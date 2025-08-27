import React, { useState, useEffect } from 'react'
import { Search, Plus, MessageCircle, Users, Settings } from 'lucide-react'
import { useChat } from '../hooks/useChat'

const ChatList = ({ onSelectConversation }) => {
  const { conversations, fetchConversations } = useChat()
  const [activeTab, setActiveTab] = useState('chats')

  useEffect(() => {
    fetchConversations()
  }, [])

  const mockConversations = [
    {
      id: 1,
      name: 'Sarah Johnson',
      last_message: 'Hey! Check out this new app',
      unread_count: 2,
      time: '2m ago',
      avatar: 'S',
      color: 'bg-red-400'
    },
    {
      id: 2,
      name: 'Gaming Squad',
      last_message: 'Alex: Game night tonight?',
      unread_count: 12,
      time: '1h ago',
      avatar: '🎮',
      color: 'bg-teal-400'
    },
    {
      id: 3,
      name: 'Work Team',
      last_message: 'Meeting moved to 3 PM tomorrow',
      unread_count: 0,
      time: '2h ago',
      avatar: '💼',
      color: 'bg-blue-400'
    }
  ]

  const stories = [
    { id: 1, name: 'You', avatar: '+', isAdd: true },
    { id: 2, name: 'Sarah', avatar: 'S', color: 'bg-red-400' },
    { id: 3, name: 'Mike', avatar: 'M', color: 'bg-teal-400' },
    { id: 4, name: 'Emma', avatar: 'E', color: 'bg-green-400' },
  ]

  return (
    <div className="h-screen flex flex-col bg-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary to-accent text-white p-4">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">ChatWave</h1>
          <div className="flex gap-3">
            <Search className="w-6 h-6 cursor-pointer" />
            <Plus className="w-6 h-6 cursor-pointer" />
          </div>
        </div>

        {/* Stories */}
        <div className="flex gap-4 overflow-x-auto pb-2">
          {stories.map(story => (
            <div key={story.id} className="flex flex-col items-center">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center text-white font-bold border-2 border-white ${story.isAdd ? 'bg-gray-300 text-gray-600 border-dashed' : story.color} cursor-pointer hover:scale-105 transition-transform`}>
                {story.isAdd ? '+' : story.avatar}
              </div>
              <span className="text-xs mt-1">{story.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Limit Indicator */}
      <div className="bg-yellow-50 border-y border-yellow-200 px-4 py-2 text-sm text-yellow-800">
        ⚠️ Daily Limit: <strong>42/50</strong> messages used
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto">
        {mockConversations.map(chat => (
          <div
            key={chat.id}
            onClick={() => onSelectConversation(chat)}
            className="flex items-center p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors"
          >
            <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold ${chat.color} mr-3`}>
              {chat.avatar}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-center mb-1">
                <h3 className="font-semibold text-gray-800 truncate">{chat.name}</h3>
                <span className="text-xs text-gray-500">{chat.time}</span>
              </div>
              <p className="text-sm text-gray-600 truncate">{chat.last_message}</p>
            </div>
            {chat.unread_count > 0 && (
              <div className="bg-primary text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-medium">
                {chat.unread_count}
              </div>
            )}
          </div>
        ))}

        {/* Upgrade Prompt */}
        <div className="m-4 p-4 bg-gradient-to-r from-primary to-accent rounded-xl text-white text-center cursor-pointer hover:shadow-lg transition-shadow">
          <div className="font-semibold">🚀 Upgrade to Premium</div>
          <div className="text-sm opacity-90">Unlimited messaging, larger groups, and more!</div>
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="flex border-t border-gray-200 bg-white">
        {[
          { icon: MessageCircle, label: 'Chats', id: 'chats' },
          { icon: Users, label: 'Stories', id: 'stories' },
          { icon: Settings, label: 'Settings', id: 'settings' },
        ].map(({ icon: Icon, label, id }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex-1 flex flex-col items-center py-3 text-sm ${
              activeTab === id ? 'text-primary' : 'text-gray-500'
            }`}
          >
            <Icon className="w-5 h-5 mb-1" />
            {label}
          </button>
        ))}
      </div>
    </div>
  )
}

export default ChatList
