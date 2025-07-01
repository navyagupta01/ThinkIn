import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, Users, Plus, CalendarDays, MapPin } from 'lucide-react';
import TeacherChatAssistant from './TeacherChatAssistant';

const TeacherSchedule: React.FC = () => {
  const [selectedView, setSelectedView] = useState<'week' | 'month'>('week');

  const upcomingClasses = [
    {
      id: 1,
      title: 'Advanced Mathematics',
      time: '09:00 AM - 10:30 AM',
      date: 'Today',
      students: 24,
      room: 'Room 101',
      status: 'scheduled'
    },
    {
      id: 2,
      title: 'Physics Lab Session',
      time: '02:00 PM - 04:00 PM',
      date: 'Today',
      students: 18,
      room: 'Lab A',
      status: 'scheduled'
    },
    {
      id: 3,
      title: 'Chemistry Basics',
      time: '10:00 AM - 11:30 AM',
      date: 'Tomorrow',
      students: 22,
      room: 'Room 203',
      status: 'scheduled'
    },
    {
      id: 4,
      title: 'Biology Workshop',
      time: '03:00 PM - 04:30 PM',
      date: 'Friday',
      students: 20,
      room: 'Lab B',
      status: 'pending'
    }
  ];

  const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const timeSlots = ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00'];

  const stats = [
    { label: 'Classes This Week', value: '12', icon: Calendar, color: 'bg-blue-500' },
    { label: 'Total Students', value: '156', icon: Users, color: 'bg-green-500' },
    { label: 'Hours Scheduled', value: '18', icon: Clock, color: 'bg-purple-500' },
    { label: 'Pending Approvals', value: '3', icon: CalendarDays, color: 'bg-orange-500' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-intel-darkblue to-intel-blue rounded-2xl p-6 text-white">
        <h1 className="text-3xl font-bold mb-2">Schedule Classes 📅</h1>
        <p className="text-blue-100">Organize and manage your teaching schedule</p>
      </div>

      {/* Stats */}
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
        {/* Schedule Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Schedule and manage your classes</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button className="w-full justify-start bg-intel-blue hover:bg-intel-darkblue">
              <Plus className="h-4 w-4 mr-2" />
              Schedule New Class
            </Button>
            <Button 
              className="w-full justify-start border-intel-blue text-intel-blue hover:bg-intel-lightblue hover:bg-opacity-10" 
              variant="outline">
              <Calendar className="h-4 w-4 mr-2" />
              Recurring Classes
            </Button>
            <Button 
              className="w-full justify-start border-intel-blue text-intel-blue hover:bg-intel-lightblue hover:bg-opacity-10" 
              variant="outline">
              <Clock className="h-4 w-4 mr-2" />
              Set Office Hours
            </Button>
            <Button 
              className="w-full justify-start border-intel-blue text-intel-blue hover:bg-intel-lightblue hover:bg-opacity-10" 
              variant="outline">
              <Users className="h-4 w-4 mr-2" />
              Manage Students
            </Button>
          </CardContent>
        </Card>

        {/* Upcoming Classes */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center">
                <Clock className="h-5 w-5 mr-2" />
                Upcoming Classes
              </span>
              <div className="flex space-x-2">
                <Button
                  size="sm"
                  variant={selectedView === 'week' ? 'default' : 'outline'}
                  onClick={() => setSelectedView('week')}
                  className={selectedView === 'week' ? 'bg-intel-blue' : 'border-intel-blue text-intel-blue'}
                >
                  Week
                </Button>
                <Button
                  size="sm"
                  variant={selectedView === 'month' ? 'default' : 'outline'}
                  onClick={() => setSelectedView('month')}
                  className={selectedView === 'month' ? 'bg-intel-blue' : 'border-intel-blue text-intel-blue'}
                >
                  Month
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {upcomingClasses.map((classItem) => (
              <div key={classItem.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <h4 className="font-medium">{classItem.title}</h4>
                    <span className={`px-2 py-1 text-xs rounded ${
                      classItem.status === 'scheduled' 
                        ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                        : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300'
                    }`}>
                      {classItem.status}
                    </span>
                  </div>
                  <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                    <span className="flex items-center">
                      <Clock className="h-4 w-4 mr-1" />
                      {classItem.time}
                    </span>
                    <span className="flex items-center">
                      <Users className="h-4 w-4 mr-1" />
                      {classItem.students} students
                    </span>
                    <span className="flex items-center">
                      <MapPin className="h-4 w-4 mr-1" />
                      {classItem.room}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">{classItem.date}</p>
                </div>
                <div className="space-x-2">
                  <Button size="sm" variant="outline" className="border-intel-blue text-intel-blue">
                    Edit
                  </Button>
                  <Button size="sm" className="bg-intel-blue hover:bg-intel-darkblue">
                    Start
                  </Button>
                </div>
              </div>
            ))}
            <Button variant="ghost" className="w-full text-intel-blue">
              View Full Calendar
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Weekly Calendar View */}
      <Card>
        <CardHeader>
          <CardTitle>This Week's Schedule</CardTitle>
          <CardDescription>Overview of your weekly teaching schedule</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <div className="grid grid-cols-8 gap-2 min-w-full">
              <div className="p-2 text-sm font-medium text-gray-600 dark:text-gray-400">Time</div>
              {weekDays.map((day) => (
                <div key={day} className="p-2 text-sm font-medium text-center text-gray-600 dark:text-gray-400">
                  {day}
                </div>
              ))}
              
              {timeSlots.map((time) => (
                <React.Fragment key={time}>
                  <div className="p-2 text-sm text-gray-600 dark:text-gray-400 border-r">
                    {time}
                  </div>
                  {weekDays.map((day) => (
                    <div key={`${time}-${day}`} className="p-2 border border-gray-200 dark:border-gray-700 rounded min-h-[60px]">
                      {/* Sample class blocks - you can populate these based on actual schedule data */}
                      {(time === '09:00' && day === 'Mon') && (
                        <div className="bg-intel-lightblue text-intel-darkblue p-1 rounded text-xs">
                          Math 101
                        </div>
                      )}
                      {(time === '14:00' && day === 'Wed') && (
                        <div className="bg-green-100 text-green-700 p-1 rounded text-xs">
                          Physics Lab
                        </div>
                      )}
                    </div>
                  ))}
                </React.Fragment>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
      <TeacherChatAssistant />
    </div>
  );
};

export default TeacherSchedule;