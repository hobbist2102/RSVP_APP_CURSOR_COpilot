import React, { useRef, useEffect, useMemo } from 'react';
import { gsap } from 'gsap';

interface FloatingShapesProps {
  count?: number;
  color?: string;
  size?: number;
  speed?: number;
  opacity?: number;
}

export const FloatingShapes: React.FC<FloatingShapesProps> = ({
  count = 6, // Reduced count for better performance
  color = '#ffffff',
  size = 20,
  speed = 30, // Longer animation cycle = less CPU usage
  opacity = 0.15
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Generate different shape SVGs - memoized to prevent re-creation
  const getRandomShape = (index: number) => {
    const shapeTypes = ['circle', 'square', 'triangle', 'plus', 'hexagon', 'ring'];
    const type = shapeTypes[index % shapeTypes.length];
    
    switch (type) {
      case 'circle':
        return (
          <div 
            className="floating-shape" 
            key={index}
            style={{
              position: 'absolute',
              animation: `float-${index % 3} ${speed + index % 5}s infinite ease-in-out`,
            }}
          >
            <svg width={size} height={size} viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="50" fill={color} />
            </svg>
          </div>
        );
      case 'square':
        return (
          <div 
            className="floating-shape" 
            key={index}
            style={{
              position: 'absolute',
              animation: `float-${(index + 1) % 3} ${speed + (index + 1) % 6}s infinite ease-in-out`,
            }}
          >
            <svg width={size} height={size} viewBox="0 0 100 100">
              <rect width="100" height="100" fill={color} />
            </svg>
          </div>
        );
      case 'triangle':
        return (
          <div 
            className="floating-shape" 
            key={index}
            style={{
              position: 'absolute',
              animation: `float-${(index + 2) % 3} ${speed + (index + 2) % 4}s infinite ease-in-out`,
            }}
          >
            <svg width={size} height={size} viewBox="0 0 100 100">
              <polygon points="50,0 100,100 0,100" fill={color} />
            </svg>
          </div>
        );
      case 'plus':
        return (
          <div 
            className="floating-shape" 
            key={index}
            style={{
              position: 'absolute',
              animation: `float-${(index + 3) % 3} ${speed + (index + 3) % 5}s infinite ease-in-out`,
            }}
          >
            <svg width={size} height={size} viewBox="0 0 100 100">
              <rect x="35" y="0" width="30" height="100" fill={color} />
              <rect x="0" y="35" width="100" height="30" fill={color} />
            </svg>
          </div>
        );
      case 'hexagon':
        return (
          <div 
            className="floating-shape" 
            key={index}
            style={{
              position: 'absolute',
              animation: `float-${(index + 4) % 3} ${speed + (index + 1) % 7}s infinite ease-in-out`,
            }}
          >
            <svg width={size} height={size} viewBox="0 0 100 100">
              <polygon points="50,0 100,25 100,75 50,100 0,75 0,25" fill={color} />
            </svg>
          </div>
        );
      case 'ring':
        return (
          <div 
            className="floating-shape" 
            key={index}
            style={{
              position: 'absolute',
              animation: `float-${(index + 5) % 3} ${speed + (index + 2) % 6}s infinite ease-in-out`,
            }}
          >
            <svg width={size} height={size} viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="45" stroke={color} strokeWidth="10" fill="none" />
            </svg>
          </div>
        );
      default:
        return (
          <div 
            className="floating-shape" 
            key={index}
            style={{
              position: 'absolute',
              animation: `float-${index % 3} ${speed + index % 5}s infinite ease-in-out`,
            }}
          >
            <svg width={size} height={size} viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="50" fill={color} />
            </svg>
          </div>
        );
    }
  };

  // Create CSS animations for shapes - use CSS instead of GSAP for better performance
  useEffect(() => {
    // Create and inject CSS animation keyframes
    const styleSheet = document.createElement("style");
    styleSheet.id = "floating-shapes-keyframes";
    styleSheet.textContent = `
      @keyframes float-0 {
        0% { transform: translate(10%, 10%) rotate(0deg); opacity: ${opacity * 0.5}; }
        33% { transform: translate(25%, 30%) rotate(30deg); opacity: ${opacity}; }
        66% { transform: translate(60%, 50%) rotate(60deg); opacity: ${opacity * 0.7}; }
        100% { transform: translate(10%, 10%) rotate(0deg); opacity: ${opacity * 0.5}; }
      }
      @keyframes float-1 {
        0% { transform: translate(70%, 70%) rotate(60deg); opacity: ${opacity * 0.6}; }
        33% { transform: translate(40%, 80%) rotate(30deg); opacity: ${opacity}; }
        66% { transform: translate(10%, 40%) rotate(10deg); opacity: ${opacity * 0.8}; }
        100% { transform: translate(70%, 70%) rotate(60deg); opacity: ${opacity * 0.6}; }
      }
      @keyframes float-2 {
        0% { transform: translate(50%, 30%) rotate(-20deg); opacity: ${opacity * 0.7}; }
        33% { transform: translate(75%, 10%) rotate(10deg); opacity: ${opacity}; }
        66% { transform: translate(30%, 50%) rotate(40deg); opacity: ${opacity * 0.6}; }
        100% { transform: translate(50%, 30%) rotate(-20deg); opacity: ${opacity * 0.7}; }
      }
    `;
    
    // Remove any previous animation styles
    const oldStyle = document.getElementById("floating-shapes-keyframes");
    if (oldStyle) {
      oldStyle.remove();
    }
    
    // Add the new animations
    document.head.appendChild(styleSheet);
    
    // Initial placement of shapes to prevent layout shift
    if (containerRef.current) {
      const shapes = containerRef.current.querySelectorAll('.floating-shape');
      shapes.forEach((shape, i) => {
        const xPos = 10 + (i * 15) % 80;
        const yPos = 10 + (i * 20) % 80;
        (shape as HTMLElement).style.left = `${xPos}%`;
        (shape as HTMLElement).style.top = `${yPos}%`;
      });
    }
    
    // Cleanup function
    return () => {
      // Remove the keyframes style
      if (styleSheet.parentNode) {
        styleSheet.parentNode.removeChild(styleSheet);
      }
    };
  }, [opacity, count]);

  // Create multiple shapes - memoized to prevent recreation on re-render
  const shapes = useMemo(() => {
    return Array.from({ length: count }).map((_, index) => getRandomShape(index));
  }, [count, size, color]);

  return (
    <div 
      ref={containerRef} 
      className="absolute inset-0 overflow-hidden pointer-events-none"
      aria-hidden="true"
    >
      {shapes}
    </div>
  );
};