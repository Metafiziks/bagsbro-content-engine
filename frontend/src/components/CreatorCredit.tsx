'use client';

import Image from 'next/image';
import { CreatorCreditProps } from '../types';
import { motion } from 'framer-motion';

export default function CreatorCredit({ logoSrc, name }: CreatorCreditProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1, delay: 0.3 }}
      className="flex items-center justify-center gap-3 mt-6"
    >
      <span className="font-mono text-lg text-light-text/70 italic">by</span>
      
      <div className="relative w-14 h-14 animate-float">
        <Image
          src={logoSrc}
          alt={name}
          fill
          className="rounded-full border-3 border-accent-yellow shadow-[0_0_20px_rgba(255,215,0,0.5)] transition-all duration-400 hover:scale-110 hover:rotate-6 hover:shadow-[0_0_30px_rgba(255,215,0,0.8)]"
        />
      </div>

      <span className="font-pixel text-3xl font-bold text-accent-yellow shadow-[2px_2px_0_rgba(0,0,0,0.3)] [text-shadow:0_0_10px_rgba(255,215,0,0.5)] tracking-wide">
        {name}
      </span>
    </motion.div>
  );
}
