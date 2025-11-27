import * as React from 'react';
import { cn } from '@/lib/utils';

interface SelectContextProps {
  value: string;
  onValueChange: (value: string) => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface SelectProps {
  children: React.ReactNode;
  value?: string;
  onValueChange?: (value: string) => void;
}

interface SelectTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children?: React.ReactNode;
}

interface SelectContentProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

interface SelectItemProps extends React.LiHTMLAttributes<HTMLLIElement> {
  value: string;
  children: React.ReactNode;
}

interface SelectValueProps {
  className?: string;
  placeholder?: string;
}

const SelectContext = React.createContext<SelectContextProps | null>(null);

const Select = ({ children, value, onValueChange, ...props }: SelectProps) => {
  const [internalValue, setInternalValue] = React.useState('');
  const [open, setOpen] = React.useState(false);

  const handleValueChange = (newValue: string) => {
    setInternalValue(newValue);
    setOpen(false); // Close the dropdown after selection
    if (onValueChange) {
      onValueChange(newValue);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
  };

  const contextValue = {
    value: value || internalValue,
    onValueChange: handleValueChange,
    open,
    onOpenChange: handleOpenChange,
  };

  return (
    <SelectContext.Provider value={contextValue}>
      <div className="relative">
        {children}
      </div>
    </SelectContext.Provider>
  );
};

const SelectTrigger = ({ children, className, onClick, ...props }: SelectTriggerProps) => {
  const context = React.useContext(SelectContext);

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    context?.onOpenChange(!context.open);
    onClick?.(e);
  };

  return (
    <button
      className={cn(
        'flex h-10 w-full items-center justify-between rounded-md border border-gray-300 bg-gray-700/50 px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600',
        className
      )}
      onClick={handleClick}
      {...props}
    >
      {children}
      <svg
        className={cn(
          "ml-2 h-4 w-4 transition-transform duration-200",
          context?.open && "rotate-180"
        )}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
      </svg>
    </button>
  );
};

const SelectContent = ({ children, className, ...props }: SelectContentProps) => {
  const context = React.useContext(SelectContext);

  if (!context?.open) return null;

  return (
    <div
      className={cn(
        'absolute z-50 min-w-[8rem] overflow-hidden rounded-md border border-gray-700 bg-gray-800 text-popover-foreground shadow-lg mt-1 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

const SelectItem = ({ children, value, className, onClick, ...props }: SelectItemProps) => {
  const context = React.useContext(SelectContext);

  const handleClick = (e: React.MouseEvent<HTMLLIElement>) => {
    if (context) {
      context.onValueChange(value);
    }
    onClick?.(e);
  };

  return (
    <li
      className={cn(
        'relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-2 pr-2 text-sm outline-none focus:bg-gray-700 focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 hover:bg-gray-700/50',
        className
      )}
      onClick={handleClick}
      {...props}
    >
      <span className="block truncate">{children}</span>
    </li>
  );
};

const SelectValue = ({ className, placeholder }: SelectValueProps) => {
  const context = React.useContext(SelectContext);

  return (
    <span className={className}>
      {context?.value ? context.value : placeholder}
    </span>
  );
};

export { Select, SelectTrigger, SelectContent, SelectItem, SelectValue };