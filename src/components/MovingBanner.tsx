// src/components/MovingBanner.tsx
'use client';

import React from 'react';
import { Facebook, X, Instagram, Linkedin, Github, MessageCircle, Mail, Phone } from 'lucide-react';

const MovingBanner = () => {
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

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-gradient-to-r from-blue-900/95 to-green-900/95 backdrop-blur-sm border-t-2 border-yellow-500/30 shadow-lg shadow-blue-900/50">
      <div className="flex items-center justify-center h-16 px-4">
        <div className="flex items-center space-x-2 bg-black/40 px-4 py-2 rounded-full border border-yellow-500/50">
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
    </div>
  );
};

export default MovingBanner;