import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle, Users, Clock, BarChart3, Calendar, MessageCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import QADiscussionBoard from '@/components/QADiscussionBoard';
import ErrorBoundary from '@/components/ErrorBoundary';

const TeacherDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const upcomingClasses = [
    { id: 1, title: 'Advanced Mathematics', time: '2:00 PM', students: 24 },
    { id: 2, title: 'Physics Lab Session', time: '4:00 PM', students: 18 },
  ];

  const stats = [
    { label: 'Total Students', value: '156', icon: Users, color: 'bg-intel-blue' },
    { label: 'Classes Today', value: '4', icon: Calendar, color: 'bg-intel-lightblue' },
    { label: 'Avg. Engagement', value: '87%', icon: BarChart3, color: 'bg-intel-darkblue' },
    { label: 'Pending Reviews', value: '12', icon: Clock, color: 'bg-intel-gray' },
  ];

  if (!user) {
    return (
      <div className="text-center py-8 text-red-500">
        Error: User not authenticated. Please log in.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-intel-darkblue to-intel-blue rounded-2xl p-6 text-white">
        <h1 className="text-3xl font-bold mb-2">Welcome back, {user.name}! 👨‍🏫</h1>
        <p className="text-blue-100">Ready to inspire minds today?</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index}>
              <CardContent className="p-4">
                <div className="flex items-center">
                  <div className={`p-2 rounded-lg ${stat.color} mr-3`}>
                    <Icon className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stat.value}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{stat.label}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks to get you started</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button 
              onClick={() => navigate('/create')}
              className="w-full justify-start border-intel-blue text-intel-blue hover:bg-intel-lightblue hover:bg-opacity-10 dark:border-intel-lightblue dark:text-intel-lightblue" 
              variant="outline">
              <PlusCircle className="h-4 w-4 mr-2" />
              Create New Lesson
            </Button>
            <Button 
              onClick={() => navigate('/schedule')}
              className="w-full justify-start border-intel-blue text-intel-blue hover:bg-intel-lightblue hover:bg-opacity-10 dark:border-intel-lightblue dark:text-intel-lightblue" 
              variant="outline">
              <Calendar className="h-4 w-4 mr-2" />
              Schedule Class
            </Button>
            <Button 
              onClick={() => navigate('/chatbot')}
              className="w-full justify-start border-intel-blue text-intel-blue hover:bg-intel-lightblue hover:bg-opacity-10 dark:border-intel-lightblue dark:text-intel-lightblue" 
              variant="outline">
              <MessageCircle className="h-4 w-4 mr-2" />
              AI Assistant
            </Button>
            <Button 
              onClick={() => navigate('/analytics')}
              className="w-full justify-start border-intel-blue text-intel-blue hover:bg-intel-lightblue hover:bg-opacity-10 dark:border-intel-lightblue dark:text-intel-lightblue" 
              variant="outline">
              <BarChart3 className="h-4 w-4 mr-2" />
              View Analytics
            </Button>
          </CardContent>
        </Card>

        {/* Upcoming Classes */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Clock className="h-5 w-5 mr-2" />
              Today's Schedule
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {upcomingClasses.map((classItem) => (
              <div key={classItem.id} className="flex items-center justify-between p-4 bg-intel-lightgray dark:bg-gray-800 rounded-lg">
                <div>
                  <h4 className="font-medium">{classItem.title}</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {classItem.time} • {classItem.students} students enrolled
                  </p>
                </div>
                <div className="space-x-2">
                  <Button size="sm" variant="outline" className="border-intel-blue text-intel-blue dark:border-intel-lightblue dark:text-intel-lightblue">Prepare</Button>
                  <Button size="sm" className="bg-intel-blue hover:bg-intel-darkblue">Start Class</Button>
                </div>
              </div>
            ))}
            <Button variant="ghost" className="w-full text-intel-blue dark:text-intel-lightblue">
              View Full Schedule
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Q&A Message Board */}
      <ErrorBoundary>
        <QADiscussionBoard
          user={{
            id: user.id,
            name: user.name,
            role: user.role || 'teacher',
            // avatar: user.avatar,
          }}
        />
      </ErrorBoundary>
    </div>
  );
};

export default TeacherDashboard;