// src/components/MovingBanner.tsx
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Facebook, X, Instagram, Linkedin, Github, MessageCircle, Mail, Phone } from 'lucide-react';

const MovingBanner = () => {
  const [isVisible, setIsVisible] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const [touchTimeout, setTouchTimeout] = useState<NodeJS.Timeout | null>(null);

  // Function to handle deep linking for social apps
  const handleSocialLinkClick = (appUrl: string, fallbackUrl: string, label: string) => {
    // On mobile devices, try the app URL first, then fall back to web URL
    if (typeof window !== 'undefined') {
      // For iOS devices
      if (/iPad|iPhone|iPod/.test(navigator.userAgent)) {
        // Try to open the app
        window.location.href = appUrl;

        // If the app isn't installed, fall back to the web URL after a delay
        setTimeout(() => {
          window.location.href = fallbackUrl;
        }, 1000);
      }
      // For Android devices
      else if (/Android/.test(navigator.userAgent)) {
        // Create a hidden iframe to try to open the app
        const iframe = document.createElement('iframe');
        iframe.style.display = 'none';
        iframe.src = appUrl;
        document.body.appendChild(iframe);

        // After a short delay, remove the iframe and redirect to web fallback
        setTimeout(() => {
          document.body.removeChild(iframe);
          window.location.href = fallbackUrl;
        }, 1000);
      }
      // For non-mobile devices or when app is not available, use the fallback URL
      else {
        window.location.href = fallbackUrl;
      }
    }
  };

  const socialLinks = [
    { href: "https://web.facebook.com/profile.php?id=61576682944507", appUrl: "fb://profile/61576682944507", icon: <Facebook size={20} />, label: "Facebook", username: "DevIsaacMaina" },
    { href: "https://x.com/DevIsaacMaina", appUrl: "twitter://user?screen_name=DevIsaacMaina", icon: <X size={20} />, label: "Twitter", username: "@DevIsaacMaina" },
    { href: "https://www.instagram.com/devisaacmaina", appUrl: "instagram://user?username=devisaacmaina", icon: <Instagram size={20} />, label: "Instagram", username: "@devisaacmaina" },
    { href: "https://www.linkedin.com/in/isaac-maina/?skipRedirect=true", appUrl: "linkedin://profile/isaac-maina", icon: <Linkedin size={20} />, label: "LinkedIn", username: "Isaac Maina" },
    { href: "https://github.com/IsaacMaina", appUrl: "github://", icon: <Github size={20} />, label: "GitHub", username: "@IsaacMaina" },
    { href: "https://wa.me/254758302725", appUrl: "whatsapp://send?phone=+254758302725", icon: <MessageCircle size={20} />, label: "WhatsApp", username: "+254 758 302 725" },
    { href: "mailto:mainaisaacwachira2000@gmail.com", appUrl: "googlegmail://", icon: <Mail size={20} />, label: "Email", username: "mainaisaacwachira2000@gmail.com" },
    { href: "tel:+254758302725", appUrl: "tel:+254758302725", icon: <Phone size={20} />, label: "Phone", username: "+254 758 302 725" },
  ];

  // Set up event listeners for user activity
  useEffect(() => {
    // Events that indicate user activity - includes touch events for mobile
    const events = ['mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart', 'click', 'focus', 'touchmove'];

    let inactivityTimer: NodeJS.Timeout | null = null;

    // Function to handle user activity
    const handleActivity = () => {
      if (!isHovered) { // Only hide if not currently interacting with the banner
        setIsVisible(false); // Hide immediately when user interacts
      }

      // Clear the previous inactivity timer if it exists
      if (inactivityTimer) {
        clearTimeout(inactivityTimer);
      }

      // Set a new timeout to show the banner after inactivity
      inactivityTimer = setTimeout(() => {
        if (!isHovered) { // Only show if not interacting with the banner
          setIsVisible(true); // Show the banner after 5 seconds of inactivity
        }
      }, 5000); // Show after 5 seconds of inactivity
    };

    // Add event listeners for user activity
    events.forEach(event => {
      window.addEventListener(event, handleActivity, { passive: true });
    });

    // Initialize timer to show banner after 100ms initially
    inactivityTimer = setTimeout(() => {
      if (!isHovered) {
        setIsVisible(true);
      }
    }, 100); // Show after 100ms initially

    // Cleanup function to remove event listeners and clear timer
    return () => {
      events.forEach(event => {
        window.removeEventListener(event, handleActivity);
      });

      if (inactivityTimer) {
        clearTimeout(inactivityTimer);
      }

      if (touchTimeout) {
        clearTimeout(touchTimeout);
      }
    };
  }, [setIsVisible, isHovered, touchTimeout]); // Add touchTimeout to dependency array

  // Create a container element to detect mouse/touch proximity
  const bannerContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (bannerContainerRef.current && !isHovered) { // Only trigger if not already interacting with the banner
        const rect = bannerContainerRef.current.getBoundingClientRect();

        // Calculate if mouse is within or near the banner container
        // Use the bounding box with some padding instead of distance from center
        const padding = 20; // Add padding around the banner
        const isNearBanner =
          e.clientX >= rect.left - padding &&
          e.clientX <= rect.right + padding &&
          e.clientY >= rect.top - padding &&
          e.clientY <= rect.bottom + padding;

        if (isNearBanner) {
          setIsVisible(true);
        }
      }
    };

    // Handle touch events for mobile proximity detection
    const handleTouchMove = (e: TouchEvent) => {
      if (bannerContainerRef.current && !isHovered) { // Only trigger if not already interacting with the banner
        const rect = bannerContainerRef.current.getBoundingClientRect();
        const touch = e.touches[0];

        // Calculate if touch is within or near the banner container
        const padding = 20; // Add padding around the banner
        const isNearBanner =
          touch.clientX >= rect.left - padding &&
          touch.clientX <= rect.right + padding &&
          touch.clientY >= rect.top - padding &&
          touch.clientY <= rect.bottom + padding;

        if (isNearBanner) {
          setIsVisible(true);
        }
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('touchmove', handleTouchMove, { passive: true });

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleTouchMove);
    };
  }, [isHovered]); // Add isHovered to dependency array

  // Handle banner interaction state to prevent disappearing when interacting
  const handleInteractionStart = () => {
    setIsVisible(true);
    setIsHovered(true);

    // Clear any existing timeout
    if (touchTimeout) {
      clearTimeout(touchTimeout);
    }

    // Set a new timeout to allow banner to stay visible for a bit longer after interaction
    const newTimeout = setTimeout(() => {
      setIsHovered(false);
    }, 2000); // Keep banner visible for 2 seconds after interaction

    setTouchTimeout(newTimeout);
  };

  const handleInteractionEnd = () => {
    // Don't hide immediately when leaving, let the inactivity timer handle it
    // Interaction end is handled by the timeout set in handleInteractionStart
  };

  return (
    <div
      ref={bannerContainerRef}
      className={`fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50 transition-all duration-500 ${
        isVisible
          ? 'opacity-100 translate-y-0'
          : 'opacity-0 translate-y-10 pointer-events-none'
      }`}
      onMouseEnter={handleInteractionStart}
      onMouseLeave={handleInteractionEnd}
      onTouchStart={handleInteractionStart}
      onTouchEnd={handleInteractionEnd}
    >
      <div className="flex flex-col sm:flex-row items-center justify-center space-y-2 sm:space-y-0 sm:space-x-2 bg-black/40 px-3 py-2 rounded-full border border-yellow-500/50 backdrop-blur-sm shadow-xl shadow-blue-900/30 min-w-[80vw] sm:min-w-[auto] max-w-[95vw]">
        <span className="text-yellow-400 font-bold text-xs sm:text-sm whitespace-nowrap">Contact Developer ShyrahDev</span>

        <div className="flex items-center space-x-1 sm:space-x-2">
          {socialLinks.map((social, index) => (
            <div key={index} className="relative group inline-block">
              <a
                onClick={(e) => {
                  e.preventDefault();
                  handleSocialLinkClick(social.appUrl, social.href, social.label);
                }}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center bg-black/50 w-8 h-8 sm:w-10 sm:h-10 rounded-full border border-yellow-500/50 hover:border-yellow-400 transition-all duration-300 hover:scale-110 shadow-md shadow-black/30"
                title={`Connect on ${social.label}`}
              >
                {social.icon}
              </a>

              {/* Tooltip - hidden on mobile due to touch interface */}
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-50 whitespace-nowrap -translate-y-2 group-hover:-translate-y-0 hidden sm:block">
                {social.username}
                {/* Tooltip arrow */}
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-gray-900"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MovingBanner;