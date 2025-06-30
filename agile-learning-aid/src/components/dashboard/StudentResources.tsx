import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookOpen, Download, FileText, Video, Image, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Resource {
  _id: string;
  title: string;
  subject: string;
  type: string;
  filePath: string;
  fileSize: string;
  uploadDate: string;
}

interface Filters {
  subject: string;
  type: string;
  search: string;
}

const StudentResources: React.FC = () => {
  const [resources, setResources] = useState<Resource[]>([]);
  const [subjects, setSubjects] = useState<string[]>([]);
  const [filters, setFilters] = useState<Filters>({ subject: '', type: '', search: '' });
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSubjects();
  }, []);

  useEffect(() => {
    fetchResources();
  }, [filters]);

  const fetchResources = async () => {
    setLoading(true);
    setError(null);
    try {
      const query = new URLSearchParams({
        ...(filters.subject && { subject: filters.subject }),
        ...(filters.type && { type: filters.type }),
      }).toString();
      const response = await fetch(`http://localhost:5009/api/content?${query}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch resources: ${response.statusText}`);
      }
      const data: Resource[] = await response.json();
      setResources(data);
    } catch (error: any) {
      setError(error.message || 'Error fetching resources');
      console.error('Error fetching resources:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSubjects = async () => {
    try {
      const response = await fetch('http://localhost:5009/api/subjects');
      if (!response.ok) {
        throw new Error(`Failed to fetch subjects: ${response.statusText}`);
      }
      const data: string[] = await response.json();
      setSubjects(data);
    } catch (error: any) {
      setError(error.message || 'Error fetching subjects');
      console.error('Error fetching subjects:', error);
    }
  };

  const getTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'pdf': return 'bg-red-100 text-red-800';
      case 'video': return 'bg-blue-100 text-blue-800';
      case 'image': return 'bg-green-100 text-green-800';
      case 'document': return 'bg-purple-100 text-purple-800';
      case 'presentation': return 'bg-orange-100 text-orange-800';
      case 'other': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'pdf': return FileText;
      case 'video': return Video;
      case 'image': return Image;
      case 'document': return FileText;
      case 'presentation': return FileText;
      case 'other': return FileText;
      default: return FileText;
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

      {/* Error Message */}
      {error && (
        <div className="p-4 bg-red-50 text-red-800 rounded-lg">
          {error}
        </div>
      )}

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search resources by title..."
                className="pl-10"
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              />
            </div>
            <Select onValueChange={(value) => setFilters({ ...filters, subject: value === 'all' ? '' : value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select Subject" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Subjects</SelectItem>
                {subjects.map((subject) => (
                  <SelectItem key={subject} value={subject}>
                    {subject}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={filters.type || 'all'} // Make the Select controlled
              onValueChange={(value) => setFilters({ ...filters, type: value === 'all' ? '' : value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="PDF">PDF</SelectItem>
                <SelectItem value="Video">Video</SelectItem>
                <SelectItem value="Image">Image</SelectItem>
                <SelectItem value="Document">Document</SelectItem>
                <SelectItem value="Presentation">Presentation</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
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
              {subjects.map((subject, index) => (
                <div
                  key={subject}
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer transition-colors"
                  onClick={() => setFilters({ ...filters, subject })}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full bg-${['blue', 'green', 'purple', 'orange'][index % 4]}-500`} />
                    <span className="font-medium">{subject}</span>
                  </div>
                  <span className="text-sm text-slate-600 dark:text-slate-400">
                    {resources.filter((r) => r.subject === subject).length}
                  </span>
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
              {loading ? (
                <div className="text-center text-gray-600">Loading resources...</div>
              ) : resources.length === 0 ? (
                <div className="text-center text-gray-600">No resources found.</div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {resources
                    .filter((resource) =>
                      resource.title.toLowerCase().includes(filters.search.toLowerCase())
                    )
                    .map((resource) => {
                      const IconComponent = getIcon(resource.type);
                      return (
                        <div key={resource._id} className="p-4 border border-slate-200 dark:border-slate-700 rounded-xl hover:shadow-lg transition-all duration-300">
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
                              {resource.fileSize} • {new Date(resource.uploadDate).toLocaleDateString()}
                            </div>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-[#0071c5] border-[#0071c5] hover:bg-[#0071c5] hover:text-white"
                              onClick={() => window.open(`http://localhost:5009/${resource.filePath}`, '_blank')}
                            >
                              <Download className="h-4 w-4 mr-1" />
                              Download
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Categories */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {['All', 'Documents', 'Videos', 'Images', 'Presentations', 'Other'].map((category) => {
              const IconComponent = category === 'Documents' ? FileText : 
                                  category === 'Videos' ? Video : 
                                  category === 'Images' ? Image : 
                                  category === 'All' ? BookOpen : FileText;
              return (
                <Card
                  key={category}
                  className="hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => setFilters({ ...filters, type: category === 'All' ? '' : (category === 'Presentations' ? 'Presentation' : category.slice(0, -1)) })}
                >
                  <CardContent className="p-6 text-center">
                    <IconComponent className="h-12 w-12 text-[#0071c5] mx-auto mb-4" />
                    <h3 className="font-semibold mb-2">{category}</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                      {category === 'All'
                        ? 'All educational materials'
                        : category === 'Documents'
                        ? 'PDFs, notes, and study materials'
                        : category === 'Videos'
                        ? 'Recorded lectures and tutorials'
                        : category === 'Images'
                        ? 'Diagrams, charts, and illustrations'
                        : category === 'Presentations'
                        ? 'Slides and presentation materials'
                        : 'Other educational materials'}
                    </p>
                    <Button variant="outline" size="sm">View All</Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentResources;