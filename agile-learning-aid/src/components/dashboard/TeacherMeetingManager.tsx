import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Video, BarChart2, FileText, AlertCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import axios from 'axios';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { toast } from '@/components/ui/use-toast';

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const TeacherMeetingManager: React.FC = () => {
  const { user, isLoading } = useAuth();
  const [meetingTitle, setMeetingTitle] = useState('');
  const [meetingId, setMeetingId] = useState('');
  const [isMeetingActive, setIsMeetingActive] = useState(false);
  const [analyticsData, setAnalyticsData] = useState<any[]>([]);
  const [transcript, setTranscript] = useState<any[]>([]);
  const [error, setError] = useState('');

  const JAVA_BACKEND_URL = 'http://localhost:6000/api';
  const JITSI_MEET_URL = 'http://localhost:5050'; // Same URL as in StudentMeetingJoin.tsx

  // Create and start a meeting
  const startMeeting = async () => {
    if (!user || user.role !== 'teacher') {
      setError('Unauthorized: Teacher role required');
      return;
    }
    if (!meetingTitle) {
      setError('Meeting title is required');
      return;
    }

    setError('');
    try {
      console.log('Sending request to:', `${JAVA_BACKEND_URL}/meetings/create`, {
        payload: { title: meetingTitle, scheduledTime: new Date().toISOString() },
        params: { teacherEmail: user.email, teacherName: user.name },
      });
      const response = await axios.post(`${JAVA_BACKEND_URL}/meetings/create`, {
        title: meetingTitle,
        scheduledTime: new Date().toISOString(),
      }, {
        params: { teacherEmail: user.email, teacherName: user.name },
      });
      setMeetingId(response.data.id);
      setIsMeetingActive(true);
      toast({ title: 'Success', description: 'Meeting created successfully' });
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to create meeting';
      setError(errorMessage);
      console.error('Error creating meeting:', err);
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    }
  };

  // Fetch analytics and transcript
  const fetchAnalyticsAndTranscript = async () => {
    if (!meetingId) return;

    try {
      const [analyticsRes, transcriptRes] = await Promise.all([
        axios.get(`${JAVA_BACKEND_URL}/analytics/chart-data/${meetingId}`),
        axios.get(`${JAVA_BACKEND_URL}/meetings/${meetingId}/transcript`),
      ]);
      setAnalyticsData(analyticsRes.data);
      setTranscript(transcriptRes.data);
    } catch (err) {
      console.error('Failed to fetch data:', err);
    }
  };

  useEffect(() => {
    if (isMeetingActive && user?.role === 'teacher') {
      const interval = setInterval(fetchAnalyticsAndTranscript, 10000); // Poll every 10 seconds
      return () => clearInterval(interval);
    }
  }, [isMeetingActive, meetingId]);

  // Chart data for engagement trends
  const chartData = {
    labels: analyticsData.map((data) => new Date(data.timestamp).toLocaleTimeString()),
    datasets: [
      {
        label: 'Average Engagement',
        data: analyticsData.map((data) => data.engagementScores?.average || 0),
        borderColor: '#0071c5',
        backgroundColor: 'rgba(0, 113, 197, 0.2)',
        fill: true,
      },
    ],
  };

  if (isLoading || user?.role !== 'teacher') {
    return <div>{isLoading ? 'Loading...' : 'Access restricted to teachers'}</div>;
  }

  return (
    <div className="flex min-h-screen bg-gray-100 dark:bg-gray-900">
      {/* Sidebar is rendered via Layout component */}
      <div className="flex-1 p-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#0071c5] via-[#004494] to-[#002c5f] rounded-2xl p-6 text-white mb-6">
          <h1 className="text-3xl font-bold mb-2 flex items-center">
            <Video className="h-8 w-8 mr-3" />
            Meeting Manager
          </h1>
          <p className="text-[#a8d4f0]">Create live classes and monitor student engagement</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Meeting Controls */}
          <Card>
            <CardHeader>
              <CardTitle>Create Meeting</CardTitle>
              <CardDescription>Start a new class session</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                placeholder="Meeting Title"
                value={meetingTitle}
                onChange={(e) => setMeetingTitle(e.target.value)}
              />
              <Button className="w-full bg-[#0071c5] hover:bg-[#004494]" onClick={startMeeting}>
                Start Meeting
              </Button>
              <Button
                variant="outline"
                className="w-full"
                onClick={async () => {
                  try {
                    const res = await axios.get(`${JAVA_BACKEND_URL}/meetings/active`);
                    toast({ title: 'Success', description: 'Backend ping successful' });
                    console.log('Backend response:', res.data);
                  } catch (err: any) {
                    const errorMessage = err.message || 'Failed to ping backend';
                    toast({ title: 'Error', description: errorMessage, variant: 'destructive' });
                    console.error('Ping failed:', err);
                  }
                }}
              >
                Test Backend
              </Button>
              {error && (
                <p className="text-red-500 text-sm flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {error}
                </p>
              )}
            </CardContent>
          </Card>

          {/* Jitsi Meet Iframe */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Live Meeting</CardTitle>
            </CardHeader>
            <CardContent>
              {isMeetingActive && meetingId ? (
                <iframe
                  src={`${JITSI_MEET_URL}/${meetingId}`}
                  title="Live Class"
                  className="w-full h-[400px] rounded-lg border-none"
                  allowFullScreen
                  allow="camera; microphone"
                ></iframe>
              ) : (
                <p className="text-gray-500">No active meeting</p>
              )}
            </CardContent>
          </Card>

          {/* Engagement Analytics */}
          <Card className="lg:col-span-3">
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart2 className="h-5 w-5 mr-2" />
                Engagement Analytics
              </CardTitle>
              <CardDescription>Real-time student engagement trends</CardDescription>
            </CardHeader>
            <CardContent>
              {analyticsData.length > 0 ? (
                <Line
                  data={chartData}
                  options={{
                    scales: {
                      x: { title: { display: true, text: 'Time' } },
                      y: { title: { display: true, text: 'Engagement Score' } },
                    },
                  }}
                />
              ) : (
                <p className="text-gray-500">No analytics data available</p>
              )}
            </CardContent>
          </Card>

          {/* Transcript */}
          <Card className="lg:col-span-3">
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="h-5 w-5 mr-2" />
                Meeting Transcript
              </CardTitle>
              <CardDescription>Live transcription of the meeting</CardDescription>
            </CardHeader>
            <CardContent>
              {transcript.length > 0 ? (
                <ul className="max-h-[200px] overflow-y-auto space-y-2">
                  {transcript.map((line, index) => (
                    <li key={index} className="text-sm">
                      <span className="font-medium">{line.speaker || 'Unknown'}:</span> {line.text}
                      <span className="text-gray-500 text-xs ml-2">
                        {new Date(line.timestamp).toLocaleTimeString()}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500">No transcript available</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default TeacherMeetingManager;