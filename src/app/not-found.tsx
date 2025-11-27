"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function NotFound() {
  const router = useRouter();
  const [isBouncing, setIsBouncing] = useState(false);
  const [isWaving, setIsWaving] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  const handleHomeClick = () => {
    router.push("/");
  };

  const handleBackClick = () => {
    router.back();
  };

  const handleBounce = () => {
    setIsBouncing(true);
    setTimeout(() => setIsBouncing(false), 1000);
  };

  const handleWave = () => {
    setIsWaving(true);
    setTimeout(() => setIsWaving(false), 1000);
  };

  const handleConfetti = () => {
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 via-purple-50 to-indigo-100 flex flex-col items-center justify-center p-4 overflow-hidden">
      {/* Confetti effect */}
      {showConfetti && (
        <>
          {[...Array(50)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-4 h-4 rounded-full"
              style={{
                backgroundColor: `hsl(${Math.random() * 360}, 100%, 50%)`,
                left: `${Math.random() * 100}vw`,
                top: `-10px`,
              }}
              animate={{
                y: [0, window.innerHeight],
                x: [0, (Math.random() - 0.5) * 400],
                rotate: [0, 360],
              }}
              transition={{
                duration: 2,
                ease: "easeOut",
              }}
            />
          ))}
        </>
      )}

      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center max-w-2xl w-full relative z-10"
      >
        {/* Animated character */}
        <motion.div
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={handleBounce}
          className="cursor-pointer mb-8 relative"
        >
          <div className={`relative ${isBouncing ? 'animate-bounce' : ''}`}>
            <div className="w-48 h-48 mx-auto bg-yellow-300 rounded-full flex items-center justify-center shadow-lg border-8 border-yellow-400 relative">
              <div className="w-32 h-32 bg-yellow-200 rounded-full flex items-center justify-center">
                <div className="w-24 h-24 bg-yellow-300 rounded-full flex items-center justify-center">
                  {/* Eyes */}
                  <div className="flex justify-center space-x-8 -mt-4">
                    <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                      <motion.div
                        className="w-4 h-4 bg-black rounded-full"
                        animate={isWaving ? { y: [0, -5, 0], x: [0, 2, 0] } : {}}
                        transition={{ repeat: isWaving ? 2 : 0, duration: 0.3 }}
                      ></motion.div>
                    </div>
                    <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                      <motion.div
                        className="w-4 h-4 bg-black rounded-full"
                        animate={isWaving ? { y: [0, -5, 0], x: [0, -2, 0] } : {}}
                        transition={{ repeat: isWaving ? 2 : 0, duration: 0.3 }}
                      ></motion.div>
                    </div>
                  </div>
                  {/* Mouth */}
                  <div className="absolute bottom-8 w-16 h-8 border-b-8 border-black rounded-b-full"></div>
                </div>
              </div>
              {/* Tongue animation */}
              {isWaving && (
                <motion.div
                  className="absolute bottom-6 w-4 h-6 bg-red-500 rounded-full"
                  initial={{ height: 0 }}
                  animate={{ height: 24 }}
                  transition={{ duration: 0.3 }}
                ></motion.div>
              )}
            </div>
            {/* Character hat */}
            <motion.div
              className="absolute -top-8 left-1/2 transform -translate-x-1/2 w-32 h-16 bg-red-500 rounded-t-full"
              animate={isWaving ? { y: [-10, 0, -10] } : {}}
              transition={{ repeat: isWaving ? 2 : 0, duration: 0.3 }}
            >
              {/* Hat decoration */}
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 w-8 h-8 bg-yellow-300 rounded-full"></div>
            </motion.div>
          </div>
        </motion.div>

        {/* Interactive text */}
        <motion.h1
          className="text-9xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-500 mb-4 cursor-pointer"
          initial={{ scale: 0.5 }}
          animate={{ scale: 1 }}
          transition={{
            type: "spring",
            stiffness: 100,
            delay: 0.2
          }}
          whileHover={{ scale: 1.05, rotate: 2 }}
          onClick={handleWave}
        >
          404
        </motion.h1>

        <motion.h2
          className="text-4xl font-bold text-gray-800 mb-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          Oops! Page Lost
        </motion.h2>

        <motion.p
          className="text-xl text-gray-600 mb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          The page you're looking for seems to have wandered off into another dimension!
        </motion.p>

        {/* Buttons */}
        <motion.div
          className="flex flex-col sm:flex-row gap-4 justify-center mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <motion.button
            onClick={handleHomeClick}
            className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold rounded-full shadow-lg hover:from-purple-600 hover:to-pink-600 transition-all"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Go Home
          </motion.button>

          <motion.button
            onClick={handleBackClick}
            className="px-6 py-3 bg-gradient-to-r from-blue-400 to-cyan-400 text-white font-bold rounded-full shadow-lg hover:from-blue-500 hover:to-cyan-500 transition-all"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Go Back
          </motion.button>
        </motion.div>

        {/* Extra interactive button */}
        <motion.button
          onClick={handleConfetti}
          className="px-4 py-2 bg-gradient-to-r from-green-400 to-teal-400 text-white font-bold rounded-full shadow-lg hover:from-green-500 hover:to-teal-500 transition-all"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Party Mode!
        </motion.button>
      </motion.div>

      {/* Floating elements */}
      <div className="absolute top-20 left-10">
        <motion.div
          animate={{
            y: [-10, 10, -10],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="w-16 h-16 bg-pink-300 rounded-full"
        ></motion.div>
      </div>

      <div className="absolute bottom-20 right-10">
        <motion.div
          animate={{
            y: [10, -10, 10],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="w-12 h-12 bg-blue-300 rounded-full"
        ></motion.div>
      </div>

      <div className="absolute top-1/3 right-20">
        <motion.div
          animate={{
            rotate: [0, 10, 0, -10, 0],
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="w-10 h-10 bg-yellow-300 rotate-45"
        ></motion.div>
      </div>

      {/* Additional floating elements */}
      <div className="absolute top-1/4 left-20">
        <motion.div
          animate={{
            x: [0, 20, 0],
            y: [0, -20, 0],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="w-8 h-8 bg-green-300 rounded-full"
        ></motion.div>
      </div>

      <div className="absolute bottom-1/4 right-1/4">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="w-14 h-14 bg-purple-300 rounded-full"
        ></motion.div>
      </div>
    </div>
  );
}