import React, { useState } from 'react';

const ChatInput = ({ onSendMessage, isLoading }) => {
  const [input, setInput] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      onSendMessage(input);
      setInput('');
    }
  };

  return (
    <div className="chat-input-container">
      <form className="chat-input-form" onSubmit={handleSubmit}>
        <input
          type="text"
          className="chat-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Message ApexAI..."
          disabled={isLoading}
        />
        {/* FIX: Changed the closing tag from </g-button> to </button> */}
        <button type="submit" className="send-button" disabled={isLoading}>
          {isLoading ? '...' : 'Send'}
        </button> 
      </form>
    </div>
  );
};

export default ChatInput;
