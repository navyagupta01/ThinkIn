import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import QADiscussionBoard from '@/components/QADiscussionBoard';
import ErrorBoundary from '@/components/ErrorBoundary';
import TeacherChatAssistant from './TeacherChatAssistant';

const TeacherDashboard: React.FC = () => {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="text-center py-8 text-red-500">
        Error: User not authenticated. Please log in.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-intel-darkblue to-intel-blue rounded-2xl p-6 text-white">
        <h1 className="text-3xl font-bold mb-2">Welcome back, {user.name}! 👨‍🏫</h1>
        <p className="text-blue-100">Ready to inspire minds today?</p>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Q&A Section */}
        <div className="lg:col-span-4">
          <ErrorBoundary>
            <QADiscussionBoard
              user={{
                id: user.id,
                name: user.name,
                role: user.role || 'teacher',
              }}
            />
          </ErrorBoundary>
        </div>
      </div>

      {/* AI Assistant */}
      <TeacherChatAssistant />
    </div>
  );
};

export default TeacherDashboard;