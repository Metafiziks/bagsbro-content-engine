'use client';

import { useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';

interface CharacterCardProps {
  image: string;
  title: string;
  previewText: string;
  fullText: string;
  index: number;
}

export default function CharacterCard({ image, title, previewText, fullText, index }: CharacterCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, delay: index * 0.2 }}
        className="glass rounded-xl overflow-hidden transition-all duration-400 hover:-translate-y-2 hover:border-primary hover:shadow-[0_20px_40px_rgba(255,51,102,0.3)] flex flex-col h-full"
      >
        {/* Image */}
        <div className="relative w-full aspect-square">
          <Image
            src={image}
            alt={title}
            fill
            className="object-cover"
          />
        </div>

        {/* Content */}
        <div className="p-6 flex flex-col flex-grow">
          <h3 className="font-pixel text-xl md:text-2xl font-bold mb-4 text-accent-yellow text-center">
            {title}
          </h3>
          
          <p className="text-base md:text-lg leading-relaxed opacity-90 mb-4 flex-grow text-center">
            {previewText}
          </p>

          <button
            onClick={() => setIsModalOpen(true)}
            className="mt-auto px-6 py-3 font-pixel text-xs md:text-sm bg-gradient-to-r from-secondary to-[#0066FF] text-dark-bg rounded hover:shadow-[0_4px_20px_rgba(0,245,255,0.6)] transition-all duration-300 hover:-translate-y-1"
          >
            Read More
          </button>
        </div>
      </motion.div>

      {/* Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-md p-4"
            onClick={() => setIsModalOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              transition={{ duration: 0.4 }}
              className="relative max-w-2xl w-full glass rounded-xl p-8"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setIsModalOpen(false)}
                className="absolute top-4 right-4 text-light-text text-3xl hover:text-primary transition-colors"
                aria-label="Close modal"
              >
                &times;
              </button>

              <h3 className="font-pixel text-2xl font-bold mb-6 text-accent-yellow">
                {title}
              </h3>

              <div className="prose prose-invert max-w-none">
                <p className="text-base leading-relaxed opacity-90 whitespace-pre-line">
                  {fullText}
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}