'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { ChevronDown } from 'lucide-react';

interface DropdownContextType {
  open: boolean;
  setOpen: (open: boolean) => void;
}

const DropdownContext = React.createContext<DropdownContextType | undefined>(
  undefined
);

function useDropdown() {
  const context = React.useContext(DropdownContext);
  if (!context) {
    throw new Error('useDropdown must be used within a Dropdown');
  }
  return context;
}

interface DropdownProps {
  children: React.ReactNode;
  defaultOpen?: boolean;
}

function Dropdown({ children, defaultOpen = false }: DropdownProps) {
  const [open, setOpen] = React.useState(defaultOpen);
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <DropdownContext.Provider value={{ open, setOpen }}>
      <div ref={ref} className="relative inline-block text-left">
        {children}
      </div>
    </DropdownContext.Provider>
  );
}

interface DropdownTriggerProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
  icon?: boolean;
}

const DropdownTrigger = React.forwardRef<HTMLButtonElement, DropdownTriggerProps>(
  ({ className, children, asChild, icon = true, ...props }, ref) => {
    const { open, setOpen } = useDropdown();

    if (asChild && React.isValidElement(children)) {
      return React.cloneElement(children as React.ReactElement<any>, {
        onClick: () => setOpen(!open),
        'aria-expanded': open,
        'aria-haspopup': true,
      });
    }

    return (
      <button
        ref={ref}
        type="button"
        className={cn(
          'inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
          className
        )}
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        aria-haspopup="true"
        {...props}
      >
        {children}
        {icon && (
          <ChevronDown
            className={cn(
              'h-4 w-4 transition-transform duration-200',
              open && 'rotate-180'
            )}
          />
        )}
      </button>
    );
  }
);

DropdownTrigger.displayName = 'DropdownTrigger';

interface DropdownContentProps extends React.HTMLAttributes<HTMLDivElement> {
  align?: 'start' | 'center' | 'end';
  sideOffset?: number;
}

const DropdownContent = React.forwardRef<HTMLDivElement, DropdownContentProps>(
  ({ className, align = 'end', children, ...props }, ref) => {
    const { open } = useDropdown();

    if (!open) return null;

    const alignClasses = {
      start: 'left-0',
      center: 'left-1/2 -translate-x-1/2',
      end: 'right-0',
    };

    return (
      <div
        ref={ref}
        className={cn(
          'absolute z-50 mt-2 min-w-[180px] rounded-md border bg-popover p-1 text-popover-foreground shadow-md animate-in fade-in-0 zoom-in-95',
          alignClasses[align],
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

DropdownContent.displayName = 'DropdownContent';

interface DropdownItemProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  inset?: boolean;
}

const DropdownItem = React.forwardRef<HTMLButtonElement, DropdownItemProps>(
  ({ className, inset, children, onClick, ...props }, ref) => {
    const { setOpen } = useDropdown();

    return (
      <button
        ref={ref}
        className={cn(
          'relative flex w-full cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground disabled:pointer-events-none disabled:opacity-50',
          inset && 'pl-8',
          className
        )}
        onClick={(e) => {
          onClick?.(e);
          setOpen(false);
        }}
        {...props}
      >
        {children}
      </button>
    );
  }
);

DropdownItem.displayName = 'DropdownItem';

const DropdownSeparator = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('-mx-1 my-1 h-px bg-muted', className)}
    {...props}
  />
));

DropdownSeparator.displayName = 'DropdownSeparator';

const DropdownLabel = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { inset?: boolean }
>(({ className, inset, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      'px-2 py-1.5 text-sm font-semibold text-foreground',
      inset && 'pl-8',
      className
    )}
    {...props}
  />
));

DropdownLabel.displayName = 'DropdownLabel';

export {
  Dropdown,
  DropdownTrigger,
  DropdownContent,
  DropdownItem,
  DropdownSeparator,
  DropdownLabel,
};
