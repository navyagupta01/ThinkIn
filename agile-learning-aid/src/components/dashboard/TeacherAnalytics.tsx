import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext'; // Import useAuth
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BarChart3, TrendingUp, Users, Clock, Award, Target, Download, Filter } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import axios from 'axios';

interface Quiz {
  quizId: string;
  title: string;
  subject: string;
  createdAt: string;
}

interface AnalyticsData {
  totalAttempts: number;
  averageScore: number;
  highestScore: number;
  lowestScore: number;
  averageTime: number;
  topicPerformance: Record<string, { totalQuestions: number; totalCorrect: number; averagePercentage: number }>;
  studentPerformance: Array<{
    studentUsername: string;
    score: number;
    percentage: number;
    timeSpent: number;
    submittedAt: string;
  }>;
}

const TeacherAnalytics: React.FC = () => {
  const { user } = useAuth(); // Get user from AuthContext
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'semester'>('month');
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [selectedQuiz, setSelectedQuiz] = useState<string | null>(null);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null); // Add error state for user handling

  // Fetch teacher's quizzes
  useEffect(() => {
    if (!user || !user.name) {
      setError('User not authenticated or username not available');
      return;
    }

    const fetchQuizzes = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`http://localhost:5010/api/teacher/${user.name}/quizzes`);
        setQuizzes(response.data);
        setError(null);
      } catch (error) {
        console.error('Error fetching quizzes:', error);
        if (axios.isAxiosError(error)) {
          console.log('Axios Error Details:', {
            message: error.message,
            code: error.code,
            response: error.response ? {
              status: error.response.status,
              data: error.response.data,
            } : 'No response received',
          });
        }
        setError('Failed to fetch quizzes');
      } finally {
        setLoading(false);
      }
    };
    fetchQuizzes();
  }, [user?.name]); // Depend on user.name

  // Fetch analytics for selected quiz
  useEffect(() => {
    if (selectedQuiz) {
      const fetchAnalytics = async () => {
        setLoading(true);
        try {
          const response = await axios.get(`http://localhost:5010/api/quizzes/${selectedQuiz}/analytics`);
          setAnalytics(response.data);
          setError(null);
        } catch (error) {
          console.error('Error fetching analytics:', error);
          setAnalytics(null);
          setError('Failed to fetch analytics');
        } finally {
          setLoading(false);
        }
      };
      fetchAnalytics();
    }
  }, [selectedQuiz]);

  // Sample stats (retained from original)
  const stats = [
    { label: 'Total Students', value: '156', change: '+12%', icon: Users, color: 'bg-blue-500' },
    { label: 'Avg. Attendance', value: '87%', change: '+5%', icon: TrendingUp, color: 'bg-green-500' },
    { label: 'Completion Rate', value: '92%', change: '+8%', icon: Award, color: 'bg-purple-500' },
    { label: 'Engagement Score', value: '4.6/5', change: '+0.3', icon: Target, color: 'bg-orange-500' },
  ];

  // Export analytics as CSV
  const exportToCSV = () => {
    if (!analytics) return;
    const headers = ['Student,Score,Percentage,Time Spent,Submitted At'];
    const rows = analytics.studentPerformance.map(student => 
      `${student.studentUsername},${student.score},${student.percentage.toFixed(2)}%,${(student.timeSpent / 60).toFixed(2)} min,${new Date(student.submittedAt).toLocaleString()}`
    );
    const csv = [headers, ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `quiz_${selectedQuiz}_analytics.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-intel-darkblue to-intel-blue rounded-2xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Teacher Analytics Dashboard 📊</h1>
            <p className="text-blue-100">Monitor student progress and quiz performance</p>
          </div>
          <div className="flex space-x-2">
            <Button
              size="sm"
              variant={selectedPeriod === 'week' ? 'secondary' : 'outline'}
              onClick={() => setSelectedPeriod('week')}
              className="text-white border-white"
            >
              Week
            </Button>
            <Button
              size="sm"
              variant={selectedPeriod === 'month' ? 'secondary' : 'outline'}
              onClick={() => setSelectedPeriod('month')}
              className="text-white border-white"
            >
              Month
            </Button>
            <Button
              size="sm"
              variant={selectedPeriod === 'semester' ? 'secondary' : 'outline'}
              onClick={() => setSelectedPeriod('semester')}
              className="text-white border-white"
            >
              Semester
            </Button>
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="p-4 bg-red-50 text-red-800 rounded-lg border border-red-200">
          <h4 className="font-medium">Error</h4>
          <p>{error}</p>
        </div>
      )}

      {/* Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index}>
              <CardContent className="p-4">
                <div className="grid grid-cols-1 gap-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className={`p-2 rounded-lg ${stat.color} mr-3`}>
                        <Icon className="h-5 w-5 text-white" />
                      </div>
                      </div>
                      <div>
                        <p className="text-2xl font-bold">{stat.value}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{stat.label}</p>
                      </div>
                    </div>
                    <div className="flex items-center text-green-600 text-sm font-medium">
                      <TrendingUp className="h-4 w-4 mr-1" />
                      {stat.change}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

      {/* Quiz Selector */}
      <Card>
        <CardHeader>
          <CardTitle>Select Quiz for Analytics</CardTitle>
          <CardDescription>Choose a quiz to view detailed performance metrics</CardDescription>
        </CardHeader>
        <CardContent>
          <Select onValueChange={setSelectedQuiz} value={selectedQuiz || ''}>
            <SelectTrigger className="w-[300px]">
              <SelectValue placeholder="Select a quiz" />
            </SelectTrigger>
            <SelectContent>
              {quizzes.map(quiz => (
                <SelectItem key={quiz.quizId} value={quiz.quizId}>
                  {quiz.title} ({quiz.subject})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Quiz Analytics */}
      {selectedQuiz && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Overview */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center">
                    <BarChart3 className="h-5 w-5 mr-2" />
                    Quiz Performance Overview
                  </CardTitle>
                  <CardDescription>Key metrics for the selected quiz</CardDescription>
                </div>
                <Button onClick={exportToCSV} size="sm" variant="outline" className="border-intel-blue text-intel-blue">
                  <Download className="h-4 w-4 mr-2" />
                  Export Analytics
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <p>Loading analytics...</p>
              ) : analytics ? (
                <div className="space-y-6">
                  {/* Summary Metrics */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="p-4 border rounded-lg">
                      <p className="text-sm text-gray-600">Total Attempts</p>
                      <p className="text-2xl font-bold">{analytics.totalAttempts}</p>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <p className="text-sm text-gray-600">Average Score</p>
                      <p className="text-2xl font-bold">{analytics.averageScore.toFixed(2)}%</p>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <p className="text-sm text-gray-600">Average Time</p>
                      <p className="text-2xl font-bold">{(analytics.averageTime / 60).toFixed(2)} min</p>
                    </div>
                  </div>

                  {/* Topic Performance */}
                  <div>
                    <h4 className="font-medium mb-3">Topic Performance</h4>
                    <div className="space-y-4">
                      {Object.entries(analytics.topicPerformance).map(([topic, perf]) => (
                        <div key={topic} className="p-4 border rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <h5 className="font-medium">{topic}</h5>
                            <span className="text-sm">{perf.averagePercentage.toFixed(2)}%</span>
                          </div>
                          <Progress value={perf.averagePercentage} className="h-2" />
                          <p className="text-sm text-gray-600 mt-1">
                            {perf.totalCorrect}/{perf.totalQuestions} correct answers
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <p>No analytics data available for this quiz.</p>
              )}
            </CardContent>
          </Card>

          {/* Student Performance */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="h-5 w-5 mr-2" />
                Student Performance
              </CardTitle>
              <CardDescription>Individual student results</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <p>Loading student data...</p>
              ) : analytics && analytics.studentPerformance.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student</TableHead>
                      <TableHead>Score</TableHead>
                      <TableHead>Time</TableHead>
                      <TableHead>Submitted</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {analytics.studentPerformance.map((student, index) => (
                      <TableRow key={index}>
                        <TableCell>{student.studentUsername}</TableCell>
                        <TableCell>{student.percentage.toFixed(2)}%</TableCell>
                        <TableCell>{(student.timeSpent / 60).toFixed(2)} min</TableCell>
                        <TableCell>{new Date(student.submittedAt).toLocaleDateString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p>No student data available.</p>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Action Buttons */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Button className="bg-intel-blue hover:bg-intel-darkblue">
              <Filter className="h-4 w-4 mr-2" />
              Generate Custom Report
            </Button>
            <Button onClick={exportToCSV} disabled={!analytics} variant="outline" className="border-intel-blue text-intel-blue">
              <Download className="h-4 w-4 mr-2" />
              Export All Data
            </Button>
            <Button variant="outline" className="border-intel-blue text-intel-blue">
              <Clock className="h-4 w-4 mr-2" />
              Schedule Review Meeting
            </Button>
            <Button variant="outline" className="border-intel-blue text-intel-blue">
              <Users className="h-4 w-4 mr-2" />
              Contact Students
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TeacherAnalytics;