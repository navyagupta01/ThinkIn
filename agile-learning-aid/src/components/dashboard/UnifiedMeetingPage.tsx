import React from 'react';
import { useAuth } from '@/contexts/AuthContext';

const UnifiedMeetingPage: React.FC = () => {
  const { user } = useAuth();

  if (!user) {
    return <div className="p-6">Please log in to access meetings.</div>;
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Meetings</h1>
      {user.role === 'teacher' ? (
        <div>
          <h2 className="text-xl mb-2">Teacher Meeting Controls</h2>
          <p>Start or manage live meetings here.</p>
          {/* Add teacher-specific meeting logic, e.g., Jitsi Meet integration */}
        </div>
      ) : (
        <div>
          <h2 className="text-xl mb-2">Student Meeting Controls</h2>
          <p>Join live meetings here.</p>
          {/* Add student-specific meeting logic, e.g., Jitsi Meet integration */}
        </div>
      )}
    </div>
  );
};

export default UnifiedMeetingPage;