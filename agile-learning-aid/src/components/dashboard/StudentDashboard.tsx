import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MessageCircle } from 'lucide-react';
import QADiscussionBoard from '@/components/QADiscussionBoard';
import ErrorBoundary from '@/components/ErrorBoundary';

const StudentDashboard: React.FC = () => {
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
        {/* Q&A Message Board - Full Width */}
        <div className="flex-1">
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

        {/* AI Assistant - Side Box */}
        <div className="xl:w-1/3">
          <Card className="border-0 shadow-xl bg-gradient-to-br from-[#f0f8ff] to-[#e6f3ff] dark:from-[#0071c5]/10 dark:to-[#004494]/10">
            <CardHeader>
              <CardTitle className="flex items-center text-xl">
                <MessageCircle className="h-6 w-6 mr-3 text-[#0071c5]" />
                AI Assistant
              </CardTitle>
              <CardDescription>Get instant help with your studies</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-white dark:bg-slate-800 rounded-2xl shadow-sm">
                  <p className="text-sm text-purple-600 dark:text-purple-400 font-medium">
                    💡 "Explain quantum mechanics in simple terms"
                  </p>
                </div>
                <div className="p-4 bg-white dark:bg-slate-800 rounded-2xl shadow-sm">
                  <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">
                    🧮 "Help me solve this calculus problem"
                  </p>
                </div>
                <Button className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-200">
                  Ask AI Assistant
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
