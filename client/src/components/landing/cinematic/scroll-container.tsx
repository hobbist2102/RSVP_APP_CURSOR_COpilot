import React, { useRef, useEffect, useState, ReactNode, memo } from 'react';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ScrollToPlugin } from 'gsap/ScrollToPlugin';

// Register plugins immediately to avoid initialization issues
// Only register if window exists to avoid SSR issues
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);
}

interface ScrollContainerProps {
  children: ReactNode;
  debug?: boolean;
}

/**
 * Main container for the cinematic scrolling experience
 * This component initializes GSAP ScrollTrigger and manages the overall scroll experience
 * Using memo to prevent unnecessary re-renders
 */
export const ScrollContainer: React.FC<ScrollContainerProps> = memo(({ 
  children, 
  debug = false // Set to true to show scroll markers for debugging
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isReady, setIsReady] = useState(false);
  const gsapContextRef = useRef<gsap.Context | null>(null);
  const handlerSetRef = useRef(new Set<HTMLAnchorElement>());

  // Initialize ScrollTrigger with proper configuration
  useEffect(() => {
    // Skip initialization if window is not available (SSR)
    if (typeof window === 'undefined') return;
    
    // Enable debugging if needed
    if (debug) {
      ScrollTrigger.defaults({ markers: true });
    }
    
    // Basic ScrollTrigger configuration with optimized settings
    ScrollTrigger.config({ 
      limitCallbacks: true,
      ignoreMobileResize: true,
      autoRefreshEvents: "visibilitychange,DOMContentLoaded,load", // Removed resize to reduce refresh frequency
      syncInterval: 250 // Increased sync interval for better performance
    });
    
    // Set body overflow to ensure proper scrolling behavior
    document.body.style.overflow = "auto";
    document.body.style.height = "auto";

    // Force immediate refresh with less aggressive settings
    ScrollTrigger.refresh(false); // false = don't force recalculation of all positions
    
    // Set a small delay to ensure DOM is fully rendered
    const timer = setTimeout(() => {
      setIsReady(true);
    }, 300); // Reduced delay for better initial load experience
    
    return () => {
      clearTimeout(timer);
      
      // Properly clean up all ScrollTriggers
      const triggers = ScrollTrigger.getAll();
      if (triggers.length > 0) {
        triggers.forEach(st => st.kill());
      }
    };
  }, [debug]);

  // Initialize main scroll effect
  useGSAP(() => {
    if (!isReady || !containerRef.current || typeof window === 'undefined') return;
    
    try {
      // Create GSAP context for proper cleanup
      gsapContextRef.current = gsap.context(() => {
        // Initialize section styling with minimal will-change
        // Only set essential properties to avoid excessive GPU memory usage
        gsap.set(".cinematic-section", { 
          position: "relative",
          zIndex: 1,
          overflow: "hidden"
          // Removed willChange to reduce GPU memory consumption
        });
        
        // Setup smooth scrolling to anchors with optimized handler
        const handleAnchorClick = (e: Event) => {
          e.preventDefault();
          const anchor = e.currentTarget as HTMLAnchorElement;
          const targetId = anchor.getAttribute('href');
          
          if (!targetId || targetId === '#') return;
          
          const targetElement = document.querySelector(targetId);
          if (!targetElement) return;
          
          // Use simpler animation with fewer properties
          gsap.to(window, {
            duration: 0.8, // Shorter duration
            scrollTo: {
              y: targetElement,
              offsetY: 0,
              autoKill: true
            },
            ease: "power2.out", // Simpler ease function
            onComplete: () => {
              history.pushState(null, '', targetId);
            }
          });
        };
        
        // Only attach event listeners to new anchors
        // This prevents memory leaks from duplicate handlers
        const anchors = document.querySelectorAll('a[href^="#"]');
        anchors.forEach(anchor => {
          if (!handlerSetRef.current.has(anchor as HTMLAnchorElement)) {
            anchor.addEventListener('click', handleAnchorClick);
            handlerSetRef.current.add(anchor as HTMLAnchorElement);
          }
        });
      });
      
      // Return cleanup function for GSAP context
      return () => {
        if (gsapContextRef.current) {
          gsapContextRef.current.revert();
        }
      };
    } catch (error) {
      // Silent fail to avoid console errors in production
      if (debug) {
        console.error("Error in scroll setup:", error);
      }
    }
  }, { scope: containerRef, dependencies: [isReady] });

  // Proper anchor event cleanup on unmount
  useEffect(() => {
    return () => {
      handlerSetRef.current.clear();
    };
  }, []);

  return (
    <div 
      ref={containerRef} 
      className="cinematic-scroll-container w-full overflow-hidden relative"
      style={{ 
        perspective: "1000px",
        perspectiveOrigin: "center center"
        // Removed willChange to reduce GPU memory consumption
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
});