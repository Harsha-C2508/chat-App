import React from 'react';

const ChatLoading = () => {
  return (
    <div className="flex flex-col gap-2 py-2">
      {[...Array(8)].map((_, i) => (
        <div key={i} className="flex items-center gap-3 animate-pulse px-1">
          <div className="w-9 h-9 rounded-full bg-dark-600 flex-shrink-0" />
          <div className="flex-1">
            <div className="h-3 bg-dark-600 rounded w-3/4 mb-2" />
            <div className="h-2.5 bg-dark-700 rounded w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
};

export default ChatLoading;
