import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, Users, Video, BookOpen } from 'lucide-react';

const StudentLiveClasses: React.FC = () => {
  const upcomingClasses = [
    { 
      id: 1, 
      title: 'Advanced Mathematics', 
      time: '2:00 PM', 
      teacher: 'Dr. Smith', 
      status: 'live',
      duration: '60 min',
      students: 24
    },
    { 
      id: 2, 
      title: 'Physics - Mechanics', 
      time: '4:00 PM', 
      teacher: 'Prof. Johnson', 
      status: 'upcoming',
      duration: '45 min',
      students: 18
    },
    { 
      id: 3, 
      title: 'Chemistry Lab', 
      time: '10:00 AM Tomorrow', 
      teacher: 'Dr. Brown', 
      status: 'scheduled',
      duration: '90 min',
      students: 15
    },
  ];

  const recentClasses = [
    { id: 1, title: 'Algebra Basics', teacher: 'Dr. Smith', date: 'Yesterday', recorded: true },
    { id: 2, title: 'Newton\'s Laws', teacher: 'Prof. Johnson', date: '2 days ago', recorded: true },
    { id: 3, title: 'Organic Chemistry', teacher: 'Dr. Brown', date: '3 days ago', recorded: false },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'live': return 'bg-red-500';
      case 'upcoming': return 'bg-yellow-500';
      default: return 'bg-gray-400';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'live': return 'Live Now';
      case 'upcoming': return 'Starting Soon';
      default: return 'Scheduled';
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-gradient-to-r from-[#0071c5] via-[#004494] to-[#002c5f] rounded-2xl p-6 text-white">
        <h1 className="text-3xl font-bold mb-2 flex items-center">
          <Video className="h-8 w-8 mr-3" />
          Live Classes
        </h1>
        <p className="text-[#a8d4f0]">Join interactive sessions with your teachers and classmates</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upcoming Classes */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Clock className="h-5 w-5 mr-2 text-[#0071c5]" />
              Today's Schedule
            </CardTitle>
            <CardDescription>Your upcoming live sessions</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {upcomingClasses.map((classItem) => (
              <div key={classItem.id} className="p-4 border border-slate-200 dark:border-slate-700 rounded-xl hover:shadow-lg transition-all duration-300">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${getStatusColor(classItem.status)}`} />
                    <div>
                      <h4 className="font-semibold text-slate-900 dark:text-white">{classItem.title}</h4>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        {classItem.teacher} • {classItem.time}
                      </p>
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    classItem.status === 'live' ? 'bg-red-100 text-red-800' : 
                    classItem.status === 'upcoming' ? 'bg-yellow-100 text-yellow-800' : 
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {getStatusText(classItem.status)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 text-sm text-slate-600 dark:text-slate-400">
                    <span className="flex items-center">
                      <Clock className="h-4 w-4 mr-1" />
                      {classItem.duration}
                    </span>
                    <span className="flex items-center">
                      <Users className="h-4 w-4 mr-1" />
                      {classItem.students} students
                    </span>
                  </div>
                  <Button 
                    size="sm" 
                    className={`${
                      classItem.status === 'live' 
                        ? 'bg-red-500 hover:bg-red-600 text-white' 
                        : 'bg-[#0071c5] hover:bg-[#004494] text-white'
                    }`}
                    disabled={classItem.status === 'scheduled'}
                  >
                    {classItem.status === 'live' ? 'Join Live' : classItem.status === 'upcoming' ? 'Join' : 'Scheduled'}
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Today's Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600 dark:text-slate-400">Classes Today</span>
                <span className="font-semibold">3</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600 dark:text-slate-400">Total Duration</span>
                <span className="font-semibold">3h 15m</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600 dark:text-slate-400">Live Now</span>
                <span className="font-semibold text-red-500">1</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full justify-start">
                <Calendar className="h-4 w-4 mr-2" />
                View Full Schedule
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <BookOpen className="h-4 w-4 mr-2" />
                Class Materials
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Recent Classes */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Classes</CardTitle>
          <CardDescription>Catch up on classes you might have missed</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recentClasses.map((classItem) => (
              <div key={classItem.id} className="p-4 border border-slate-200 dark:border-slate-700 rounded-xl">
                <h4 className="font-semibold mb-2">{classItem.title}</h4>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                  {classItem.teacher} • {classItem.date}
                </p>
                <Button 
                  size="sm" 
                  variant={classItem.recorded ? "default" : "secondary"}
                  className="w-full"
                  disabled={!classItem.recorded}
                >
                  {classItem.recorded ? 'Watch Recording' : 'Not Available'}
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StudentLiveClasses;