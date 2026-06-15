import React from 'react';
import { Brain, FileText, Search, Database, Loader2 } from 'lucide-react';

export type AgentAction = 'thinking' | 'searching' | 'reading_file' | 'recalling' | 'idle';

export interface AgentStatusProps {
  action: AgentAction;
  details?: string;
}

const actionConfig: Record<AgentAction, { icon: React.ReactNode; label: string; color: string }> = {
  thinking: {
    icon: <Brain className="w-4 h-4" />,
    label: 'Thinking',
    color: 'text-purple-400'
  },
  searching: {
    icon: <Search className="w-4 h-4" />,
    label: 'Searching web',
    color: 'text-blue-400'
  },
  reading_file: {
    icon: <FileText className="w-4 h-4" />,
    label: 'Reading file',
    color: 'text-green-400'
  },
  recalling: {
    icon: <Database className="w-4 h-4" />,
    label: 'Recalling memory',
    color: 'text-yellow-400'
  },
  idle: {
    icon: null,
    label: '',
    color: ''
  }
};

export const AgentStatus: React.FC<AgentStatusProps> = ({ action, details }) => {
  if (action === 'idle') return null;

  const config = actionConfig[action];

  return (
    <div className={`flex items-center gap-2 text-sm ${config.color}`}>
      <Loader2 className="w-4 h-4 animate-spin" />
      {config.icon}
      <span>{config.label}{details ? ` ${details}` : ''}...</span>
    </div>
  );
};

export default AgentStatus;
