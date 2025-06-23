import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trophy, Clock, CheckCircle, AlertCircle, Play, BarChart3, Calendar, Target } from 'lucide-react';

const StudentQuizzes: React.FC = () => {
  const availableQuizzes = [
    {
      id: 1,
      title: 'Quadratic Equations Assessment',
      subject: 'Mathematics',
      questions: 15,
      duration: '30 min',
      difficulty: 'Medium',
      dueDate: 'Tomorrow',
      status: 'available'
    },
    {
      id: 2,
      title: 'Newton\'s Laws Quiz',
      subject: 'Physics',
      questions: 10,
      duration: '20 min',
      difficulty: 'Easy',
      dueDate: '3 days',
      status: 'available'
    },
    {
      id: 3,
      title: 'Chemical Bonding Test',
      subject: 'Chemistry',
      questions: 20,
      duration: '45 min',
      difficulty: 'Hard',
      dueDate: '1 week',
      status: 'locked'
    }
  ];

  const completedQuizzes = [
    {
      id: 1,
      title: 'Algebra Basics Quiz',
      subject: 'Mathematics',
      score: 85,
      maxScore: 100,
      completedDate: '2 days ago',
      attempts: 1,
      grade: 'B+'
    },
    {
      id: 2,
      title: 'Motion and Forces',
      subject: 'Physics',
      score: 92,
      maxScore: 100,
      completedDate: '1 week ago',
      attempts: 2,
      grade: 'A-'
    },
    {
      id: 3,
      title: 'Periodic Table',
      subject: 'Chemistry',
      score: 78,
      maxScore: 100,
      completedDate: '2 weeks ago',
      attempts: 1,
      grade: 'B'
    }
  ];

  const stats = [
    { label: 'Completed', value: '12', icon: CheckCircle, color: 'text-green-600' },
    { label: 'Pending', value: '3', icon: Clock, color: 'text-yellow-600' },
    { label: 'Average Score', value: '85%', icon: Target, color: 'text-blue-600' },
    { label: 'Best Score', value: '96%', icon: Trophy, color: 'text-purple-600' }
  ];

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'easy': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'hard': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getSubjectColor = (subject: string) => {
    switch (subject) {
      case 'Mathematics': return 'bg-blue-100 text-blue-800';
      case 'Physics': return 'bg-green-100 text-green-800';
      case 'Chemistry': return 'bg-purple-100 text-purple-800';
      case 'Biology': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getGradeColor = (grade: string) => {
    if (['A+', 'A', 'A-'].includes(grade)) return 'text-green-600';
    if (['B+', 'B', 'B-'].includes(grade)) return 'text-blue-600';
    if (['C+', 'C', 'C-'].includes(grade)) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-gradient-to-r from-[#0071c5] via-[#004494] to-[#002c5f] rounded-2xl p-6 text-white">
        <h1 className="text-3xl font-bold mb-2 flex items-center">
          <Trophy className="h-8 w-8 mr-3" />
          Quizzes & Assessments
        </h1>
        <p className="text-[#a8d4f0]">Take quizzes and track your learning progress</p>
      </div>

      {/* Stats */}
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
        {/* Available Quizzes */}
        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Play className="h-5 w-5 mr-2 text-[#0071c5]" />
              Available Quizzes
            </CardTitle>
            <CardDescription>Ready to take assessments</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {availableQuizzes.map((quiz) => (
              <div key={quiz.id} className={`p-4 border rounded-xl transition-all duration-300 ${
                quiz.status === 'locked' 
                  ? 'border-slate-200 dark:border-slate-700 opacity-60' 
                  : 'border-slate-200 dark:border-slate-700 hover:shadow-lg hover:border-[#0071c5]'
              }`}>
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
                        {quiz.questions} questions
                      </span>
                      <span className="flex items-center">
                        <Clock className="h-4 w-4 mr-1" />
                        {quiz.duration}
                      </span>
                      <span className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        Due in {quiz.dueDate}
                      </span>
                    </div>
                  </div>
                  <Button 
                    size="sm" 
                    disabled={quiz.status === 'locked'}
                    className={quiz.status === 'locked' 
                      ? 'bg-gray-400 cursor-not-allowed' 
                      : 'bg-[#0071c5] hover:bg-[#004494] text-white'
                    }
                  >
                    {quiz.status === 'locked' ? 'Locked' : 'Start Quiz'}
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Progress Overview */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <BarChart3 className="h-5 w-5 mr-2 text-[#0071c5]" />
                Progress Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Mathematics</span>
                    <span className="text-[#0071c5] font-medium">90%</span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                    <div className="bg-[#0071c5] h-2 rounded-full" style={{ width: '90%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Physics</span>
                    <span className="text-[#0071c5] font-medium">85%</span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                    <div className="bg-[#0071c5] h-2 rounded-full" style={{ width: '85%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Chemistry</span>
                    <span className="text-[#0071c5] font-medium">78%</span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                    <div className="bg-[#0071c5] h-2 rounded-full" style={{ width: '78%' }}></div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full justify-start">
                <BarChart3 className="h-4 w-4 mr-2" />
                View Detailed Analytics
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Clock className="h-4 w-4 mr-2" />
                Practice Mode
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Recent Results */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Results</CardTitle>
          <CardDescription>Your latest quiz performances</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {completedQuizzes.map((quiz) => (
              <div key={quiz.id} className="p-4 border border-slate-200 dark:border-slate-700 rounded-xl">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h4 className="font-semibold text-slate-900 dark:text-white mb-1">{quiz.title}</h4>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSubjectColor(quiz.subject)}`}>
                      {quiz.subject}
                    </span>
                  </div>
                  <span className={`text-2xl font-bold ${getGradeColor(quiz.grade)}`}>
                    {quiz.grade}
                  </span>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Score</span>
                    <span className="font-medium">{quiz.score}/{quiz.maxScore}</span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-[#0071c5] to-[#004494] h-2 rounded-full" 
                      style={{ width: `${(quiz.score / quiz.maxScore) * 100}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-xs text-slate-600 dark:text-slate-400">
                    <span>Completed {quiz.completedDate}</span>
                    <span>{quiz.attempts} attempt{quiz.attempts > 1 ? 's' : ''}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StudentQuizzes;