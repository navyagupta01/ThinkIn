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
import { Alert, AlertDescription } from '@/components/ui/alert';
import { MessageCircle, ThumbsUp, Edit, Trash2, CheckCircle, Search, Tag, Clock, Pin, Wifi, WifiOff, RefreshCw } from 'lucide-react';
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

// Error types for better error handling
enum ErrorType {
  NETWORK = 'network',
  AUTH = 'auth',
  VALIDATION = 'validation',
  SERVER = 'server',
  UNKNOWN = 'unknown'
}

interface AppError {
  type: ErrorType;
  message: string;
  originalError?: any;
}

// Enhanced error handling utility
const handleError = (error: any, context: string): AppError => {
  console.error(`Error in ${context}:`, error);
  
  // Network errors
  if (error.code === 'NETWORK_ERROR' || error.message?.includes('Network Error') || 
      error.code === 'ECONNREFUSED' || !navigator.onLine) {
    return {
      type: ErrorType.NETWORK,
      message: 'Network connection issue. Please check your internet connection and try again.',
      originalError: error
    };
  }
  
  // Authentication errors
  if (error.response?.status === 401 || error.message?.includes('not authenticated')) {
    return {
      type: ErrorType.AUTH,
      message: 'Authentication required. Please sign in again.',
      originalError: error
    };
  }
  
  // Validation errors
  if (error.response?.status === 400) {
    return {
      type: ErrorType.VALIDATION,
      message: error.response?.data?.message || 'Invalid request data.',
      originalError: error
    };
  }
  
  // Server errors
  if (error.response?.status >= 500) {
    return {
      type: ErrorType.SERVER,
      message: 'Server temporarily unavailable. Please try again later.',
      originalError: error
    };
  }
  
  // Default error
  return {
    type: ErrorType.UNKNOWN,
    message: error.message || 'An unexpected error occurred.',
    originalError: error
  };
};

// Safe token retrieval with error handling
const getAuthToken = async (): Promise<string | null> => {
  try {
    const user = auth.currentUser;
    if (!user) {
      throw new Error('User not authenticated');
    }
    return await user.getIdToken();
  } catch (error) {
    console.error('Failed to get auth token:', error);
    return null;
  }
};

// Enhanced API with comprehensive error handling
const api = {
  async fetchQuestions(filters: any = {}, controller: AbortController): Promise<{ data: Question[], error: AppError | null }> {
    try {
      const token = await getAuthToken();
      if (!token) {
        return { 
          data: [], 
          error: { type: ErrorType.AUTH, message: 'Authentication required' } 
        };
      }

      const response = await axios.get('/api/qa/questions', {
        headers: { Authorization: `Bearer ${token}` },
        params: filters,
        signal: controller.signal,
        timeout: 10000, // 10 second timeout
      });
      
      console.log('API Response:', response.data);
      const questions = Array.isArray(response.data) ? response.data : [];
      return { data: questions, error: null };
    } catch (error: any) {
      if (error.name === 'AbortError') {
        return { data: [], error: null };
      }
      return { data: [], error: handleError(error, 'fetchQuestions') };
    }
  },

  async fetchAnswers(questionId: string, controller: AbortController): Promise<{ data: Answer[], error: AppError | null }> {
    try {
      const token = await getAuthToken();
      if (!token) {
        return { 
          data: [], 
          error: { type: ErrorType.AUTH, message: 'Authentication required' } 
        };
      }

      const response = await axios.get(`/api/qa/questions/${questionId}/answers`, {
        headers: { Authorization: `Bearer ${token}` },
        signal: controller.signal,
        timeout: 10000,
      });
      
      console.log(`Answers for question ${questionId}:`, response.data);
      const answers = Array.isArray(response.data) ? response.data : [];
      return { data: answers, error: null };
    } catch (error: any) {
      if (error.name === 'AbortError') {
        return { data: [], error: null };
      }
      return { data: [], error: handleError(error, 'fetchAnswers') };
    }
  },

  async createQuestion(data: any): Promise<{ data: Question | null, error: AppError | null }> {
    try {
      const token = await getAuthToken();
      if (!token) {
        return { 
          data: null, 
          error: { type: ErrorType.AUTH, message: 'Authentication required' } 
        };
      }

      const response = await axios.post('/api/qa/questions', data, {
        headers: { Authorization: `Bearer ${token}` },
        timeout: 10000,
      });
      return { data: response.data, error: null };
    } catch (error: any) {
      return { data: null, error: handleError(error, 'createQuestion') };
    }
  },

  async createAnswer(questionId: string, data: any): Promise<{ data: Answer | null, error: AppError | null }> {
    try {
      const token = await getAuthToken();
      if (!token) {
        return { 
          data: null, 
          error: { type: ErrorType.AUTH, message: 'Authentication required' } 
        };
      }

      const response = await axios.post(
        '/api/qa/answers',
        { questionId, content: data.content },
        { 
          headers: { Authorization: `Bearer ${token}` },
          timeout: 10000,
        }
      );
      return { data: response.data, error: null };
    } catch (error: any) {
      return { data: null, error: handleError(error, 'createAnswer') };
    }
  },

  async toggleUpvote(type: 'question' | 'answer', id: string): Promise<{ data: { upvotes: number; hasUpvoted: boolean } | null, error: AppError | null }> {
    try {
      const token = await getAuthToken();
      if (!token) {
        return { 
          data: null, 
          error: { type: ErrorType.AUTH, message: 'Authentication required' } 
        };
      }

      const response = await axios.post(`/api/qa/${type}/${id}/upvote`, {}, {
        headers: { Authorization: `Bearer ${token}` },
        timeout: 10000,
      });
      return { data: response.data, error: null };
    } catch (error: any) {
      return { data: null, error: handleError(error, 'toggleUpvote') };
    }
  },

  async markAnswerCorrect(questionId: string, answerId: string): Promise<{ error: AppError | null }> {
    try {
      const token = await getAuthToken();
      if (!token) {
        return { error: { type: ErrorType.AUTH, message: 'Authentication required' } };
      }

      await axios.post(`/api/qa/questions/${questionId}/answers/${answerId}/correct`, {}, {
        headers: { Authorization: `Bearer ${token}` },
        timeout: 10000,
      });
      return { error: null };
    } catch (error: any) {
      return { error: handleError(error, 'markAnswerCorrect') };
    }
  },

  async deleteQuestion(id: string): Promise<{ error: AppError | null }> {
    try {
      const token = await getAuthToken();
      if (!token) {
        return { error: { type: ErrorType.AUTH, message: 'Authentication required' } };
      }

      await axios.delete(`/api/qa/questions/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
        timeout: 10000,
      });
      return { error: null };
    } catch (error: any) {
      return { error: handleError(error, 'deleteQuestion') };
    }
  },

  async deleteAnswer(id: string): Promise<{ error: AppError | null }> {
    try {
      const token = await getAuthToken();
      if (!token) {
        return { error: { type: ErrorType.AUTH, message: 'Authentication required' } };
      }

      await axios.delete(`/api/qa/answers/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
        timeout: 10000,
      });
      return { error: null };
    } catch (error: any) {
      return { error: handleError(error, 'deleteAnswer') };
    }
  },

  async updateQuestion(id: string, data: any): Promise<{ data: Question | null, error: AppError | null }> {
    try {
      const token = await getAuthToken();
      if (!token) {
        return { 
          data: null, 
          error: { type: ErrorType.AUTH, message: 'Authentication required' } 
        };
      }

      const response = await axios.put(`/api/qa/questions/${id}`, data, {
        headers: { Authorization: `Bearer ${token}` },
        timeout: 10000,
      });
      return { data: response.data, error: null };
    } catch (error: any) {
      return { data: null, error: handleError(error, 'updateQuestion') };
    }
  },

  async updateAnswer(id: string, data: any): Promise<{ data: Answer | null, error: AppError | null }> {
    try {
      const token = await getAuthToken();
      if (!token) {
        return { 
          data: null, 
          error: { type: ErrorType.AUTH, message: 'Authentication required' } 
        };
      }

      const response = await axios.put(`/api/qa/answers/${id}`, data, {
        headers: { Authorization: `Bearer ${token}` },
        timeout: 10000,
      });
      return { data: response.data, error: null };
    } catch (error: any) {
      return { data: null, error: handleError(error, 'updateAnswer') };
    }
  },
};

const QADiscussionBoard: React.FC<QADiscussionBoardProps> = ({ user }) => {
  const { isLoading: authLoading } = useAuth();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const [subject, setSubject] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<AppError | null>(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [retryCount, setRetryCount] = useState(0);
  const [newQuestion, setNewQuestion] = useState({ title: '', content: '', tags: '', subject: '' });
  const [newAnswer, setNewAnswer] = useState<{ [key: string]: string }>({});
  const [showQuestionDialog, setShowQuestionDialog] = useState(false);
  const [editQuestion, setEditQuestion] = useState<Question | null>(null);
  const [editAnswer, setEditAnswer] = useState<Answer | null>(null);
  const [actionLoading, setActionLoading] = useState<{ [key: string]: boolean }>({});

  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null);

  // Network status monitoring
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setError(null);
      // Retry fetching data when coming back online
      if (retryCount < 3) {
        const controller = new AbortController();
        fetchQuestions(controller);
      }
    };
    
    const handleOffline = () => {
      setIsOnline(false);
      setError({
        type: ErrorType.NETWORK,
        message: 'You are currently offline. Please check your internet connection.'
      });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [retryCount]);

  // Enhanced fetch function with retry logic
  const fetchQuestions = useCallback(async (controller: AbortController) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const params: any = { search: searchTerm, filter, subject };
      if (filter === 'my-questions') {
        params.userId = auth.currentUser?.uid;
      }
      
      console.log('Sending request with params:', params);
      const { data: fetchedQuestions, error: fetchError } = await api.fetchQuestions(params, controller);
      
      if (fetchError) {
        setError(fetchError);
        setRetryCount(prev => prev + 1);
        return;
      }

      // Fetch answers separately if populate fails
      const questionsWithAnswers = await Promise.all(
        fetchedQuestions.map(async (question) => {
          if (!question.answers || question.answers.length === 0) {
            const { data: answers, error: answersError } = await api.fetchAnswers(question._id, controller);
            if (answersError) {
              console.warn('Failed to fetch answers for question:', question._id, answersError);
              return { ...question, answers: [] };
            }
            return { ...question, answers };
          }
          return question;
        })
      );
      
      console.log('Questions with answers:', questionsWithAnswers);
      setQuestions(questionsWithAnswers);
      setRetryCount(0); // Reset retry count on success
    } catch (err: any) {
      if (err.name === 'AbortError') return;
      
      const appError = handleError(err, 'fetchQuestions');
      setError(appError);
      setRetryCount(prev => prev + 1);
      setQuestions([]);
    } finally {
      setIsLoading(false);
    }
  }, [searchTerm, filter, subject]);

  // Debounced effect for search and subject
  useEffect(() => {
    if (authLoading) return;
    
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    const newTimeout = setTimeout(() => {
      const controller = new AbortController();
      fetchQuestions(controller);
      return () => controller.abort();
    }, 300);

    setSearchTimeout(newTimeout);

    return () => {
      if (newTimeout) {
        clearTimeout(newTimeout);
      }
    };
  }, [searchTerm, subject, authLoading, fetchQuestions]);

  // Separate effect for filter changes (immediate)
  useEffect(() => {
    if (authLoading) return;
    const controller = new AbortController();
    fetchQuestions(controller);
    return () => controller.abort();
  }, [filter, authLoading, fetchQuestions]);

  // Helper function to set loading state for specific actions
  const setActionLoadingState = (key: string, loading: boolean) => {
    setActionLoading(prev => ({ ...prev, [key]: loading }));
  };

  const handlePostQuestion = async () => {
    setActionLoadingState('postQuestion', true);
    setError(null);
    
    try {
      const tags = newQuestion.tags.split(',').map((tag) => tag.trim()).filter((tag) => tag);
      const questionData = { ...newQuestion, tags };
      
      if (editQuestion) {
        const { data: updatedQuestion, error: updateError } = await api.updateQuestion(editQuestion._id, questionData);
        if (updateError) {
          setError(updateError);
          return;
        }
        if (updatedQuestion) {
          setQuestions(questions.map((q) => (q._id === updatedQuestion._id ? updatedQuestion : q)));
        }
      } else {
        const { data: createdQuestion, error: createError } = await api.createQuestion(questionData);
        if (createError) {
          setError(createError);
          return;
        }
        if (createdQuestion) {
          setQuestions([createdQuestion, ...questions]);
        }
      }
      
      setNewQuestion({ title: '', content: '', tags: '', subject: '' });
      setEditQuestion(null);
      setShowQuestionDialog(false);
    } catch (err: any) {
      const appError = handleError(err, 'handlePostQuestion');
      setError(appError);
    } finally {
      setActionLoadingState('postQuestion', false);
    }
  };

  const handlePostAnswer = async (questionId: string) => {
    setActionLoadingState(`postAnswer-${questionId}`, true);
    setError(null);
    
    try {
      const content = newAnswer[questionId] || '';
      if (!content.trim()) {
        setError({ type: ErrorType.VALIDATION, message: 'Answer content is required' });
        return;
      }
      
      if (editAnswer && editAnswer.questionId === questionId) {
        const { data: updatedAnswer, error: updateError } = await api.updateAnswer(editAnswer._id, { content });
        if (updateError) {
          setError(updateError);
          return;
        }
        if (updatedAnswer) {
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
        }
        setEditAnswer(null);
      } else {
        const { data: createdAnswer, error: createError } = await api.createAnswer(questionId, { content });
        if (createError) {
          setError(createError);
          return;
        }
        if (createdAnswer) {
          setQuestions(
            questions.map((q) =>
              q._id === questionId 
                ? { ...q, answers: [...q.answers, createdAnswer], lastActivity: new Date().toISOString() } 
                : q
            )
          );
        }
      }
      
      setNewAnswer({ ...newAnswer, [questionId]: '' });
    } catch (err: any) {
      const appError = handleError(err, 'handlePostAnswer');
      setError(appError);
    } finally {
      setActionLoadingState(`postAnswer-${questionId}`, false);
    }
  };

  const handleUpvote = async (type: 'question' | 'answer', id: string, questionId?: string) => {
    setActionLoadingState(`upvote-${id}`, true);
    
    try {
      const { data: result, error: upvoteError } = await api.toggleUpvote(type, id);
      if (upvoteError) {
        setError(upvoteError);
        return;
      }
      if (result) {
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
      }
    } catch (err: any) {
      const appError = handleError(err, 'handleUpvote');
      setError(appError);
    } finally {
      setActionLoadingState(`upvote-${id}`, false);
    }
  };

  const handleMarkCorrect = async (questionId: string, answerId: string) => {
    setActionLoadingState(`markCorrect-${answerId}`, true);
    
    try {
      const { error: markError } = await api.markAnswerCorrect(questionId, answerId);
      if (markError) {
        setError(markError);
        return;
      }
      
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
      const appError = handleError(err, 'handleMarkCorrect');
      setError(appError);
    } finally {
      setActionLoadingState(`markCorrect-${answerId}`, false);
    }
  };

  const handleDeleteQuestion = async (id: string) => {
    setActionLoadingState(`deleteQuestion-${id}`, true);
    
    try {
      const { error: deleteError } = await api.deleteQuestion(id);
      if (deleteError) {
        setError(deleteError);
        return;
      }
      
      setQuestions(questions.filter((q) => q._id !== id));
    } catch (err: any) {
      const appError = handleError(err, 'handleDeleteQuestion');
      setError(appError);
    } finally {
      setActionLoadingState(`deleteQuestion-${id}`, false);
    }
  };

  const handleDeleteAnswer = async (questionId: string, answerId: string) => {
    setActionLoadingState(`deleteAnswer-${answerId}`, true);
    
    try {
      const { error: deleteError } = await api.deleteAnswer(answerId);
      if (deleteError) {
        setError(deleteError);
        return;
      }
      
      setQuestions(
        questions.map((q) =>
          q._id === questionId ? { ...q, answers: q.answers.filter((a) => a._id !== answerId) } : q
        )
      );
    } catch (err: any) {
      const appError = handleError(err, 'handleDeleteAnswer');
      setError(appError);
    } finally {
      setActionLoadingState(`deleteAnswer-${answerId}`, false);
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

  const handleRetry = () => {
    setError(null);
    setRetryCount(0);
    const controller = new AbortController();
    fetchQuestions(controller);
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

  // Render error state
  const renderError = () => {
    if (!error) return null;

    const getErrorIcon = () => {
      switch (error.type) {
        case ErrorType.NETWORK:
          return <WifiOff className="h-5 w-5" />;
        case ErrorType.AUTH:
          return <MessageCircle className="h-5 w-5" />;
        default:
          return <MessageCircle className="h-5 w-5" />;
      }
    };

    const getErrorColor = () => {
      switch (error.type) {
        case ErrorType.NETWORK:
          return 'border-orange-200 bg-orange-50 text-orange-800';
        case ErrorType.AUTH:
          return 'border-red-200 bg-red-50 text-red-800';
        default:
          return 'border-red-200 bg-red-50 text-red-800';
      }
    };

    return (
      <Alert className={`mb-4 ${getErrorColor()}`}>
        <div className="flex items-center gap-2">
          {getErrorIcon()}
          <AlertDescription className="flex-1">
            {error.message}
          </AlertDescription>
          {error.type === ErrorType.NETWORK && (
            <Button 
              onClick={handleRetry} 
              size="sm" 
              variant="outline"
              disabled={isLoading}
              className="ml-2"
            >
              {isLoading ? <RefreshCw className="h-4 w-4 animate-spin" /> : 'Retry'}
            </Button>
          )}
        </div>
      </Alert>
    );
  };

  if (authLoading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  return (
    <Card className="border-0 shadow-xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm h-[600px] flex flex-col">
      <CardHeader className="flex-shrink-0">
        <CardTitle className="flex items-center text-xl">
          <MessageCircle className="h-6 w-6 mr-3 text-[#0071c5]" />
          Q&A Discussion Board
          <div className="ml-2">
            {isOnline ? (
              <Wifi className="h-4 w-4 text-green-500" />
            ) : (
              <WifiOff className="h-4 w-4 text-red-500" />
            )}
          </div>
        </CardTitle>
        <CardDescription>
          Engage with your peers and teachers
          {!isOnline && <span className="text-red-500 ml-2">(Offline)</span>}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col space-y-6 flex-1 min-h-0">
        {/* Error Display */}
        {renderError()}

        {/* Filters and Search - Fixed at top */}
        <div className="flex flex-col md:flex-row gap-4 flex-shrink-0">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              className="pl-10"
              placeholder="Search questions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              disabled={!isOnline}
            />
          </div>
          <Select value={filter} onValueChange={setFilter} disabled={!isOnline}>
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
            disabled={!isOnline}
          />
        </div>

        {/* Post Question Button */}
        <Button
          className="bg-[#0071c5] hover:bg-[#004494] text-white flex-shrink-0"
          onClick={() => {
            setEditQuestion(null);
            setNewQuestion({ title: '', content: '', tags: '', subject: '' });
            setShowQuestionDialog(true);
          }}
          disabled={!isOnline}
        >
          Ask a Question
        </Button>

        {/* Loading state */}
        {isLoading && (
          <div className="text-center py-8 flex items-center justify-center gap-2">
            <RefreshCw className="h-4 w-4 animate-spin" />
            Loading questions...
          </div>
        )}

        {/* Scrollable Questions List */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-2">
          {!isLoading && Array.isArray(questions) && questions.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              {error?.type === ErrorType.NETWORK ? 
                'Unable to load questions. Please check your connection.' : 
                'No questions found.'}
            </div>
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
                            disabled={question.author.id !== user.id || !isOnline || actionLoading[`editQuestion-${question._id}`]}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteQuestion(question._id)}
                            disabled={!isOnline || actionLoading[`deleteQuestion-${question._id}`]}
                          >
                            {actionLoading[`deleteQuestion-${question._id}`] ? 
                              <RefreshCw className="h-4 w-4 animate-spin" /> : 
                              <Trash2 className="h-4 w-4 text-red-500" />
                            }
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
                      disabled={!isOnline || actionLoading[`upvote-${question._id}`]}
                    >
                      {actionLoading[`upvote-${question._id}`] ? 
                        <RefreshCw className="h-4 w-4 animate-spin mr-1" /> : 
                        <ThumbsUp className="h-4 w-4 mr-1" />
                      }
                      {question.upvotes}
                    </Button>
                  </div>
                  <div className="mt-4">
                    <h4 className="text-sm font-medium mb-2">Answers ({question.answers.length})</h4>
                    {question.answers.length === 0 ? (
                      <p className="text-sm text-gray-500">No answers yet.</p>
                    ) : (
                      <div className="max-h-60 overflow-y-auto space-y-2">
                        {[...question.answers]
                          .sort((a, b) => {
                            if (a.isCorrect) return -1;
                            if (b.isCorrect) return 1;
                            return b.upvotes - a.upvotes;
                          })
                          .map((answer) => (
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
                                        disabled={answer.author.id !== user.id || !isOnline}
                                      >
                                        <Edit className="h-4 w-4" />
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleDeleteAnswer(question._id, answer._id)}
                                        disabled={!isOnline || actionLoading[`deleteAnswer-${answer._id}`]}
                                      >
                                        {actionLoading[`deleteAnswer-${answer._id}`] ? 
                                          <RefreshCw className="h-4 w-4 animate-spin" /> : 
                                          <Trash2 className="h-4 w-4 text-red-500" />
                                        }
                                      </Button>
                                    </>
                                  )}
                                  {user.role === 'teacher' && !answer.isCorrect && (
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleMarkCorrect(question._id, answer._id)}
                                      disabled={!isOnline || actionLoading[`markCorrect-${answer._id}`]}
                                    >
                                      {actionLoading[`markCorrect-${answer._id}`] ? 
                                        <RefreshCw className="h-4 w-4 animate-spin mr-1" /> : 
                                        <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
                                      }
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
                                disabled={!isOnline || actionLoading[`upvote-${answer._id}`]}
                              >
                                {actionLoading[`upvote-${answer._id}`] ? 
                                  <RefreshCw className="h-4 w-4 animate-spin mr-1" /> : 
                                  <ThumbsUp className="h-4 w-4 mr-1" />
                                }
                                {answer.upvotes}
                              </Button>
                            </div>
                          ))}
                      </div>
                    )}
                    <div className="mt-4">
                      <Textarea
                        placeholder={isOnline ? "Write your answer..." : "Go online to write an answer"}
                        value={newAnswer[question._id] || ''}
                        onChange={(e) => setNewAnswer({ ...newAnswer, [question._id]: e.target.value })}
                        className="mb-2"
                        disabled={!isOnline}
                      />
                      <Button
                        onClick={() => handlePostAnswer(question._id)}
                        className="bg-blue-500 hover:bg-blue-600 text-white"
                        disabled={!newAnswer[question._id]?.trim() || !isOnline || actionLoading[`postAnswer-${question._id}`]}
                      >
                        {actionLoading[`postAnswer-${question._id}`] ? (
                          <>
                            <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                            {editAnswer && editAnswer.questionId === question._id ? 'Updating...' : 'Posting...'}
                          </>
                        ) : (
                          editAnswer && editAnswer.questionId === question._id ? 'Update Answer' : 'Post Answer'
                        )}
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
                {!isOnline && <span className="text-red-500 block mt-1">You need to be online to post questions.</span>}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Title</Label>
                <Input
                  value={newQuestion.title}
                  onChange={(e) => setNewQuestion({ ...newQuestion, title: e.target.value })}
                  placeholder="Enter question title"
                  disabled={!isOnline}
                />
              </div>
              <div>
                <Label>Content</Label>
                <Textarea
                  value={newQuestion.content}
                  onChange={(e) => setNewQuestion({ ...newQuestion, content: e.target.value })}
                  placeholder="Describe your question in detail"
                  disabled={!isOnline}
                />
              </div>
              <div>
                <Label>Tags (comma-separated)</Label>
                <Input
                  value={newQuestion.tags}
                  onChange={(e) => setNewQuestion({ ...newQuestion, tags: e.target.value })}
                  placeholder="e.g., math, algebra"
                  disabled={!isOnline}
                />
              </div>
              <div>
                <Label>Subject</Label>
                <Input
                  value={newQuestion.subject}
                  onChange={(e) => setNewQuestion({ ...newQuestion, subject: e.target.value })}
                  placeholder="e.g., Mathematics"
                  disabled={!isOnline}
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
                disabled={!newQuestion.title.trim() || !newQuestion.content.trim() || !isOnline || actionLoading['postQuestion']}
                className="bg-blue-500 hover:bg-blue-600 text-white"
              >
                {actionLoading['postQuestion'] ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                    {editQuestion ? 'Updating...' : 'Posting...'}
                  </>
                ) : (
                  editQuestion ? 'Update Question' : 'Post Question'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default QADiscussionBoard;