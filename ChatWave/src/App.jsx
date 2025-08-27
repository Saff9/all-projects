import React, { useState } from 'react'
import { AuthProvider, useAuth } from './context/AuthContext'
import Login from './components/Login'
import ChatList from './components/ChatList'
import ChatRoom from './components/ChatRoom'

const AppContent = () => {
  const { user } = useAuth()
  const [currentView, setCurrentView] = useState('chatList')
  const [selectedConversation, setSelectedConversation] = useState(null)

  if (!user) {
    return <Login />
  }

  const handleSelectConversation = (conversation) => {
    setSelectedConversation(conversation)
    setCurrentView('chatRoom')
  }

  const handleBackToList = () => {
    setCurrentView('chatList')
    setSelectedConversation(null)
  }

  if (currentView === 'chatRoom' && selectedConversation) {
    return (
      <ChatRoom 
        conversation={selectedConversation} 
        onBack={handleBackToList}
      />
    )
  }

  return (
    <ChatList onSelectConversation={handleSelectConversation} />
  )
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}

export default App
