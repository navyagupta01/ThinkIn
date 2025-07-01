import React, { useEffect, useState, useCallback } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Typography from '@tiptap/extension-typography';
import TextStyle from '@tiptap/extension-text-style';
import Highlight from '@tiptap/extension-highlight';
import TextAlign from '@tiptap/extension-text-align';
import Underline from '@tiptap/extension-underline';
import Subscript from '@tiptap/extension-subscript';
import Superscript from '@tiptap/extension-superscript';
import katex from 'katex';
import 'katex/dist/katex.min.css';

// UI components (assumed to be available in your project)
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

// Initialize Supabase with environment variables
const supabase = createClient(
  'https://bziqqrmbmerdnepnvtlp.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ6aXFxcm1ibWVyZG5lcG52dGxwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MTIxNDE0MywiZXhwIjoyMDY2NzkwMTQzfQ.QSFy9x28G7FkJGhmrDpnxxqFW-5Kk_bYwpDREj3_yUE'
);

interface Note {
  id: string;
  title: string;
  content: string;
  subject: string;
  role: string;
  created_by: string;
  created_at: string;
  tags?: string[];
}

// Functional Error Boundary Component
const ErrorBoundary: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [error, setError] = useState<string | null>(null);

  React.useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      console.error('Uncaught error:', event.error);
      setError(event.error?.message || 'An unexpected error occurred.');
    };

    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, []);

  if (error) {
    return (
      <div className="bg-red-100 text-red-700 p-4 rounded-md m-6">
        <h2>Something went wrong: {error}</h2>
        <p>Please refresh the page or try again.</p>
      </div>
    );
  }

  return <>{children}</>;
};

const LaTeXGuide: React.FC = () => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          LaTeX Guide
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>LaTeX Guide for Mathematical Formulas</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <p className="text-sm">
            Use LaTeX to write mathematical expressions with variables like a and b. Enter formulas without the <code>$</code> symbols. Below are examples using a and b to illustrate common LaTeX commands.
          </p>
          <div className="space-y-2">
            <h3 className="font-medium">Examples with Variables a and b</h3>
            <ul className="list-disc pl-5 text-sm">
              <li>
                <strong>Fraction</strong>: <code>\frac{`{a}`}{`{b}`}</code> → renders as 
                <span dangerouslySetInnerHTML={{ __html: katex.renderToString('\\frac{a}{b}', { throwOnError: false }) }} />
              </li>
              <li>
                <strong>Superscript</strong>: <code>a^2 + b^2</code> → renders as 
                <span dangerouslySetInnerHTML={{ __html: katex.renderToString('a^2 + b^2', { throwOnError: false }) }} />
              </li>
              <li>
                <strong>Subscript</strong>: <code>a_1 + b_1</code> → renders as 
                <span dangerouslySetInnerHTML={{ __html: katex.renderToString('a_1 + b_1', { throwOnError: false }) }} />
              </li>
              <li>
                <strong>Square Root</strong>: <code>\sqrt{`{a + b}`}</code> → renders as 
                <span dangerouslySetInnerHTML={{ __html: katex.renderToString('\\sqrt{a + b}', { throwOnError: false }) }} />
              </li>
              <li>
                <strong>Sum</strong>: <code>\sum_{`{i=a}`}^{`{b}`} i</code> → renders as 
                <span dangerouslySetInnerHTML={{ __html: katex.renderToString('\\sum_{i=a}^{b} i', { throwOnError: false }) }} />
              </li>
              <li>
                <strong>Integral</strong>: <code>\int_{`{a}`}^{`{b}`} x\,dx</code> → renders as 
                <span dangerouslySetInnerHTML={{ __html: katex.renderToString('\\int_{a}^{b} x\\,dx', { throwOnError: false }) }} />
              </li>
              <li>
                <strong>Equation</strong>: <code>a^2 + b^2 = c^2</code> → renders as 
                <span dangerouslySetInnerHTML={{ __html: katex.renderToString('a^2 + b^2 = c^2', { throwOnError: false }) }} />
              </li>
              <li>
                <strong>Matrix</strong>: <code>\begin{`{pmatrix}`} a & b \\ b & a \end{`{pmatrix}`}</code> → renders as 
                <span dangerouslySetInnerHTML={{ __html: katex.renderToString('\\begin{pmatrix} a & b \\\\ b & a \\end{pmatrix}', { throwOnError: false }) }} />
              </li>
            </ul>
            <p className="text-sm">
              <strong>Tip</strong>: Enter LaTeX code (e.g., <code>a^2 + b^2</code>) without <code>$</code> symbols. The editor will render it in the preview. Use variables like a and b for placeholders in your formulas.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

const StudentNotes: React.FC = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [saving, setSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string>('00000000-0000-0000-0000-000000000000');
  const [isEditorReady, setIsEditorReady] = useState(false);
  const [lastSavedContent, setLastSavedContent] = useState<string>('');

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        history: {
          depth: 100,
        },
        paragraph: {
          HTMLAttributes: {
            class: 'my-2',
          },
        },
        heading: {
          levels: [1, 2, 3, 4, 5, 6],
          HTMLAttributes: {
            class: 'font-bold my-2',
          },
        },
        bulletList: {
          HTMLAttributes: {
            class: 'list-disc ml-6',
          },
        },
        orderedList: {
          HTMLAttributes: {
            class: 'list-decimal ml-6',
          },
        },
        listItem: {
          HTMLAttributes: {
            class: 'my-1',
          },
        },
        codeBlock: {
          HTMLAttributes: {
            class: 'bg-gray-100 p-4 rounded-md font-mono text-sm',
          },
        },
        code: {
          HTMLAttributes: {
            class: 'bg-gray-200 px-1 rounded font-mono text-sm',
          },
        },
      }),
      Placeholder.configure({
        placeholder: 'Start typing your notes here... Use $formula$ for math equations',
        emptyEditorClass: 'is-editor-empty',
      }),
      Typography.configure({
        openDoubleQuote: '"',
        closeDoubleQuote: '"',
        openSingleQuote: "'",
        closeSingleQuote: "'",
      }),
      TextStyle,
      Highlight.configure({
        multicolor: true,
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Underline,
      Subscript,
      Superscript,
    ],
    content: '',
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none min-h-[300px] p-4',
        spellcheck: 'true',
      },
      handleKeyDown: (view, event) => {
        return false;
      },
    },
    onUpdate: ({ editor }) => {
      if (!selectedNote || !isEditorReady) return;
      
      const content = editor.getHTML();
      if (content !== lastSavedContent) {
        setSelectedNote(prev => (prev ? { ...prev, content } : null));
      }
    },
    onCreate: ({ editor }) => {
      console.log('Editor created successfully');
      setIsEditorReady(true);
    },
    onDestroy: () => {
      console.log('Editor destroyed');
      setIsEditorReady(false);
    },
  });

  // Get authenticated user ID
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser();
        if (error) {
          console.error('Error fetching user:', error.message);
          return;
        }
        if (user) {
          setUserId(user.id);
          console.log('Authenticated user ID:', user.id);
        }
      } catch (err) {
        console.error('Unexpected error fetching user:', err);
      }
    };
    fetchUser();
  }, []);

  // Fetch notes from Supabase
  const fetchNotes = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('notes1')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) {
        console.error('Error fetching notes:', error.message, error.details);
        setError(`Failed to load notes: ${error.message}`);
        return;
      }
      console.log('Fetched notes:', data);
      setNotes(data as Note[]);
      setError(null);
    } catch (err) {
      console.error('Unexpected error fetching notes:', err);
      setError('An unexpected error occurred while loading notes.');
    }
  }, []);

  // Auto-save with debounce
  useEffect(() => {
    if (!selectedNote || !selectedNote.id || !isEditorReady) return;
    
    const handler = setTimeout(() => {
      if (selectedNote.content !== lastSavedContent) {
        console.log('Triggering auto-save for note:', selectedNote.id);
        saveNote();
      }
    }, 2000);
    
    return () => clearTimeout(handler);
  }, [selectedNote?.content, isEditorReady]);

  // Load notes on mount
  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  // Update editor content when selected note changes
  useEffect(() => {
    if (editor && selectedNote && isEditorReady) {
      try {
        console.log('Setting editor content for note:', selectedNote.id);
        const content = selectedNote.content || '<p></p>';
        editor.commands.setContent(content);
        setLastSavedContent(content);
        // Focus the editor after content is set
        setTimeout(() => {
          editor.commands.focus();
        }, 100);
      } catch (err) {
        console.error('Error setting editor content:', err);
        setError('Failed to load note content in editor.');
      }
    }
  }, [selectedNote?.id, editor, isEditorReady]);

  const createNote = async () => {
    try {
      const newNote = {
        title: 'Untitled Note',
        content: '<p></p>',
        subject: 'General',
        role: 'student',
        created_by: userId,
        tags: [],
      };
      console.log('Creating note:', newNote);
      const { data, error } = await supabase
        .from('notes1')
        .insert([newNote])
        .select()
        .single();
      if (error) {
        console.error('Error creating note:', error.message, error.details);
        setError(`Failed to create note: ${error.message}`);
        return;
      }
      if (data) {
        setNotes(prev => [data, ...prev]);
        setSelectedNote(data as Note);
        setError(null);
        console.log('Note created:', data);
      }
    } catch (err) {
      console.error('Unexpected error creating note:', err);
      setError('An unexpected error occurred while creating note.');
    }
  };

  const saveNote = async () => {
    if (!selectedNote || !selectedNote.id) return;
    setSaving(true);
    try {
      console.log('Saving note:', selectedNote.id);
      const { error } = await supabase
        .from('notes1')
        .update({
          title: selectedNote.title,
          content: selectedNote.content,
          subject: selectedNote.subject,
          tags: selectedNote.tags || [],
        })
        .eq('id', selectedNote.id);
      if (error) {
        console.error('Error saving note:', error.message, error.details);
        setError(`Failed to save note: ${error.message}`);
      } else {
        setLastSavedContent(selectedNote.content);
        await fetchNotes();
        setError(null);
        console.log('Note saved successfully');
      }
    } catch (err) {
      console.error('Unexpected error saving note:', err);
      setError('An unexpected error occurred while saving note.');
    } finally {
      setSaving(false);
    }
  };

  const deleteNote = async () => {
    if (!selectedNote || !selectedNote.id) return;
    setSaving(true);
    try {
      console.log('Deleting note:', selectedNote.id);
      const { error } = await supabase
        .from('notes1')
        .delete()
        .eq('id', selectedNote.id);
      if (error) {
        console.error('Error deleting note:', error.message, error.details);
        setError(`Failed to delete note: ${error.message}`);
        return;
      }
      setNotes(prev => prev.filter(note => note.id !== selectedNote.id));
      setSelectedNote(null);
      setError(null);
      if (editor) {
        editor.commands.setContent('<p></p>');
      }
      console.log('Note deleted successfully');
    } catch (err) {
      console.error('Unexpected error deleting note:', err);
      setError('An unexpected error occurred while deleting note.');
    } finally {
      setSaving(false);
    }
  };

  // Enhanced formula and symbol insertion functions
  const insertMathFormula = () => {
    if (!editor) return;
    const formula = prompt('Enter your LaTeX formula (without $ symbols):');
    if (formula) {
      editor.chain().focus().insertContent(`$${formula}$`).run();
    }
  };

  const insertSymbol = (symbol: string) => {
    if (!editor) return;
    editor.chain().focus().insertContent(symbol).run();
  };

  const formatText = (format: string) => {
    if (!editor) return;
    switch (format) {
      case 'bold':
        editor.chain().focus().toggleBold().run();
        break;
      case 'italic':
        editor.chain().focus().toggleItalic().run();
        break;
      case 'underline':
        editor.chain().focus().toggleUnderline().run();
        break;
      case 'strike':
        editor.chain().focus().toggleStrike().run();
        break;
      case 'code':
        editor.chain().focus().toggleCode().run();
        break;
      case 'highlight':
        editor.chain().focus().toggleHighlight().run();
        break;
      case 'subscript':
        editor.chain().focus().toggleSubscript().run();
        break;
      case 'superscript':
        editor.chain().focus().toggleSuperscript().run();
        break;
    }
  };

  const insertList = (type: 'bullet' | 'ordered') => {
    if (!editor) return;
    if (type === 'bullet') {
      editor.chain().focus().toggleBulletList().run();
    } else {
      editor.chain().focus().toggleOrderedList().run();
    }
  };

  const insertHeading = (level: 1 | 2 | 3) => {
    if (!editor) return;
    editor.chain().focus().setHeading({ level }).run();
  };

  const renderWithKaTeX = (html: string) => {
    try {
      return html.replace(/\$(.*?)\$/g, (match, expr) => {
        try {
          return katex.renderToString(expr, { 
            throwOnError: false, 
            displayMode: false,
            strict: false
          });
        } catch (e) {
          console.warn('KaTeX rendering failed for:', expr, e);
          return match; // Return original if rendering fails
        }
      });
    } catch (err) {
      console.error('KaTeX rendering error:', err);
      return html;
    }
  };

  const filteredNotes = notes.filter(note =>
    note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    note.subject.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const commonSymbols = [
    { symbol: '±', name: 'Plus-minus' },
    { symbol: '×', name: 'Multiply' },
    { symbol: '÷', name: 'Divide' },
    { symbol: '≠', name: 'Not equal' },
    { symbol: '≤', name: 'Less equal' },
    { symbol: '≥', name: 'Greater equal' },
    { symbol: '∞', name: 'Infinity' },
    { symbol: 'π', name: 'Pi' },
    { symbol: 'α', name: 'Alpha' },
    { symbol: 'β', name: 'Beta' },
    { symbol: 'γ', name: 'Gamma' },
    { symbol: 'Δ', name: 'Delta' },
    { symbol: '∑', name: 'Sum' },
    { symbol: '∫', name: 'Integral' },
    { symbol: '√', name: 'Square root' },
    { symbol: '°', name: 'Degree' }
  ];

  return (
    <ErrorBoundary>
      <div className="p-6 space-y-6 max-w-7xl mx-auto">
        {error && (
          <div className="bg-red-100 text-red-700 p-4 rounded-md">
            {error}
          </div>
        )}
        
        <div className="bg-gradient-to-r from-[#0071c5] via-[#004494] to-[#002c5f] rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold flex items-center mb-1">
                <svg className="h-7 w-7 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
                </svg>
                Enhanced Classroom Notes
              </h1>
              <p className="text-[#a8d4f0]">Create rich notes with formulas, symbols, and advanced formatting</p>
            </div>
            <Button
              onClick={createNote}
              className="bg-white text-[#0071c5] hover:bg-gray-100"
              disabled={saving}
            >
              <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
              </svg>
              New Note
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="space-y-4 col-span-1">
            <div className="relative">
              <svg className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <Input
                type="text"
                placeholder="Search notes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle>All Notes ({filteredNotes.length})</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 max-h-[600px] overflow-y-auto">
                {filteredNotes.length > 0 ? (
                  filteredNotes.map((note) => (
                    <div
                      key={note.id}
                      className={`flex items-center justify-between p-3 rounded-lg hover:bg-gray-100 transition-colors border ${
                        selectedNote?.id === note.id 
                          ? 'bg-blue-50 border-blue-200 shadow-sm' 
                          : 'border-gray-200'
                      }`}
                    >
                      <div
                        className="flex-1 cursor-pointer"
                        onClick={() => setSelectedNote(note)}
                      >
                        <div className="font-medium text-sm truncate">{note.title}</div>
                        <div className="text-xs text-gray-500 mt-1">{note.subject}</div>
                        <div className="text-xs text-gray-400 mt-1">
                          {new Date(note.created_at).toLocaleDateString()}
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setSelectedNote(note);
                          deleteNote();
                        }}
                        className="ml-2"
                        title="Delete note"
                      >
                        <svg
                          className="h-5 w-5 text-red-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5-4h4a1 1 0 011 1v1H9V4a1 1 0 011-1z"
                          />
                        </svg>
                      </Button>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-center py-4">No notes found</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Editor */}
          <div className="col-span-3 space-y-4">
            {selectedNote ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    value={selectedNote.title}
                    onChange={(e) => setSelectedNote({ ...selectedNote, title: e.target.value })}
                    className="text-lg font-bold"
                    placeholder="Note Title"
                  />
                  <Input
                    value={selectedNote.subject}
                    onChange={(e) => setSelectedNote({ ...selectedNote, subject: e.target.value })}
                    className="text-md"
                    placeholder="Subject"
                  />
                </div>

                {/* Toolbar */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Formatting Tools</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Text Formatting */}
                    <div className="flex flex-wrap gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => formatText('bold')}
                        className={editor?.isActive('bold') ? 'bg-blue-100' : ''}
                      >
                        <strong>B</strong>
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => formatText('italic')}
                        className={editor?.isActive('italic') ? 'bg-blue-100' : ''}
                      >
                        <em>I</em>
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => formatText('underline')}
                        className={editor?.isActive('underline') ? 'bg-blue-100' : ''}
                      >
                        <u>U</u>
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => formatText('strike')}
                        className={editor?.isActive('strike') ? 'bg-blue-100' : ''}
                      >
                        <s>S</s>
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => formatText('highlight')}
                        className={editor?.isActive('highlight') ? 'bg-blue-100' : ''}
                      >
                        H
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => formatText('subscript')}
                        className={editor?.isActive('subscript') ? 'bg-blue-100' : ''}
                      >
                        X₂
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => formatText('superscript')}
                        className={editor?.isActive('superscript') ? 'bg-blue-100' : ''}
                      >
                        X²
                      </Button>
                    </div>

                    {/* Lists and Formulas */}
                    <div className="flex flex-wrap gap-2">
                      <Button size="sm" variant="outline" onClick={() => insertList('bullet')}>
                        • List
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => insertList('ordered')}>
                        1. List
                      </Button>
                      <Button size="sm" variant="outline" onClick={insertMathFormula}>
                        ∫ Formula
                      </Button>
                      <LaTeXGuide />
                    </div>

                    {/* Common Symbols */}
                    <div>
                      <p className="text-sm font-medium mb-2">Quick Symbols:</p>
                      <div className="grid grid-cols-8 gap-1">
                        {commonSymbols.map((item) => (
                          <Button
                            key={item.symbol}
                            size="sm"
                            variant="outline"
                            onClick={() => insertSymbol(item.symbol)}
                            title={item.name}
                            className="h-8 w-8 p-0 text-sm"
                          >
                            {item.symbol}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Editor */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      Editor
                      {saving && (
                        <span className="text-sm text-blue-600 font-normal">Saving...</span>
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="border rounded-lg min-h-[400px] focus-within:ring-2 focus-within:ring-blue-500">
                      {editor && isEditorReady ? (
                        <EditorContent editor={editor} />
                      ) : (
                        <div className="p-4 text-gray-500">Loading editor...</div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Action Buttons */}
                <div className="flex space-x-4">
                  <Button
                    onClick={saveNote}
                    disabled={saving}
                    className={saving ? 'bg-gray-400' : 'bg-[#0071c5] hover:bg-[#005a9e]'}
                  >
                    {saving ? 'Saving...' : 'Save Note'}
                  </Button>
                  <Button
                    onClick={deleteNote}
                    disabled={saving}
                    className={saving ? 'bg-gray-400' : 'bg-red-600 hover:bg-red-700'}
                  >
                    Delete Note
                  </Button>
                </div>

                {/* Preview */}
                <Card>
                  <CardHeader>
                    <CardTitle>Live Preview</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div
                      className="prose max-w-full min-h-[200px] p-4 border rounded-lg bg-gray-50"
                      dangerouslySetInnerHTML={{
                        __html: renderWithKaTeX(selectedNote.content || '<p>Start typing to see preview...</p>'),
                      }}
                    />
                  </CardContent>
                </Card>
              </>
            ) : (
              <Card>
                <CardContent className="text-center py-12">
                  <svg className="h-12 w-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <p className="text-gray-500 text-lg">Select or create a note to get started</p>
                  <p className="text-gray-400 text-sm mt-2">Use the toolbar for rich formatting and mathematical formulas</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default StudentNotes;