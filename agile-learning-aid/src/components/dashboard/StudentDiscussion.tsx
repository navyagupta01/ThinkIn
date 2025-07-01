import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import QADiscussionBoard from '@/components/QADiscussionBoard';
import AIAssistant from '@/components/dashboard/AIAssistant'; // Import the new AI Assistant
import ErrorBoundary from '@/components/ErrorBoundary';

const StudentDiscussion: React.FC = () => {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="text-center py-8 text-red-500">
        Error: User not authenticated. Please log in.
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="relative bg-gradient-to-r from-[#0071c5] via-[#004494] to-[#002c5f] rounded-3xl p-8 text-white overflow-hidden">
        <div className="absolute inset-0 bg-black bg-opacity-10" />
        <div className="absolute top-0 right-0 w-64 h-64 bg-white bg-opacity-10 rounded-full -translate-y-32 translate-x-32" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white bg-opacity-5 rounded-full translate-y-24 -translate-x-24" />
        <div className="relative z-10">
          <h1 className="text-4xl font-bold mb-2">Welcome back, {user.name}! 👋</h1>
          <p className="text-[#a8d4f0] text-lg">Ready to continue your learning journey today?</p>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex flex-col xl:flex-row gap-8">
        {/* Q&A Message Board - Takes up 2/3 width on large screens */}
        <div className="flex-1 xl:w-2/3">
          <ErrorBoundary>
            <QADiscussionBoard
              user={{
                id: user.id,
                name: user.name,
                role: user.role || 'student',
              }}
            />
          </ErrorBoundary>
        </div>

        {/* AI Assistant - Takes up 1/3 width on large screens */}
        <div className="xl:w-1/3">
          <ErrorBoundary>
            <AIAssistant
              user={{
                id: user.id,
                name: user.name,
                role: user.role || 'student',
              }}
            />
          </ErrorBoundary>
        </div>
      </div>
    </div>
  );
};

export default StudentDiscussion;