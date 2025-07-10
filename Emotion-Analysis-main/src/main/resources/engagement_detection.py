from flask import Flask, request, jsonify, render_template
from flask_cors import CORS
from openvino.runtime import Core
import cv2
import numpy as np
import base64
import io
from PIL import Image
import requests
import logging
from datetime import datetime
import os

app = Flask(__name__)
CORS(app)
# CORS(app, resources={r"/*": {"origins": [
#     "http://localhost:8080",
#     "http://localhost:3000",
#     "http://localhost:5000",
#     "http://127.0.0.1:8080",
#     "http://127.0.0.1:3000",
#     "http://127.0.0.1:5000"
# ]}})

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Backend API configuration
BACKEND_BASE_URL = "http://localhost:8080/api/analytics"

# Initialize OpenVINO
core = Core()

# Load models
try:
    fd = core.read_model("static/face_detection/face-detection-adas-0001.xml")
    em = core.read_model("static/emotion_detection/emotions-recognition-retail-0003.xml")
    gaze = core.read_model("static/fatigue_detection/facial_landmark.xml")
    head_pose = core.read_model("static/head_pose/head_pose.xml")

    fd_net = core.compile_model(fd, "CPU")
    em_net = core.compile_model(em, "CPU")
    gaze_net = core.compile_model(gaze, "CPU")
    hp_net = core.compile_model(head_pose, "CPU")

    fd_out = fd_net.output(0)
    em_out = em_net.output(0)
    gaze_out = gaze_net.output(0)
    hp_outs = hp_net.outputs

    emotion_labels = ['neutral', 'happy', 'sad', 'surprise', 'anger']
    logger.info("OpenVINO models loaded successfully")

except Exception as e:
    logger.error(f"Error loading OpenVINO models: {e}")
    fd_net = em_net = gaze_net = hp_net = None


def send_to_backend(endpoint, data):
    try:
        response = requests.post(f"{BACKEND_BASE_URL}/{endpoint}", json=data)
        if response.status_code == 200:
            logger.info(f"Data sent to /{endpoint}: {data}")
            return True
        else:
            logger.error(f"Failed to send to /{endpoint} | {response.status_code}: {response.text}")
            return False
    except Exception as e:
        logger.error(f"Error sending data to backend: {e}")
        return False


def analyze_frame(frame, meeting_id, participant_id):
    if fd_net is None:
        return {"emotion": "Model not loaded", "fatigue": "Model not loaded", "head_pose": {}}

    try:
        h, w = frame.shape[:2]
        blob = cv2.resize(frame, (672, 384)).transpose((2, 0, 1))[np.newaxis].astype(np.float32)
        detections = fd_net([blob])[fd_out]

        results = []
        timestamp = datetime.now().isoformat()

        for det in detections[0][0]:
            if det[2] < 0.6:
                continue

            xmin, ymin, xmax, ymax = map(int, [det[3]*w, det[4]*h, det[5]*w, det[6]*h])
            xmin, ymin = max(0, xmin), max(0, ymin)
            xmax, ymax = min(w - 1, xmax), min(h - 1, ymax)

            face = frame[ymin:ymax, xmin:xmax]
            if face.size == 0:
                continue

            # Emotion Detection
            em_blob = cv2.resize(face, (64, 64)).transpose((2, 0, 1))[np.newaxis].astype(np.float32)
            em_res = em_net([em_blob])[em_out]
            em_label = emotion_labels[np.argmax(em_res)]

            emotion_data = {
                "meetingId": meeting_id,
                "participantId": participant_id,
                "emotion": em_label,
                "timestamp": timestamp
            }
            send_to_backend("emotion", emotion_data)

            # Head Pose
            hp_blob = cv2.resize(face, (60, 60)).transpose((2, 0, 1))[np.newaxis].astype(np.float32)
            hp_result = hp_net([hp_blob])
            yaw = float(hp_result[hp_outs[0]][0][0])
            pitch = float(hp_result[hp_outs[1]][0][0])
            roll = float(hp_result[hp_outs[2]][0][0])

            head_pose_data = {
                "meetingId": meeting_id,
                "participantId": participant_id,
                "yaw": yaw,
                "pitch": pitch,
                "roll": roll,
                "timestamp": timestamp
            }
            send_to_backend("headpose", head_pose_data)

            # Fatigue Detection
            try:
                eye_y = int(face.shape[0] * 0.3)
                left_eye_x = int(face.shape[1] * 0.2)
                right_eye_x = int(face.shape[1] * 0.6)
                eye_h, eye_w = 60, 60

                left_eye = face[eye_y:eye_y+eye_h, left_eye_x:left_eye_x+eye_w]
                right_eye = face[eye_y:eye_y+eye_h, right_eye_x:right_eye_x+eye_w]

                if left_eye.shape[:2] != (eye_h, eye_w) or right_eye.shape[:2] != (eye_h, eye_w):
                    fatigue_status = "Unknown"
                else:
                    left_blob = left_eye.transpose((2, 0, 1))[np.newaxis].astype(np.float32)
                    right_blob = right_eye.transpose((2, 0, 1))[np.newaxis].astype(np.float32)
                    head_pose_angles = np.array([[yaw, pitch, roll]], dtype=np.float32)

                    gaze_inputs = {
                        "left_eye_image": left_blob,
                        "right_eye_image": right_blob,
                        "head_pose_angles": head_pose_angles
                    }

                    gaze_vec = gaze_net(gaze_inputs)[gaze_out][0]
                    fatigue_status = "Sleepy" if abs(gaze_vec[1]) > 0.15 else "Alert"

                fatigue_data = {
                    "meetingId": meeting_id,
                    "participantId": participant_id,
                    "fatigueStatus": fatigue_status,
                    "timestamp": timestamp
                }
                send_to_backend("fatigue", fatigue_data)
            except Exception as e:
                logger.error(f"Fatigue detection error: {e}")
                fatigue_status = "Unknown"

            results.append({
                "emotion": em_label,
                "fatigue": fatigue_status,
                "head_pose": {"yaw": yaw, "pitch": pitch, "roll": roll},
                "confidence": float(det[2])
            })

        if results:
            return max(results, key=lambda x: x['confidence'])
        else:
            return {
                "emotion": "No face detected",
                "fatigue": "No face detected",
                "head_pose": {"yaw": 0.0, "pitch": 0.0, "roll": 0.0}
            }

    except Exception as e:
        logger.error(f"Analysis error: {e}")
        return {
            "emotion": "Error",
            "fatigue": "Error",
            "head_pose": {"yaw": 0.0, "pitch": 0.0, "roll": 0.0}
        }


@app.route('/')
def index():
    return render_template('index.html')


@app.route('/analyze', methods=['POST'])
def analyze_image():
    try:
        data = request.get_json()
        if not data or not all(k in data for k in ['image', 'meeting_id', 'participant_id']):
            return jsonify({"error": "Image, meeting_id, and participant_id required"}), 400

        # Decode image from base64
        if ',' in data['image']:
            image_data = base64.b64decode(data['image'].split(',')[1])
        else:
            image_data = base64.b64decode(data['image'])

        image = Image.open(io.BytesIO(image_data)).convert('RGB')
        frame = cv2.cvtColor(np.array(image), cv2.COLOR_RGB2BGR)

        result = analyze_frame(frame, data['meeting_id'], data['participant_id'])
        return jsonify(result)

    except Exception as e:
        logger.error(f"Image analysis error: {e}")
        return jsonify({"error": "Internal server error"}), 500


@app.route('/health')
def health_check():
    return jsonify({
        "status": "healthy",
        "models_loaded": all([fd_net, em_net, gaze_net, hp_net]),
        "timestamp": datetime.now().isoformat()
    })


if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5050)
