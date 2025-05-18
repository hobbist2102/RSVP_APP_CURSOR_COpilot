import React, { useRef } from 'react';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';

interface ParallaxTextProps {
  text: string;
  subtext?: string;
  align?: 'left' | 'center' | 'right';
  size?: 'small' | 'medium' | 'large' | 'xl';
  gradient?: boolean;
  reveal?: boolean;
  className?: string;
}

export const ParallaxText: React.FC<ParallaxTextProps> = ({
  text,
  subtext,
  align = 'center',
  size = 'large',
  gradient = false,
  reveal = true,
  className
}) => {
  const textRef = useRef<HTMLDivElement>(null);
  
  useGSAP(() => {
    if (textRef.current) {
      // Import ScrollTrigger dynamically
      import('gsap/ScrollTrigger').then(({ ScrollTrigger }) => {
        gsap.registerPlugin(ScrollTrigger);
        
        // Split text into words and characters for animation
        const words = textRef.current.querySelectorAll('.word');
        
        if (reveal) {
          // Stagger reveal animation for each word
          gsap.fromTo(words, 
            { y: 50, opacity: 0 },
            {
              y: 0,
              opacity: 1,
              stagger: 0.1,
              duration: 1,
              ease: "power2.out",
              scrollTrigger: {
                trigger: textRef.current,
                start: "top 80%",
                toggleActions: "play none none reset"
              }
            }
          );
        }
        
        // Add slight parallax effect on scroll
        gsap.to(textRef.current, {
          y: -30,
          scrollTrigger: {
            trigger: textRef.current,
            start: "top bottom",
            end: "bottom top",
            scrub: true
          }
        });
      });
    }
  }, { scope: textRef });
  
  // Split text into individual words for animation
  const renderWords = () => {
    return text.split(' ').map((word, index) => (
      <span key={index} className="word inline-block mr-[0.25em] transform-gpu">
        {word}
      </span>
    ));
  };
  
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
  
  return (
    <div ref={textRef} className={`parallax-text ${className || ''}`}>
      <h2 
        className={`
          font-bold leading-tight 
          ${sizeClasses[size]} 
          ${alignClasses[align]} 
          ${gradientClass}
        `}
      >
        {renderWords()}
      </h2>
      
      {subtext && (
        <p className={`mt-4 text-lg md:text-xl opacity-80 ${alignClasses[align]}`}>
          {subtext}
        </p>
      )}
    </div>
  );
};