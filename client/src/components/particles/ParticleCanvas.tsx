import React, { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  size: number;
  speedX: number;
  speedY: number;
  color: string;
  alpha: number;
}

interface ParticleCanvasProps {
  count?: number;
  color?: string;
  backgroundColor?: string;
  maxSpeed?: number;
  maxSize?: number;
}

/**
 * A highly optimized particle animation component using canvas
 * based on performance best practices to minimize memory usage
 */
const ParticleCanvas: React.FC<ParticleCanvasProps> = ({
  count = 15, // Reduced particle count for better performance
  color = '#d4b976',
  backgroundColor = 'transparent',
  maxSpeed = 0.3,
  maxSize = 2
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);
  
  // Use refs instead of state for particles to avoid re-renders
  const particlesRef = useRef<Particle[]>([]);
  
  const initParticles = (width: number, height: number) => {
    // Create fixed number of particles in memory
    const particles: Particle[] = [];
    
    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() * maxSize + 0.5,
        speedX: (Math.random() - 0.5) * maxSpeed,
        speedY: (Math.random() - 0.5) * maxSpeed,
        color,
        alpha: 0.3 + Math.random() * 0.4
      });
    }
    
    particlesRef.current = particles;
  };
  
  const updateAndDrawParticles = (
    ctx: CanvasRenderingContext2D, 
    width: number, 
    height: number,
    timestamp: number
  ) => {
    // Limit to 30fps for better performance
    if (timestamp - lastTimeRef.current < 33) {
      animationRef.current = requestAnimationFrame((time) => 
        updateAndDrawParticles(ctx, width, height, time)
      );
      return;
    }
    
    lastTimeRef.current = timestamp;
    
    // Clear canvas
    ctx.fillStyle = backgroundColor;
    ctx.clearRect(0, 0, width, height);
    
    const particles = particlesRef.current;
    
    // Update and draw particles
    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      
      // Update position
      p.x += p.speedX;
      p.y += p.speedY;
      
      // Bounce off edges with minimal calculations
      if (p.x < 0 || p.x > width) p.speedX *= -1;
      if (p.y < 0 || p.y > height) p.speedY *= -1;
      
      // Draw particle with minimal operations
      ctx.globalAlpha = p.alpha;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    }
    
    // Draw connections between closest particles
    ctx.globalAlpha = 0.15;
    ctx.strokeStyle = color;
    ctx.lineWidth = 0.5;
    
    // Limit connections to nearest 8 particles for performance
    const maxConnections = Math.min(8, count);
    
    for (let i = 0; i < particles.length; i++) {
      const p1 = particles[i];
      // Connect only to nearest particles in a predictable pattern
      for (let j = 1; j <= maxConnections / 2; j++) {
        const idx = (i + j) % particles.length;
        const p2 = particles[idx];
        
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.stroke();
      }
    }
    
    // Continue animation loop
    animationRef.current = requestAnimationFrame((time) => 
      updateAndDrawParticles(ctx, width, height, time)
    );
  };
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Set canvas dimensions to full window
    const handleResize = () => {
      const { innerWidth, innerHeight } = window;
      canvas.width = innerWidth;
      canvas.height = innerHeight;
      
      // Reinitialize particles when resizing
      initParticles(innerWidth, innerHeight);
    };
    
    // Initial setup
    handleResize();
    window.addEventListener('resize', handleResize);
    
    // Start animation
    animationRef.current = requestAnimationFrame((time) => 
      updateAndDrawParticles(ctx, canvas.width, canvas.height, time)
    );
    
    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationRef.current);
    };
  }, [color, backgroundColor, count, maxSpeed, maxSize]);
  
  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 10
      }}
    />
  );
};

export default ParticleCanvas;