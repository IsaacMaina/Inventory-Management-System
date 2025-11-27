'use client';

import { motion } from 'framer-motion';

// Micro-interaction for buttons
interface MicroButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}

export const MicroButton = ({ children, onClick, className }: MicroButtonProps) => {
  return (
    <motion.button
      whileHover={{ scale: 1.03, boxShadow: "0 4px 14px rgba(0, 0, 0, 0.15)" }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`px-4 py-2 rounded-lg transition-all ${className}`}
    >
      {children}
    </motion.button>
  );
};

// Micro-interaction for cards
interface MicroCardProps {
  children: React.ReactNode;
  className?: string;
}

export const MicroCard = ({ children, className }: MicroCardProps) => {
  return (
    <motion.div
      whileHover={{ 
        y: -5,
        boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
      }}
      className={`rounded-lg p-4 transition-all ${className}`}
    >
      {children}
    </motion.div>
  );
};

// Micro-interaction for inputs
interface MicroInputProps {
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  className?: string;
}

export const MicroInput = ({ placeholder, value, onChange, className }: MicroInputProps) => {
  return (
    <motion.input
      whileFocus={{ scale: 1.01, boxShadow: "0 0 0 3px rgba(59, 130, 246, 0.3)" }}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      className={`w-full p-3 rounded-lg bg-gray-700 border border-gray-600 focus:border-blue-500 focus:outline-none transition-all ${className}`}
    />
  );
};

// Micro-interaction for menu items
interface MicroMenuItemProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}

export const MicroMenuItem = ({ children, onClick, className }: MicroMenuItemProps) => {
  return (
    <motion.div
      whileHover={{ 
        backgroundColor: "rgba(55, 65, 81, 0.5)",
        paddingLeft: "1.2rem"
      }}
      onClick={onClick}
      className={`py-2 px-4 rounded-lg cursor-pointer transition-all ${className}`}
    >
      {children}
    </motion.div>
  );
};

// Micro-interaction for toggle switches
interface MicroToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
}

export const MicroToggle = ({ checked, onChange, label }: MicroToggleProps) => {
  return (
    <div className="flex items-center">
      {label && <span className="mr-3 text-sm">{label}</span>}
      <motion.div
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => onChange(!checked)}
        className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer ${
          checked ? 'bg-blue-500' : 'bg-gray-600'
        }`}
      >
        <motion.div
          className="bg-white w-4 h-4 rounded-full shadow-md"
          animate={{ x: checked ? 20 : 0 }}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
        />
      </motion.div>
    </div>
  );
};

// Micro-interaction for notifications
interface MicroNotificationProps {
  children: React.ReactNode;
  visible: boolean;
  setVisible: (visible: boolean) => void;
}

export const MicroNotification = ({ children, visible, setVisible }: MicroNotificationProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20, scale: 0.95 }}
      animate={{ 
        opacity: visible ? 1 : 0,
        y: visible ? 0 : -20,
        scale: visible ? 1 : 0.95,
        height: visible ? "auto" : 0,
        overflow: "hidden"
      }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
      className="fixed top-4 right-4 z-50 bg-gray-800 border border-gray-700 rounded-lg p-4 shadow-lg max-w-xs"
    >
      <div className="flex justify-between items-start">
        <div>{children}</div>
        <button 
          onClick={() => setVisible(false)}
          className="ml-2 text-gray-400 hover:text-white"
        >
          ✕
        </button>
      </div>
    </motion.div>
  );
};