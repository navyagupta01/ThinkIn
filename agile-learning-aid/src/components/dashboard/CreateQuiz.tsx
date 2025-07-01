import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PlusCircle, Trash2, Save, Eye, Clock, Target, BookOpen, Users, Edit, Play } from 'lucide-react';
import { toast } from '@/hooks/use-toast';


interface Option {
  text: string;
  isCorrect: boolean;
}

interface Question {
  questionText: string;
  options: Option[];
  correctAnswer: string;
  topic: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  points: number;
}

interface QuizForm {
  quizId?: string;
  title: string;
  subject: string;
  description: string;
  duration: number;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  dueDate: string;
  allowedAttempts: number;
  questions: Question[];
}

const subjects = ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'Computer Science', 'English', 'History'];
const difficulties = ['Easy', 'Medium', 'Hard'];

const CreateQuiz: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [quizData, setQuizData] = useState<QuizForm>({
    title: '',
    subject: '',
    description: '',
    duration: 30,
    difficulty: 'Medium',
    dueDate: '',
    allowedAttempts: 1,
    questions: [{
      questionText: '',
      options: [
        { text: '', isCorrect: false },
        { text: '', isCorrect: false },
        { text: '', isCorrect: false },
        { text: '', isCorrect: false }
      ],
      correctAnswer: '',
      topic: '',
      difficulty: 'Medium',
      points: 1
    }]
  });
  const [activeQuestion, setActiveQuestion] = useState(0);
  const [loading, setLoading] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [drafts, setDrafts] = useState<QuizForm[]>([]);

  useEffect(() => {
    if (user) {
      fetchDrafts();
    }
  }, [user]);

  const fetchDrafts = async () => {
    try {
      const response = await fetch(`http://localhost:5010/api/teacher/${user.name}/drafts`);
      if (!response.ok) throw new Error('Failed to fetch drafts');
      const data = await response.json();
      setDrafts(data.map(draft => ({
        quizId: draft.quizId,
        title: draft.title,
        subject: draft.subject,
        description: draft.description,
        duration: draft.duration,
        difficulty: draft.difficulty,
        dueDate: draft.dueDate ? new Date(draft.dueDate).toISOString().split('T')[0] : '',
        allowedAttempts: draft.allowedAttempts,
        questions: draft.questions
      })));
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to load drafts', variant: 'destructive' });
    }
  };

  const validateQuiz = () => {
    if (!quizData.title.trim()) return 'Quiz title is required';
    if (!quizData.subject) return 'Subject is required';
    if (quizData.duration < 1) return 'Duration must be at least 1 minute';
    if (quizData.dueDate && new Date(quizData.dueDate) < new Date()) {
      return 'Due date must be in the future';
    }
    if (quizData.questions.length === 0) return 'At least one question is required';
    
    for (let i = 0; i < quizData.questions.length; i++) {
      const q = quizData.questions[i];
      if (!q.questionText.trim()) return `Question ${i + 1}: Question text is required`;
      if (!q.topic.trim()) return `Question ${i + 1}: Topic is required`;
      if (!q.correctAnswer) return `Question ${i + 1}: Please select a correct answer`;
      const validOptions = q.options.filter(opt => opt.text.trim());
      if (validOptions.length < 2) return `Question ${i + 1}: At least 2 options are required`;
    }
    
    return null;
  };

  const handleInputChange = (field: keyof QuizForm, value: string | number) => {
    setQuizData(prev => ({ ...prev, [field]: value }));
  };

  const updateQuestion = (index: number, field: keyof Question, value: string) => {
    const newQuestions = [...quizData.questions];
    newQuestions[index] = { ...newQuestions[index], [field]: value };
    setQuizData(prev => ({ ...prev, questions: newQuestions }));
  };

  const updateOption = (questionIndex: number, optionIndex: number, value: string) => {
    const newQuestions = [...quizData.questions];
    newQuestions[questionIndex].options[optionIndex].text = value;
    setQuizData(prev => ({ ...prev, questions: newQuestions }));
  };

  const setCorrectAnswer = (questionIndex: number, optionIndex: number) => {
    const newQuestions = [...quizData.questions];
    const selectedOption = newQuestions[questionIndex].options[optionIndex];
    
    newQuestions[questionIndex].options.forEach(opt => opt.isCorrect = false);
    selectedOption.isCorrect = true;
    newQuestions[questionIndex].correctAnswer = selectedOption.text;
    
    setQuizData(prev => ({ ...prev, questions: newQuestions }));
  };

  const addQuestion = () => {
    setQuizData(prev => ({
      ...prev,
      questions: [...prev.questions, {
        questionText: '',
        options: [
          { text: '', isCorrect: false },
          { text: '', isCorrect: false },
          { text: '', isCorrect: false },
          { text: '', isCorrect: false }
        ],
        correctAnswer: '',
        topic: '',
        difficulty: 'Medium',
        points: 1
      }]
    }));
    setActiveQuestion(quizData.questions.length);
  };

  const removeQuestion = (index: number) => {
    if (quizData.questions.length > 1) {
      const newQuestions = quizData.questions.filter((_, i) => i !== index);
      setQuizData(prev => ({ ...prev, questions: newQuestions }));
      if (activeQuestion >= newQuestions.length) {
        setActiveQuestion(newQuestions.length - 1);
      }
    }
  };

  const saveQuiz = async (status: 'draft' | 'published') => {
    if (!user) {
      setError('User not authenticated');
      return;
    }

    const validationError = validateQuiz();
    if (validationError) {
      setError(validationError);
      toast({ title: 'Error', description: validationError, variant: 'destructive' });
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const cleanedQuestions = quizData.questions.map(q => ({
        questionText: q.questionText.trim(),
        options: q.options.filter(opt => opt.text.trim()).map(opt => ({
          text: opt.text.trim(),
          isCorrect: opt.isCorrect
        })),
        correctAnswer: q.correctAnswer.trim(),
        topic: q.topic.trim(),
        difficulty: q.difficulty,
        points: q.points || 1
      }));

      const quizPayload: any = {
        title: quizData.title.trim(),
        subject: quizData.subject,
        description: quizData.description.trim(),
        duration: Number(quizData.duration),
        difficulty: quizData.difficulty,
        allowedAttempts: Number(quizData.allowedAttempts),
        createdBy: user.name,
        status,
        dueDate: quizData.dueDate ? new Date(quizData.dueDate).toISOString() : null,
        questions: cleanedQuestions
      };

      if (quizData.quizId) {
        quizPayload.quizId = quizData.quizId;
      }

      const url = quizData.quizId 
        ? `http://localhost:5010/api/quizzes/${quizData.quizId}`
        : `http://localhost:5010/api/quizzes`;
      const method = quizData.quizId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(quizPayload),
      });

      if (!response.ok) {
        throw new Error('Failed to save quiz');
      }

      const result = await response.json();
      toast({
        title: 'Success',
        description: `Quiz ${quizData.quizId ? 'updated' : 'created'} successfully`,
      });

      // Redirect to TeacherCreateContent
      navigate('/create');
    } catch (error) {
      setError('Failed to save quiz');
      toast({ title: 'Error', description: 'Failed to save quiz', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const loadDraft = (draft: QuizForm) => {
    setQuizData(draft);
    setActiveQuestion(0);
  };

  const handlePreview = (quizId: string) => {
    const draft = drafts.find(d => d.quizId === quizId);
    if (draft) {
      setQuizData(draft);
      setActiveQuestion(0);
      setPreviewMode(true);
    } else {
      toast({ title: 'Error', description: 'Draft not found', variant: 'destructive' });
    }
  };

  const publishDraft = async (draft: QuizForm) => {
    setQuizData(draft);
    setActiveQuestion(0);
    await saveQuiz('published');
  };

  if (previewMode) {
    return (
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-[#0071c5] via-[#004494] to-[#002c5f] rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">{quizData.title || 'Quiz Preview'}</h1>
              <p className="text-[#a8d4f0]">{quizData.description || 'No description provided'}</p>
            </div>
            <Button 
              variant="outline" 
              className="bg-white text-[#0071c5] hover:bg-gray-100"
              onClick={() => setPreviewMode(false)}
            >
              <Eye className="h-4 w-4 mr-2" />
              Exit Preview
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="md:col-span-1">
            <CardHeader>
              <CardTitle className="text-lg">Quiz Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <BookOpen className="h-4 w-4 text-[#0071c5]" />
                <span className="text-sm">{quizData.subject}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-[#0071c5]" />
                <span className="text-sm">{quizData.duration} minutes</span>
              </div>
              <div className="flex items-center space-x-2">
                <Target className="h-4 w-4 text-[#0071c5]" />
                <span className="text-sm">{quizData.questions.length} questions</span>
              </div>
              <div className="flex items-center space-x-2">
                <Users className="h-4 w-4 text-[#0071c5]" />
                <span className="text-sm">{quizData.allowedAttempts} attempt(s)</span>
              </div>
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-[#0071c5]" />
                <span className="text-sm">
                  {quizData.dueDate ? new Date(quizData.dueDate).toLocaleDateString() : 'No due date'}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="md:col-span-3">
            <CardHeader>
              <CardTitle>Questions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {quizData.questions.map((question, index) => (
                <div key={index} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="font-semibold text-lg">Q{index + 1}. {question.questionText}</h3>
                    <div className="flex space-x-2">
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                        {question.topic}
                      </span>
                      <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs">
                        {question.difficulty}
                      </span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    {question.options.filter(opt => opt.text.trim()).map((option, optIndex) => (
                      <div 
                        key={optIndex} 
                        className={`p-3 rounded-lg border ${
                          option.isCorrect 
                            ? 'border-green-500 bg-green-50 dark:bg-green-900/20' 
                            : 'border-gray-300 dark:border-gray-600'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <span className="font-medium">{String.fromCharCode(65 + optIndex)}.</span>
                          <span>{option.text}</span>
                          {option.isCorrect && (
                            <span className="ml-auto text-green-600 text-sm font-medium">✓ Correct</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-[#0071c5] via-[#004494] to-[#002c5f] rounded-2xl p-6 text-white">
        <h1 className="text-3xl font-bold mb-2">Create New Quiz</h1>
        <p className="text-[#a8d4f0]">Design engaging quizzes to test student knowledge</p>
      </div>

      {error && (
        <div className="p-4 bg-red-50 text-red-800 rounded-lg border border-red-200">
          <h4 className="font-medium">Error</h4>
          <p>{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        <Card className="xl:col-span-1">
          <CardHeader>
            <CardTitle>Quiz Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Title</label>
              <Input
                value={quizData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="Enter quiz title"
                disabled={loading}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Subject</label>
              <Select 
                value={quizData.subject} 
                onValueChange={(value) => handleInputChange('subject', value)}
                disabled={loading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select subject" />
                </SelectTrigger>
                <SelectContent>
                  {subjects.map((subject) => (
                    <SelectItem key={subject} value={subject}>{subject}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Description</label>
              <Textarea
                value={quizData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Quiz description (optional)"
                rows={3}
                disabled={loading}
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-sm font-medium mb-2 block">Duration (min)</label>
                <Input
                  type="number"
                  value={quizData.duration}
                  onChange={(e) => handleInputChange('duration', parseInt(e.target.value) || 30)}
                  min="1"
                  disabled={loading}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Attempts</label>
                <Input
                  type="number"
                  value={quizData.allowedAttempts}
                  onChange={(e) => handleInputChange('allowedAttempts', parseInt(e.target.value) || 1)}
                  min="1"
                  disabled={loading}
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Difficulty</label>
              <Select 
                value={quizData.difficulty} 
                onValueChange={(value) => handleInputChange('difficulty', value)}
                disabled={loading}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {difficulties.map((diff) => (
                    <SelectItem key={diff} value={diff}>{diff}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
  <div>
  <label className="text-sm font-medium mb-2 block flex items-center">
    <Calendar className="h-4 w-4 mr-2 text-gray-500" />
    Due Date <span className="text-gray-400 ml-1">(optional)</span>
  </label>
  <div className="relative">
    <Input
      type="datetime-local"
      value={quizData.dueDate}
      onChange={(e) => handleInputChange('dueDate', e.target.value)}
      min={new Date(Date.now() + 60 * 1000).toISOString().slice(0, 16)} // min = now + 1 min
      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0071c5] focus:border-transparent transition duration-200 disabled:bg-gray-100 disabled:cursor-not-allowed"
      disabled={loading}
      placeholder="Select due date and time"
    />
    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
  </div>
</div>
</div>
            <div className="pt-4 space-y-2">
              <Button 
                className="w-full bg-[#0071c5] hover:bg-[#004494]"
                onClick={() => setPreviewMode(true)}
                disabled={loading}
              >
                <Eye className="h-4 w-4 mr-2" />
                Preview Quiz
              </Button>
              <Button 
                className="w-full" 
                variant="outline"
                onClick={() => saveQuiz('draft')}
                disabled={loading}
              >
                <Save className="h-4 w-4 mr-2" />
                {loading ? 'Saving...' : 'Save Draft'}
              </Button>
              <Button 
                className="w-full bg-green-600 hover:bg-green-700" 
                onClick={() => saveQuiz('published')}
                disabled={loading}
              >
                {loading ? 'Publishing...' : 'Publish Quiz'}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="xl:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Question {activeQuestion + 1} of {quizData.questions.length}</CardTitle>
              <div className="flex space-x-2">
                <Button size="sm" onClick={addQuestion} disabled={loading}>
                  <PlusCircle className="h-4 w-4 mr-1" />
                  Add Question
                </Button>
                {quizData.questions.length > 1 && (
                  <Button 
                    size="sm" 
                    variant="destructive"
                    onClick={() => removeQuestion(activeQuestion)}
                    disabled={loading}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Question Text</label>
              <Textarea
                value={quizData.questions[activeQuestion].questionText}
                onChange={(e) => updateQuestion(activeQuestion, 'questionText', e.target.value)}
                placeholder="Enter your question here..."
                rows={3}
                disabled={loading}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Topic</label>
                <Input
                  value={quizData.questions[activeQuestion].topic}
                  onChange={(e) => updateQuestion(activeQuestion, 'topic', e.target.value)}
                  placeholder="e.g., Algebra, Mechanics"
                  disabled={loading}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Difficulty</label>
                <Select 
                  value={quizData.questions[activeQuestion].difficulty} 
                  onValueChange={(value) => updateQuestion(activeQuestion, 'difficulty', value)}
                  disabled={loading}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {difficulties.map((diff) => (
                      <SelectItem key={diff} value={diff}>{diff}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Options (Select the correct answer)</label>
              <div className="space-y-3">
                {quizData.questions[activeQuestion].options.map((option, optIndex) => (
                  <div key={optIndex} className="flex items-center space-x-3">
                    <button
                      type="button"
                      onClick={() => setCorrectAnswer(activeQuestion, optIndex)}
                      className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                        option.isCorrect 
                          ? 'border-green-500 bg-green-500 text-white' 
                          : 'border-gray-300 hover:border-green-400'
                      }`}
                      disabled={loading}
                    >
                      {option.isCorrect && '✓'}
                    </button>
                    <span className="font-medium min-w-[20px]">{String.fromCharCode(65 + optIndex)}.</span>
                    <Input
                      value={option.text}
                      onChange={(e) => updateOption(activeQuestion, optIndex, e.target.value)}
                      placeholder={`Option ${String.fromCharCode(65 + optIndex)}`}
                      className="flex-1"
                      disabled={loading}
                    />
                  </div>
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Click the circle to mark the correct answer
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="xl:col-span-1">
          <CardHeader>
            <CardTitle>Questions</CardTitle>
            <CardDescription>Navigate between questions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-2 max-h-96 overflow-y-auto">
              {quizData.questions.map((question, index) => (
                <button
                  key={index}
                  onClick={() => setActiveQuestion(index)}
                  className={`p-3 text-left rounded-lg border transition-colors ${
                    activeQuestion === index
                      ? 'border-[#0071c5] bg-blue-50 dark:bg-blue-900/20' 
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                  }`}
                  disabled={loading}
                >
                  <div className="font-medium text-sm">
                    Q{index + 1}
                  </div>
                  <div className="text-xs text-gray-500 truncate">
                    {question.questionText || 'Empty question'}
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-xs text-gray-400">
                      {question.topic || 'No topic'}
                    </span>
                    {question.correctAnswer && (
                      <span className="text-xs text-green-600">✓</span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Drafts</CardTitle>
          <CardDescription>Manage your saved drafts</CardDescription>
        </CardHeader>
        <CardContent>
          {drafts.length === 0 ? (
            <p className="text-gray-600">No drafts available.</p>
          ) : (
            <div className="space-y-4">
              {drafts.map((draft) => (
                <div key={draft.quizId} className="p-4 border rounded-xl hover:shadow-lg">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="font-semibold">{draft.title}</h4>
                      <p className="text-sm text-gray-600">{draft.subject} - {draft.difficulty}</p>
                      <p className="text-xs text-gray-500">{draft.questions.length} questions</p>
                    </div>
                    <div className="flex space-x-2">
                      <Button size="sm" onClick={() => loadDraft(draft)}>
                        <Edit className="h-4 w-4" /> Load
                      </Button>
                      <Button size="sm" onClick={() => handlePreview(draft.quizId!)}>
                        <Eye className="h-4 w-4" /> Preview
                      </Button>
                      <Button 
                        size="sm" 
                        onClick={() => publishDraft(draft)} 
                        className="bg-green-600 hover:bg-green-700"
                        disabled={loading}
                      >
                        <Play className="h-4 w-4" /> Publish
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CreateQuiz;