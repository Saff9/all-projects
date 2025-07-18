// client/src/App.js
import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import ChatWindow from './components/ChatWindow'; // Create this file
import ChatInput from './components/ChatInput'; // Create this file
import './App.css'; // You will create this file below

// The socket URL is read from the .env file
const SOCKET_URL = process.env.REACT_APP_SOCKET_URL;

function App() {
  const [socket, setSocket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  
  useEffect(() => {
    // Check if the URL is set
    if (!SOCKET_URL) {
      console.error("REACT_APP_SOCKET_URL is not defined!");
      return;
    }

    // 1. Initialize the Socket Connection
    const newSocket = io(SOCKET_URL, {
        transports: ['websocket', 'polling'], // Use both to handle Render wake-up time
        withCredentials: true 
    });
    
    setSocket(newSocket);

    // 2. Setup Socket Listeners
    newSocket.on('connect', () => {
      console.log('Connected to server:', newSocket.id);
      setMessages((prev) => [...prev, { text: 'Welcome to Apex Chat! Try sending a message.', type: 'system' }]);
    });

    newSocket.on('chat message', (msg) => {
      // Incoming message from the server
      setMessages((prev) => [...prev, { text: msg, type: 'bot' }]);
      setIsLoading(false); // Stop loading when bot response is received
    });

    newSocket.on('error', (err) => {
        console.error('Socket Error:', err);
        setIsLoading(false);
    });

    newSocket.on('disconnect', () => {
      console.log('Disconnected from server');
    });

    // 3. Cleanup function
    return () => newSocket.disconnect();
  }, []);

  const handleSendMessage = (text) => {
    if (socket && socket.connected) {
      // Add user message to state immediately
      setMessages((prev) => [...prev, { text: text, type: 'user' }]);
      setIsLoading(true);

      // Emit message to the server
      socket.emit('chat message', text);
    } else {
      setMessages((prev) => [...prev, { text: 'Connection failed. Try refreshing.', type: 'system-error' }]);
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Apex Chat 🤘</h1>
        <p>Connected to: {SOCKET_URL}</p>
      </header>
      <div className="chat-container">
        <ChatWindow messages={messages} />
        <ChatInput onSendMessage={handleSendMessage} isLoading={isLoading} />
      </div>
    </div>
  );
}

export default App;
