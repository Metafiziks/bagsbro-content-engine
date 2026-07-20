'use client';

import { useEffect } from 'react';
import { ModalProps } from '../types';
import { motion, AnimatePresence } from 'framer-motion';

export default function Modal({ isOpen, onClose }: ModalProps) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-md"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            transition={{ duration: 0.4 }}
            className="relative w-[90%] max-w-6xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={onClose}
              className="absolute -top-16 right-0 text-light-text text-5xl transition-all duration-400 hover:text-primary hover:rotate-90 z-10"
              aria-label="Close modal"
            >
              &times;
            </button>

            <div className="relative rounded-xl overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.8)]" style={{ aspectRatio: '16/9' }}>
              <iframe
                src="https://player.cloudinary.com/embed/?cloud_name=dbhqbpbfo&public_id=bags-bro-trailer_lidkxb&profile=cld-default&autoplay=true"
                width="100%"
                height="100%"
                className="absolute inset-0"
                allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
                allowFullScreen
              />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}