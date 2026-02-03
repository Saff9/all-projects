"use client";

import { AVAILABLE_MODELS, ModelConfig } from '@/lib/types';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Zap, Sparkles, Scale, Palette, Feather, Search } from 'lucide-react';

interface ModelSelectorProps {
  value: string;
  onChange: (value: string) => void;
}

function getModelIcon(name: string) {
  switch (name) {
    case 'Fast':
      return <Zap className="w-3.5 h-3.5 text-yellow-500" />;
    case 'Instant':
      return <Sparkles className="w-3.5 h-3.5 text-purple-500" />;
    case 'Balanced':
      return <Scale className="w-3.5 h-3.5 text-blue-500" />;
    case 'Creative':
      return <Palette className="w-3.5 h-3.5 text-pink-500" />;
    case 'Light':
      return <Feather className="w-3.5 h-3.5 text-green-500" />;
    case 'Search':
      return <Search className="w-3.5 h-3.5 text-cyan-500" />;
    default:
      return <Zap className="w-3.5 h-3.5" />;
  }
}

export function ModelSelector({ value, onChange }: ModelSelectorProps) {
  const selectedModel = AVAILABLE_MODELS.find(m => `${m.prefix}${m.id}` === value);

  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="w-[110px] sm:w-[140px] h-9 glass-strong border-0 text-sm font-medium">
        <div className="flex items-center gap-2">
          {selectedModel && getModelIcon(selectedModel.name)}
          <SelectValue placeholder="Mode" />
        </div>
      </SelectTrigger>
      <SelectContent className="glass-strong border-border/50">
        {AVAILABLE_MODELS.map((model: ModelConfig) => (
          <SelectItem 
            key={`${model.prefix}${model.id}`} 
            value={`${model.prefix}${model.id}`}
            className="cursor-pointer"
          >
            <div className="flex items-center gap-2">
              {getModelIcon(model.name)}
              <div>
                <p className="font-medium text-sm">{model.name}</p>
                <p className="text-xs text-muted-foreground">{model.description}</p>
              </div>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
