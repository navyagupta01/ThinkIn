import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, BookOpen, MessageCircle, BarChart3, Bell } from 'lucide-react';
import QADiscussionBoard from '@/components/QADiscussionBoard';
import ErrorBoundary from '@/components/ErrorBoundary';

const StudentDashboard: React.FC = () => {
  const { user } = useAuth();

  const upcomingClasses = [
    { id: 1, title: 'Advanced Mathematics', time: '2:00 PM', teacher: 'Dr. Smith', status: 'live' },
    { id: 2, title: 'Physics - Mechanics', time: '4:00 PM', teacher: 'Prof. Johnson', status: 'upcoming' },
    { id: 3, title: 'Chemistry Lab', time: '10:00 AM Tomorrow', teacher: 'Dr. Brown', status: 'scheduled' },
  ];

  const notifications = [
    { id: 1, message: 'New assignment posted for Mathematics', time: '30 min ago', type: 'assignment' },
    { id: 2, message: 'Physics class rescheduled to 4:30 PM', time: '1 hour ago', type: 'schedule' },
    { id: 3, message: 'Great job on your Chemistry quiz!', time: '2 hours ago', type: 'achievement' },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'live': return 'bg-red-500';
      case 'upcoming': return 'bg-yellow-500';
      default: return 'bg-gray-400';
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'assignment': return '📝';
      case 'schedule': return '📅';
      case 'achievement': return '🏆';
      default: return '🔔';
    }
  };

  if (!user) {
    return (
      <div className="text-center py-8 text-red-500">
        Error: User not authenticated. Please log in.
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="relative bg-gradient-to-r from-[#0071c5] via-[#004494] to-[#002c5f] rounded-3xl p-8 text-white overflow-hidden">
        <div className="absolute inset-0 bg-black bg-opacity-10" />
        <div className="absolute top-0 right-0 w-64 h-64 bg-white bg-opacity-10 rounded-full -translate-y-32 translate-x-32" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white bg-opacity-5 rounded-full translate-y-24 -translate-x-24" />
        <div className="relative z-10">
          <h1 className="text-4xl font-bold mb-2">Welcome back, {user.name}! 👋</h1>
          <p className="text-[#a8d4f0] text-lg">Ready to continue your learning journey today?</p>
          <div className="mt-6 flex flex-wrap gap-4">
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
        {/* Upcoming Classes */}
        <Card className="xl:col-span-2 border-0 shadow-xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center text-xl">
              <Calendar className="h-6 w-6 mr-3 text-[#0071c5]" />
              Upcoming Classes
            </CardTitle>
            <CardDescription>Your scheduled learning sessions</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {upcomingClasses.map((classItem) => (
              <div key={classItem.id} className="group p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <div className={`w-3 h-3 rounded-full ${getStatusColor(classItem.status)}`} />
                      <h4 className="font-semibold text-slate-900 dark:text-white">{classItem.title}</h4>
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      {classItem.teacher} • {classItem.time}
                    </p>
                  </div>
                  <Button 
                    size="sm" 
                    className={`${classItem.status === 'live' ? 'bg-red-500 hover:bg-red-600' : 'bg-[#0071c5] hover:bg-[#004494]'} text-white shadow-md hover:shadow-lg transition-all duration-200`}
                  >
                    {classItem.status === 'live' ? 'Join Live' : 'Join'}
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* AI Assistant */}
        <Card className="xl:col-span-2 border-0 shadow-xl bg-gradient-to-br from-[#f0f8ff] to-[#e6f3ff] dark:from-[#0071c5]/10 dark:to-[#004494]/10">
          <CardHeader>
            <CardTitle className="flex items-center text-xl">
              <MessageCircle className="h-6 w-6 mr-3 text-[#0071c5]" />
              AI Assistant
            </CardTitle>
            <CardDescription>Get instant help with your studies</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 bg-white dark:bg-slate-800 rounded-2xl shadow-sm">
                <p className="text-sm text-purple-600 dark:text-purple-400 font-medium">
                  💡 "Explain quantum mechanics in simple terms"
                </p>
              </div>
              <div className="p-4 bg-white dark:bg-slate-800 rounded-2xl shadow-sm">
                <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">
                  🧮 "Help me solve this calculus problem"
                </p>
              </div>
              <Button className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-200">
                Ask AI Assistant
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Q&A Message Board */}
        <div className="xl:col-span-2">
          <ErrorBoundary>
            <QADiscussionBoard
              user={{
                id: user.id,
                name: user.name,
                role: user.role || 'student',
                // avatar: user.avatar,
              }}
            />
          </ErrorBoundary>
        </div>

        {/* Stats and Notifications */}
        <div className="space-y-6">
          {/* Progress Card */}
          <Card className="border-0 shadow-xl bg-gradient-to-br from-[#f0f8ff] to-[#e6f3ff] dark:from-[#0071c5]/10 dark:to-[#004494]/10">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center text-lg">
                <BarChart3 className="h-5 w-5 mr-2 text-[#0071c5]" />
                Your Progress
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between text-sm mb-2 font-medium">
                    <span className="text-slate-700 dark:text-slate-300">Overall Progress</span>
                    <span className="text-[#0071c5]">78%</span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-3">
                    <div className="bg-gradient-to-r from-[#0071c5] to-[#004494] h-3 rounded-full" style={{ width: '78%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-2 font-medium">
                    <span className="text-slate-700 dark:text-slate-300">Quizzes Completed</span>
                    <span className="text-[#0071c5]">12/15</span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-3">
                    <div className="bg-gradient-to-r from-[#0071c5] to-[#004494] h-3 rounded-full" style={{ width: '80%' }}></div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notifications */}
          <Card className="border-0 shadow-xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center text-lg">
                <Bell className="h-5 w-5 mr-2 text-[#0071c5]" />
                Notifications
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {notifications.map((notification) => (
                  <div key={notification.id} className="flex items-start space-x-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800 hover:shadow-md transition-all duration-200">
                    <span className="text-lg">{getNotificationIcon(notification.type)}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-slate-700 dark:text-slate-300 font-medium">{notification.message}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{notification.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;