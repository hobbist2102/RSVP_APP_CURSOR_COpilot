import React, { useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Ensure ScrollTrigger is registered
gsap.registerPlugin(ScrollTrigger);

interface ParallaxTextProps {
  text: string;
  subtext?: string;
  align?: 'left' | 'center' | 'right';
  size?: 'small' | 'medium' | 'large' | 'xl';
  gradient?: boolean;
  reveal?: boolean;
  className?: string;
  animationMode?: 'stagger' | 'reveal' | 'chars' | 'cinema';
  speed?: number;
  headingElement?: 'h1' | 'h2' | 'h3' | 'h4';
  debug?: boolean;
}

export const ParallaxText: React.FC<ParallaxTextProps> = ({
  text,
  subtext,
  align = 'center',
  size = 'large',
  gradient = false,
  reveal = true,
  className,
  animationMode = 'stagger',
  speed = 1,
  headingElement = 'h2',
  debug = false
}) => {
  const textRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const subtextRef = useRef<HTMLParagraphElement>(null);
  
  // Split text function to handle both word and character splits
  const splitTextIntoElements = (text: string, type: 'words' | 'chars') => {
    if (type === 'words') {
      return text.split(' ').map((word, index) => (
        <span key={index} className="word inline-block mr-[0.25em] transform-gpu opacity-0">
          {word}
        </span>
      ));
    } else {
      // Split into individual characters
      return Array.from(text).map((char, index) => (
        <span key={index} className="char inline-block transform-gpu opacity-0">
          {char === ' ' ? '\u00A0' : char}
        </span>
      ));
    }
  };
  
  useGSAP(() => {
    if (!textRef.current) return;
    
    const container = textRef.current;
    const heading = headingRef.current;
    const subtitle = subtextRef.current;
    
    if (!heading) return;
    
    // Setup scroll animation
    const scrollConfig = {
      trigger: container,
      start: "top 80%",
      end: "bottom 20%",
      toggleActions: "play none none reverse",
      markers: debug,
    };
    
    const words = container.querySelectorAll('.word');
    const chars = container.querySelectorAll('.char');
    
    // Create master timeline
    const tl = gsap.timeline({
      scrollTrigger: scrollConfig,
      defaults: { 
        ease: "power3.out",
        duration: 0.8 * (1 / speed)
      }
    });
    
    // Create animations based on selected mode
    switch (animationMode) {
      case 'cinema':
        // Cinematic text reveal - scale and move words with wave effect
        tl.set(words, { opacity: 0, y: 40, scale: 0.9 });
        tl.to(words, {
          opacity: 1, 
          y: 0, 
          scale: 1,
          stagger: {
            amount: 0.6, 
            from: "start",
            ease: "power2.out"
          },
        });
        
        // Dramatic subtitle fade-in
        if (subtitle) {
          tl.fromTo(
            subtitle, 
            { opacity: 0, y: 20 },
            { opacity: 1, y: 0, duration: 1 },
            0.4
          );
        }
        
        // Add parallax scroll effect
        gsap.to(container, {
          y: -40 * speed,
          scrollTrigger: {
            trigger: container,
            start: "top bottom",
            end: "bottom top",
            scrub: 0.5,
          }
        });
        break;

      case 'chars':
        // Character-by-character animation for a more detailed effect
        tl.set(chars, { opacity: 0, y: 20, rotateX: -90 });
        tl.to(chars, {
          opacity: 1,
          y: 0,
          rotateX: 0,
          stagger: 0.02,
          duration: 0.6
        });
        
        if (subtitle) {
          tl.fromTo(
            subtitle, 
            { opacity: 0 },
            { opacity: 1, duration: 0.8 },
            0.5
          );
        }
        break;

      case 'reveal':
        // Clean reveal with an attractive mask effect
        gsap.set(heading, { 
          clipPath: 'polygon(0 0, 0 0, 0 100%, 0 100%)',
          opacity: 1
        });
        
        tl.to(heading, {
          clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 100%)',
          duration: 1.2,
          ease: "power3.inOut"
        });
        
        if (subtitle) {
          gsap.set(subtitle, { opacity: 0 });
          tl.to(subtitle, {
            opacity: 1,
            duration: 0.8
          }, 0.4);
        }
        break;

      case 'stagger':
      default:
        // Standard staggered reveal animation
        tl.to(words, {
          opacity: 1,
          y: 0,
          stagger: 0.08 * speed,
          duration: 0.6
        });
        
        if (subtitle) {
          tl.fromTo(
            subtitle, 
            { opacity: 0, y: 10 },
            { opacity: 1, y: 0, duration: 0.7 },
            0.4
          );
        }
        
        // Simple parallax scroll effect
        gsap.to(container, {
          y: -25 * speed,
          scrollTrigger: {
            trigger: container,
            start: "top bottom",
            end: "bottom top",
            scrub: true,
          }
        });
    }
    
    return () => {
      if (tl.scrollTrigger) {
        tl.scrollTrigger.kill();
      }
      tl.kill();
    };
  }, { scope: textRef });
  
  // Define text size classes
  const sizeClasses = {
    small: 'text-2xl md:text-3xl',
    medium: 'text-3xl md:text-5xl',
    large: 'text-4xl md:text-6xl lg:text-7xl',
    xl: 'text-5xl md:text-7xl lg:text-8xl'
  };
  
  // Define alignment classes
  const alignClasses = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right'
  };
  
  // Gradient text effect
  const gradientClass = gradient 
    ? 'bg-gradient-to-r from-purple-300 via-pink-300 to-indigo-300 text-transparent bg-clip-text'
    : '';
  
  // Determine if we need to split by words or characters
  const shouldSplitChars = animationMode === 'chars';
  
  // Create the heading element based on headingElement prop
  const HeadingTag = headingElement as any;
  
  return (
    <div ref={textRef} className={`parallax-text overflow-hidden ${className || ''}`}>
      <HeadingTag 
        ref={headingRef}
        className={`
          font-bold leading-tight relative
          ${sizeClasses[size]} 
          ${alignClasses[align]} 
          ${gradientClass}
        `}
      >
        {shouldSplitChars ? splitTextIntoElements(text, 'chars') : splitTextIntoElements(text, 'words')}
      </HeadingTag>
      
      {subtext && (
        <p 
          ref={subtextRef}
          className={`mt-4 text-lg md:text-xl opacity-0 ${alignClasses[align]}`}
        >
          {subtext}
        </p>
      )}
    </div>
  );
};