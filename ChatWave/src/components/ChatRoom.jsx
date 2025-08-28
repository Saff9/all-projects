import React, { useState, useRef, useEffect } from 'react'
import { ArrowLeft, Smile, Mic, Paperclip, Send, MoreVertical } from 'lucide-react'

const ChatRoom = ({ conversation, onBack }) => {
  const [message, setMessage] = useState('')
  const [messages, setMessages] = useState([])
  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    // Mock messages for demo
    setMessages([
      {
        id: 1,
        content: 'Hey! Check out this new messaging app I found!',
        isSent: false,
        time: '11:30 AM'
      },
      {
        id: 2,
        content: 'Wow, this looks amazing! The design is so clean 🎉',
        isSent: true,
        time: '11:31 AM'
      },
      {
        id: 3,
        content: 'I know right? And it has stories like Instagram!',
        isSent: false,
        time: '11:31 AM'
      },
      {
        id: 4,
        content: 'Can we send voice messages too?',
        isSent: true,
        time: '11:32 AM'
      }
    ])
  }, [conversation])

  const sendMessage = () => {
    if (message.trim()) {
      const newMessage = {
        id: messages.length + 1,
        content: message,
        isSent: true,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
      setMessages(prev => [...prev, newMessage])
      setMessage('')

      // Auto-reply after 1 second
      setTimeout(() => {
        const replies = [
          "That's interesting!",
          "I agree with you!",
          "Let me check that...",
          "Sounds good to me!"
        ]
        const reply = {
          id: messages.length + 2,
          content: replies[Math.floor(Math.random() * replies.length)],
          isSent: false,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
        setMessages(prev => [...prev, reply])
      }, 1000)
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary to-accent text-white p-4">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="p-1">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${conversation.color} mr-2`}>
            {conversation.avatar}
          </div>
          <div className="flex-1">
            <h2 className="font-semibold">{conversation.name}</h2>
            <p className="text-sm opacity-90">Online</p>
          </div>
          <MoreVertical className="w-6 h-6 cursor-pointer" />
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map(msg => (
          <div
            key={msg.id}
            className={`flex ${msg.isSent ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                msg.isSent
                  ? 'bg-primary text-white rounded-br-md'
                  : 'bg-white text-gray-800 rounded-bl-md shadow-sm'
              }`}
            >
              <p className="text-sm">{msg.content}</p>
              <p className={`text-xs mt-1 ${msg.isSent ? 'text-blue-100' : 'text-gray-500'} text-right`}>
                {msg.time}
              </p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Limit Indicator */}
      <div className="bg-yellow-50 border-y border-yellow-200 px-4 py-2 text-sm text-yellow-800">
        ⚠️ Daily Limit: <strong>48/50</strong> messages used
      </div>

      {/* Input Area */}
      <div className="bg-white p-4 border-t border-gray-200">
        <div className="flex items-end gap-2">
          <button className="p-2 text-gray-500 hover:text-gray-700 transition-colors">
            <Smile className="w-5 h-5" />
          </button>
          <button className="p-2 text-gray-500 hover:text-gray-700 transition-colors">
            <Paperclip className="w-5 h-5" />
          </button>
          <div className="flex-1 bg-gray-100 rounded-2xl">
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type a message..."
              className="w-full bg-transparent border-none resize-none py-3 px-4 focus:outline-none focus:ring-0 text-gray-800 placeholder-gray-500"
              rows="1"
            />
          </div>
          <button className="p-2 text-gray-500 hover:text-gray-700 transition-colors">
            <Mic className="w-5 h-5" />
          </button>
          <button
            onClick={sendMessage}
            disabled={!message.trim()}
            className="bg-primary text-white p-2 rounded-full hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  )
}

export default ChatRoom
