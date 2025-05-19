import React, { useEffect, useRef, useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";

// Import custom styles for immersive landing page
import "@/styles/immersive-landing.css";

// Register ScrollTrigger plugin
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

// Simple throttle function for mouse move events
const throttle = (func: Function, limit: number) => {
  let inThrottle: boolean;
  return function(this: any, ...args: any[]) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

export default function ImmersiveLanding() {
  // Refs for sections
  const heroRef = useRef<HTMLDivElement>(null);
  const problemRef = useRef<HTMLDivElement>(null);
  const solutionRef = useRef<HTMLDivElement>(null);
  const pageRef = useRef<HTMLDivElement>(null);
  const transportRef = useRef<HTMLDivElement>(null);
  const communicationRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  
  // Canvas for particle animation
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Mouse position for subtle parallax effect
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  // Set up mouse tracking for subtle parallax
  useEffect(() => {
    if (typeof window === "undefined") return;
    
    // Throttled handler to reduce CPU usage
    const handleMouseMove = throttle((e: MouseEvent) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth) - 0.5,
        y: (e.clientY / window.innerHeight) - 0.5
      });
    }, 50); // 50ms throttle

    window.addEventListener("mousemove", handleMouseMove);
    
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  // Basic page animations - minimal for memory efficiency
  useEffect(() => {
    if (typeof window === "undefined") return;
    
    // Create GSAP context for easier cleanup
    const ctx = gsap.context(() => {
      // Hero section animations
      if (heroRef.current) {
        // Simple fade-in animations
        gsap.from(".hero-title", {
          opacity: 0,
          y: 30,
          duration: 0.8,
          delay: 0.2
        });
        
        gsap.from(".hero-subtitle", {
          opacity: 0,
          y: 20,
          duration: 0.6,
          delay: 0.8
        });
        
        gsap.from(".hero-buttons", {
          opacity: 0,
          duration: 0.5,
          delay: 1.2
        });
      }
      
      // Problem section animation
      if (problemRef.current) {
        gsap.from(".problem-title", {
          opacity: 0,
          y: 30,
          duration: 0.7,
          scrollTrigger: {
            trigger: problemRef.current,
            start: "top 80%"
          }
        });
      }
      
      // Solution section animation
      if (solutionRef.current) {
        gsap.from(".solution-title", {
          opacity: 0,
          y: 30,
          duration: 0.7,
          scrollTrigger: {
            trigger: solutionRef.current,
            start: "top 80%"
          }
        });
      }
      
      // Transport section animation
      if (transportRef.current) {
        gsap.from(".transport-title", {
          opacity: 0,
          y: 30,
          duration: 0.7,
          scrollTrigger: {
            trigger: transportRef.current,
            start: "top 80%"
          }
        });
      }
      
      // Communication section animation
      if (communicationRef.current) {
        gsap.from(".communication-title", {
          opacity: 0,
          y: 30,
          duration: 0.7,
          scrollTrigger: {
            trigger: communicationRef.current,
            start: "top 80%"
          }
        });
      }
      
      // CTA section animation
      if (ctaRef.current) {
        gsap.from(".cta-content", {
          opacity: 0,
          y: 20,
          duration: 0.6,
          scrollTrigger: {
            trigger: ctaRef.current,
            start: "top 85%"
          }
        });
      }
    }, pageRef);
    
    // Initialize canvas-based particles
    initializeCanvas();
    
    // Cleanup function
    return () => {
      ctx.revert();
      
      // Cleanup canvas animation
      if (canvasRef.current) {
        const canvas = canvasRef.current;
        const animationId = (canvas as any).__animationId;
        if (animationId) {
          cancelAnimationFrame(animationId);
        }
      }
      
      // Kill all ScrollTriggers
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, []);
  
  // Initialize canvas-based particles animation - much more memory efficient than DOM elements
  const initializeCanvas = () => {
    if (typeof window === "undefined") return;
    
    // Create canvas element
    const canvas = document.createElement('canvas');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    canvas.style.position = 'fixed';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.pointerEvents = 'none';
    canvas.style.zIndex = '10';
    canvas.style.opacity = '0.7';
    
    // Store in ref for cleanup
    canvasRef.current = canvas;
    
    // Get context
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Particle settings - reduced count for memory efficiency
    const particleCount = 15;
    const particles = [];
    
    // Create particles with initial positions
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        radius: 1 + Math.random() * 2,
        speed: 0.2 + Math.random() * 0.3,
        angle: Math.random() * Math.PI * 2,
        opacity: 0.3 + Math.random() * 0.3
      });
    }
    
    // Animation function - optimized for minimal CPU usage
    let lastFrameTime = 0;
    const animate = (timestamp: number) => {
      // Limit to 30fps for performance
      if (timestamp - lastFrameTime < 33) {
        const animationId = requestAnimationFrame(animate);
        (canvas as any).__animationId = animationId;
        return;
      }
      
      lastFrameTime = timestamp;
      
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Update and draw particles
      ctx.fillStyle = 'rgba(212, 185, 118, 0.5)';
      
      for (let i = 0; i < particleCount; i++) {
        const p = particles[i];
        
        // Update position with very subtle movement
        p.x += Math.cos(p.angle) * p.speed;
        p.y += Math.sin(p.angle) * p.speed;
        
        // Bounce off edges
        if (p.x < 0 || p.x > canvas.width) p.angle = Math.PI - p.angle;
        if (p.y < 0 || p.y > canvas.height) p.angle = -p.angle;
        
        // Draw particle
        ctx.globalAlpha = p.opacity;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();
      }
      
      // Draw connections (limited number)
      ctx.strokeStyle = 'rgba(212, 185, 118, 0.15)';
      ctx.lineWidth = 0.5;
      
      const maxConnections = 10; // Limited for performance
      for (let i = 0; i < maxConnections; i++) {
        const p1 = particles[i];
        const p2 = particles[(i + 1) % particleCount];
        
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.stroke();
      }
      
      // Continue animation loop
      const animationId = requestAnimationFrame(animate);
      (canvas as any).__animationId = animationId;
    };
    
    // Start animation
    const animationId = requestAnimationFrame(animate);
    (canvas as any).__animationId = animationId;
    
    // Add to DOM
    const container = document.getElementById('particles-container');
    if (container) {
      container.appendChild(canvas);
    }
    
    // Handle window resize
    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    
    window.addEventListener('resize', handleResize, { passive: true });
    (canvas as any).__cleanup = () => {
      window.removeEventListener('resize', handleResize);
    };
  };
  
  // Apply subtle parallax effect based on mouse position
  const getParallaxStyle = (factor: number) => {
    return {
      transform: `translate(${mousePosition.x * factor * 20}px, ${mousePosition.y * factor * 20}px)`
    };
  };

  return (
    <div ref={pageRef} className="immersive-landing">
      {/* Particles container */}
      <div id="particles-container" />
      
      {/* Hero Section */}
      <section ref={heroRef} className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">
            Wedding Planning<br />Reimagined
          </h1>
          <p className="hero-subtitle">
            Create unforgettable wedding experiences with our intelligent planning platform
          </p>
          <div className="hero-buttons">
            <Link href="/auth/register">
              <Button size="lg" className="mr-4">Get Started</Button>
            </Link>
            <Link href="/about">
              <Button variant="outline" size="lg">Learn More</Button>
            </Link>
          </div>
        </div>
        {/* Decorative elements */}
        <div className="hero-decoration">
          <div className="decoration-element" style={getParallaxStyle(0.5)} />
          <div className="decoration-element" style={getParallaxStyle(0.3)} />
        </div>
      </section>
      
      {/* Problem Section */}
      <section ref={problemRef} className="problem-section">
        <div className="container">
          <h2 className="problem-title section-title">The Challenge</h2>
          <div className="problem-cards">
            <Card className="problem-card">
              <div className="card-content">
                <h3>Guest Management</h3>
                <p>Tracking RSVPs, meal preferences, and special requests becomes overwhelming.</p>
              </div>
            </Card>
            <Card className="problem-card">
              <div className="card-content">
                <h3>Communication</h3>
                <p>Keeping everyone informed about schedule changes and important details.</p>
              </div>
            </Card>
            <Card className="problem-card">
              <div className="card-content">
                <h3>Logistics</h3>
                <p>Coordinating venues, vendors, and transportation across multiple events.</p>
              </div>
            </Card>
          </div>
        </div>
      </section>
      
      {/* Solution Section */}
      <section ref={solutionRef} className="solution-section">
        <div className="container">
          <h2 className="solution-title section-title">Our Solution</h2>
          <div className="solution-cards">
            <Card className="solution-card">
              <div className="card-content">
                <h3>Smart RSVP System</h3>
                <p>Automated tracking with customizable forms and real-time updates.</p>
              </div>
            </Card>
            <Card className="solution-card">
              <div className="card-content">
                <h3>Multichannel Notifications</h3>
                <p>Email, WhatsApp, and SMS notifications keep everyone informed.</p>
              </div>
            </Card>
            <Card className="solution-card">
              <div className="card-content">
                <h3>Event Dashboard</h3>
                <p>Centralized management for all wedding events and activities.</p>
              </div>
            </Card>
          </div>
        </div>
      </section>
      
      {/* Transport Section */}
      <section ref={transportRef} className="transport-section">
        <div className="container">
          <h2 className="transport-title section-title">Transportation Management</h2>
          <div className="transport-content">
            <div className="transport-info">
              <p>Our platform simplifies guest transportation with:</p>
              <ul>
                <li>Shuttle scheduling and tracking</li>
                <li>Group transportation organization</li>
                <li>Pickup and dropoff management</li>
                <li>Transportation preferences in RSVP</li>
              </ul>
            </div>
            <div className="transport-image">
              {/* Simple image placeholder */}
              <div className="image-placeholder"></div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Communication Section */}
      <section ref={communicationRef} className="communication-section">
        <div className="container">
          <h2 className="communication-title section-title">Seamless Communication</h2>
          <div className="communication-content">
            <div className="communication-image">
              {/* Simple image placeholder */}
              <div className="image-placeholder"></div>
            </div>
            <div className="communication-info">
              <p>Keep everyone updated with:</p>
              <ul>
                <li>Email and SMS templates</li>
                <li>WhatsApp integration</li>
                <li>Automated reminders</li>
                <li>RSVP follow-ups</li>
              </ul>
            </div>
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section ref={ctaRef} className="cta-section">
        <div className="container">
          <div className="cta-content">
            <h2>Ready to create your perfect wedding?</h2>
            <p>Join thousands of couples who have simplified their wedding planning</p>
            <Link href="/auth/register">
              <Button size="lg" className="cta-button">Get Started Now</Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}