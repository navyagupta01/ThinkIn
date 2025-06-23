import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookOpen, Download, FileText, Video, Image, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

const StudentResources: React.FC = () => {
  const subjects = [
    { id: 1, name: 'Mathematics', resources: 15, color: 'bg-blue-500' },
    { id: 2, name: 'Physics', resources: 12, color: 'bg-green-500' },
    { id: 3, name: 'Chemistry', resources: 18, color: 'bg-purple-500' },
    { id: 4, name: 'Biology', resources: 9, color: 'bg-orange-500' },
  ];

  const recentResources = [
    {
      id: 1,
      title: 'Calculus Fundamentals',
      type: 'PDF',
      subject: 'Mathematics',
      size: '2.5 MB',
      uploadDate: '2 days ago',
      icon: FileText
    },
    {
      id: 2,
      title: 'Newton\'s Laws Explained',
      type: 'Video',
      subject: 'Physics',
      size: '45 MB',
      uploadDate: '3 days ago',
      icon: Video
    },
    {
      id: 3,
      title: 'Chemical Bonds Diagram',
      type: 'Image',
      subject: 'Chemistry',
      size: '1.2 MB',
      uploadDate: '1 week ago',
      icon: Image
    },
    {
      id: 4,
      title: 'Organic Chemistry Notes',
      type: 'PDF',
      subject: 'Chemistry',
      size: '3.1 MB',
      uploadDate: '1 week ago',
      icon: FileText
    }
  ];

  const popularResources = [
    { id: 1, title: 'Algebra Cheat Sheet', downloads: 245, subject: 'Mathematics' },
    { id: 2, title: 'Physics Formula Collection', downloads: 189, subject: 'Physics' },
    { id: 3, title: 'Periodic Table Guide', downloads: 167, subject: 'Chemistry' }
  ];

  const getTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'pdf': return 'bg-red-100 text-red-800';
      case 'video': return 'bg-blue-100 text-blue-800';
      case 'image': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-gradient-to-r from-[#0071c5] via-[#004494] to-[#002c5f] rounded-2xl p-6 text-white">
        <h1 className="text-3xl font-bold mb-2 flex items-center">
          <BookOpen className="h-8 w-8 mr-3" />
          Learning Resources
        </h1>
        <p className="text-[#a8d4f0]">Access your course materials, videos, and study guides</p>
      </div>

      {/* Search Bar */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input 
              placeholder="Search resources by title, subject, or type..." 
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Subjects */}
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Subjects</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {subjects.map((subject) => (
                <div key={subject.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer transition-colors">
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${subject.color}`} />
                    <span className="font-medium">{subject.name}</span>
                  </div>
                  <span className="text-sm text-slate-600 dark:text-slate-400">
                    {subject.resources}
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Popular Downloads</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {popularResources.map((resource) => (
                <div key={resource.id} className="p-3 border border-slate-200 dark:border-slate-700 rounded-lg">
                  <h4 className="font-medium text-sm mb-1">{resource.title}</h4>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mb-2">{resource.subject}</p>
                  <p className="text-xs text-[#0071c5]">{resource.downloads} downloads</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3 space-y-6">
          {/* Recent Resources */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Resources</CardTitle>
              <CardDescription>Latest materials added to your courses</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {recentResources.map((resource) => {
                  const IconComponent = resource.icon;
                  return (
                    <div key={resource.id} className="p-4 border border-slate-200 dark:border-slate-700 rounded-xl hover:shadow-lg transition-all duration-300">
                      <div className="flex items-start space-x-3 mb-3">
                        <div className="p-2 bg-[#0071c5]/10 rounded-lg">
                          <IconComponent className="h-5 w-5 text-[#0071c5]" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-slate-900 dark:text-white truncate">
                            {resource.title}
                          </h4>
                          <p className="text-sm text-slate-600 dark:text-slate-400">
                            {resource.subject}
                          </p>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(resource.type)}`}>
                          {resource.type}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="text-xs text-slate-500 dark:text-slate-400">
                          {resource.size} • {resource.uploadDate}
                        </div>
                        <Button size="sm" variant="outline" className="text-[#0071c5] border-[#0071c5] hover:bg-[#0071c5] hover:text-white">
                          <Download className="h-4 w-4 mr-1" />
                          Download
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Categories */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="p-6 text-center">
                <FileText className="h-12 w-12 text-[#0071c5] mx-auto mb-4" />
                <h3 className="font-semibold mb-2">Documents</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">PDFs, notes, and study materials</p>
                <Button variant="outline" size="sm">View All</Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="p-6 text-center">
                <Video className="h-12 w-12 text-[#0071c5] mx-auto mb-4" />
                <h3 className="font-semibold mb-2">Videos</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">Recorded lectures and tutorials</p>
                <Button variant="outline" size="sm">View All</Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="p-6 text-center">
                <Image className="h-12 w-12 text-[#0071c5] mx-auto mb-4" />
                <h3 className="font-semibold mb-2">Images</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">Diagrams, charts, and illustrations</p>
                <Button variant="outline" size="sm">View All</Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentResources;