'use client';

import { motion } from 'framer-motion';
import { FaSpotify, FaApple, FaYoutube } from 'react-icons/fa';
import CreatorCredit from './CreatorCredit';

interface HeroSectionProps {
  onWatchTrailer: () => void;
}

export default function HeroSection({ onWatchTrailer }: HeroSectionProps) {
  const scrollToFestivals = () => {
    document.getElementById('festivals')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="relative h-screen flex items-center justify-center overflow-hidden">
      {/* Top Links - Center */}
      <div className="absolute top-8 left-0 right-0 z-30 flex justify-center gap-6">
        <a
          href="/ballers"
          className="font-pixel text-lg text-secondary hover:text-primary transition-colors duration-300"
        >
          Enter The Bagaverse
        </a>
        <span className="text-accent-yellow text-lg">{"|"}</span>
        <a
          href="/ballers"
          className="font-pixel text-lg text-accent-yellow hover:text-primary transition-colors duration-300"
        >
          Click Here To Ball Out
        </a>
      </div>

      {/* Background Video */}
      <div className="absolute inset-0 z-0">
        <video
          autoPlay
          muted
          loop
          playsInline
          className="w-full h-full object-cover"
        >
          <source src="/video/hero-clip.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-b from-dark-bg/30 via-dark-bg/70 to-dark-bg/90" />
      </div>

      {/* Decorative bottom border */}
      <div className="absolute bottom-0 left-0 right-0 z-20 h-2 bg-gradient-to-r from-primary via-accent-yellow to-secondary shadow-[0_0_20px_rgba(255,51,102,0.8)]" />

      {/* Content */}
      <div className="relative z-10 text-center px-8 max-w-6xl">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="font-pixel text-4xl sm:text-5xl md:text-6xl lg:text-8xl tracking-wider relative inline-block glitch-text animate-glitch leading-tight"
          data-text="BIGGITY BAGGITY BOO"
          style={{
            textShadow: '0 0 20px rgba(255,51,102,0.8), 0 0 40px rgba(0,245,255,0.6)',
            fontWeight: 700
          }}
        >
          BIGGITY BAGGITY BOO!
        </motion.h1>

        <CreatorCredit logoSrc="/images/bags-bro-logo.jpg" name="Bags Bro!" />

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.5 }}
          className="mt-4 text-lg sm:text-xl md:text-2xl tracking-[0.3em] uppercase opacity-90"
        >
          An Animated Music Experience
        </motion.p>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.6 }}
          className="mt-6 text-xs sm:text-sm opacity-80"
        >
          <p className="flex flex-wrap sm:flex-nowrap items-center justify-center gap-x-2 gap-y-1">
            <span className="whitespace-nowrap">
              <span className="font-semibold">Writer & Director:</span>{' '}
              <a 
                href="https://www.linkedin.com/in/jeremiahwilliams1/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-secondary hover:text-primary transition-colors underline decoration-secondary/50 hover:decoration-primary"
              >
                The Bag Lord
              </a>
            </span>
            <span className="text-accent-yellow">|</span>
            <span className="whitespace-nowrap">
              <span className="font-semibold">Music Performance:</span>{' '}
              <a 
                href="https://www.youtube.com/c/MonLeeMane" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-secondary hover:text-primary transition-colors underline decoration-secondary/50 hover:decoration-primary"
              >
                MonLee Mane
              </a>
            </span>
            <span className="text-accent-yellow">|</span>
            <span className="whitespace-nowrap">
              <span className="font-semibold">Animation:</span>{' '}
              <a 
                href="https://www.forjastudios.com/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-secondary hover:text-primary transition-colors underline decoration-secondary/50 hover:decoration-primary"
              >
                Forja Studios
              </a>
            </span>
          </p>
        </motion.div>

        {/* Unified Hero CTA Card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="mt-10 flex justify-center"
        >
          <div
            className="w-full max-w-xl rounded-2xl px-6 py-5"
            style={{
              background: 'linear-gradient(135deg, rgba(0,30,60,0.78) 0%, rgba(0,60,80,0.72) 50%, rgba(10,10,30,0.82) 100%)',
              backdropFilter: 'blur(14px)',
              border: '1.5px solid rgba(0,245,255,0.45)',
              boxShadow: '0 0 28px rgba(0,245,255,0.22), 0 0 10px rgba(255,51,102,0.18), inset 0 0 32px rgba(0,245,255,0.05)',
            }}
          >
            {/* Music Promo Row */}
            <div className="flex items-center gap-5 pb-5 mb-5" style={{ borderBottom: '1px solid rgba(0,245,255,0.20)' }}>
              <div className="flex-1 text-right min-w-0">
                <p
                  className="font-pixel text-xs sm:text-sm tracking-widest uppercase mb-1"
                  style={{ color: '#FFD700', textShadow: '0 0 8px rgba(255,215,0,0.6)' }}
                >
                  Now Streaming
                </p>
                <p
                  className="font-pixel text-sm sm:text-base font-bold leading-snug mb-1"
                  style={{ color: '#FFFFFF', textShadow: '0 0 10px rgba(255,51,102,0.7)' }}
                >
                  BIGGITY BAGGITY BOO
                </p>
                <p
                  className="font-pixel text-xs sm:text-sm mb-3"
                  style={{ color: '#00F5FF', textShadow: '0 0 8px rgba(0,245,255,0.5)' }}
                >
                  BAGS BRO!
                </p>
                <div className="flex items-center justify-end gap-3 flex-wrap">
                  <span
                    className="font-pixel text-xs sm:text-sm tracking-wide uppercase"
                    style={{ color: '#FF6B9D', textShadow: '0 0 6px rgba(255,107,157,0.6)' }}
                  >
                    Click Here to Listen →
                  </span>
                  <a
                    href="https://open.spotify.com/track/05T3GBubw1G9zfVDHgCwNX"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Listen on Spotify"
                    className="hover:scale-125 transition-transform duration-150"
                    style={{ color: '#1DB954', filter: 'drop-shadow(0 0 4px rgba(29,185,84,0.6))' }}
                  >
                    <FaSpotify size={36} />
                  </a>
                  <a
                    href="https://music.apple.com/us/album/biggity-baggity-boo-feat-monlee-mane-single/1825494890"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Listen on Apple Music"
                    className="hover:scale-125 transition-transform duration-150"
                    style={{ color: '#fc3c44', filter: 'drop-shadow(0 0 4px rgba(252,60,68,0.6))' }}
                  >
                    <FaApple size={36} />
                  </a>
                  <a
                    href="https://youtu.be/sMd1DIgFX9k?si=RouPcDBBYLa5kJQz"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Watch on YouTube"
                    className="hover:scale-125 transition-transform duration-150"
                    style={{ color: '#FF0000', filter: 'drop-shadow(0 0 4px rgba(255,0,0,0.6))' }}
                  >
                    <FaYoutube size={36} />
                  </a>
                </div>
              </div>
              <img
                src="/images/biggity.jpg"
                alt="Biggity Baggity Boo album cover"
                className="flex-shrink-0 rounded-xl"
                style={{
                  width: '130px',
                  height: '130px',
                  imageRendering: 'pixelated',
                  border: '2px solid rgba(0,245,255,0.6)',
                  boxShadow: '0 0 18px rgba(255,51,102,0.55), 0 0 10px rgba(0,245,255,0.30)',
                }}
              />
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={onWatchTrailer}
                className="flex-1 px-8 py-4 font-pixel text-sm sm:text-base font-bold tracking-wide uppercase bg-gradient-to-r from-primary to-[#FF6B35] text-light-text shadow-[0_4px_20px_rgba(255,51,102,0.4)] hover:shadow-[0_8px_30px_rgba(255,51,102,0.6)] hover:-translate-y-1 transition-all duration-400"
              >
                Watch Trailer
              </button>
              <button
                onClick={scrollToFestivals}
                className="flex-1 px-8 py-4 font-pixel text-sm sm:text-base font-bold tracking-wide uppercase bg-transparent text-light-text border-2 border-secondary shadow-[0_4px_20px_rgba(0,245,255,0.3)] hover:bg-secondary hover:text-dark-bg hover:shadow-[0_8px_30px_rgba(0,245,255,0.5)] hover:-translate-y-1 transition-all duration-400"
              >
                Festival Info
              </button>
            </div>
          </div>
        </motion.div>
      </div>

    </section>
  );
}