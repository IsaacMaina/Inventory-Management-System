'use client';

import { motion } from 'framer-motion';

interface PageTransitionProps {
  children: React.ReactNode;
  key?: string;
}

export const PageTransition = ({ children, key }: PageTransitionProps) => {
  return (
    <motion.div
      key={key}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      {children}
    </motion.div>
  );
};

interface FadeTransitionProps {
  children: React.ReactNode;
  key?: string;
}

export const FadeTransition = ({ children, key }: FadeTransitionProps) => {
  return (
    <motion.div
      key={key}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      {children}
    </motion.div>
  );
};

interface SlideTransitionProps {
  children: React.ReactNode;
  key?: string;
  direction?: 'left' | 'right' | 'up' | 'down';
}

export const SlideTransition = ({ 
  children, 
  key, 
  direction = 'left' 
}: SlideTransitionProps) => {
  const getSlideOffset = () => {
    switch (direction) {
      case 'left': return { x: -100, opacity: 0 };
      case 'right': return { x: 100, opacity: 0 };
      case 'up': return { y: -100, opacity: 0 };
      case 'down': return { y: 100, opacity: 0 };
      default: return { x: -100, opacity: 0 };
    }
  };

  return (
    <motion.div
      key={key}
      initial={getSlideOffset()}
      animate={{ x: 0, y: 0, opacity: 1 }}
      exit={getSlideOffset()}
      transition={{ duration: 0.3 }}
    >
      {children}
    </motion.div>
  );
};