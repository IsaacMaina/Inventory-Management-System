'use client';

import { motion } from 'framer-motion';

interface FadeInProps {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  className?: string;
}

export const FadeIn = ({ children, delay = 0, duration = 0.5, className }: FadeInProps) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay, duration }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

interface SlideInProps {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  direction?: 'up' | 'down' | 'left' | 'right';
  className?: string;
}

export const SlideIn = ({ 
  children, 
  delay = 0, 
  duration = 0.5, 
  direction = 'up', 
  className 
}: SlideInProps) => {
  const getPosition = () => {
    switch (direction) {
      case 'up': return { y: 20 };
      case 'down': return { y: -20 };
      case 'left': return { x: -20 };
      case 'right': return { x: 20 };
      default: return { y: 20 };
    }
  };

  return (
    <motion.div
      initial={getPosition()}
      animate={{ x: 0, y: 0 }}
      transition={{ delay, duration }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

interface ScaleInProps {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  className?: string;
}

export const ScaleIn = ({ children, delay = 0, duration = 0.5, className }: ScaleInProps) => {
  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay, duration }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

interface StaggerContainerProps {
  children: React.ReactNode;
  staggerAmount?: number;
  className?: string;
}

export const StaggerContainer = ({ 
  children, 
  staggerAmount = 0.1, 
  className 
}: StaggerContainerProps) => {
  return (
    <motion.div
      initial="hidden"
      animate="show"
      variants={{
        hidden: { opacity: 0 },
        show: {
          opacity: 1,
          transition: {
            staggerChildren: staggerAmount,
          },
        },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

interface StaggerItemProps {
  children: React.ReactNode;
  className?: string;
}

export const StaggerItem = ({ children, className }: StaggerItemProps) => {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};