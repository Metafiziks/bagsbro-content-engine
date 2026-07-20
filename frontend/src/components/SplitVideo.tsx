'use client';

import { useEffect, useRef } from 'react';
import Image from 'next/image';

export default function SplitVideo() {
  const rightVideoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            rightVideoRef.current?.play().catch(err => console.log('Play failed:', err));
          } else {
            rightVideoRef.current?.pause();
          }
        });
      },
      { threshold: 0.5 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section className="relative py-24 px-8 overflow-hidden border-t-4 border-b-4 border-transparent bg-gradient-to-r from-primary via-secondary to-primary bg-clip-border">
      <div className="absolute inset-0 bg-black">
        {/* Background image with darkened overlay */}
        <div className="absolute inset-0">
          <Image
            src="/images/drive-scene.png"
            alt="Background"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-black/70" />
        </div>

        {/* Seamless blend from previous section */}
        <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-blue-dark to-transparent z-10" />
      </div>
      
      {/* Content */}
      <div className="relative z-10">
        {/* Title matching hero section */}
        <div className="text-center mb-12">
          <h2 
            className="font-pixel text-4xl sm:text-5xl md:text-6xl lg:text-7xl tracking-wider relative inline-block glitch-text animate-glitch leading-tight"
            data-text="EVOLUTION"
            style={{
              textShadow: '0 0 20px rgba(255,51,102,0.8), 0 0 40px rgba(0,245,255,0.6)',
              fontWeight: 700
            }}
          >
            EVOLUTION
          </h2>
        </div>
        <div className="w-24 h-1 bg-gradient-to-r from-primary via-accent-yellow to-secondary mx-auto mb-16 shadow-[0_0_20px_rgba(255,51,102,0.8)] animate-pulse" />

        <div className="max-w-6xl mx-auto space-y-8">
          {/* First Row - Car Sketch vs Drive Scene */}
          <div className="w-full rounded-xl overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.8)]">
            <div className="flex" style={{ height: '450px' }}>
              {/* Left - Car Sketch */}
              <div className="relative flex-1 overflow-hidden">
                <Image
                  src="/images/car-sketch.png"
                  alt="Car Sketch"
                  fill
                  className="object-cover"
                  priority
                />
                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 font-pixel text-lg md:text-xl font-bold bg-black/70 px-6 py-2 rounded backdrop-blur-md text-white z-10">
                  Sketch
                </div>
              </div>

              {/* Divider */}
              <div className="w-1 bg-gradient-to-b from-primary via-accent-yellow to-secondary shadow-[0_0_20px_rgba(255,51,102,0.8)]" />

              {/* Right - Drive Scene Illustration */}
              <div className="relative flex-1 overflow-hidden">
                <Image
                  src="/images/car-illustration.jpg"
                  alt="Drive Scene Illustration"
                  fill
                  className="object-cover"
                  priority
                />
                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 font-pixel text-lg md:text-xl font-bold bg-black/70 px-6 py-2 rounded backdrop-blur-md text-white z-10">
                  Illustration
                </div>
              </div>
            </div>
          </div>

          {/* Second Row - Sketch vs Animation */}
          <div
            ref={containerRef}
            className="w-full rounded-xl overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.8)]"
          >
            <div className="flex" style={{ height: '450px' }}>
              {/* Left - Sketch Image */}
              <div className="relative flex-1 overflow-hidden">
                <Image
                  src="/images/sketch-optimized.webp"
                  alt="BagsBro Sketch"
                  fill
                  className="object-cover"
                  priority
                />
                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 font-pixel text-lg md:text-xl font-bold bg-black/70 px-6 py-2 rounded backdrop-blur-md text-white z-10">
                  Sketch
                </div>
              </div>

              {/* Divider */}
              <div className="w-1 bg-gradient-to-b from-primary via-accent-yellow to-secondary shadow-[0_0_20px_rgba(255,51,102,0.8)]" />

              {/* Right - Animated Video */}
              <div className="relative flex-1 overflow-hidden">
                <video
                  ref={rightVideoRef}
                  autoPlay
                  muted
                  loop
                  playsInline
                  className="w-full h-full object-cover"
                >
                  <source src="/video/test-animation.mp4" type="video/mp4" />
                </video>
                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 font-pixel text-lg md:text-xl font-bold bg-black/70 px-6 py-2 rounded backdrop-blur-md text-white z-10">
                  Animation
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}