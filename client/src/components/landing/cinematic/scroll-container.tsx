import React, { useRef, useEffect, useState, ReactNode } from 'react';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';

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

  // Initialize ScrollTrigger
  useEffect(() => {
    // Register ScrollTrigger plugin
    if (typeof window !== 'undefined') {
      // Import ScrollTrigger dynamically to avoid SSR issues
      import('gsap/ScrollTrigger').then(({ ScrollTrigger }) => {
        gsap.registerPlugin(ScrollTrigger);
        
        // Set a small delay to ensure DOM is fully rendered
        const timer = setTimeout(() => {
          setIsReady(true);
        }, 100);
        
        return () => {
          clearTimeout(timer);
          // Kill all ScrollTriggers when component unmounts
          ScrollTrigger.getAll().forEach(st => st.kill());
        };
      });
    }
  }, []);

  useGSAP(() => {
    if (isReady && containerRef.current) {
      // Create a unified scrolling experience
      gsap.set(".cinematic-section", { 
        position: "relative",
        zIndex: 1,
        overflow: "hidden"
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