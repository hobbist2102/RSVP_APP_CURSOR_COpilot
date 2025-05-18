import React, { useRef, useEffect, ReactNode } from 'react';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';

interface AnimatedSectionProps {
  id: string;
  children: ReactNode;
  backgroundImage?: string;
  backgroundColor?: string;
  textColor?: string;
  style?: React.CSSProperties;
  animationType?: 'fade' | 'slide' | 'zoom' | 'parallax' | 'reveal'; 
  overlayOpacity?: number;
  pinned?: boolean;
  duration?: number;
}

export const AnimatedSection: React.FC<AnimatedSectionProps> = ({
  id,
  children,
  backgroundImage,
  backgroundColor = '#000',
  textColor = 'white',
  style,
  animationType = 'fade',
  overlayOpacity = 0.5,
  pinned = false,
  duration = 1
}) => {
  const sectionRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  
  useGSAP(() => {
    if (sectionRef.current && contentRef.current) {
      // Import ScrollTrigger dynamically
      import('gsap/ScrollTrigger').then(({ ScrollTrigger }) => {
        gsap.registerPlugin(ScrollTrigger);
        
        // Create animation timeline
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top bottom",
            end: "bottom top",
            scrub: true,
            markers: false,
            pin: pinned,
            pinSpacing: true,
            toggleActions: "play pause resume reset"
          }
        });
        
        // Define animations based on type
        switch (animationType) {
          case 'fade':
            tl.fromTo(contentRef.current, 
              { autoAlpha: 0 }, 
              { autoAlpha: 1, duration: duration }
            );
            break;
            
          case 'slide':
            tl.fromTo(contentRef.current, 
              { y: 100, autoAlpha: 0 }, 
              { y: 0, autoAlpha: 1, duration: duration }
            );
            break;
            
          case 'zoom':
            tl.fromTo(contentRef.current, 
              { scale: 0.8, autoAlpha: 0 }, 
              { scale: 1, autoAlpha: 1, duration: duration }
            );
            break;
            
          case 'parallax':
            // Background parallax effect
            if (backgroundImage) {
              const bgElement = sectionRef.current.querySelector('.section-background');
              if (bgElement) {
                tl.fromTo(bgElement, 
                  { y: '-20%' }, 
                  { y: '20%', ease: "none", duration: duration }
                );
              }
            }
            // Content parallax (slower than background)
            tl.fromTo(contentRef.current, 
              { y: '5%' }, 
              { y: '-5%', ease: "none", duration: duration * 0.5 },
              0
            );
            break;
            
          case 'reveal':
            // Create a reveal mask effect
            gsap.set(contentRef.current, { clipPath: 'polygon(0% 0%, 0% 0%, 0% 100%, 0% 100%)' });
            tl.to(contentRef.current, { 
              clipPath: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)', 
              duration: duration 
            });
            // Also fade in to enhance the effect
            tl.fromTo(contentRef.current, 
              { autoAlpha: 0 }, 
              { autoAlpha: 1, duration: duration * 0.5 },
              0
            );
            break;
        }
      });
    }
  }, { scope: sectionRef });

  return (
    <section
      id={id}
      ref={sectionRef}
      className="cinematic-section min-h-screen w-full relative flex items-center justify-center overflow-hidden"
      style={{
        backgroundColor,
        color: textColor,
        ...style
      }}
      data-animation-type={animationType}
    >
      {/* Background with parallax effect */}
      {backgroundImage && (
        <div 
          className="section-background absolute inset-0 w-full h-full bg-cover bg-center"
          style={{ 
            backgroundImage: `url(${backgroundImage})`,
            transform: 'scale(1.2)'
          }}
        />
      )}
      
      {/* Overlay for better text contrast */}
      <div 
        className="absolute inset-0 w-full h-full"
        style={{ 
          backgroundColor: backgroundColor,
          opacity: overlayOpacity
        }}
      />
      
      {/* Content layer with animations */}
      <div 
        ref={contentRef}
        className="relative z-10 w-full max-w-7xl mx-auto p-8 md:px-16"
      >
        {children}
      </div>
    </section>
  );
};