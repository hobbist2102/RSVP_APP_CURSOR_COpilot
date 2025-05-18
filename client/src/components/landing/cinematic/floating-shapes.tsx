import React, { useRef, useEffect } from 'react';
import { gsap } from 'gsap';

interface FloatingShapesProps {
  count?: number;
  color?: string;
  size?: number;
  speed?: number;
  opacity?: number;
}

export const FloatingShapes: React.FC<FloatingShapesProps> = ({
  count = 10,
  color = '#ffffff',
  size = 20,
  speed = 20,
  opacity = 0.15
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (!containerRef.current) return;
    
    const shapes = containerRef.current.querySelectorAll('.floating-shape');
    
    // Create random floating animation for each shape
    shapes.forEach((shape) => {
      // Random starting position
      gsap.set(shape, {
        x: `random(0, 100)%`,
        y: `random(0, 100)%`,
        scale: `random(0.5, 1.5)`,
        opacity: `random(${opacity * 0.5}, ${opacity})`,
      });
      
      // Create infinite floating animation with random parameters
      gsap.to(shape, {
        x: `random(-50, 150)%`,
        y: `random(-50, 150)%`,
        rotation: `random(-180, 180)`,
        scale: `random(0.5, 2)`,
        duration: `random(${speed * 0.8}, ${speed * 1.2})`,
        ease: 'sine.inOut',
        repeat: -1,
        yoyo: true,
        delay: `random(0, ${speed / 2})`,
      });
    });
    
    return () => {
      // Cleanup animations
      shapes.forEach((shape) => {
        gsap.killTweensOf(shape);
      });
    };
  }, [count, speed, opacity]);

  // Generate different shape SVGs
  const getRandomShape = (index: number) => {
    const shapeTypes = ['circle', 'square', 'triangle', 'plus', 'hexagon', 'ring'];
    const type = shapeTypes[index % shapeTypes.length];
    
    switch (type) {
      case 'circle':
        return (
          <div className="floating-shape" key={index}>
            <svg width={size} height={size} viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="50" fill={color} />
            </svg>
          </div>
        );
      case 'square':
        return (
          <div className="floating-shape" key={index}>
            <svg width={size} height={size} viewBox="0 0 100 100">
              <rect width="100" height="100" fill={color} />
            </svg>
          </div>
        );
      case 'triangle':
        return (
          <div className="floating-shape" key={index}>
            <svg width={size} height={size} viewBox="0 0 100 100">
              <polygon points="50,0 100,100 0,100" fill={color} />
            </svg>
          </div>
        );
      case 'plus':
        return (
          <div className="floating-shape" key={index}>
            <svg width={size} height={size} viewBox="0 0 100 100">
              <rect x="35" y="0" width="30" height="100" fill={color} />
              <rect x="0" y="35" width="100" height="30" fill={color} />
            </svg>
          </div>
        );
      case 'hexagon':
        return (
          <div className="floating-shape" key={index}>
            <svg width={size} height={size} viewBox="0 0 100 100">
              <polygon points="50,0 100,25 100,75 50,100 0,75 0,25" fill={color} />
            </svg>
          </div>
        );
      case 'ring':
        return (
          <div className="floating-shape" key={index}>
            <svg width={size} height={size} viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="45" stroke={color} strokeWidth="10" fill="none" />
            </svg>
          </div>
        );
      default:
        return (
          <div className="floating-shape" key={index}>
            <svg width={size} height={size} viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="50" fill={color} />
            </svg>
          </div>
        );
    }
  };

  // Create multiple shapes
  const renderShapes = () => {
    return Array.from({ length: count }).map((_, index) => getRandomShape(index));
  };

  return (
    <div 
      ref={containerRef} 
      className="absolute inset-0 overflow-hidden pointer-events-none"
      aria-hidden="true"
    >
      {renderShapes()}
    </div>
  );
};