import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BarChart3, TrendingUp, Users, Clock, Award, Target, Download, Filter } from 'lucide-react';

const TeacherAnalytics: React.FC = () => {
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'semester'>('month');

  const stats = [
    { label: 'Total Students', value: '156', change: '+12%', icon: Users, color: 'bg-blue-500' },
    { label: 'Avg. Attendance', value: '87%', change: '+5%', icon: TrendingUp, color: 'bg-green-500' },
    { label: 'Completion Rate', value: '92%', change: '+8%', icon: Award, color: 'bg-purple-500' },
    { label: 'Engagement Score', value: '4.6/5', change: '+0.3', icon: Target, color: 'bg-orange-500' },
  ];

  const classPerformance = [
    { subject: 'Advanced Mathematics', students: 24, avgScore: 85, attendance: 92 },
    { subject: 'Physics Lab', students: 18, avgScore: 78, attendance: 88 },
    { subject: 'Chemistry Basics', students: 22, avgScore: 91, attendance: 95 },
    { subject: 'Biology Workshop', students: 20, avgScore: 87, attendance: 90 },
  ];

  const topPerformers = [
    { name: 'Alice Johnson', class: 'Mathematics', score: 98, improvement: '+15%' },
    { name: 'Bob Smith', class: 'Physics', score: 94, improvement: '+12%' },
    { name: 'Carol Davis', class: 'Chemistry', score: 96, improvement: '+18%' },
    { name: 'David Wilson', class: 'Biology', score: 92, improvement: '+10%' },
  ];

  const recentActivity = [
    { activity: 'Quiz: Quadratic Equations completed', class: 'Mathematics', students: 22, avgScore: 88 },
    { activity: 'Lab Report: Pendulum Motion submitted', class: 'Physics', students: 16, avgScore: 85 },
    { activity: 'Assignment: Chemical Bonding graded', class: 'Chemistry', students: 20, avgScore: 91 },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-intel-darkblue to-intel-blue rounded-2xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Analytics Dashboard 📊</h1>
            <p className="text-blue-100">Monitor student progress and engagement metrics</p>
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

      {/* Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className={`p-2 rounded-lg ${stat.color} mr-3`}>
                      <Icon className="h-5 w-5 text-white" />
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Class Performance */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center">
                  <BarChart3 className="h-5 w-5 mr-2" />
                  Class Performance Overview
                </CardTitle>
                <CardDescription>Performance metrics across all your classes</CardDescription>
              </div>
              <Button size="sm" variant="outline" className="border-intel-blue text-intel-blue">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {classPerformance.map((classItem, index) => (
                <div key={index} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">{classItem.subject}</h4>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {classItem.students} students
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Average Score</p>
                      <div className="flex items-center space-x-2">
                        <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div 
                            className="bg-intel-blue h-2 rounded-full" 
                            style={{ width: `${classItem.avgScore}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium">{classItem.avgScore}%</span>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Attendance</p>
                      <div className="flex items-center space-x-2">
                        <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div 
                            className="bg-green-500 h-2 rounded-full" 
                            style={{ width: `${classItem.attendance}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium">{classItem.attendance}%</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Performers */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Award className="h-5 w-5 mr-2" />
              Top Performers
            </CardTitle>
            <CardDescription>Students showing excellent progress</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topPerformers.map((student, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{student.name}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{student.class}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{student.score}%</p>
                    <p className="text-sm text-green-600">{student.improvement}</p>
                  </div>
                </div>
              ))}
            </div>
            <Button variant="ghost" className="w-full mt-4 text-intel-blue">
              View All Students
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity & Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Assessment Results</CardTitle>
            <CardDescription>Latest quiz and assignment outcomes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((item, index) => (
                <div key={index} className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <h4 className="font-medium mb-1">{item.activity}</h4>
                  <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
                    <span>{item.class}</span>
                    <span>{item.students} submissions</span>
                    <span className="font-medium">Avg: {item.avgScore}%</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Insights & Recommendations</CardTitle>
            <CardDescription>AI-powered teaching insights</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <h4 className="font-medium mb-2 text-blue-800 dark:text-blue-200">
                  📈 Strong Performance Trend
                </h4>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  Your Mathematics class shows 15% improvement in quiz scores over the past month.
                </p>
              </div>
              <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                <h4 className="font-medium mb-2 text-yellow-800 dark:text-yellow-200">
                  ⚠️ Attention Needed
                </h4>
                <p className="text-sm text-yellow-700 dark:text-yellow-300">
                  Physics Lab attendance has dropped 5%. Consider reviewing session timing.
                </p>
              </div>
              <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <h4 className="font-medium mb-2 text-green-800 dark:text-green-200">
                  ✅ Engagement Success
                </h4>
                <p className="text-sm text-green-700 dark:text-green-300">
                  Interactive elements in Chemistry increased participation by 20%.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

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
            <Button variant="outline" className="border-intel-blue text-intel-blue">
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