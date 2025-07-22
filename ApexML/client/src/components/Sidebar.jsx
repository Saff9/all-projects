import React from 'react';

const Sidebar = () => {
  
  // This will clear the chat
  const startNewChat = () => {
    window.location.reload(); // Simple way to reset the chat
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-header">ApexAI</div>
      <button className="new-chat-btn" onClick={startNewChat}>
        + New Chat
      </button>
      <div className="chat-history">
        {/* Chat history items would go here */}
      </div>
    </aside>
  );
};

export default Sidebar;
