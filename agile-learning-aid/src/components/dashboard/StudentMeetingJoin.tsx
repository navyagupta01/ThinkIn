import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Video, AlertCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import axios from 'axios';

const StudentMeetingJoin: React.FC = () => {
  const { user, isLoading } = useAuth();
  const [meetingId, setMeetingId] = useState('');
  const [isMeetingActive, setIsMeetingActive] = useState(false);
  const [error, setError] = useState('');
  const jitsiContainerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [jitsiApi, setJitsiApi] = useState<any>(null);

  const JAVA_BACKEND_URL = 'http://localhost:6000/api';
  const FLASK_BACKEND_URL = 'http://localhost:5050';

  // Load Jitsi Meet external API script
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://meet.jit.si/external_api.js';
    script.async = true;
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  // Join a meeting
  const joinMeeting = async () => {
    if (!user || !meetingId) return;

    try {
      const response = await axios.post(`${JAVA_BACKEND_URL}/meetings/join/${meetingId}`, {}, {
        params: { userEmail: user.email, userName: user.name },
      });
      setIsMeetingActive(true);
      loadJitsi(meetingId, user.name);
    } catch (err) {
      setError('Failed to join meeting');
      console.error(err);
    }
  };

  // Load Jitsi Meet
  const loadJitsi = (meetingId: string, displayName: string) => {
    const domain = 'meet.jit.si';
    const options = {
      roomName: meetingId,
      width: '100%',
      height: 500,
      parentNode: jitsiContainerRef.current,
      userInfo: { displayName },
    };
    const api = new (window as any).JitsiMeetExternalAPI(domain, options);
    setJitsiApi(api);
  };

  // Capture webcam frames and send to Flask
  const startVideoCapture = async () => {
    if (!user || !meetingId) return;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      const captureFrame = async () => {
        if (canvasRef.current && videoRef.current) {
          const ctx = canvasRef.current.getContext('2d');
          if (!ctx) return;
          ctx.drawImage(videoRef.current, 0, 0, 320, 240);
          const imageData = canvasRef.current.toDataURL('image/jpeg');

          try {
            const response = await axios.post(`${FLASK_BACKEND_URL}/analyze`, {
              image: imageData,
              meeting_id: meetingId,
              participant_id: user.id,
            });
            console.log('Engagement data:', response.data);
          } catch (err) {
            console.error('Failed to analyze frame:', err);
          }
        }
        setTimeout(captureFrame, 5000); // Analyze every 5 seconds
      };
      captureFrame();
    } catch (err) {
      console.error('Failed to access webcam:', err);
    }
  };

  useEffect(() => {
    if (isMeetingActive && user?.role === 'student') {
      startVideoCapture();
    }
  }, [isMeetingActive, user, meetingId]);

  // Clean up
  useEffect(() => {
    return () => {
      if (jitsiApi) {
        jitsiApi.dispose();
      }
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [jitsiApi]);

  if (isLoading || user?.role !== 'student') {
    return <div>{isLoading ? 'Loading...' : 'Access restricted to students'}</div>;
  }

  return (
    <div className="flex min-h-screen bg-gray-100 dark:bg-gray-900">
      {/* Sidebar is rendered via Layout component */}
      <div className="flex-1 p-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#0071c5] via-[#004494] to-[#002c5f] rounded-2xl p-6 text-white mb-6">
          <h1 className="text-3xl font-bold mb-2 flex items-center">
            <Video className="h-8 w-8 mr-3" />
            Join Meeting
          </h1>
          <p className="text-[#a8d4f0]">Enter a meeting ID to join a live class</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Meeting Controls */}
          <Card>
            <CardHeader>
              <CardTitle>Join Meeting</CardTitle>
              <CardDescription>Enter a meeting ID to join</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                placeholder="Enter Meeting ID"
                value={meetingId}
                onChange={(e) => setMeetingId(e.target.value)}
              />
              <Button className="w-full bg-[#0071c5] hover:bg-[#004494]" onClick={joinMeeting}>
                Join Meeting
              </Button>
              {error && (
                <p className="text-red-500 text-sm flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {error}
                </p>
              )}
            </CardContent>
          </Card>

          {/* Jitsi Meet Video */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Live Meeting</CardTitle>
            </CardHeader>
            <CardContent>
              <div ref={jitsiContainerRef} className="w-full h-[500px] rounded-lg overflow-hidden"></div>
              <video ref={videoRef} autoPlay playsInline style={{ display: 'none' }} />
              <canvas ref={canvasRef} width="320" height="240" style={{ display: 'none' }} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default StudentMeetingJoin;