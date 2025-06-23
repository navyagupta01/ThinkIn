import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { BookOpen, Search, Plus, Edit, Trash2, Calendar, Tag, Filter } from 'lucide-react';

const StudentNotes: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const notes = [
    {
      id: 1,
      title: 'Quadratic Equations - Chapter 5',
      subject: 'Mathematics',
      content: 'Key concepts: ax² + bx + c = 0, discriminant, roots, factoring methods...',
      date: '2024-01-15',
      tags: ['algebra', 'equations', 'important'],
      lastModified: '2 days ago'
    },
    {
      id: 2,
      title: 'Newton\'s Laws of Motion',
      subject: 'Physics',
      content: 'First Law: Object at rest stays at rest, Second Law: F = ma, Third Law: Action-reaction...',
      date: '2024-01-14',
      tags: ['mechanics', 'forces', 'exam'],
      lastModified: '3 days ago'
    },
    {
      id: 3,
      title: 'Chemical Bonding Types',
      subject: 'Chemistry',
      content: 'Ionic bonds: metal + non-metal, Covalent bonds: sharing electrons, Metallic bonds...',
      date: '2024-01-13',
      tags: ['chemistry', 'bonds', 'molecules'],
      lastModified: '4 days ago'
    },
    {
      id: 4,
      title: 'Photosynthesis Process',
      subject: 'Biology',
      content: '6CO₂ + 6H₂O + light energy → C₆H₁₂O₆ + 6O₂, Light reactions, Calvin cycle...',
      date: '2024-01-12',
      tags: ['biology', 'plants', 'energy'],
      lastModified: '5 days ago'
    }
  ];

  const subjects = [
    { name: 'All Subjects', count: notes.length, color: 'bg-gray-500' },
    { name: 'Mathematics', count: 1, color: 'bg-blue-500' },
    { name: 'Physics', count: 1, color: 'bg-green-500' },
    { name: 'Chemistry', count: 1, color: 'bg-purple-500' },
    { name: 'Biology', count: 1, color: 'bg-orange-500' }
  ];

  const getSubjectColor = (subject: string) => {
    switch (subject) {
      case 'Mathematics': return 'bg-blue-100 text-blue-800';
      case 'Physics': return 'bg-green-100 text-green-800';
      case 'Chemistry': return 'bg-purple-100 text-purple-800';
      case 'Biology': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredNotes = notes.filter(note =>
    note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    note.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
    note.subject.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-gradient-to-r from-[#0071c5] via-[#004494] to-[#002c5f] rounded-2xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2 flex items-center">
              <BookOpen className="h-8 w-8 mr-3" />
              My Notes
            </h1>
            <p className="text-[#a8d4f0]">Review and organize your lesson notes and summaries</p>
          </div>
          <Button className="bg-white text-[#0071c5] hover:bg-gray-100">
            <Plus className="h-4 w-4 mr-2" />
            New Note
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          {/* Search */}
          <Card>
            <CardContent className="p-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input 
                  placeholder="Search notes..." 
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Subjects Filter */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <Filter className="h-5 w-5 mr-2" />
                Subjects
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {subjects.map((subject, index) => (
                <div key={index} className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer transition-colors">
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${subject.color}`} />
                    <span className="text-sm font-medium">{subject.name}</span>
                  </div>
                  <span className="text-xs text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded-full">
                    {subject.count}
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Statistics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600 dark:text-slate-400">Total Notes</span>
                <span className="font-semibold">{notes.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600 dark:text-slate-400">This Week</span>
                <span className="font-semibold">3</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600 dark:text-slate-400">Last Updated</span>
                <span className="font-semibold text-[#0071c5]">{notes[0]?.lastModified}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Notes Grid */}
        <div className="lg:col-span-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredNotes.map((note) => (
              <Card key={note.id} className="hover:shadow-lg transition-all duration-300 group">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg mb-2 group-hover:text-[#0071c5] transition-colors">
                        {note.title}
                      </CardTitle>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSubjectColor(note.subject)}`}>
                          {note.subject}
                        </span>
                        <span className="text-xs text-slate-500 flex items-center">
                          <Calendar className="h-3 w-3 mr-1" />
                          {note.date}
                        </span>
                      </div>
                    </div>
                    <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-red-500 hover:text-red-700">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-4 line-clamp-3">
                    {note.content}
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex flex-wrap gap-1">
                      {note.tags.map((tag, index) => (
                        <span key={index} className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                          <Tag className="h-3 w-3 mr-1" />
                          {tag}
                        </span>
                      ))}
                    </div>
                    <span className="text-xs text-slate-500">{note.lastModified}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredNotes.length === 0 && (
            <Card className="text-center py-12">
              <CardContent>
                <BookOpen className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Notes Found</h3>
                <p className="text-slate-600 dark:text-slate-400 mb-4">
                  {searchTerm ? `No notes match "${searchTerm}"` : 'Start taking notes to see them here'}
                </p>
                <Button className="bg-[#0071c5] hover:bg-[#004494]">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Note
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentNotes;