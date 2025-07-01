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
  Users,
  Play,
  FileText,
  Brain,
  PenTool,
  Target
} from 'lucide-react';

const StudentDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const features = [
    {
      id: 'discussion',
      title: 'Discussion Forum',
      description: 'Connect with classmates, ask questions, and participate in engaging discussions with your peers and teachers.',
      icon: MessageCircle,
      link: '/discussion',
      gradient: 'from-purple-500 via-purple-600 to-indigo-600',
      bgPattern: 'bg-purple-50',
      stats: 'Join 500+ active discussions'
    },
    {
      id: 'live',
      title: 'Live Classes',
      description: 'Attend interactive live sessions, participate in real-time discussions, and never miss an important class.',
      icon: Video,
      link: '/live',
      gradient: 'from-red-500 via-pink-600 to-rose-600',
      bgPattern: 'bg-red-50',
      stats: 'Next class in 2 hours'
    },
    {
      id: 'resources',
      title: 'Learning Resources',
      description: 'Access curated materials, documents, videos, and study guides shared by your teachers.',
      icon: BookOpen,
      link: '/resources',
      gradient: 'from-green-500 via-emerald-600 to-teal-600',
      bgPattern: 'bg-green-50',
      stats: '150+ resources available'
    },
    {
      id: 'chatbot',
      title: '3D AI Teacher',
      description: 'Get personalized help from our advanced AI teacher available 24/7 to answer your questions and guide your learning.',
      icon: Bot,
      link: '/chatbot',
      gradient: 'from-blue-500 via-cyan-600 to-teal-600',
      bgPattern: 'bg-blue-50',
      stats: 'AI powered learning assistant'
    },
    {
      id: 'notes',
      title: 'Smart Notes',
      description: 'Create, organize, and manage your personal notes with our intelligent note-taking system.',
      icon: StickyNote,
      link: '/notes',
      gradient: 'from-yellow-500 via-orange-500 to-red-500',
      bgPattern: 'bg-yellow-50',
      stats: 'Organize your thoughts better'
    },
    {
      id: 'quizzes',
      title: 'Quizzes & SWOT Analysis',
      description: 'Take interactive quizzes and get detailed SWOT analysis to track your academic progress and identify improvement areas.',
      icon: ClipboardCheck,
      link: '/quizzes',
      gradient: 'from-violet-500 via-purple-600 to-indigo-600',
      bgPattern: 'bg-violet-50',
      stats: 'Track your progress'
    }
  ];

  const handleFeatureClick = (link: string) => {
    navigate(link);
  };

  const handleQuickAction = (action: string) => {
    switch (action) {
      case 'live':
        navigate('/live');
        break;
      case 'chatbot':
        navigate('/chatbot');
        break;
      case 'resources':
        navigate('/resources');
        break;
      default:
        break;
    }
  };

  // Show loading or error state if user is not available
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-lg font-medium">
            Error: User not authenticated. Please log in.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-[#0071c5] via-[#004494] to-[#002c5f] rounded-3xl p-8 mb-8 text-white overflow-hidden">
        <div className="absolute inset-0 bg-black bg-opacity-10" />
        <div className="absolute top-0 right-0 w-64 h-64 bg-white bg-opacity-10 rounded-full -translate-y-32 translate-x-32" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white bg-opacity-5 rounded-full translate-y-24 -translate-x-24" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <Sparkles className="w-32 h-32 text-white opacity-5" />
        </div>
        
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-4xl font-bold">Welcome back, {user.name}! 🎓</h1>
          </div>
          <p className="text-[#a8d4f0] text-lg mb-6 max-w-2xl">
            Your personalized learning dashboard is ready. Explore our comprehensive suite of tools designed to enhance your educational journey and academic success.
          </p>
        </div>
      </div>

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
        {features.map((feature, index) => {
          const IconComponent = feature.icon;
          return (
            <div
              key={feature.id}
              onClick={() => handleFeatureClick(feature.link)}
              className="group relative cursor-pointer"
            >
              <div className={`relative h-full bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-gray-200 hover:-translate-y-1 ${feature.bgPattern} overflow-hidden`}>
                {/* Background Pattern */}
                <div className="absolute top-0 right-0 w-24 h-24 opacity-5">
                  <IconComponent className="w-full h-full" />
                </div>
                
                {/* Gradient Accent */}
                <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${feature.gradient}`} />
                
                {/* Content */}
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
                
                {/* Hover Effect */}
                <div className={`absolute inset-0 bg-gradient-to-r ${feature.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300 rounded-2xl`} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Stats Section */}
      <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-r from-[#0071c5] to-[#004494] rounded-lg flex items-center justify-center">
            <FileText className="w-4 h-4 text-white" />
          </div>
          Your Learning Journey
        </h2>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-100 hover:shadow-md transition-shadow duration-300">
            <div className="text-2xl font-bold text-[#0071c5] mb-1">24</div>
            <div className="text-sm text-gray-600">Classes Attended</div>
          </div>
          
          <div className="text-center p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-100 hover:shadow-md transition-shadow duration-300">
            <div className="text-2xl font-bold text-green-600 mb-1">156</div>
            <div className="text-sm text-gray-600">Resources Accessed</div>
          </div>
          
          <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-violet-50 rounded-xl border border-purple-100 hover:shadow-md transition-shadow duration-300">
            <div className="text-2xl font-bold text-purple-600 mb-1">12</div>
            <div className="text-sm text-gray-600">Quizzes Completed</div>
          </div>
          
          <div className="text-center p-4 bg-gradient-to-br from-orange-50 to-red-50 rounded-xl border border-orange-100 hover:shadow-md transition-shadow duration-300">
            <div className="text-2xl font-bold text-orange-600 mb-1">89%</div>
            <div className="text-sm text-gray-600">Average Score</div>
          </div>
        </div>
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
            Join Live Class
          </button>
          <button 
            onClick={() => handleQuickAction('chatbot')}
            className="px-4 py-2 bg-white text-[#0071c5] border border-[#0071c5] rounded-lg hover:bg-[#0071c5] hover:text-white transition-all duration-300 text-sm font-medium"
          >
            Ask AI Teacher
          </button>
          <button 
            onClick={() => handleQuickAction('resources')}
            className="px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-300 text-sm font-medium"
          >
            View Resources
          </button>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;