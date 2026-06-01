import { useState, useEffect } from 'react'
import { motion, AnimatePresence, Reorder } from 'framer-motion'
import { 
  Folder, 
  Plus, 
  X, 
  ChevronDown, 
  ChevronRight,
  MoreVertical,
  Edit2,
  Trash2,
  GripVertical,
  FolderPlus,
  Check,
  Settings,
  Eye,
  EyeOff
} from 'lucide-react'

// Default group colors
const GROUP_COLORS = [
  { name: 'Blue', value: '#3b82f6' },
  { name: 'Purple', value: '#8b5cf6' },
  { name: 'Pink', value: '#ec4899' },
  { name: 'Red', value: '#ef4444' },
  { name: 'Orange', value: '#f97316' },
  { name: 'Yellow', value: '#eab308' },
  { name: 'Green', value: '#22c55e' },
  { name: 'Teal', value: '#14b8a6' },
  { name: 'Cyan', value: '#06b6d4' },
  { name: 'Gray', value: '#6b7280' }
]

/**
 * LinkGroups Component
 * Organize links into groups/categories
 */
const LinkGroups = ({
  groups = [],
  links = [],
  onChange,
  onLinksUpdate,
  className = ''
}) => {
  const [isCreating, setIsCreating] = useState(false)
  const [editingGroup, setEditingGroup] = useState(null)
  const [expandedGroups, setExpandedGroups] = useState(
    groups.map(g => g.id).filter(id => id !== 'ungrouped')
  )
  const [newGroupName, setNewGroupName] = useState('')
  const [newGroupColor, setNewGroupColor] = useState(GROUP_COLORS[0].value)

  // Toggle group expansion
  const toggleExpand = (groupId) => {
    setExpandedGroups(prev => 
      prev.includes(groupId)
        ? prev.filter(id => id !== groupId)
        : [...prev, groupId]
    )
  }

  // Create new group
  const handleCreateGroup = () => {
    if (!newGroupName.trim()) return

    const newGroup = {
      id: `group_${Date.now()}`,
      name: newGroupName.trim(),
      color: newGroupColor,
      isExpanded: true,
      order: groups.length
    }

    onChange?.([...groups.filter(g => g.id !== 'ungrouped'), newGroup])
    setNewGroupName('')
    setNewGroupColor(GROUP_COLORS[0].value)
    setIsCreating(false)
    setExpandedGroups(prev => [...prev, newGroup.id])
  }

  // Update group
  const handleUpdateGroup = (groupId, updates) => {
    onChange?.(
      groups.map(g => g.id === groupId ? { ...g, ...updates } : g)
    )
    setEditingGroup(null)
  }

  // Delete group
  const handleDeleteGroup = (groupId) => {
    // Move links from deleted group to ungrouped
    const updatedLinks = links.map(link => 
      link.groupId === groupId ? { ...link, groupId: null } : link
    )
    onLinksUpdate?.(updatedLinks)
    
    // Remove group
    onChange?.(groups.filter(g => g.id !== groupId))
  }

  // Move link to group
  const handleMoveLinkToGroup = (linkId, groupId) => {
    const updatedLinks = links.map(link =>
      link.id === linkId ? { ...link, groupId: groupId === 'ungrouped' ? null : groupId } : link
    )
    onLinksUpdate?.(updatedLinks)
  }

  // Get links for a group
  const getGroupLinks = (groupId) => {
    if (groupId === 'ungrouped') {
      return links.filter(link => !link.groupId)
    }
    return links.filter(link => link.groupId === groupId)
  }

  // Reorder groups
  const handleReorderGroups = (newOrder) => {
    onChange?.(newOrder)
  }

  return (
    <div className={className}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Link Groups
        </h3>
        <button
          type="button"
          onClick={() => setIsCreating(true)}
          className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg transition-colors"
        >
          <FolderPlus className="w-4 h-4" />
          New Group
        </button>
      </div>

      {/* Create Group Form */}
      <AnimatePresence>
        {isCreating && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-4 overflow-hidden"
          >
            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
              <div className="space-y-3">
                <input
                  type="text"
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  placeholder="Group name"
                  className="w-full px-4 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  autoFocus
                />
                
                {/* Color Picker */}
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500 dark:text-gray-400">Color:</span>
                  <div className="flex gap-1">
                    {GROUP_COLORS.map(color => (
                      <button
                        key={color.value}
                        type="button"
                        onClick={() => setNewGroupColor(color.value)}
                        className={`w-6 h-6 rounded-full transition-transform ${
                          newGroupColor === color.value ? 'scale-110 ring-2 ring-offset-2 ring-gray-400' : ''
                        }`}
                        style={{ backgroundColor: color.value }}
                        title={color.name}
                      />
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsCreating(false)
                      setNewGroupName('')
                    }}
                    className="px-3 py-1.5 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleCreateGroup}
                    disabled={!newGroupName.trim()}
                    className="px-3 py-1.5 text-sm font-medium text-white bg-primary-500 rounded-lg hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Create Group
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Groups List */}
      <Reorder.Group
        axis="y"
        values={groups}
        onReorder={handleReorderGroups}
        className="space-y-2"
      >
        {groups.map((group) => {
          const isExpanded = expandedGroups.includes(group.id)
          const groupLinks = getGroupLinks(group.id)
          const isEditing = editingGroup === group.id

          return (
            <Reorder.Item
              key={group.id}
              value={group}
              className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden"
            >
              {/* Group Header */}
              <div
                className="flex items-center gap-3 p-3 cursor-pointer"
                onClick={() => toggleExpand(group.id)}
              >
                <GripVertical className="w-4 h-4 text-gray-400 cursor-grab active:cursor-grabbing" />
                
                <button
                  type="button"
                  className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                >
                  {isExpanded ? (
                    <ChevronDown className="w-4 h-4 text-gray-400" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  )}
                </button>

                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: group.color }}
                />

                {isEditing ? (
                  <input
                    type="text"
                    defaultValue={group.name}
                    onBlur={(e) => handleUpdateGroup(group.id, { name: e.target.value })}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleUpdateGroup(group.id, { name: e.target.value })
                      }
                      if (e.key === 'Escape') {
                        setEditingGroup(null)
                      }
                    }}
                    onClick={(e) => e.stopPropagation()}
                    className="flex-1 px-2 py-1 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                    autoFocus
                  />
                ) : (
                  <span className="flex-1 font-medium text-gray-900 dark:text-white">
                    {group.name}
                  </span>
                )}

                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {groupLinks.length} links
                </span>

                {/* Actions */}
                <div className="flex items-center gap-1">
                  {group.id !== 'ungrouped' && (
                    <>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          setEditingGroup(group.id)
                        }}
                        className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDeleteGroup(group.id)
                        }}
                        className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Group Links */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="border-t border-gray-200 dark:border-gray-700"
                  >
                    <div className="p-3 space-y-2 bg-gray-50 dark:bg-gray-900/50">
                      {groupLinks.length > 0 ? (
                        groupLinks.map((link) => (
                          <div
                            key={link.id}
                            className="flex items-center gap-3 p-2 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
                          >
                            <GripVertical className="w-4 h-4 text-gray-400" />
                            <span className="flex-1 text-sm text-gray-700 dark:text-gray-300 truncate">
                              {link.title}
                            </span>
                            
                            {/* Move to Group Dropdown */}
                            <select
                              value={link.groupId || 'ungrouped'}
                              onChange={(e) => handleMoveLinkToGroup(link.id, e.target.value)}
                              onClick={(e) => e.stopPropagation()}
                              className="text-xs bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded px-2 py-1 text-gray-600 dark:text-gray-300"
                            >
                              <option value="ungrouped">Ungrouped</option>
                              {groups.filter(g => g.id !== 'ungrouped').map(g => (
                                <option key={g.id} value={g.id}>{g.name}</option>
                              ))}
                            </select>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-4">
                          No links in this group
                        </p>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </Reorder.Item>
          )
        })}
      </Reorder.Group>

      {/* Empty State */}
      {groups.length === 0 && (
        <div className="text-center py-8">
          <Folder className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600 mb-3" />
          <p className="text-gray-500 dark:text-gray-400 mb-2">No groups created yet</p>
          <p className="text-sm text-gray-400 dark:text-gray-500">
            Create groups to organize your links
          </p>
        </div>
      )}
    </div>
  )
}

/**
 * LinkGroupsCompact - Compact version for sidebar
 */
export const LinkGroupsCompact = ({
  groups = [],
  links = [],
  selectedGroup,
  onSelect,
  className = ''
}) => {
  // Count links per group
  const getGroupCount = (groupId) => {
    if (groupId === 'all') return links.length
    if (groupId === 'ungrouped') return links.filter(l => !l.groupId).length
    return links.filter(l => l.groupId === groupId).length
  }

  return (
    <div className={className}>
      <div className="space-y-1">
        {/* All Links */}
        <button
          type="button"
          onClick={() => onSelect?.('all')}
          className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${
            selectedGroup === 'all'
              ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400'
              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
          }`}
        >
          <span>All Links</span>
          <span className="text-xs font-medium">{getGroupCount('all')}</span>
        </button>

        {/* Ungrouped */}
        <button
          type="button"
          onClick={() => onSelect?.('ungrouped')}
          className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${
            selectedGroup === 'ungrouped'
              ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400'
              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
          }`}
        >
          <span>Ungrouped</span>
          <span className="text-xs font-medium">{getGroupCount('ungrouped')}</span>
        </button>

        {/* Custom Groups */}
        {groups.filter(g => g.id !== 'ungrouped').map((group) => (
          <button
            key={group.id}
            type="button"
            onClick={() => onSelect?.(group.id)}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${
              selectedGroup === group.id
                ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
            }`}
          >
            <div className="flex items-center gap-2">
              <div
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: group.color }}
              />
              <span>{group.name}</span>
            </div>
            <span className="text-xs font-medium">{getGroupCount(group.id)}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

/**
 * GroupBadge - Display group badge for a link
 */
export const GroupBadge = ({
  group,
  className = ''
}) => {
  if (!group) return null

  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${className}`}
      style={{ 
        backgroundColor: `${group.color}20`,
        color: group.color
      }}
    >
      <Folder className="w-3 h-3" />
      {group.name}
    </span>
  )
}

/**
 * GroupSelector - Select a group for a link
 */
export const GroupSelector = ({
  groups = [],
  value,
  onChange,
  className = ''
}) => {
  return (
    <select
      value={value || 'ungrouped'}
      onChange={(e) => onChange?.(e.target.value === 'ungrouped' ? null : e.target.value)}
      className={`px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500 ${className}`}
    >
      <option value="ungrouped">No Group</option>
      {groups.filter(g => g.id !== 'ungrouped').map((group) => (
        <option key={group.id} value={group.id}>
          {group.name}
        </option>
      ))}
    </select>
  )
}

export default LinkGroups
