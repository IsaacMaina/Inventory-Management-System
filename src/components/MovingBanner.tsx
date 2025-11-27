// src/components/MovingBanner.tsx
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Facebook, X, Instagram, Linkedin, Github, MessageCircle, Mail, Phone } from 'lucide-react';

const MovingBanner = () => {
  const [isVisible, setIsVisible] = useState(true);

  const socialLinks = [
    { href: "https://web.facebook.com/profile.php?id=61576682944507", icon: <Facebook size={20} />, label: "Facebook", username: "DevIsaacMaina" },
    { href: "https://x.com/DevIsaacMaina", icon: <X size={20} />, label: "Twitter", username: "@DevIsaacMaina" },
    { href: "https://www.instagram.com/devisaacmaina", icon: <Instagram size={20} />, label: "Instagram", username: "@devisaacmaina" },
    { href: "https://www.linkedin.com/in/isaac-maina/?skipRedirect=true", icon: <Linkedin size={20} />, label: "LinkedIn", username: "Isaac Maina" },
    { href: "https://github.com/IsaacMaina", icon: <Github size={20} />, label: "GitHub", username: "@IsaacMaina" },
    { href: "https://wa.me/254758302725", icon: <MessageCircle size={20} />, label: "WhatsApp", username: "+254 758 302 725" },
    { href: "https://mail.google.com/mail/?view=cm&to=mainaisaacwachira2000@gmail.com", icon: <Mail size={20} />, label: "Email", username: "mainaisaacwachira2000@gmail.com" },
    { href: "tel:+254758302725", icon: <Phone size={20} />, label: "Phone", username: "+254 758 302 725" },
  ];

  // Set up event listeners for user activity
  useEffect(() => {
    // Events that indicate user activity
    const events = ['mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart', 'click', 'focus'];

    let inactivityTimer: NodeJS.Timeout | null = null;

    // Function to handle user activity
    const handleActivity = () => {
      setIsVisible(false); // Hide immediately when user interacts

      // Clear the previous inactivity timer if it exists
      if (inactivityTimer) {
        clearTimeout(inactivityTimer);
      }

      // Set a new timeout to show the banner after inactivity
      inactivityTimer = setTimeout(() => {
        setIsVisible(true); // Show the banner after 5 seconds of inactivity
      }, 5000); // Show after 5 seconds of inactivity
    };

    // Add event listeners for user activity
    events.forEach(event => {
      window.addEventListener(event, handleActivity, { passive: true });
    });

    // Initialize timer to show banner after 100ms initially
    inactivityTimer = setTimeout(() => {
      setIsVisible(true);
    }, 100); // Show after 100ms initially

    // Cleanup function to remove event listeners and clear timer
    return () => {
      events.forEach(event => {
        window.removeEventListener(event, handleActivity);
      });

      if (inactivityTimer) {
        clearTimeout(inactivityTimer);
      }
    };
  }, [setIsVisible]); // Add setIsVisible to dependency array

  // Create a container element to detect mouse proximity
  const bannerContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (bannerContainerRef.current) {
        const rect = bannerContainerRef.current.getBoundingClientRect();

        // Calculate distance between mouse and banner container
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const distance = Math.sqrt(
          Math.pow(e.clientX - centerX, 2) +
          Math.pow(e.clientY - centerY, 2)
        );

        // Show banner if mouse is within 200px radius
        if (distance < 200) {
          setIsVisible(true);
        }
      }
    };

    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <div
      ref={bannerContainerRef}
      className={`fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50 transition-all duration-500 ${
        isVisible
          ? 'opacity-100 translate-y-0'
          : 'opacity-0 translate-y-10 pointer-events-none'
      }`}
    >
      <div className="flex items-center space-x-2 bg-black/40 px-4 py-2 rounded-full border border-yellow-500/50 backdrop-blur-sm shadow-xl shadow-blue-900/30">
        <span className="text-yellow-400 font-bold text-sm mr-3">Contact Developer ShyrahDev</span>

        {socialLinks.map((social, index) => (
          <div key={index} className="relative group inline-block">
            <a
              href={social.href}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center bg-black/50 w-11 h-11 rounded-full border border-yellow-500/50 hover:border-yellow-400 transition-all duration-300 hover:scale-110 shadow-md shadow-black/30"
              title={`Connect on ${social.label}`}
            >
              {social.icon}
            </a>

            {/* Tooltip */}
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-50 whitespace-nowrap -translate-y-2 group-hover:-translate-y-0">
              {social.username}
              {/* Tooltip arrow */}
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-gray-900"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MovingBanner;