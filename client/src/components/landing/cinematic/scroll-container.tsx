import React, { useRef, useEffect, useState, ReactNode } from 'react';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ScrollToPlugin } from 'gsap/ScrollToPlugin';

// Register plugins immediately to avoid initialization issues
gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

interface ScrollContainerProps {
  children: ReactNode;
  debug?: boolean;
}

/**
 * Main container for the cinematic scrolling experience
 * This component initializes GSAP ScrollTrigger and manages the overall scroll experience
 */
export const ScrollContainer: React.FC<ScrollContainerProps> = ({ 
  children, 
  debug = false // Set to true to show scroll markers for debugging
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isReady, setIsReady] = useState(false);

  // Initialize ScrollTrigger with proper configuration
  useEffect(() => {
    console.log("ScrollContainer mounted, initializing GSAP...");
    
    // Enable debugging if needed
    if (debug) {
      ScrollTrigger.defaults({ markers: true });
    }
    
    // Basic ScrollTrigger configuration
    ScrollTrigger.config({ 
      limitCallbacks: true,
      ignoreMobileResize: true,
      autoRefreshEvents: "visibilitychange,DOMContentLoaded,load,resize" // Added more refresh events
    });
    
    // Set body overflow to ensure proper scrolling behavior
    document.body.style.overflow = "auto";
    document.body.style.height = "auto";

    // Force immediate refresh
    ScrollTrigger.refresh();
    
    // Set a small delay to ensure DOM is fully rendered
    const timer = setTimeout(() => {
      setIsReady(true);
      console.log("ScrollContainer ready, refreshing ScrollTrigger...");
      
      // Refresh ScrollTrigger after everything is loaded
      ScrollTrigger.refresh(true);
    }, 500); // Extended delay for more reliable initialization
    
    return () => {
      clearTimeout(timer);
      console.log("ScrollContainer unmounting, cleaning up...");
      
      // Kill all ScrollTriggers when component unmounts
      ScrollTrigger.getAll().forEach(st => {
        console.log("Killing ScrollTrigger:", st.vars);
        st.kill();
      });
      
      // Final refresh to ensure clean state
      ScrollTrigger.refresh();
    };
  }, [debug]);

  // Initialize main scroll effect
  useGSAP(() => {
    if (!isReady || !containerRef.current) return;
    
    console.log("Setting up scroll animations...");
    
    try {
      // Initialize section styling with will-change for better performance
      gsap.set(".cinematic-section", { 
        position: "relative",
        zIndex: 1,
        overflow: "hidden",
        willChange: "transform, opacity" // Hint browser for optimization
      });
      
      // Setup smooth scrolling to anchors with proper cleanup
      const clickHandler = (e: Event) => {
        e.preventDefault();
        const anchor = e.currentTarget as HTMLAnchorElement;
        const targetId = anchor.getAttribute('href');
        
        if (targetId && targetId !== '#') {
          const targetElement = document.querySelector(targetId);
          if (targetElement) {
            gsap.to(window, {
              duration: 1,
              scrollTo: {
                y: targetElement,
                offsetY: 0,
                autoKill: true
              },
              ease: "power3.inOut",
              onComplete: () => {
                // Update URL hash without triggering scroll
                history.pushState(null, '', targetId);
              }
            });
          }
        }
      };
      
      // Attach click handlers with cleanup
      const anchors = document.querySelectorAll('a[href^="#"]');
      anchors.forEach(anchor => {
        anchor.addEventListener('click', clickHandler);
      });
      
      // Return cleanup function
      return () => {
        anchors.forEach(anchor => {
          anchor.removeEventListener('click', clickHandler);
        });
      };
    } catch (error) {
      console.error("Error in scroll setup:", error);
    }
  }, { scope: containerRef, dependencies: [isReady] });

  return (
    <div 
      ref={containerRef} 
      className="cinematic-scroll-container w-full overflow-hidden relative"
      style={{ 
        perspective: "1000px",
        perspectiveOrigin: "center center",
        willChange: "transform-style, perspective-origin" // Performance hint
      }}
    >
      {children}
      
      {/* Debug info */}
      {debug && (
        <div className="fixed bottom-4 right-4 bg-black/80 text-white p-2 z-50 text-xs rounded">
          <div>Scroll: {typeof window !== 'undefined' ? Math.round(window.scrollY) : 0}px</div>
          <div>Triggers: {ScrollTrigger.getAll().length}</div>
        </div>
      )}
    </div>
  );
};