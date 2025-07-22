import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import ChatMessage from '../components/ChatMessage';
import ChatInput from '../components/ChatInput';

// This is the URL of your Render backend.
// When developing, it's http://localhost:10000
// When deployed, it will be your Render URL.
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:10000';

const ChatPage = () => {
  const [messages, setMessages] = useState([
    { 
      role: 'model', 
      content: 'Hello! I am ApexAI. How can I help you today?',
      source: 'ApexAI'
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);

  // This function is called when the user sends a message
  const handleSendMessage = async (userInput) => {
    // Add user's message to the chat
    const newUserMessage = { role: 'user', content: userInput };
    const updatedMessages = [...messages, newUserMessage];
    setMessages(updatedMessages);
    setIsLoading(true);

    try {
      // Send the user's message to our backend
      const response = await fetch(`${API_URL}/api/v1/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          message: userInput,
          // Send the last 10 messages as history (optional)
          conversationHistory: messages.slice(-10) 
        }),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();

      // Add the AI's response to the chat
      const aiResponse = { 
        role: 'model', 
        content: data.text, 
        source: data.source || 'AI' 
      };
      setMessages([...updatedMessages, aiResponse]);

    } catch (error) {
      console.error('Failed to send message:', error);
      const errorResponse = {
        role: 'model',
        content: 'Sorry, I ran into an error. Please try again.',
        source: 'Error'
      };
      setMessages([...updatedMessages, errorResponse]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="chat-page">
      <Sidebar />
      <div className="chat-container">
        <div className="chat-messages">
          {messages.map((msg, index) => (
            <ChatMessage 
              key={index} 
              role={msg.role} 
              content={msg.content} 
              source={msg.source}
            />
          ))}
          {isLoading && (
            <ChatMessage role="model" content="Thinking..." source="ApexAI" />
          )}
        </div>
        <ChatInput onSendMessage={handleSendMessage} isLoading={isLoading} />
      </div>
    </div>
  );
};

export default ChatPage;
