import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { MessageCircle, ThumbsUp, Edit, Trash2, CheckCircle, Search, Tag, Clock, Pin } from 'lucide-react';
import axios from 'axios';
import { auth } from '@/lib/firebase';

// Define types
interface Question {
  _id: string;
  title: string;
  content: string;
  author: {
    id: string;
    name: string;
    role: 'student' | 'teacher';
    avatar?: string;
  };
  timestamp: string;
  upvotes: number;
  upvoters: string[];
  answers: Answer[];
  isResolved: boolean;
  isPinned: boolean;
  tags: string[];
  lastActivity: string;
  subject?: string;
  hasUpvoted?: boolean;
}

interface Answer {
  _id: string;
  questionId: string;
  content: string;
  author: {
    id: string;
    name: string;
    role: 'student' | 'teacher';
    avatar?: string;
  };
  timestamp: string;
  upvotes: number;
  upvoters: string[];
  isCorrect: boolean;
  isPinned: boolean;
  edited: boolean;
  editedAt?: string;
  hasUpvoted?: boolean;
}

interface QADiscussionBoardProps {
  user: {
    id: string;
    name: string;
    role: 'student' | 'teacher';
    avatar?: string;
  };
}

const getAuthToken = async () => {
  const user = auth.currentUser;
  if (!user) throw new Error('User not authenticated');
  return user.getIdToken();
};

const api = {
  async fetchQuestions(filters: any = {}, controller: AbortController): Promise<Question[]> {
    const token = await getAuthToken();
    try {
      const response = await axios.get('/api/qa/questions', {
        headers: { Authorization: `Bearer ${token}` },
        params: filters,
        signal: controller.signal,
      });
      console.log('API Response:', response.data); // Debug log
      return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
      console.error('Fetch questions error:', error);
      return [];
    }
  },

  async fetchAnswers(questionId: string, controller: AbortController): Promise<Answer[]> {
    const token = await getAuthToken();
    try {
      const response = await axios.get(`/api/qa/questions/${questionId}/answers`, {
        headers: { Authorization: `Bearer ${token}` },
        signal: controller.signal,
      });
      console.log(`Answers for question ${questionId}:`, response.data); // Debug log
      return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
      console.error('Fetch answers error:', error);
      return [];
    }
  },

  async createQuestion(data: any): Promise<Question> {
    const token = await getAuthToken();
    const response = await axios.post('/api/qa/questions', data, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },

  async createAnswer(questionId: string, data: any): Promise<Answer> {
    const token = await getAuthToken();
    const response = await axios.post(
      '/api/qa/answers',
      { questionId, content: data.content },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
  },

  async toggleUpvote(type: 'question' | 'answer', id: string): Promise<{ upvotes: number; hasUpvoted: boolean }> {
    const token = await getAuthToken();
    const response = await axios.post(`/api/qa/${type}/${id}/upvote`, {}, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },

  async markAnswerCorrect(questionId: string, answerId: string): Promise<void> {
    const token = await getAuthToken();
    await axios.post(`/api/qa/questions/${questionId}/answers/${answerId}/correct`, {}, {
      headers: { Authorization: `Bearer ${token}` },
    });
  },

  async deleteQuestion(id: string): Promise<void> {
    const token = await getAuthToken();
    await axios.delete(`/api/qa/questions/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  },

  async deleteAnswer(id: string): Promise<void> {
    const token = await getAuthToken();
    await axios.delete(`/api/qa/answers/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  },

  async updateQuestion(id: string, data: any): Promise<Question> {
    const token = await getAuthToken();
    const response = await axios.put(`/api/qa/questions/${id}`, data, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },

  async updateAnswer(id: string, data: any): Promise<Answer> {
    const token = await getAuthToken();
    const response = await axios.put(`/api/qa/answers/${id}`, data, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },
};

const QADiscussionBoard: React.FC<QADiscussionBoardProps> = ({ user }) => {
  const { isLoading: authLoading } = useAuth();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const [subject, setSubject] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newQuestion, setNewQuestion] = useState({ title: '', content: '', tags: '', subject: '' });
  const [newAnswer, setNewAnswer] = useState<{ [key: string]: string }>({});
  const [showQuestionDialog, setShowQuestionDialog] = useState(false);
  const [editQuestion, setEditQuestion] = useState<Question | null>(null);
  const [editAnswer, setEditAnswer] = useState<Answer | null>(null);

  // Debounced search function
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null);

  const fetchQuestions = useCallback(async (controller: AbortController) => {
    setIsLoading(true);
    setError(null);
    try {
      const token = await getAuthToken();
      const params: any = { search: searchTerm, filter, subject };
      if (filter === 'my-questions') {
        params.userId = auth.currentUser?.uid;
      }
      console.log('Sending request with params:', params); // Debug log
      const fetchedQuestions = await api.fetchQuestions(params, controller);
      // Fetch answers separately if populate fails
      const questionsWithAnswers = await Promise.all(
        fetchedQuestions.map(async (question) => {
          if (!question.answers || question.answers.length === 0) {
            const answers = await api.fetchAnswers(question._id, controller);
            return { ...question, answers };
          }
          return question;
        })
      );
      console.log('Questions with answers:', questionsWithAnswers); // Debug log
      setQuestions(questionsWithAnswers);
    } catch (err: any) {
      if (err.name === 'AbortError') return;
      console.error('Fetch questions error:', err);
      setError(err.message || 'Failed to fetch questions');
      setQuestions([]);
    } finally {
      setIsLoading(false);
    }
  }, [searchTerm, filter, subject]);

  // Debounced effect for search and subject
  useEffect(() => {
    if (authLoading) return;
    
    // Clear existing timeout
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    // Set new timeout for debounced search
    const newTimeout = setTimeout(() => {
      const controller = new AbortController();
      fetchQuestions(controller);
      return () => controller.abort();
    }, 300); // 300ms delay

    setSearchTimeout(newTimeout);

    // Cleanup function
    return () => {
      if (newTimeout) {
        clearTimeout(newTimeout);
      }
    };
  }, [searchTerm, subject, authLoading]);

  // Separate effect for filter changes (immediate)
  useEffect(() => {
    if (authLoading) return;
    const controller = new AbortController();
    fetchQuestions(controller);
    return () => controller.abort();
  }, [filter, authLoading]);

  const handlePostQuestion = async () => {
    try {
      const tags = newQuestion.tags.split(',').map((tag) => tag.trim()).filter((tag) => tag);
      const questionData = { ...newQuestion, tags };
      if (editQuestion) {
        const updatedQuestion = await api.updateQuestion(editQuestion._id, questionData);
        setQuestions(questions.map((q) => (q._id === updatedQuestion._id ? updatedQuestion : q)));
      } else {
        const createdQuestion = await api.createQuestion(questionData);
        setQuestions([createdQuestion, ...questions]);
      }
      setNewQuestion({ title: '', content: '', tags: '', subject: '' });
      setEditQuestion(null);
      setShowQuestionDialog(false);
    } catch (err: any) {
      setError(err.message || 'Failed to post question');
    }
  };

  const handlePostAnswer = async (questionId: string) => {
    try {
      const content = newAnswer[questionId] || '';
      if (!content.trim()) {
        setError('Answer content is required');
        return;
      }
      if (editAnswer && editAnswer.questionId === questionId) {
        const updatedAnswer = await api.updateAnswer(editAnswer._id, { content });
        setQuestions(
          questions.map((q) =>
            q._id === questionId
              ? {
                  ...q,
                  answers: q.answers.map((a) => (a._id === updatedAnswer._id ? updatedAnswer : a)),
                }
              : q
          )
        );
        setEditAnswer(null);
      } else {
        const createdAnswer = await api.createAnswer(questionId, { content });
        setQuestions(
          questions.map((q) =>
            q._id === questionId ? { ...q, answers: [...q.answers, createdAnswer], lastActivity: new Date().toISOString() } : q
          )
        );
      }
      setNewAnswer({ ...newAnswer, [questionId]: '' });
    } catch (err: any) {
      setError(err.message || 'Failed to post answer');
    }
  };

  const handleUpvote = async (type: 'question' | 'answer', id: string, questionId?: string) => {
    try {
      const result = await api.toggleUpvote(type, id);
      setQuestions(
        questions.map((q) => {
          if (type === 'question' && q._id === id) {
            return { ...q, upvotes: result.upvotes, hasUpvoted: result.hasUpvoted };
          }
          if (type === 'answer' && q._id === questionId) {
            return {
              ...q,
              answers: q.answers.map((a) => (a._id === id ? { ...a, upvotes: result.upvotes, hasUpvoted: result.hasUpvoted } : a)),
            };
          }
          return q;
        })
      );
    } catch (err: any) {
      setError(err.message || 'Failed to toggle upvote');
    }
  };

  const handleMarkCorrect = async (questionId: string, answerId: string) => {
    try {
      await api.markAnswerCorrect(questionId, answerId);
      setQuestions(
        questions.map((q) =>
          q._id === questionId
            ? {
                ...q,
                isResolved: true,
                answers: q.answers.map((a) => (a._id === answerId ? { ...a, isCorrect: true } : a)),
              }
            : q
        )
      );
    } catch (err: any) {
      setError(err.message || 'Failed to mark answer as correct');
    }
  };

  const handleDeleteQuestion = async (id: string) => {
    try {
      await api.deleteQuestion(id);
      setQuestions(questions.filter((q) => q._id !== id));
    } catch (err: any) {
      setError(err.message || 'Failed to delete question');
    }
  };

  const handleDeleteAnswer = async (questionId: string, answerId: string) => {
    try {
      await api.deleteAnswer(answerId);
      setQuestions(
        questions.map((q) =>
          q._id === questionId ? { ...q, answers: q.answers.filter((a) => a._id !== answerId) } : q
        )
      );
    } catch (err: any) {
      setError(err.message || 'Failed to delete answer');
    }
  };

  const handleEditQuestion = (question: Question) => {
    setEditQuestion(question);
    setNewQuestion({
      title: question.title,
      content: question.content,
      tags: question.tags.join(', '),
      subject: question.subject || '',
    });
    setShowQuestionDialog(true);
  };

  const handleEditAnswer = (answer: Answer) => {
    setEditAnswer(answer);
    setNewAnswer({ ...newAnswer, [answer.questionId]: answer.content });
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
    });
  };

  if (authLoading || isLoading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  return (
    <Card className="border-0 shadow-xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm h-[600px] flex flex-col">
      <CardHeader className="flex-shrink-0">
        <CardTitle className="flex items-center text-xl">
          <MessageCircle className="h-6 w-6 mr-3 text-[#0071c5]" />
          Q&A Discussion Board
        </CardTitle>
        <CardDescription>Engage with your peers and teachers</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col space-y-6 flex-1 min-h-0">
        {/* Filters and Search - Fixed at top */}
        <div className="flex flex-col md:flex-row gap-4 flex-shrink-0">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              className="pl-10"
              placeholder="Search questions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Questions</SelectItem>
              <SelectItem value="resolved">Resolved</SelectItem>
              <SelectItem value="unresolved">Unresolved</SelectItem>
              <SelectItem value="my-questions">My Questions</SelectItem>
            </SelectContent>
          </Select>
          <Input
            className="w-[180px]"
            placeholder="Subject (e.g., Math)"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
          />
        </div>

        {/* Error Message */}
        {error && <div className="text-red-500 text-sm flex-shrink-0">{error}</div>}

        {/* Post Question Button */}
        <Button
          className="bg-[#0071c5] hover:bg-[#004494] text-white flex-shrink-0"
          onClick={() => {
            setEditQuestion(null);
            setNewQuestion({ title: '', content: '', tags: '', subject: '' });
            setShowQuestionDialog(true);
          }}
        >
          Ask a Question
        </Button>

        {/* Scrollable Questions List */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-2">
          {Array.isArray(questions) && questions.length === 0 ? (
            <div className="text-center text-gray-500 py-8">No questions found.</div>
          ) : Array.isArray(questions) ? (
            questions.map((question) => (
              <Card key={question._id} className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl hover:shadow-lg transition-all">
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {question.isPinned && <Pin className="h-4 w-4 text-yellow-500" />}
                      {question.isResolved && <CheckCircle className="h-4 w-4 text-green-500" />}
                      <h3 className="font-semibold text-lg">{question.title}</h3>
                    </div>
                    <div className="flex items-center gap-2">
                      {(question.author.id === user.id || user.role === 'teacher') && (
                        <>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditQuestion(question)}
                            disabled={question.author.id !== user.id}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteQuestion(question._id)}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300">{question.content}</p>
                  <div className="flex flex-wrap gap-2">
                    {question.tags.map((tag) => (
                      <Badge key={tag} variant="secondary">
                        <Tag className="h-3 w-3 mr-1" />
                        {tag}
                      </Badge>
                    ))}
                    {question.subject && (
                      <Badge variant="outline">{question.subject}</Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span className="flex items-center">
                      <Clock className="h-4 w-4 mr-1" />
                      {formatDate(question.lastActivity)}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleUpvote('question', question._id)}
                      className={question.hasUpvoted ? 'text-blue-500' : ''}
                    >
                      <ThumbsUp className="h-4 w-4 mr-1" />
                      {question.upvotes}
                    </Button>
                  </div>
                  <div className="mt-4">
                    <h4 className="text-sm font-medium mb-2">Answers ({question.answers.length})</h4>
                    {question.answers.length === 0 ? (
                      <p className="text-sm text-gray-500">No answers yet.</p>
                    ) : (
                      <div className="max-h-60 overflow-y-auto space-y-2">
                        {question.answers.map((answer) => (
                          <div
                            key={answer._id}
                            className={`p-3 rounded-lg ${answer.isCorrect ? 'bg-green-100 dark:bg-green-900' : 'bg-white dark:bg-slate-700'}`}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                {answer.isCorrect && <CheckCircle className="h-4 w-4 text-green-500" />}
                                <span className="text-sm font-medium">{answer.author.name}</span>
                                <span className="text-xs text-gray-500">
                                  ({answer.author.role}) • {formatDate(answer.timestamp)}
                                  {answer.edited && ` • Edited ${formatDate(answer.editedAt!)}`}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                {(answer.author.id === user.id || user.role === 'teacher') && (
                                  <>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleEditAnswer(answer)}
                                      disabled={answer.author.id !== user.id}
                                    >
                                      <Edit className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleDeleteAnswer(question._id, answer._id)}
                                    >
                                      <Trash2 className="h-4 w-4 text-red-500" />
                                    </Button>
                                  </>
                                )}
                                {user.role === 'teacher' && !answer.isCorrect && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleMarkCorrect(question._id, answer._id)}
                                  >
                                    <CheckCircle className="h-4 w-4 text-green-500" />
                                    Mark Correct
                                  </Button>
                                )}
                              </div>
                            </div>
                            <p className="text-sm mt-2">{answer.content}</p>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleUpvote('answer', answer._id, question._id)}
                              className={answer.hasUpvoted ? 'text-blue-500' : ''}
                            >
                              <ThumbsUp className="h-4 w-4 mr-1" />
                              {answer.upvotes}
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                    <div className="mt-4">
                      <Textarea
                        placeholder="Write your answer..."
                        value={newAnswer[question._id] || ''}
                        onChange={(e) => setNewAnswer({ ...newAnswer, [question._id]: e.target.value })}
                        className="mb-2"
                      />
                      <Button
                        onClick={() => handlePostAnswer(question._id)}
                        className="bg-blue-500 hover:bg-blue-600 text-white"
                        disabled={!newAnswer[question._id]?.trim()}
                      >
                        {editAnswer && editAnswer.questionId === question._id ? 'Update Answer' : 'Post Answer'}
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))
          ) : (
            <div className="text-center text-red-500">Error: Invalid data format</div>
          )}
        </div>

        {/* Post/Edit Question Dialog */}
        <Dialog open={showQuestionDialog} onOpenChange={setShowQuestionDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editQuestion ? 'Edit Question' : 'Ask a Question'}</DialogTitle>
              <DialogDescription>
                {editQuestion ? 'Edit the details of your question below.' : 'Enter the details of your new question below.'}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Title</Label>
                <Input
                  value={newQuestion.title}
                  onChange={(e) => setNewQuestion({ ...newQuestion, title: e.target.value })}
                  placeholder="Enter question title"
                />
              </div>
              <div>
                <Label>Content</Label>
                <Textarea
                  value={newQuestion.content}
                  onChange={(e) => setNewQuestion({ ...newQuestion, content: e.target.value })}
                  placeholder="Describe your question in detail"
                />
              </div>
              <div>
                <Label>Tags (comma-separated)</Label>
                <Input
                  value={newQuestion.tags}
                  onChange={(e) => setNewQuestion({ ...newQuestion, tags: e.target.value })}
                  placeholder="e.g., math, algebra"
                />
              </div>
              <div>
                <Label>Subject</Label>
                <Input
                  value={newQuestion.subject}
                  onChange={(e) => setNewQuestion({ ...newQuestion, subject: e.target.value })}
                  placeholder="e.g., Mathematics"
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setShowQuestionDialog(false);
                  setEditQuestion(null);
                  setNewQuestion({ title: '', content: '', tags: '', subject: '' });
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handlePostQuestion}
                disabled={!newQuestion.title.trim() || !newQuestion.content.trim()}
                className="bg-blue-500 hover:bg-blue-600 text-white"
              >
                {editQuestion ? 'Update Question' : 'Post Question'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default QADiscussionBoard;