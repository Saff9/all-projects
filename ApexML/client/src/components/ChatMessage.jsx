import React from 'react';

const ChatMessage = ({ role, content, source }) => {
  const isUser = role === 'user';
  
  return (
    <div className={`chat-message ${role}`}>
      {!isUser && (
        <div className="message-sender">
          {source || 'AI'}
        </div>
      )}
      {isUser && (
        <div className="message-sender user">
          You
        </div>
      )}
      <div className="message-content">
        {content}
      </div>
    </div>
  );
};

export default ChatMessage;
