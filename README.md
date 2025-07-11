# ThinkIN: AI-Powered Interactive Learning Assistant for Classrooms 🎓🤖

## Overview

**ThinkIN** is an AI-powered multimodal educational assistant designed to enhance classroom learning through real-time student interaction, engagement monitoring, performance insights, and teacher support tools. Leveraging Intel® OpenVINO™ toolkit, Hugging Face Transformers, and state-of-the-art speech and vision models, ThinkIN transforms classrooms into dynamic smart learning environments.

---

## 🧠 Features

| Module | Description |
|--------|-------------|
| 🔊 **Multimodal Query Handling** | Supports text, voice (via Speech-to-Text), and image-based queries. |
| 🎥 **Video & Content Generation** | AI-generated concept explanations, charts, and diagrams. |
| 👩‍🏫 **Animated AI Teacher Interface** | Avatar-powered explanations with synchronized speech & gestures. |
| 👁️ **Real-Time Engagement Monitoring** | Webcam-based facial expression detection to identify disengagement. |
| 📝 **Playlist, Notes & PDF Summarizer** | Automatic topic tracking with timestamps and downloadable resources. |
| 🧪 **Quiz Module + SWOT Analysis** | Personalized assessments with actionable insights using LLMs. |
| 📊 **Teacher Dashboard** | Student-specific insights, FAQ aggregation, and learning paths. |
| 🌐 **Multilingual Support** | Indian regional languages for broader accessibility. |

---

## 🧰 Tech Stack

| Layer | Tools / Frameworks |
|-------|--------------------|
| Frontend | ReactJS / Streamlit |
| Backend | Flask / FastAPI |
| NLP Models | Hugging Face (T5, BERT, mBERT) |
| Speech | Whisper / Google Speech API |
| TTS | ElevenLabs / Google TTS |
| Image / Facial Analysis | OpenCV, DeepFace, FER, ViT/ResNet |
| Deployment | Docker / Intel® AI PC |
| Optimization | Intel® OpenVINO™ Toolkit |
| Database | MongoDB / SQLite |

---

## 🏎️ Performance Comparison

### 📊 Model Inference Time (Lower is Better)

| Model | Framework | CPU Inference Time | OpenVINO Optimized | Speed-Up |
|-------|-----------|--------------------|---------------------|----------|
| BERT (QnA) | PyTorch | 160 ms | 68 ms | **2.35×** |
| ResNet-50 (Image Input) | TensorFlow | 140 ms | 55 ms | **2.54×** |
| FER+Emotion | Python (DeepFace) | 220 ms | 97 ms | **2.27×** |
| TTS (Google) | Cloud | 500 ms | Local w/ OpenVINO | **~Local Deployment** |

### 📉 CPU Utilization (%)

| Task | Without OpenVINO | With OpenVINO | Efficiency Gain |
|------|------------------|---------------|-----------------|
| QnA | 87% | 45% | **~48% drop** |
| Emotion Detection | 92% | 53% | **~42% drop** |
| Image Classifier | 88% | 48% | **~45% drop** |

*Tested on Intel® Core™ i7-1255U with 16GB RAM.*

---
### 🔍 Model Inference Time Comparison

![Inference Time](https://raw.githubusercontent.com/Mukul-Gupta-300/ThinkIN/main/Assets/Time%20Comparison.jpg)

---

### 🧮 CPU Utilization Comparison

![CPU Utilization](https://raw.githubusercontent.com/Mukul-Gupta-300/ThinkIN/main/Assets/Utilization%20Comparison.jpg)


---

## ⚙️ Intel® Optimization Tools

| Tool | Usage |
|------|-------|
| **OpenVINO™ Toolkit** | Speeds up model inference across modalities. |
| **Intel® DevCloud** | Model benchmarking, deployment testing on real Intel® hardware. |
| **Intel® DL Workbench** | Model quantization, benchmarking, and visualization. |
| **Open Model Zoo** | Access to pre-optimized models for faster deployment. |

---

## 📌 Additional Features

- 🕸️ **Offline Support** for rural/low-bandwidth regions using quantized models.
- 🔊 **Voice Modulation** for personalized TTS tone and speed.
- 🧑‍👩‍👧‍👦 **Parent Mode** for sharing performance summaries.
- ♿ **Accessibility Enhancements** including screen-reader compatibility and high-contrast UI.

---



