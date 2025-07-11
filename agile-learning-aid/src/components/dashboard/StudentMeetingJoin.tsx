import React from 'react';

const StudentLiveClasses: React.FC = () => {
  return (
    <div className="w-full h-screen overflow-hidden">
      {/* Header (assumed to be already part of layout, not repeated here) */}

      {/* Fullscreen iframe */}
      <iframe
        src="http://localhost:5050"
        title="Live Class"
        className="w-full h-full border-none"
        allowFullScreen
      ></iframe>
    </div>
  );
};

export default StudentLiveClasses;
