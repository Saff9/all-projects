import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

interface DropdownOption {
  value: string;
  label: string;
  icon?: React.ReactNode;
  disabled?: boolean;
}

interface DropdownProps {
  options: DropdownOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  disabled?: boolean;
  className?: string;
}

export const Dropdown: React.FC<DropdownProps> = ({
  options,
  value,
  onChange,
  placeholder = 'Select...',
  label,
  disabled = false,
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (optionValue: string) => {
    const option = options.find((opt) => opt.value === optionValue);
    if (option && !option.disabled) {
      onChange(optionValue);
      setIsOpen(false);
    }
  };

  return (
    <div ref={dropdownRef} className={`relative ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">
          {label}
        </label>
      )}
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`
          w-full flex items-center justify-between gap-2
          bg-[var(--bg-secondary)] text-[var(--text-primary)]
          border border-[var(--border-primary)] rounded-lg
          px-3 py-2
          focus:outline-none focus:border-[var(--border-focus)] focus:ring-1 focus:ring-[var(--border-focus)]
          disabled:opacity-50 disabled:cursor-not-allowed
          transition-all duration-200
          ${isOpen ? 'border-[var(--border-focus)] ring-1 ring-[var(--border-focus)]' : ''}
        `}
      >
        <div className="flex items-center gap-2 min-w-0">
          {selectedOption?.icon && (
            <span className="flex-shrink-0">{selectedOption.icon}</span>
          )}
          <span className="truncate text-sm">
            {selectedOption?.label || placeholder}
          </span>
        </div>
        <ChevronDown
          className={`w-4 h-4 text-[var(--text-tertiary)] flex-shrink-0 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-lg shadow-lg animate-slideUp overflow-hidden">
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => handleSelect(option.value)}
              disabled={option.disabled}
              className={`
                w-full flex items-center justify-between gap-2 px-3 py-2.5
                text-left text-sm
                transition-colors duration-150
                ${option.disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-[var(--bg-hover)] cursor-pointer'}
                ${option.value === value ? 'bg-[var(--bg-active)]' : ''}
              `}
            >
              <div className="flex items-center gap-2 min-w-0">
                {option.icon && (
                  <span className="flex-shrink-0">{option.icon}</span>
                )}
                <span
                  className={`truncate ${
                    option.value === value
                      ? 'text-[var(--accent-primary)] font-medium'
                      : 'text-[var(--text-primary)]'
                  }`}
                >
                  {option.label}
                </span>
              </div>
              {option.value === value && (
                <Check className="w-4 h-4 text-[var(--accent-primary)] flex-shrink-0" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default Dropdown;
