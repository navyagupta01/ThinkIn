import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle, FileText, Video, Image, BookOpen, Edit3 } from 'lucide-react';

const TeacherCreateContent: React.FC = () => {
  const navigate = useNavigate();

  const contentTypes = [
    {
      id: 1,
      title: 'Create Lesson Plan',
      description: 'Design structured lesson plans with objectives and activities',
      icon: BookOpen,
      color: 'bg-blue-500',
      action: () => navigate('/create/lesson-plan'),
    },
    {
      id: 2,
      title: 'Upload Video Content',
      description: 'Add educational videos to your course library',
      icon: Video,
      color: 'bg-red-500',
      action: () => navigate('/create/video'),
    },
    {
      id: 3,
      title: 'Create Quiz',
      description: 'Build interactive quizzes to test student understanding',
      icon: Edit3,
      color: 'bg-green-500',
      action: () => navigate('/create/quiz'),
    },
    {
      id: 4,
      title: 'Upload Documents',
      description: 'Share PDFs, presentations, and other learning materials',
      icon: FileText,
      color: 'bg-purple-500',
      action: () => navigate('/create/documents'),
    },
    {
      id: 5,
      title: 'Add Images',
      description: 'Upload diagrams, charts, and visual aids',
      icon: Image,
      color: 'bg-orange-500',
      action: () => navigate('/create/images'),
    },
  ];

  const recentContent = [
    { id: 1, title: 'Mathematics Chapter 5', type: 'Lesson Plan', created: '2 hours ago' },
    { id: 2, title: 'Physics Quiz - Motion', type: 'Quiz', created: '1 day ago' },
    { id: 3, title: 'Chemistry Lab Video', type: 'Video', created: '3 days ago' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-intel-darkblue to-intel-blue rounded-2xl p-6 text-white">
        <h1 className="text-3xl font-bold mb-2">Create Content 📚</h1>
        <p className="text-blue-100">Design engaging lessons and learning materials for your students</p>
      </div>

      {/* Content Creation Options */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {contentTypes.map((type) => {
          const Icon = type.icon;
          return (
            <Card key={type.id} className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className={`p-3 rounded-lg ${type.color}`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{type.title}</CardTitle>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="mb-4">{type.description}</CardDescription>
                <Button
                  className="w-full bg-intel-blue hover:bg-intel-darkblue"
                  onClick={type.action}
                >
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Create New
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Recent Content */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Content</CardTitle>
          <CardDescription>Your recently created educational materials</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentContent.map((content) => (
              <div key={content.id} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                <div>
                  <h4 className="font-medium">{content.title}</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {content.type} • Created {content.created}
                  </p>
                </div>
                <div className="space-x-2">
                  <Button size="sm" variant="outline" className="border-intel-blue text-intel-blue">
                    Edit
                  </Button>
                  <Button size="sm" variant="outline" className="border-green-500 text-green-500">
                    View
                  </Button>
                </div>
              </div>
            ))}
          </div>
          <Button variant="ghost" className="w-full mt-4 text-intel-blue">
            View All Content
          </Button>
        </CardContent>
      </Card>

      {/* Quick Tips */}
      <Card>
        <CardHeader>
          <CardTitle>Content Creation Tips</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <h4 className="font-medium mb-2">Engaging Lessons</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Include interactive elements and real-world examples to keep students engaged.
              </p>
            </div>
            <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <h4 className="font-medium mb-2">Clear Objectives</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Define clear learning objectives for each lesson to guide student progress.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TeacherCreateContent;