import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trophy, Clock, CheckCircle, Play, BarChart3, Calendar, Target, Eye } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface Quiz {
  quizId: string;
  title: string;
  subject: string;
  questions: {
    questionText: string;
    options: { text: string; isCorrect?: boolean }[];
    topic: string;
    difficulty: string;
    points: number;
  }[];
  duration: number;
  difficulty: string;
  dueDate: string;
  attemptCount: number;
  canAttempt: boolean;
}

interface Attempt {
  attemptId: string;
  quizId: { title: string; subject: string; _id: string } | null; // Allow quizId to be null
  score: number;
  maxScore: number;
  percentage: number;
  submittedAt: string;
  topicPerformance: { topic: string; correct: number; total: number; percentage: number }[];
}

const StudentQuizzes: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [questionStartTimes, setQuestionStartTimes] = useState<number[]>([]);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);

  if (!user) {
    return (
      <div className="p-4 bg-red-50 text-red-800 rounded-lg">
        Please log in to access quizzes.
      </div>
    );
  }

  const { data: quizzes, isLoading: quizzesLoading, error: quizzesError } = useQuery({
    queryKey: ['quizzes', user.name],
    queryFn: async () => {
      const response = await fetch(`http://localhost:5010/api/quizzes?studentUsername=${user.name}`);
      if (!response.ok) throw new Error('Failed to fetch quizzes');
      const data = await response.json();
      return data.filter((quiz: Quiz) => {
        if (!quiz.dueDate) return true;
        return new Date(quiz.dueDate) > new Date();
      });
    },
    enabled: !!user,
  });

  const { data: attempts, isLoading: attemptsLoading, error: attemptsError } = useQuery({
    queryKey: ['attempts', user.name],
    queryFn: async () => {
      const response = await fetch(`http://localhost:5010/api/students/${user.name}/results`);
      if (!response.ok) throw new Error('Failed to fetch results');
      return response.json();
    },
    enabled: !!user,
  });

  const startQuiz = (quiz: Quiz) => {
    if (quiz.dueDate && new Date(quiz.dueDate) <= new Date()) {
      toast({
        title: 'Error',
        description: 'This quiz is past due and cannot be attempted.',
        variant: 'destructive',
      });
      return;
    }
    if (!quiz.canAttempt) {
      toast({
        title: 'Error',
        description: 'You have reached the maximum number of attempts for this quiz.',
        variant: 'destructive',
      });
      return;
    }
    setSelectedQuiz(quiz);
    setAnswers(new Array(quiz.questions.length).fill(''));
    setQuestionStartTimes(new Array(quiz.questions.length).fill(Date.now()));
    setCurrentQuestionIndex(0);
    setStartTime(new Date());
    setTimeRemaining(quiz.duration * 60); // Convert minutes to seconds
  };

  const handleAnswerSelect = (option: string) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestionIndex] = option;
    setAnswers(newAnswers);
  };

  const handleNextQuestion = () => {
    const newQuestionStartTimes = [...questionStartTimes];
    newQuestionStartTimes[currentQuestionIndex + 1] = Date.now();
    setQuestionStartTimes(newQuestionStartTimes);
    setCurrentQuestionIndex((prev) => prev + 1);
  };

  const handlePreviousQuestion = () => {
    const newQuestionStartTimes = [...questionStartTimes];
    newQuestionStartTimes[currentQuestionIndex - 1] = Date.now();
    setQuestionStartTimes(newQuestionStartTimes);
    setCurrentQuestionIndex((prev) => prev - 1);
  };

  const submitQuiz = async (isAutoSubmit = false) => {
    if (!selectedQuiz || !startTime || !user) return;

    const timeSpent = Math.round((new Date().getTime() - startTime.getTime()) / 1000);
    const questionTimes = questionStartTimes.map((startTime, index) => {
      const nextIndex = index + 1;
      const endTime = nextIndex < questionStartTimes.length ? questionStartTimes[nextIndex] : Date.now();
      return Math.round((endTime - startTime) / 1000);
    });

    try {
      const response = await fetch(`http://localhost:5010/api/quizzes/${selectedQuiz.quizId}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentUsername: user.name,
          answers: answers.map((answer, index) => ({
            selectedAnswer: answer,
            timeTaken: questionTimes[index],
          })),
          timeSpent,
          startedAt: startTime.toISOString(),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to submit quiz');
      }

      const result = await response.json();
      toast({
        title: isAutoSubmit ? 'Time Up!' : 'Quiz Submitted',
        description: `Score: ${result.score}/${result.maxScore} (${result.percentage}%)`,
      });
      setSelectedQuiz(null);
      setQuestionStartTimes([]);
      setTimeRemaining(null);
    } catch (err: any) {
      toast({ title: 'Error', description: err.message || 'Error submitting quiz', variant: 'destructive' });
    }
  };

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (selectedQuiz && timeRemaining !== null && timeRemaining > 0) {
      timer = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev && prev <= 1) {
            submitQuiz(true); // Auto-submit when time is up
            return 0;
          }
          return prev ? prev - 1 : 0;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [selectedQuiz, timeRemaining]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'easy': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'hard': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getSubjectColor = (subject: string) => {
    const colors = [
      'bg-blue-100 text-blue-800',
      'bg-green-100 text-green-800',
      'bg-purple-100 text-purple-800',
      'bg-orange-100 text-orange-800',
      'bg-pink-100 text-pink-800',
      'bg-teal-100 text-teal-800',
      'bg-indigo-100 text-indigo-800'
    ];
    const hash = subject.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[hash % colors.length];
  };

  const getGradeColor = (percentage: number) => {
    if (percentage >= 90) return 'text-green-600';
    if (percentage >= 80) return 'text-blue-600';
    if (percentage >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const stats = [
    { label: 'Completed', value: attempts?.length || 0, icon: CheckCircle, color: 'text-green-600' },
    { label: 'Pending', value: quizzes?.filter((q: Quiz) => q.canAttempt).length || 0, icon: Clock, color: 'text-yellow-600' },
    { label: 'Average Score', value: attempts?.length ? `${Math.round(attempts.reduce((sum: number, a: Attempt) => sum + a.percentage, 0) / attempts.length)}%` : '0%', icon: Target, color: 'text-blue-600' },
    { label: 'Best Score', value: attempts?.length ? `${Math.max(...attempts.map((a: Attempt) => a.percentage)).toFixed(2)}%`  : '0%', icon: Trophy, color: 'text-purple-600' },
  ];

  // Get unique subjects from available quizzes (not just completed attempts)
  const subjects = Array.from(
    new Set(
      quizzes?.map((quiz: Quiz) => quiz.subject).filter((subject): subject is string => typeof subject === 'string') || []
    )
  );

  if (quizzesLoading || attemptsLoading) return <div>Loading...</div>;
  if (quizzesError || attemptsError) {
    return (
      <div className="p-4 bg-red-50 text-red-800 rounded-lg">
        Error loading quizzes or results: {(quizzesError || attemptsError)?.message || 'Unknown error'}
      </div>
    );
  }

  if (selectedQuiz) {
    const question = selectedQuiz.questions[currentQuestionIndex];
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>{selectedQuiz.title}</CardTitle>
                <CardDescription>
                  Question {currentQuestionIndex + 1} of {selectedQuiz.questions.length}
                </CardDescription>
              </div>
              <div className="text-lg font-semibold text-red-600">
                Time Remaining: {timeRemaining !== null ? formatTime(timeRemaining) : 'N/A'}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <h4 className="font-semibold text-lg">{question.questionText}</h4>
                <div className="flex space-x-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSubjectColor(selectedQuiz.subject)}`}>{selectedQuiz.subject}</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(question.difficulty)}`}>{question.difficulty}</span>
                </div>
              </div>
              <div className="space-y-2">
                {question.options.map((option, index) => (
                  <Button
                    key={index}
                    variant={answers[currentQuestionIndex] === option.text ? 'default' : 'outline'}
                    className="w-full justify-start"
                    onClick={() => handleAnswerSelect(option.text)}
                    disabled={timeRemaining === 0}
                  >
                    {String.fromCharCode(65 + index)}. {option.text}
                  </Button>
                ))}
              </div>
              <div className="flex justify-between">
                <Button
                  disabled={currentQuestionIndex === 0 || timeRemaining === 0}
                  onClick={handlePreviousQuestion}
                >
                  Previous
                </Button>
                {currentQuestionIndex < selectedQuiz.questions.length - 1 ? (
                  <Button onClick={handleNextQuestion} disabled={timeRemaining === 0}>Next</Button>
                ) : (
                  <Button onClick={() => submitQuiz(false)} disabled={timeRemaining === 0}>Submit Quiz</Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-[#0071c5] via-[#004494] to-[#002c5f] rounded-2xl p-6 text-white">
        <h1 className="text-3xl font-bold mb-2 flex items-center">
          <Trophy className="h-8 w-8 mr-3" />
          Quizzes & Assessments
        </h1>
        <p className="text-[#a8d4f0]">Take quizzes and track your learning progress</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => {
          const IconComponent = stat.icon;
          return (
            <Card key={index}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold">{stat.value}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{stat.label}</p>
                  </div>
                  <IconComponent className={`h-8 w-8 ${stat.color}`} />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Play className="h-5 w-5 mr-2 text-[#0071c5]" />
              Available Quizzes
            </CardTitle>
            <CardDescription>Ready to take assessments</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {quizzes?.length === 0 ? (
              <p className="text-gray-600">No quizzes available at the moment.</p>
            ) : (
              quizzes.map((quiz: Quiz) => (
                <div
                  key={quiz.quizId}
                  className={`p-4 border rounded-xl transition-all duration-300 ${
                    !quiz.canAttempt || (quiz.dueDate && new Date(quiz.dueDate) < new Date())
                      ? 'border-slate-200 dark:border-slate-700 opacity-60'
                      : 'border-slate-200 dark:border-slate-700 hover:shadow-lg hover:border-[#0071c5]'
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h4 className="font-semibold text-slate-900 dark:text-white mb-2">{quiz.title}</h4>
                      <div className="flex items-center space-x-2 mb-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSubjectColor(quiz.subject)}`}>
                          {quiz.subject}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(quiz.difficulty)}`}>
                          {quiz.difficulty}
                        </span>
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-slate-600 dark:text-slate-400">
                        <span className="flex items-center">
                          <Target className="h-4 w-4 mr-1" />
                          {quiz.questions.length} questions
                        </span>
                        <span className="flex items-center">
                          <Clock className="h-4 w-4 mr-1" />
                          {quiz.duration} min
                        </span>
                        <span className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          {quiz.dueDate ? `Due ${new Date(quiz.dueDate).toLocaleDateString()}` : 'No due date'}
                        </span>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      disabled={!quiz.canAttempt || (quiz.dueDate && new Date(quiz.dueDate) < new Date())}
                      className={
                        quiz.canAttempt && (!quiz.dueDate || new Date(quiz.dueDate) >= new Date())
                          ? 'bg-[#0071c5] hover:bg-[#004494] text-white'
                          : 'bg-gray-400 cursor-not-allowed'
                      }
                      onClick={() => startQuiz(quiz)}
                    >
                      {quiz.canAttempt ? 'Start Quiz' : 'Attempts Exhausted'}
                    </Button>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <BarChart3 className="h-5 w-5 mr-2 text-[#0071c5]" />
                Progress Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-h-64 overflow-y-auto">
                {subjects.length === 0 ? (
                  <p className="text-gray-600">No subjects available.</p>
                ) : (
                  subjects.map((subject) => {
                    // Get all quizzes for this subject
                    const subjectQuizzes = quizzes?.filter((quiz: Quiz) => quiz.subject === subject) || [];
                    
                    // Get completed attempts for this subject
                    const subjectAttempts = attempts?.filter((a: Attempt) => a.quizId?.subject === subject) || [];
                    
                    // Calculate progress: completed quizzes / total quizzes * 100
                    const completedQuizzes = subjectAttempts.length;
                    const totalQuizzes = subjectQuizzes.length;
                    const progressPercentage = totalQuizzes > 0 ? Math.round((completedQuizzes / totalQuizzes) * 100) : 0;
                    
                    // Calculate average score for completed quizzes
                    const avgScore = subjectAttempts.length
                      ? Math.round(
                          subjectAttempts.reduce((sum: number, a: Attempt) => sum + a.percentage, 0) /
                            subjectAttempts.length
                        )
                      : 0;
                    
                    return (
                      <div key={subject as string}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="font-medium">{subject as string}</span>
                          <span className="text-[#0071c5] font-medium">
                            {completedQuizzes}/{totalQuizzes} ({progressPercentage}%)
                          </span>
                        </div>
                        <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 mb-2">
                          <div
                            className="bg-[#0071c5] h-2 rounded-full"
                            style={{ width: `${progressPercentage}%` }}
                          ></div>
                        </div>
                        {subjectAttempts.length > 0 && (
                          <div className="text-xs text-slate-600 dark:text-slate-400">
                            Average Score: {avgScore}%
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full justify-start" onClick={() => navigate('/swot')}>
                <BarChart3 className="h-4 w-4 mr-2" />
                View SWOT Analysis
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Results</CardTitle>
          <CardDescription>Your latest quiz performances</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {attempts?.length === 0 ? (
              <p className="text-gray-600">No recent results available.</p>
            ) : (
              attempts.map((attempt: Attempt) => (
                <div
                  key={attempt.attemptId}
                  className="p-4 border border-slate-200 dark:border-slate-700 rounded-xl"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h4 className="font-semibold text-slate-900 dark:text-white mb-1">
                        {attempt.quizId?.title || 'Unknown Quiz'}
                      </h4>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${getSubjectColor(
                          attempt.quizId?.subject || 'Unknown'
                        )}`}
                      >
                        {attempt.quizId?.subject || 'Unknown'}
                      </span>
                    </div>
                    <span className={`text-2xl font-bold ${getGradeColor(attempt.percentage)}`}>
                      {Math.round(attempt.percentage)}%
                    </span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Score</span>
                      <span className="font-medium">
                        {attempt.score}/{attempt.maxScore}
                      </span>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-[#0071c5] to-[#004494] h-2 rounded-full"
                        style={{ width: `${attempt.percentage}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-xs text-slate-600 dark:text-slate-400">
                      <span>Completed {new Date(attempt.submittedAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StudentQuizzes;