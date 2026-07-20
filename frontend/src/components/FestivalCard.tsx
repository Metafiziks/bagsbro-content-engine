'use client';

import { FestivalCardProps } from '../types';
import { motion } from 'framer-motion';

export default function FestivalCard({ icon, title, description }: FestivalCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      whileHover={{ y: -10 }}
      className="relative glass p-12 rounded-xl text-center transition-all duration-400 hover:bg-white/8 hover:border-primary overflow-hidden group h-full"
    >
      {/* Top border animation */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-[#FF6B35] scale-x-0 transition-transform duration-400 group-hover:scale-x-100" />

      <div className="text-6xl mb-4">{icon}</div>
      
      <h3 className="font-pixel text-3xl font-bold tracking-wide mb-4 text-secondary">
        {title}
      </h3>
      
      <p className="leading-relaxed opacity-90">
        {description}
      </p>
    </motion.div>
  );
}