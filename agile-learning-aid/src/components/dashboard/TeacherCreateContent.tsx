import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle, FileText, Video, Image, BookOpen, Edit3 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import TeacherChatAssistant from './TeacherChatAssistant';
import { toast } from '@/hooks/use-toast';

interface FormData {
  title: string;
  subject: string;
  file: File | null;
}

interface Content {
  _id: string;
  title: string;
  type: string;
  uploadDate: string;
  filePath: string;
}

interface ContentType {
  id: number;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  action: () => void;
  type: string;
}

const TeacherCreateContent: React.FC = () => {
  const navigate = useNavigate();
  const [showForm, setShowForm] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData>({ title: '', subject: '', file: null });
  const [uploading, setUploading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [recentContent, setRecentContent] = useState<Content[]>([]);

  const contentTypes: ContentType[] = [
    {
      id: 1,
      title: 'Create Lesson Plan',
      description: 'Design structured lesson plans with objectives and activities',
      icon: BookOpen,
      color: 'bg-blue-500',
      action: () => navigate('/create/lesson-plan'),
      type: 'LessonPlan',
    },
    {
      id: 2,
      title: 'Upload Video Content',
      description: 'Add educational videos to your course library',
      icon: Video,
      color: 'bg-red-500',
      action: () => setShowForm('Video'),
      type: 'Video',
    },
    {
      id: 3,
      title: 'Create Quiz',
      description: 'Build interactive quizzes to test student understanding',
      icon: Edit3,
      color: 'bg-green-500',
      action: () => navigate('/create/quiz'),
      type: 'Quiz',
    },
    {
      id: 4,
      title: 'Upload Documents',
      description: 'Share PDFs, presentations (.pptx), and other documents',
      icon: FileText,
      color: 'bg-purple-500',
      action: () => setShowForm('Document'),
      type: 'Document',
    },
    {
      id: 5,
      title: 'Add Images',
      description: 'Upload diagrams, charts, and visual aids',
      icon: Image,
      color: 'bg-orange-500',
      action: () => setShowForm('Image'),
      type: 'Image',
    },
    {
      id: 6,
      title: 'Upload Other Content',
      description: 'Share any other type of educational materials',
      icon: FileText,
      color: 'bg-gray-500',
      action: () => setShowForm('Other'),
      type: 'Other',
    },
  ];

  useEffect(() => {
    fetchRecentContent();
  }, []);

  const fetchRecentContent = async () => {
    try {
      const response = await fetch('http://localhost:5009/api/content?limit=3');
      if (!response.ok) {
        throw new Error(`Failed to fetch recent content: ${response.statusText}`);
      }
      const data: Content[] = await response.json();
      setRecentContent(data);
    } catch (error: any) {
      setError(error.message || 'Error fetching recent content');
      toast({ title: 'Error', description: error.message || 'Error fetching recent content', variant: 'destructive' });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFormData({ ...formData, file: e.target.files[0] });
    }
  };

  const handleSubmit = async (type: string) => {
    if (!formData.title || !formData.subject || !formData.file) {
      setError('Please fill all fields and select a file.');
      toast({ title: 'Error', description: 'Please fill all fields and select a file.', variant: 'destructive' });
      return;
    }

    setUploading(true);
    setError(null);
    const data = new FormData();
    data.append('title', formData.title);
    data.append('subject', formData.subject);
    data.append('type', type);
    data.append('file', formData.file);

    try {
      const response = await fetch('http://localhost:5009/api/content', {
        method: 'POST',
        body: data,
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to upload content');
      }
      toast({
        title: 'Success',
        description: 'Content uploaded successfully'
      });
      setFormData({ title: '', subject: '', file: null });
      setShowForm(null);
      fetchRecentContent();
    } catch (error: any) {
      setError(error.message || 'Error uploading content');
      toast({ title: 'Error', description: error.message || 'Error uploading content', variant: 'destructive' });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-intel-darkblue to-intel-blue rounded-2xl p-6 text-white">
        <h1 className="text-3xl font-bold mb-2">Create Content 📚</h1>
        <p className="text-blue-100">Design engaging lessons and learning materials for your students</p>
      </div>

      {error && (
        <div className="p-4 bg-red-50 text-red-800 rounded-lg">
          {error}
        </div>
      )}

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
                  disabled={uploading}
                >
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Create New
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Upload {showForm} Content</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Input
                placeholder="Content Title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                disabled={uploading}
              />
              <Input
                placeholder="Subject"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                disabled={uploading}
              />
              <Input
                type="file"
                onChange={handleFileChange}
                disabled={uploading}
              />
              <div className="flex space-x-2">
                <Button onClick={() => handleSubmit(showForm)} disabled={uploading}>
                  {uploading ? 'Uploading...' : 'Upload'}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowForm(null);
                    setError(null);
                    setFormData({ title: '', subject: '', file: null });
                  }}
                  disabled={uploading}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Recent Content</CardTitle>
          <CardDescription>Your recently created educational materials</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentContent.length === 0 ? (
              <div className="text-center text-gray-600">No recent content available.</div>
            ) : (
              recentContent.map((content) => (
                <div key={content._id} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <div>
                    <h4 className="font-medium">{content.title}</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {content.type} • Created {new Date(content.uploadDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-intel-blue text-intel-blue"
                      onClick={() => navigate(`/edit/content/${content._id}`)}
                    >
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-green-500 text-green-500"
                      onClick={() => window.open(`http://localhost:5009/${content.filePath}`, '_blank')}
                    >
                      View
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
          <Button variant="ghost" className="w-full mt-4 text-intel-blue">
            View All Content
          </Button>
        </CardContent>
      </Card>

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
      <TeacherChatAssistant />
    </div>
  );
};

export default TeacherCreateContent;