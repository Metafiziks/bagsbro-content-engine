'use client';

import { useState, useRef } from 'react';
import { VideoCardProps } from '../types';
import { motion } from 'framer-motion';

export default function VideoCard({ src, title, index, poster }: VideoCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleMouseEnter = () => {
    setIsHovered(true);
    videoRef.current?.play().catch(err => console.log('Play failed:', err));
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8, delay: index * 0.1 }}
      className="group relative rounded-xl overflow-hidden glass cursor-pointer transition-all duration-400 hover:-translate-y-2 hover:border-primary hover:shadow-[0_20px_40px_rgba(255,51,102,0.3)]"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="relative w-full pt-[56.25%] overflow-hidden">
        <video
          ref={videoRef}
          muted
          loop
          playsInline
          poster={poster}
          className="absolute top-0 left-0 w-full h-full object-cover transition-transform duration-400 group-hover:scale-105"
        >
          <source src={src} type="video/mp4" />
        </video>

        {/* Play overlay */}
        <div className={`absolute inset-0 flex items-center justify-center bg-black/30 transition-opacity duration-400 ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
          <svg 
            className="w-16 h-16 text-light-text drop-shadow-[0_4px_8px_rgba(0,0,0,0.5)]"
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2"
          >
            <polygon points="5 3 19 12 5 21 5 3" />
          </svg>
        </div>
      </div>

      <h3 className="p-6 font-fredoka text-2xl font-bold tracking-wide text-center">
        {title}
      </h3>
    </motion.div>
  );
}
