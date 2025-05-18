import React, { useRef, useEffect, useState, ReactNode } from 'react';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ScrollToPlugin } from 'gsap/ScrollToPlugin';

// Register plugins immediately to avoid initialization issues
gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

interface ScrollContainerProps {
  children: ReactNode;
}

/**
 * Main container for the cinematic scrolling experience
 * This component initializes GSAP ScrollTrigger and manages the overall scroll experience
 */
export const ScrollContainer: React.FC<ScrollContainerProps> = ({ children }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isReady, setIsReady] = useState(false);

  // Initialize ScrollTrigger with proper configuration
  useEffect(() => {
    // Basic ScrollTrigger configuration
    ScrollTrigger.config({ 
      limitCallbacks: true,
      ignoreMobileResize: true 
    });
    
    // Set body overflow to ensure proper scrolling behavior
    document.body.style.overflow = "auto";
    document.body.style.height = "auto";

    // Set a small delay to ensure DOM is fully rendered
    const timer = setTimeout(() => {
      setIsReady(true);
      
      // Refresh ScrollTrigger after everything is loaded
      ScrollTrigger.refresh(true);
    }, 300);
    
    return () => {
      clearTimeout(timer);
      // Kill all ScrollTriggers when component unmounts
      ScrollTrigger.getAll().forEach(st => st.kill());
    };
  }, []);

  // Initialize main scroll effect
  useGSAP(() => {
    if (isReady && containerRef.current) {
      // Setup smooth scrolling behaviors
      
      // Initialize section styling
      gsap.set(".cinematic-section", { 
        position: "relative",
        zIndex: 1,
        overflow: "hidden"
      });
      
      // Setup smooth scrolling to anchors
      const anchors = document.querySelectorAll('a[href^="#"]');
      anchors.forEach(anchor => {
        anchor.addEventListener('click', (e) => {
          e.preventDefault();
          const targetId = (e.currentTarget as HTMLAnchorElement).getAttribute('href');
          if (targetId && targetId !== '#') {
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
              gsap.to(window, {
                duration: 1,
                scrollTo: {
                  y: targetElement,
                  offsetY: 0
                },
                ease: "power3.inOut"
              });
            }
          }
        });
      });
    }
  }, { scope: containerRef, dependencies: [isReady] });

  return (
    <div 
      ref={containerRef} 
      className="cinematic-scroll-container w-full overflow-hidden relative"
      style={{ 
        perspective: "1000px",
        perspectiveOrigin: "center center"
      }}
    >
      {children}
    </div>
  );
};