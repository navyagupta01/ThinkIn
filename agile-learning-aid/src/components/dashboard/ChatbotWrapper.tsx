import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import StudentChatbot from './StudentChatbot';
import TeacherChatbot from './TeacherChatbot';

// Add import for the ChatbotWrapper in your App.tsx:
// import ChatbotWrapper from "./components/dashboard/ChatbotWrapper";

const ChatbotWrapper: React.FC = () => {
  const { user } = useAuth();
  
  // Render the appropriate chatbot based on user role
  if (user?.role === 'student') {
    return <StudentChatbot />;
  } else if (user?.role === 'teacher') {
    return <TeacherChatbot />;
  }
  
  // Fallback - shouldn't happen with proper auth, but just in case
  return (
    <div className="flex items-center justify-center h-64">
      <p className="text-gray-500">Unable to determine user role</p>
    </div>
  );
};

export default ChatbotWrapper;