
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import Header from '@/components/layout/Header';

const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-intel-lightgray to-white dark:from-intel-darkgray dark:to-intel-darkblue">
      <Header showSidebarToggle={false} />
      
      <div className="container mx-auto px-4 py-16">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
            AI-Powered
            <span className="bg-gradient-to-r from-intel-blue to-intel-lightblue bg-clip-text text-transparent block">
              Interactive Learning
            </span>
          </h1>
          
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-12 max-w-2xl mx-auto">
            Experience personalized education with our AI assistant. Join live classes, 
            get instant help, and track your progress in real-time.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Button 
              size="lg" 
              className="px-8 py-4 text-lg bg-intel-blue hover:bg-intel-darkblue text-white"
              onClick={() => navigate('/signup')}
            >
              Get Started Free
            </Button>
            <Button 
              variant="outline" 
              size="lg" 
              className="px-8 py-4 text-lg border-intel-blue text-intel-blue dark:text-white dark:border-white"
              onClick={() => navigate('/login')}
            >
              Sign In
            </Button>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="bg-white dark:bg-intel-darkblue p-6 rounded-2xl shadow-lg">
              <div className="w-12 h-12 bg-intel-lightblue bg-opacity-20 dark:bg-intel-blue dark:bg-opacity-30 rounded-lg flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🤖</span>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">AI Assistant</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Get instant answers with voice, text, and image support in multiple languages
              </p>
            </div>

            <div className="bg-white dark:bg-intel-darkblue p-6 rounded-2xl shadow-lg">
              <div className="w-12 h-12 bg-intel-lightblue bg-opacity-20 dark:bg-intel-blue dark:bg-opacity-30 rounded-lg flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📚</span>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">Live Classes</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Join interactive sessions with real-time engagement tracking and feedback
              </p>
            </div>

            <div className="bg-white dark:bg-intel-darkblue p-6 rounded-2xl shadow-lg">
              <div className="w-12 h-12 bg-intel-lightblue bg-opacity-20 dark:bg-intel-blue dark:bg-opacity-30 rounded-lg flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📊</span>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">Smart Analytics</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Track progress with personalized insights and adaptive learning paths
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
