'use client';

import { motion } from 'framer-motion';

interface HoverCardProps {
  children: React.ReactNode;
  className?: string;
}

export const HoverCard = ({ children, className }: HoverCardProps) => {
  return (
    <motion.div
      whileHover={{ y: -5, boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' }}
      whileTap={{ scale: 0.98 }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

interface HoverButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
}

export const HoverButton = ({ children, onClick, className, type = 'button', disabled = false }: HoverButtonProps) => {
  return (
    <motion.button
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={className}
      type={type}
      disabled={disabled}
    >
      {children}
    </motion.button>
  );
};

interface AnimatedCounterProps {
  value: number;
  duration?: number;
  className?: string;
}

export const AnimatedCounter = ({ value, duration = 1, className }: AnimatedCounterProps) => {
  return (
    <motion.span
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration }}
      className={className}
    >
      {value}
    </motion.span>
  );
};

interface AnimatedProgressBarProps {
  progress: number;
  duration?: number;
  className?: string;
}

export const AnimatedProgressBar = ({ 
  progress, 
  duration = 1, 
  className 
}: AnimatedProgressBarProps) => {
  return (
    <div className={`w-full bg-gray-700 rounded-full h-2.5 ${className}`}>
      <motion.div
        className="bg-blue-600 h-2.5 rounded-full"
        initial={{ width: 0 }}
        animate={{ width: `${progress}%` }}
        transition={{ duration, ease: "easeOut" }}
      />
    </div>
  );
};