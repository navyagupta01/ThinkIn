import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { 
  MessageCircle, 
  Video, 
  BookOpen, 
  Bot, 
  StickyNote, 
  ClipboardCheck,
  ArrowRight,
  Sparkles,
  FileText,
  Brain,
  PenTool,
} from 'lucide-react';
import QADiscussionBoard from '@/components/QADiscussionBoard';
import TeacherChatAssistant from './TeacherChatAssistant';
import ErrorBoundary from '@/components/ErrorBoundary';
  
const TeacherDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  if (!user) {
    return (
      <div className="text-center py-8 text-red-500">
        Error: User not authenticated. Please log in.
      </div>
    );
  }

  const features = [
    {
      id: 'discussion',
      title: 'Discussion Forum',
      description: 'Engage with students, answer questions, and foster collaborative discussions in the Q&A board.',
      icon: MessageCircle,
      link: '/teacher/discussion',
      gradient: 'from-purple-500 via-purple-600 to-indigo-600',
      bgPattern: 'bg-purple-50',
      stats: 'Monitor student questions and responses',
    },
    {
      id: 'live',
      title: 'Live Classes',
      description: 'Create and manage live class sessions, track student engagement, and share links with your class.',
      icon: Video,
      link: '/teacher/live',
      gradient: 'from-red-500 via-pink-600 to-rose-600',
      bgPattern: 'bg-red-50',
      stats: 'Schedule your next live session',
    },
    {
      id: 'resources',
      title: 'Content Creation',
      description: 'Upload notes, videos, and other resources for students to access in their learning journey.',
      icon: BookOpen,
      link: '/teacher/resources',
      gradient: 'from-green-500 via-emerald-600 to-teal-600',
      bgPattern: 'bg-green-50',
      stats: 'Share new materials with students',
    },
    {
      id: 'quizzes',
      title: 'Create Quizzes',
      description: 'Design interactive quizzes to assess student understanding and track their progress.',
      icon: ClipboardCheck,
      link: '/teacher/quizzes',
      gradient: 'from-violet-500 via-purple-600 to-indigo-600',
      bgPattern: 'bg-violet-50',
      stats: 'Create assessments for your class',
    },
    {
      id: 'lecture-plans',
      title: 'Lecture Plans',
      description: 'Use our AI assistant to create structured lecture plans tailored to your curriculum.',
      icon: PenTool,
      link: '/teacher/lecture-plans',
      gradient: 'from-blue-500 via-cyan-600 to-teal-600',
      bgPattern: 'bg-blue-50',
      stats: 'Plan your next class with AI',
    },
  ];

  const handleFeatureClick = (link: string) => {
    navigate(link);
  };

  const handleQuickAction = (action: string) => {
    switch (action) {
      case 'live':
        navigate('/teacher/live');
        break;
      case 'resources':
        navigate('/teacher/resources');
        break;
      case 'quizzes':
        navigate('/teacher/quizzes');
        break;
      case 'lecture-plans':
        navigate('/teacher/lecture-plans');
        break;
      default:
        break;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-[#0071c5] via-[#004494] to-[#002c5f] rounded-3xl p-8 mb-8 text-white overflow-hidden">
        <div className="absolute inset-0 bg-black bg-opacity-10" />
        <div className="absolute top-0 right-0 w associates-64 h-64 bg-white bg-opacity-10 rounded-full -translate-y-32 translate-x-32" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white bg-opacity-5 rounded-full translate-y-24 -translate-x-24" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <Sparkles className="w-32 h-32 text-white opacity-5" />
        </div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-4xl font-bold">Welcome back, {user.name}! 👨‍🏫</h1>
          </div>
          <p className="text-[#a8d4f0] text-lg mb-6 max-w-2xl">
            Your teaching dashboard is ready. Explore tools to create content, manage classes, and engage with students.
          </p>
        </div>
      </div>

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
        {features.map((feature) => {
          const IconComponent = feature.icon;
          return (
            <div
              key={feature.id}
              onClick={() => handleFeatureClick(feature.link)}
              className="group relative cursor-pointer"
            >
              <div className={`relative h-full bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-gray-200 hover:-translate-y-1 ${feature.bgPattern} overflow-hidden`}>
                <div className="absolute top-0 right-0 w-24 h-24 opacity-5">
                  <IconComponent className="w-full h-full" />
                </div>
                <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${feature.gradient}`} />
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-12 h-12 bg-gradient-to-r ${feature.gradient} rounded-xl flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                      <IconComponent className="w-6 h-6" />
                    </div>
                    <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-gray-600 group-hover:translate-x-1 transition-all duration-300" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-gray-700 transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 text-sm mb-4 leading-relaxed">
                    {feature.description}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <div className={`w-2 h-2 bg-gradient-to-r ${feature.gradient} rounded-full animate-pulse`} />
                    <span>{feature.stats}</span>
                  </div>
                </div>
                <div className={`absolute inset-0 bg-gradient-to-r ${feature.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300 rounded-2xl`} />
              </div>
            </div>
          );
        })}
      </div>

      
      {/* Quick Actions */}
      <div className="mt-8 bg-gradient-to-r from-gray-50 to-blue-50 rounded-2xl p-6 border border-gray-100">
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-[#0071c5]" />
          Quick Actions
        </h3>
        <div className="flex flex-wrap gap-3">
          <button 
            onClick={() => handleQuickAction('live')}
            className="px-4 py-2 bg-[#0071c5] text-white rounded-lg hover:bg-[#004494] transition-colors duration-300 text-sm font-medium"
          >
            Schedule Live Class
          </button>
          <button 
            onClick={() => handleQuickAction('resources')}
            className="px-4 py-2 bg-white text-[#0071c5] border border-[#0071c5] rounded-lg hover:bg-[#0071c5] hover:text-white transition-all duration-300 text-sm font-medium"
          >
            Upload Resources
          </button>
          <button 
            onClick={() => handleQuickAction('quizzes')}
            className="px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-300 text-sm font-medium"
          >
            Create Quiz
          </button>
          <button 
            onClick={() => handleQuickAction('lecture-plans')}
            className="px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-300 text-sm font-medium"
          >
            Plan Lecture
          </button>
        </div>
      </div>

      {/* Teacher AI Assistant */}
      <div className="mt-8">
        <ErrorBoundary>
          <TeacherChatAssistant/>
        </ErrorBoundary>
      </div>
    </div>
  );
};

export default TeacherDashboard;