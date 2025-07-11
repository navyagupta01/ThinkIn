import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AlertCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import axios from 'axios';

const BasicMeetingJoin: React.FC = () => {
  const { user, isLoading } = useAuth();
  const [meetingId, setMeetingId] = useState('');
  const [meetingTitle, setMeetingTitle] = useState('');
  const [error, setError] = useState('');
  const jitsiContainerRef = useRef<HTMLDivElement>(null);

  const JAVA_BACKEND_URL = 'http://localhost:6000/api';

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://meet.jit.si/external_api.js';
    script.async = true;
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const joinMeeting = async () => {
    if (!user) {
      setError('You must be logged in to join a meeting');
      return;
    }
    if (!meetingId) {
      setError('Meeting ID is required');
      return;
    }
    setError('');
    try {
      await axios.post(`${JAVA_BACKEND_URL}/meetings/join/${meetingId}`, {}, {
        params: { userEmail: user.email, userName: user.name },
      });
      loadJitsi(meetingId, user.name);
    } catch (err) {
      setError('Failed to join meeting. Check backend connectivity.');
      console.error(err);
    }
  };

  const createMeeting = async () => {
    if (!user || user.role !== 'teacher') {
      setError('Only teachers can create meetings');
      return;
    }
    if (!meetingTitle) {
      setError('Meeting title is required');
      return;
    }
    setError('');
    try {
      const response = await axios.post(`${JAVA_BACKEND_URL}/meetings/create`, {
        title: meetingTitle,
        scheduledTime: new Date().toISOString(),
      }, {
        params: { teacherEmail: user.email, teacherName: user.name },
      });
      setMeetingId(response.data.id);
      loadJitsi(response.data.id, user.name);
    } catch (err) {
      setError('Failed to create meeting');
      console.error(err);
    }
  };

  const loadJitsi = (meetingId: string, displayName: string) => {
    if (!(window as any).JitsiMeetExternalAPI) {
      setError('Jitsi Meet API not loaded');
      return;
    }
    const domain = 'meet.jit.si';
    const options = {
      roomName: meetingId,
      width: '100%',
      height: 500,
      parentNode: jitsiContainerRef.current,
      userInfo: { displayName },
    };
    new (window as any).JitsiMeetExternalAPI(domain, options);
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <div>Please log in to access this page</div>;
  }

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>{user.role === 'teacher' ? 'Manage Meeting' : 'Join a Meeting'}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {user.role === 'teacher' && (
            <>
              <Input
                placeholder="Enter Meeting Title"
                value={meetingTitle}
                onChange={(e) => setMeetingTitle(e.target.value)}
              />
              <Button onClick={createMeeting} className="w-full bg-green-600 hover:bg-green-700">
                Create Meeting
              </Button>
            </>
          )}
          <Input
            placeholder="Enter Meeting ID"
            value={meetingId}
            onChange={(e) => setMeetingId(e.target.value)}
          />
          <Button onClick={joinMeeting} className="w-full bg-blue-600 hover:bg-blue-700">
            Join Meeting
          </Button>
          {error && (
            <p className="text-red-500 text-sm flex items-center">
              <AlertCircle className="h-4 w-4 mr-1" />
              {error}
            </p>
          )}
          <div ref={jitsiContainerRef} className="mt-4"></div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BasicMeetingJoin;