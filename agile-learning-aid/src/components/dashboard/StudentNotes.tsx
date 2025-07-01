import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { BookOpen, Search, Plus, Edit, Trash2, Calendar, Tag, Filter, Sparkles, Loader2 } from 'lucide-react';

interface Note {
  id: string | number;
  title: string;
  subject: string;
  content: string;
  date: string;
  tags: string[];
  lastModified: string;
}

interface Subject {
  name: string;
  count: number;
  color: string;
}

const StudentNotes: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [isImproving, setIsImproving] = useState(false);
  const [showImproveModal, setShowImproveModal] = useState(false);
  const [notes, setNotes] = useState<Note[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch notes from your API/database
  const fetchNotes = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Replace this with your actual API endpoint
      const response = await fetch('/api/notes');
      
      if (!response.ok) {
        throw new Error('Failed to fetch notes');
      }
      
      const data = await response.json();
      setNotes(data.notes || []);
      
    } catch (err) {
      console.error('Error fetching notes:', err);
      setError('Failed to load notes. Please try again later.');
      // Set empty array as fallback
      setNotes([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate subjects dynamically from notes
  const calculateSubjects = (notesList: Note[]) => {
    const subjectCounts: { [key: string]: number } = {};
    
    notesList.forEach(note => {
      subjectCounts[note.subject] = (subjectCounts[note.subject] || 0) + 1;
    });

    const subjectColors = [
      'bg-blue-500',
      'bg-green-500', 
      'bg-purple-500',
      'bg-orange-500',
      'bg-red-500',
      'bg-indigo-500',
      'bg-pink-500',
      'bg-teal-500'
    ];

    const calculatedSubjects: Subject[] = [
      { name: 'All Subjects', count: notesList.length, color: 'bg-gray-500' }
    ];

    Object.entries(subjectCounts).forEach(([subject, count], index) => {
      calculatedSubjects.push({
        name: subject,
        count,
        color: subjectColors[index % subjectColors.length]
      });
    });

    return calculatedSubjects;
  };

  // Load data on component mount
  useEffect(() => {
    fetchNotes();
  }, []);

  // Update subjects when notes change
  useEffect(() => {
    setSubjects(calculateSubjects(notes));
  }, [notes]);

  const getSubjectColor = (subject: string) => {
    const colorMap: { [key: string]: string } = {
      'Mathematics': 'bg-blue-100 text-blue-800',
      'Physics': 'bg-green-100 text-green-800',
      'Chemistry': 'bg-purple-100 text-purple-800',
      'Biology': 'bg-orange-100 text-orange-800',
      'History': 'bg-red-100 text-red-800',
      'English': 'bg-indigo-100 text-indigo-800',
      'Geography': 'bg-teal-100 text-teal-800',
      'Computer Science': 'bg-pink-100 text-pink-800',
    };
    
    return colorMap[subject] || 'bg-gray-100 text-gray-800';
  };

  const filteredNotes = notes.filter(note =>
    note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    note.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
    note.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
    note.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // AI Improvement Function
  const improveNote = async (noteToImprove: Note) => {
    if (!noteToImprove?.content) {
      alert('No note content to improve');
      return;
    }

    setIsImproving(true);
    
    try {
      const response = await fetch('/api/improve-note', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ note: noteToImprove.content }),
      });

      const data = await response.json();

      if (response.ok) {
        // Update the note with improved content
        setNotes(prevNotes => 
          prevNotes.map(note => 
            note.id === noteToImprove.id 
              ? { ...note, content: data.improved, lastModified: 'just now' }
              : note
          )
        );
        
        // Optionally update the note in your database
        await updateNoteInDatabase(noteToImprove.id, data.improved);
        
        alert('✅ Note improved successfully and saved!');
        setShowImproveModal(false);
      } else {
        alert(`❌ Error: ${data.error}`);
      }
    } catch (error) {
      console.error('Failed to improve note:', error);
      alert('❌ Failed to contact AI service. Please try again.');
    } finally {
      setIsImproving(false);
    }
  };

  // Function to update note in your database
  const updateNoteInDatabase = async (noteId: string | number, improvedContent: string) => {
    try {
      await fetch(`/api/notes/${noteId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: improvedContent }),
      });
    } catch (error) {
      console.error('Failed to update note in database:', error);
    }
  };

  // Calculate statistics dynamically
  const getStatistics = () => {
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    const thisWeekNotes = notes.filter(note => {
      const noteDate = new Date(note.date);
      return noteDate >= oneWeekAgo;
    });

    const lastUpdatedNote = notes.reduce((latest, note) => {
      const noteDate = new Date(note.date);
      const latestDate = latest ? new Date(latest.date) : new Date(0);
      return noteDate > latestDate ? note : latest;
    }, null as Note | null);

    return {
      total: notes.length,
      thisWeek: thisWeekNotes.length,
      lastUpdated: lastUpdatedNote?.lastModified || 'N/A'
    };
  };

  const stats = getStatistics();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-[#0071c5] via-[#004494] to-[#002c5f] rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2 flex items-center">
                <BookOpen className="h-8 w-8 mr-3" />
                My Notes
              </h1>
              <p className="text-[#a8d4f0]">Loading your notes...</p>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-[#0071c5]" />
          <span className="ml-2 text-lg">Loading notes...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-[#0071c5] via-[#004494] to-[#002c5f] rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2 flex items-center">
                <BookOpen className="h-8 w-8 mr-3" />
                My Notes
              </h1>
              <p className="text-[#a8d4f0]">Review and organize your lesson notes and summaries</p>
            </div>
          </div>
        </div>
        <Card className="text-center py-12">
          <CardContent>
            <div className="text-red-500 mb-4">
              <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-semibold mb-2">Error Loading Notes</h3>
              <p className="text-gray-600 mb-4">{error}</p>
              <Button onClick={fetchNotes} className="bg-[#0071c5] hover:bg-[#004494]">
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

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

          {/* Dynamic Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Statistics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600 dark:text-slate-400">Total Notes</span>
                <span className="font-semibold">{stats.total}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600 dark:text-slate-400">This Week</span>
                <span className="font-semibold">{stats.thisWeek}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600 dark:text-slate-400">Last Updated</span>
                <span className="font-semibold text-[#0071c5]">{stats.lastUpdated}</span>
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
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        className="h-8 w-8 p-0 text-yellow-500 hover:text-yellow-700"
                        onClick={() => {
                          setSelectedNote(note);
                          setShowImproveModal(true);
                        }}
                        disabled={isImproving}
                      >
                        {isImproving && selectedNote?.id === note.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Sparkles className="h-4 w-4" />
                        )}
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

          {filteredNotes.length === 0 && !isLoading && (
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

      {/* AI Improvement Confirmation Modal */}
      {showImproveModal && selectedNote && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Sparkles className="h-5 w-5 mr-2 text-yellow-500" />
                Improve Note with AI
              </CardTitle>
              <CardDescription>
                This will improve the note "{selectedNote.title}" using AI and save it to Notion.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex space-x-3">
                <Button 
                  variant="outline" 
                  onClick={() => setShowImproveModal(false)}
                  disabled={isImproving}
                >
                  Cancel
                </Button>
                <Button 
                  className="bg-yellow-500 hover:bg-yellow-600 text-white flex-1"
                  onClick={() => improveNote(selectedNote)}
                  disabled={isImproving}
                >
                  {isImproving ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Improving...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 mr-2" />
                      Improve with AI
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default StudentNotes;