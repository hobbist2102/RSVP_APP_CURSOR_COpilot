import React, { useRef, useEffect, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { motion } from 'framer-motion';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';
import { AnimatedSection } from '@/components/landing/cinematic/animated-section';
import { ParallaxText } from '@/components/landing/cinematic/parallax-text';
import { FloatingShapes } from '@/components/landing/cinematic/floating-shapes';

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger);

// Typographic Hero Section Component
const Hero = () => {
  const heroRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  
  // Split text into individual characters for 3D animation
  const split3DText = (text: string) => {
    return text.split('').map((char, i) => (
      <span 
        key={i} 
        className="text-3d-char inline-block"
        style={{ 
          '--char-index': i,
          animationDelay: `${i * 0.08}s`,
          transformOrigin: 'center bottom'
        } as React.CSSProperties}
      >
        {char === ' ' ? '\u00A0' : char}
      </span>
    ));
  };
  
  useEffect(() => {
    if (!heroRef.current) return;
    
    try {
      // Set up initial animations
      gsap.set(".hero-char", { opacity: 0, y: 30 });
      gsap.set(".hero-subtitle", { opacity: 0, y: 20 });
      gsap.set(".hero-cta", { opacity: 0, y: 30 });
      gsap.set(".hero-shape", { opacity: 0, scale: 0 });
      
      // Create animation timeline
      const tl = gsap.timeline({ defaults: { ease: "power3.out" }});
      
      // Animate title characters
      tl.to(".hero-char", {
        opacity: 1,
        y: 0,
        stagger: 0.02,
        duration: 0.8,
        ease: "back.out(1.5)"
      });
      
      // Animate subtitle
      tl.to(".hero-subtitle", {
        opacity: 1,
        y: 0,
        duration: 1
      }, "-=0.4");
      
      // Animate CTA buttons
      tl.to(".hero-cta", {
        opacity: 1,
        y: 0,
        stagger: 0.2,
        duration: 0.8
      }, "-=0.6");
      
      // Animate shapes
      tl.to(".hero-shape", {
        opacity: 0.8,
        scale: 1,
        stagger: 0.1,
        duration: 1.2,
        ease: "elastic.out(1, 0.5)"
      }, "-=1.2");
      
      // Add scroll animations
      gsap.to(".hero-content", {
        y: -80,
        opacity: 0,
        scrollTrigger: {
          trigger: heroRef.current,
          start: "top top",
          end: "30% top",
          scrub: 0.8
        }
      });
      
      // Parallax effect on the shapes
      gsap.to(".hero-shape-container", {
        y: 100,
        scrollTrigger: {
          trigger: heroRef.current,
          start: "top top",
          end: "bottom top",
          scrub: 0.5
        }
      });
      
      // Scale effect on background gradient
      gsap.to(".hero-bg-gradient", {
        backgroundPosition: "0% 100%",
        scrollTrigger: {
          trigger: heroRef.current,
          start: "top top",
          end: "bottom top",
          scrub: true
        }
      });
      
      return () => {
        // Clean up animations
        const triggers = ScrollTrigger.getAll();
        triggers.forEach(trigger => trigger.kill());
      };
    } catch (error) {
      console.error("Animation error:", error);
    }
  }, []);
  
  return (
    <div 
      ref={heroRef}
      className="relative h-screen w-full overflow-hidden"
    >
      {/* Gradient Background */}
      <div className="hero-bg-gradient absolute inset-0 bg-gradient-to-b from-purple-900 via-indigo-900 to-black bg-[length:100%_200%] bg-[position:0%_0%]"></div>
      
      {/* Animated shapes in background */}
      <div className="hero-shape-container absolute inset-0 overflow-hidden">
        {/* Large circle */}
        <div className="hero-shape absolute top-1/4 left-1/4 w-96 h-96 rounded-full border-2 border-purple-500/20 transform -translate-x-1/2 -translate-y-1/2"></div>
        
        {/* Medium circle */}
        <div className="hero-shape absolute top-2/3 right-1/4 w-64 h-64 rounded-full border border-indigo-400/30 transform translate-x-1/2 -translate-y-1/2"></div>
        
        {/* Small circle */}
        <div className="hero-shape absolute bottom-1/4 left-1/3 w-32 h-32 rounded-full border border-pink-500/20 transform -translate-x-1/2 translate-y-1/2"></div>
        
        {/* Large square rotated */}
        <div className="hero-shape absolute top-1/2 right-1/3 w-80 h-80 border border-indigo-600/10 transform rotate-45 translate-x-1/2 -translate-y-1/2"></div>
        
        {/* Blurred glowing orbs */}
        <div className="hero-shape absolute top-1/3 left-2/3 w-40 h-40 rounded-full bg-purple-800/10 blur-xl"></div>
        <div className="hero-shape absolute bottom-1/3 right-2/3 w-32 h-32 rounded-full bg-indigo-600/10 blur-xl"></div>
        <div className="hero-shape absolute top-2/3 right-1/2 w-24 h-24 rounded-full bg-pink-700/10 blur-xl"></div>
        
        {/* Floating particles */}
        <div className="hero-shape absolute w-2 h-2 bg-white rounded-full animate-float1 top-1/4 left-1/4 opacity-30"></div>
        <div className="hero-shape absolute w-3 h-3 bg-white rounded-full animate-float2 top-1/3 left-1/2 opacity-30"></div>
        <div className="hero-shape absolute w-2 h-2 bg-white rounded-full animate-float3 top-1/2 left-3/4 opacity-30"></div>
        <div className="hero-shape absolute w-1 h-1 bg-white rounded-full animate-float4 top-2/3 left-1/4 opacity-30"></div>
        <div className="hero-shape absolute w-2 h-2 bg-white rounded-full animate-float5 top-3/4 left-1/2 opacity-30"></div>
      </div>
      
      {/* Subtle overlay gradient for better text contrast */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/70"></div>
      
      {/* Main content */}
      <div className="hero-content relative z-10 h-full flex flex-col items-center justify-center px-6 md:px-8">
        <div className="text-center max-w-5xl mx-auto">
          {/* Animated title */}
          <h1 
            ref={titleRef}
            className="font-script text-6xl md:text-8xl mb-8 leading-tight"
          >
            <span className="block text-3d bg-gradient-to-r from-rose-300 via-purple-300 to-indigo-300 text-transparent bg-clip-text">
              {split3DText("Eternally Yours")}
            </span>
          </h1>
          
          {/* Subtitle with fade in */}
          <p 
            ref={subtitleRef}
            className="hero-subtitle text-white text-xl md:text-2xl max-w-3xl mx-auto mb-12 leading-relaxed"
          >
            The most elegant wedding management platform for Indian weddings.
            From guest management to itinerary planning, we make it seamless.
          </p>
          
          {/* CTA buttons with staggered animation */}
          <div ref={ctaRef} className="flex flex-col sm:flex-row gap-4 justify-center">
            <div className="hero-cta">
              <Button 
                size="lg" 
                className="text-lg bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 border-0 shadow-lg shadow-purple-900/20"
                asChild
              >
                <Link href="/auth">Get Started</Link>
              </Button>
            </div>
            
            <div className="hero-cta">
              <Button 
                size="lg" 
                variant="outline" 
                className="text-lg border-white text-white hover:bg-white/10"
                asChild
              >
                <a href="#chaos">See How It Works</a>
              </Button>
            </div>
          </div>
        </div>
        
        {/* Scroll indicator */}
        <motion.div 
          className="absolute bottom-10 left-1/2 transform -translate-x-1/2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2, duration: 1 }}
        >
          <motion.div
            animate={{ y: [0, 12, 0] }}
            transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
          >
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

// The Chaos section showing the problems planners face
const ChaosSection = () => {
  return (
    <AnimatedSection
      id="chaos"
      backgroundColor="#0D0027"
      animationType="cinematic"
      pinned={true}
      debug={false}
    >
      <div className="relative z-10">
        <ParallaxText
          text="The ceremony is beautiful. The backend is broken."
          subtext="Behind every perfect wedding is a chaotic mess of spreadsheets, WhatsApp threads, and manual coordination."
          size="large"
          gradient={true}
          animationMode="cinema"
        />
        
        <div className="mt-16 w-full max-w-4xl mx-auto relative">
          {/* Floating chaotic elements */}
          <div className="absolute inset-0 pointer-events-none">
            <FloatingShapes count={12} color="#fff" opacity={0.05} />
          </div>
          
          <div className="bg-white/5 backdrop-blur-sm p-8 rounded-xl border border-white/10 shadow-2xl">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2 animate-in">
                <div className="h-6 w-full bg-white/10 rounded"></div>
                <div className="h-6 w-3/4 bg-white/10 rounded"></div>
                <div className="h-6 w-5/6 bg-white/10 rounded"></div>
                <div className="h-6 w-2/3 bg-white/10 rounded"></div>
              </div>
              
              <div className="space-y-2 animate-in">
                <div className="h-6 w-5/6 bg-white/10 rounded"></div>
                <div className="h-6 w-full bg-white/10 rounded"></div>
                <div className="h-6 w-3/4 bg-white/10 rounded"></div>
                <div className="h-6 w-full bg-white/10 rounded"></div>
              </div>
              
              <div className="space-y-2 animate-in">
                <div className="h-6 w-2/3 bg-white/10 rounded"></div>
                <div className="h-6 w-3/4 bg-white/10 rounded"></div>
                <div className="h-6 w-full bg-white/10 rounded"></div>
                <div className="h-6 w-3/4 bg-white/10 rounded"></div>
              </div>
            </div>
            
            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white/5 p-4 rounded flex items-center animate-in">
                <div className="w-10 h-10 rounded-full bg-indigo-500/20 mr-3 flex items-center justify-center text-indigo-300">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-white font-medium">15 Separate Spreadsheets</h3>
                  <p className="text-white/70 text-sm">Managing guests across multiple documents</p>
                </div>
              </div>
              
              <div className="bg-white/5 p-4 rounded flex items-center animate-in">
                <div className="w-10 h-10 rounded-full bg-green-500/20 mr-3 flex items-center justify-center text-green-300">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-white font-medium">Endless WhatsApp Messages</h3>
                  <p className="text-white/70 text-sm">Impossible to track RSVP confirmations</p>
                </div>
              </div>
              
              <div className="bg-white/5 p-4 rounded flex items-center animate-in">
                <div className="w-10 h-10 rounded-full bg-red-500/20 mr-3 flex items-center justify-center text-red-300">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-white font-medium">Manual Coordination</h3>
                  <p className="text-white/70 text-sm">Room and transport allocations by hand</p>
                </div>
              </div>
              
              <div className="bg-white/5 p-4 rounded flex items-center animate-in">
                <div className="w-10 h-10 rounded-full bg-amber-500/20 mr-3 flex items-center justify-center text-amber-300">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-white font-medium">Time-Consuming Process</h3>
                  <p className="text-white/70 text-sm">Hours spent on repetitive tasks</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AnimatedSection>
  );
};

// The Breakthrough section showing the clean UI solution
const BreakthroughSection = () => {
  return (
    <AnimatedSection
      id="breakthrough"
      backgroundColor="#0A0535"
      animationType="cinematic"
      pinned={true}
    >
      <div className="relative z-10">
        <ParallaxText
          text="The most elegant RSVP you'll never have to explain."
          subtext="An intuitive system that handles everything from attendance to dietary requirements."
          size="large"
          gradient={true}
          animationMode="cinema"
        />
        
        <div className="mt-16 max-w-4xl mx-auto">
          <div className="bg-white rounded-xl overflow-hidden shadow-2xl animate-in">
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-4 text-white">
              <h3 className="font-medium">Wedding RSVP</h3>
              <p className="text-white/80 text-sm">Priya & Rahul • May 20-22, 2025 • Delhi, India</p>
            </div>
            
            <div className="p-6 space-y-5">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Will you be attending?</label>
                <div className="flex space-x-3">
                  <div className="bg-indigo-100 text-indigo-800 px-4 py-2 rounded-full text-sm font-medium">Yes, I will attend</div>
                  <div className="bg-gray-100 text-gray-800 px-4 py-2 rounded-full text-sm font-medium">No, I can't make it</div>
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Number of guests in your party</label>
                <div className="h-10 w-24 bg-gray-100 rounded flex items-center justify-between px-3">
                  <span className="text-gray-500">2</span>
                  <div className="flex flex-col">
                    <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7" />
                    </svg>
                    <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Guest names</label>
                <div className="h-10 w-full bg-gray-100 rounded"></div>
              </div>
              
              <div className="bg-indigo-50 p-4 rounded-lg text-indigo-800 text-sm">
                <p>After completing this form, you'll receive a link to provide your travel details for hotel and transportation arrangements.</p>
              </div>
              
              <div className="pt-4">
                <div className="bg-indigo-600 text-white py-3 rounded-lg text-center font-medium">
                  Complete RSVP
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AnimatedSection>
  );
};

// Two-Stage RSVP Section
const TwoStageRSVPSection = () => {
  return (
    <AnimatedSection
      id="two-stage-rsvp"
      backgroundColor="#0F0842"
      animationType="reveal"
      pinned={true}
    >
      <div className="relative z-10">
        <ParallaxText
          text="From invite to itinerary. In two steps."
          subtext="Our two-part RSVP system gets the essential info first, then collects travel details when they're ready."
          size="large"
          gradient={true}
          animationMode="reveal"
        />
        
        <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {/* Step 1 */}
          <div className="bg-white rounded-xl overflow-hidden shadow-2xl">
            <div className="bg-indigo-600 p-4 text-white">
              <div className="flex justify-between items-center">
                <h3 className="font-medium">Step 1: Attendance</h3>
                <span className="bg-white text-indigo-600 text-xs font-bold px-2 py-1 rounded-full">First</span>
              </div>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Guest response</label>
                <div className="flex space-x-2">
                  <div className="h-10 w-20 bg-indigo-100 rounded-lg flex items-center justify-center text-indigo-800 font-medium">Yes</div>
                  <div className="h-10 w-20 bg-gray-100 rounded-lg flex items-center justify-center text-gray-800">No</div>
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Number of guests</label>
                <div className="h-10 w-full bg-gray-100 rounded"></div>
              </div>
              
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Guest names</label>
                <div className="h-10 w-full bg-gray-100 rounded"></div>
              </div>
              
              <div className="pt-4">
                <div className="bg-indigo-100 text-indigo-800 py-3 rounded-lg text-center font-medium">
                  Submit Response
                </div>
              </div>
            </div>
          </div>
          
          {/* Step 2 */}
          <div className="bg-white rounded-xl overflow-hidden shadow-2xl">
            <div className="bg-indigo-700 p-4 text-white">
              <div className="flex justify-between items-center">
                <h3 className="font-medium">Step 2: Travel Details</h3>
                <span className="bg-white text-indigo-700 text-xs font-bold px-2 py-1 rounded-full">Then</span>
              </div>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Arrival date & time</label>
                <div className="h-10 w-full bg-gray-100 rounded"></div>
              </div>
              
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Departure date & time</label>
                <div className="h-10 w-full bg-gray-100 rounded"></div>
              </div>
              
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Transportation needs</label>
                <div className="h-10 w-full bg-gray-100 rounded"></div>
              </div>
              
              <div className="pt-4">
                <div className="bg-indigo-600 text-white py-3 rounded-lg text-center font-medium">
                  Complete Travel Info
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AnimatedSection>
  );
};

// WhatsApp AI Concierge Section
const AIConciergeSection = () => {
  return (
    <AnimatedSection
      id="ai-concierge"
      backgroundColor="#0F064F"
      animationType="parallax"
      pinned={true}
    >
      <div className="relative z-10">
        <ParallaxText
          text="One message. Infinite coordination."
          subtext="Our AI concierge handles guest questions and updates automatically through WhatsApp."
          size="large"
          gradient={true}
          animationMode="cinema"
        />
        
        <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-12 max-w-6xl mx-auto">
          {/* WhatsApp Interface */}
          <div className="md:order-2">
            <div className="max-w-sm mx-auto bg-[#111B21] rounded-2xl overflow-hidden shadow-2xl border border-gray-800">
              <div className="bg-[#202C33] text-white p-3 flex items-center">
                <div className="w-10 h-10 rounded-full bg-green-600 flex items-center justify-center text-white mr-3">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7l4-4m0 0l4 4m-4-4v18" />
                  </svg>
                </div>
                <div>
                  <div className="font-medium">Wedding Concierge</div>
                  <div className="text-xs text-gray-300">AI Assistant</div>
                </div>
              </div>
              
              <div className="bg-[#0B141A] h-96 p-3 overflow-y-auto space-y-3">
                <div className="ml-auto max-w-[80%] bg-[#005C4B] text-white p-2 rounded-lg">
                  Hello! Will you be attending Priya and Rahul's wedding?
                </div>
                
                <div className="max-w-[80%] bg-[#202C33] text-white p-2 rounded-lg">
                  Yes, I'll be there! So excited!
                </div>
                
                <div className="ml-auto max-w-[80%] bg-[#005C4B] text-white p-2 rounded-lg">
                  Great! How many guests will be in your party?
                </div>
                
                <div className="max-w-[80%] bg-[#202C33] text-white p-2 rounded-lg">
                  It will be 2 of us - me and my wife
                </div>
                
                <div className="ml-auto max-w-[80%] bg-[#005C4B] text-white p-2 rounded-lg">
                  Perfect! When will you arrive in Delhi?
                </div>
                
                <div className="max-w-[80%] bg-[#202C33] text-white p-2 rounded-lg">
                  We'll be landing on May 19th at 2pm at IGI Airport
                </div>
                
                <div className="ml-auto max-w-[80%] bg-[#005C4B] text-white p-2 rounded-lg">
                  I've updated your RSVP with this information. Would you like me to arrange airport pickup?
                </div>
              </div>
            </div>
          </div>
          
          {/* Features */}
          <div className="space-y-6 md:order-1">
            <div className="bg-white/5 p-6 rounded-lg backdrop-blur-sm animate-in border border-white/10">
              <h3 className="text-xl font-medium text-white mb-3">24/7 Guest Support</h3>
              <p className="text-white/80">Your guests get instant answers to common questions without bothering the busy couple.</p>
            </div>
            
            <div className="bg-white/5 p-6 rounded-lg backdrop-blur-sm animate-in border border-white/10">
              <h3 className="text-xl font-medium text-white mb-3">Automatic Data Collection</h3>
              <p className="text-white/80">Every conversation updates your central dashboard with the latest RSVP information.</p>
            </div>
            
            <div className="bg-white/5 p-6 rounded-lg backdrop-blur-sm animate-in border border-white/10">
              <h3 className="text-xl font-medium text-white mb-3">Multi-Language Support</h3>
              <p className="text-white/80">Communicate with guests in their preferred language—no translation needed.</p>
            </div>
          </div>
        </div>
      </div>
    </AnimatedSection>
  );
};

// Room Assignment Section
const RoomAssignmentSection = () => {
  return (
    <AnimatedSection
      id="room-assignment"
      backgroundColor="#0C055C"
      animationType="cinematic"
      pinned={true}
    >
      <div className="relative z-10">
        <ParallaxText
          text="Match. Approve. Move on."
          subtext="Our room assignment system automatically matches guests to appropriate accommodations."
          size="large"
          gradient={true}
          animationMode="cinema"
        />
        
        <div className="mt-16 max-w-5xl mx-auto bg-white rounded-xl overflow-hidden shadow-2xl">
          <div className="bg-gradient-to-r from-indigo-700 to-purple-700 p-4 text-white">
            <div className="flex justify-between items-center">
              <h3 className="font-medium text-lg">Room Allocation Dashboard</h3>
              <span className="bg-white/20 text-white text-xs px-2 py-1 rounded-full">46/50 Rooms Assigned</span>
            </div>
          </div>
          
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[1, 2, 3, 4, 5, 6].map(room => (
                <div key={room} className="border border-gray-200 rounded-lg p-4 hover:bg-indigo-50 transition-colors">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="font-medium text-gray-900">Room {room}</h4>
                      <p className="text-sm text-gray-500">Deluxe King • 2nd Floor</p>
                    </div>
                    <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">Assigned</span>
                  </div>
                  
                  <div className="pt-2 border-t border-gray-100">
                    <p className="text-sm font-medium text-gray-900">Sharma Family</p>
                    <p className="text-xs text-gray-500">4 guests • May 19-22</p>
                  </div>
                  
                  <div className="flex mt-3 text-xs">
                    <div className="text-indigo-600 font-medium mr-3 flex items-center">
                      <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      View
                    </div>
                    <div className="text-indigo-600 font-medium flex items-center">
                      <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      Edit
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AnimatedSection>
  );
};

// Transport Planning Section
const TransportSection = () => {
  return (
    <AnimatedSection
      id="transport-planning"
      backgroundColor="#090669"
      animationType="cinematic"
      pinned={true}
    >
      <div className="relative z-10">
        <ParallaxText
          text="Arrival time becomes pickup time. Automatically."
          subtext="As guests submit their travel plans, our system organizes them into transport groups."
          size="large"
          gradient={true}
          animationMode="cinema"
        />
        
        <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-12 max-w-6xl mx-auto">
          <div className="bg-white rounded-xl overflow-hidden shadow-2xl">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-4 text-white">
              <h3 className="font-medium text-lg">Transport Groups</h3>
              <p className="text-sm text-white/80">Airport Pickups • May 19, 2025</p>
            </div>
            
            <div className="p-6 space-y-4">
              {[1, 2, 3].map(group => (
                <div key={group} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium text-gray-900">Shuttle Group {group}</h4>
                      <p className="text-sm text-gray-500">IGI Airport • Terminal 3 • 2:00 PM</p>
                    </div>
                    <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                      {group * 6} passengers
                    </span>
                  </div>
                  
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <h5 className="text-xs text-gray-500 mb-1">Families:</h5>
                    <div className="flex flex-wrap gap-2">
                      {['Sharma', 'Patel', 'Gupta', 'Singh'].slice(0, group).map(family => (
                        <span key={family} className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded-full">
                          {family}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <div className="mt-3 pt-3 border-t border-gray-100 flex text-xs">
                    <div className="text-indigo-600 font-medium mr-4 flex items-center">
                      <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                      Manifest
                    </div>
                    <div className="text-indigo-600 font-medium flex items-center">
                      <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                      </svg>
                      Send to Driver
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="space-y-6 flex flex-col justify-center">
            <div className="bg-white/5 backdrop-blur-sm p-6 rounded-lg border border-white/10 animate-in">
              <h3 className="text-xl font-medium text-white mb-3">Family-Based Groups</h3>
              <p className="text-white/80">Our algorithm ensures family members are always kept together when creating transport groups.</p>
            </div>
            
            <div className="bg-white/5 backdrop-blur-sm p-6 rounded-lg border border-white/10 animate-in">
              <h3 className="text-xl font-medium text-white mb-3">Real-Time Updates</h3>
              <p className="text-white/80">As flight details change, transport groups automatically adjust to accommodate new arrival times.</p>
            </div>
            
            <div className="bg-white/5 backdrop-blur-sm p-6 rounded-lg border border-white/10 animate-in">
              <h3 className="text-xl font-medium text-white mb-3">Driver Communications</h3>
              <p className="text-white/80">Generate driver instructions, passenger manifests, and contact details with a single click.</p>
            </div>
          </div>
        </div>
      </div>
    </AnimatedSection>
  );
};

// Main Dashboard Section
const DashboardSection = () => {
  return (
    <AnimatedSection
      id="command-center"
      backgroundColor="#050576"
      animationType="cinematic"
      pinned={true}
    >
      <div className="relative z-10">
        <ParallaxText
          text="From 300 guests to one screen."
          subtext="Our intelligent dashboard gives you complete visibility into your event's status."
          size="large"
          gradient={true}
          animationMode="cinema"
        />
        
        <div className="mt-16 max-w-6xl mx-auto bg-white rounded-xl overflow-hidden shadow-2xl">
          <div className="bg-gradient-to-r from-purple-700 to-indigo-700 p-4 text-white">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-medium text-lg">Wedding Command Center</h3>
                <p className="text-sm text-white/80">Priya & Rahul • May 20-22, 2025 • Delhi</p>
              </div>
              <button className="bg-white/20 hover:bg-white/30 text-white text-sm px-3 py-1 rounded-full transition-colors">
                View Reports
              </button>
            </div>
          </div>
          
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="bg-purple-50 rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="text-purple-800 font-medium">RSVP Status</h4>
                  <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded-full">81%</span>
                </div>
                <div className="text-3xl font-bold text-purple-900 mb-2">243/300</div>
                <div className="w-full bg-purple-200 h-2 rounded-full">
                  <div className="bg-purple-600 h-2 rounded-full" style={{ width: '81%' }}></div>
                </div>
                <p className="text-xs text-purple-700 mt-2">57 responses pending</p>
              </div>
              
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="text-blue-800 font-medium">Room Allocation</h4>
                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">92%</span>
                </div>
                <div className="text-3xl font-bold text-blue-900 mb-2">46/50</div>
                <div className="w-full bg-blue-200 h-2 rounded-full">
                  <div className="bg-blue-600 h-2 rounded-full" style={{ width: '92%' }}></div>
                </div>
                <p className="text-xs text-blue-700 mt-2">4 rooms remaining</p>
              </div>
              
              <div className="bg-green-50 rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="text-green-800 font-medium">Transport</h4>
                  <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">75%</span>
                </div>
                <div className="text-3xl font-bold text-green-900 mb-2">225/300</div>
                <div className="w-full bg-green-200 h-2 rounded-full">
                  <div className="bg-green-600 h-2 rounded-full" style={{ width: '75%' }}></div>
                </div>
                <p className="text-xs text-green-700 mt-2">75 guests unassigned</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-3">Upcoming Tasks</h4>
                <div className="space-y-2">
                  {[
                    { task: 'Send reminder to 57 pending guests', priority: 'High' },
                    { task: 'Confirm catering for Mehndi ceremony', priority: 'Medium' },
                    { task: 'Assign remaining 4 rooms', priority: 'Medium' },
                    { task: 'Coordinate with venue for setup', priority: 'Low' }
                  ].map((item, i) => (
                    <div key={i} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <div className="flex items-center">
                        <div className={`w-3 h-3 rounded-full mr-2 ${
                          item.priority === 'High' ? 'bg-red-500' : 
                          item.priority === 'Medium' ? 'bg-amber-500' : 'bg-green-500'
                        }`}></div>
                        <span className="text-sm">{item.task}</span>
                      </div>
                      <span className="text-xs text-gray-500">{item.priority}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-3">Event Timeline</h4>
                <div className="space-y-3">
                  {[
                    { day: 'Day 1', event: 'Welcome Dinner', time: '7:00 PM - 10:00 PM', confirmed: 207 },
                    { day: 'Day 2', event: 'Mehndi Ceremony', time: '11:00 AM - 3:00 PM', confirmed: 186 },
                    { day: 'Day 2', event: 'Sangeet Night', time: '7:00 PM - 11:00 PM', confirmed: 243 },
                    { day: 'Day 3', event: 'Wedding Ceremony', time: '9:00 AM - 2:00 PM', confirmed: 243 }
                  ].map((item, i) => (
                    <div key={i} className="flex items-center p-2 border-l-2 border-indigo-500 pl-3">
                      <div className="flex-1">
                        <div className="flex items-center">
                          <span className="text-sm font-medium">{item.event}</span>
                          <span className="ml-2 text-xs bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded-full">{item.day}</span>
                        </div>
                        <span className="text-xs text-gray-500">{item.time}</span>
                      </div>
                      <div className="text-xs text-gray-700">{item.confirmed} confirmed</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AnimatedSection>
  );
};

// Testimonials Section
const TestimonialsSection = () => {
  return (
    <AnimatedSection
      id="testimonials"
      backgroundColor="#030383"
      animationType="fade"
    >
      <div className="relative z-10">
        <ParallaxText
          text="They didn't need tech. Until this."
          subtext="Hear from couples and planners who transformed their wedding management experience."
          size="large"
          gradient={true}
          animationMode="stagger"
        />
        
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {[
            {
              quote: "Our wedding planning went from chaotic to streamlined overnight. The RSVP system saved us countless hours of back-and-forth with guests.",
              name: "Priya & Rahul",
              role: "Newlyweds",
              delay: 0
            },
            {
              quote: "I've planned over 200 weddings, and this platform has revolutionized how I coordinate guests and logistics. It's a must-have for any modern planner.",
              name: "Vidya Sharma",
              role: "Wedding Planner",
              delay: 0.2
            },
            {
              quote: "With family coming from across the world, the transportation coordination alone was worth it. Our guests felt well taken care of from the moment they landed.",
              name: "Arjun & Meera",
              role: "Parents of the Bride",
              delay: 0.4
            }
          ].map((testimonial, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: testimonial.delay }}
              viewport={{ once: true, margin: "-100px" }}
              className="bg-white/10 backdrop-blur-sm p-6 rounded-lg border border-white/10"
            >
              <div className="text-lg italic text-white/90 mb-4">"{testimonial.quote}"</div>
              <div className="font-medium text-white">{testimonial.name}</div>
              <div className="text-sm text-white/80">{testimonial.role}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </AnimatedSection>
  );
};

// Final CTA Section
const CTASection = () => {
  return (
    <AnimatedSection
      id="cta"
      backgroundColor="#020290"
      animationType="cinematic"
      pinned={true}
    >
      <div className="relative z-10">
        <ParallaxText
          text="Your event starts where your guests already are."
          subtext="From the first WhatsApp message to the final shuttle dropoff, we handle every detail so you can focus on creating memories."
          size="large"
          gradient={true}
          animationMode="cinema"
        />
        
        <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-12 max-w-6xl mx-auto">
          <div className="flex flex-col justify-center">
            <div className="space-y-6">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
                className="bg-white/5 backdrop-blur-sm p-6 rounded-lg border border-white/10"
              >
                <div className="flex items-start">
                  <div className="bg-gradient-to-r from-indigo-500 to-purple-500 w-10 h-10 rounded-full flex items-center justify-center mr-4 flex-shrink-0">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-white text-lg font-medium mb-1">Start with a Simple WhatsApp Message</h3>
                    <p className="text-white/80">Guests receive a personalized message with a link to complete their RSVP information.</p>
                  </div>
                </div>
              </motion.div>
              
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                viewport={{ once: true }}
                className="bg-white/5 backdrop-blur-sm p-6 rounded-lg border border-white/10"
              >
                <div className="flex items-start">
                  <div className="bg-gradient-to-r from-indigo-500 to-purple-500 w-10 h-10 rounded-full flex items-center justify-center mr-4 flex-shrink-0">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-white text-lg font-medium mb-1">Collect All Details in Minutes</h3>
                    <p className="text-white/80">Our smart forms adapt based on responses, collecting only what's needed for each guest.</p>
                  </div>
                </div>
              </motion.div>
              
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                viewport={{ once: true }}
                className="bg-white/5 backdrop-blur-sm p-6 rounded-lg border border-white/10"
              >
                <div className="flex items-start">
                  <div className="bg-gradient-to-r from-indigo-500 to-purple-500 w-10 h-10 rounded-full flex items-center justify-center mr-4 flex-shrink-0">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-white text-lg font-medium mb-1">Get Started Today</h3>
                    <p className="text-white/80">Set up your event in under an hour and start inviting guests immediately.</p>
                  </div>
                </div>
              </motion.div>
              
              <div className="pt-4 flex flex-col sm:flex-row gap-4">
                <Button 
                  size="lg" 
                  className="text-lg bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 border-0"
                  asChild
                >
                  <Link href="/auth">Get Started Now</Link>
                </Button>
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="text-lg border-white text-white hover:bg-white/10"
                >
                  Request Demo
                </Button>
              </div>
            </div>
          </div>
          
          <div className="flex items-center justify-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="max-w-xs w-full bg-[#111B21] rounded-2xl overflow-hidden shadow-2xl border border-gray-800"
            >
              <div className="bg-[#202C33] text-white p-3">
                <div className="font-medium">Start Your Wedding Journey</div>
              </div>
              
              <div className="bg-[#0B141A] p-4 space-y-4">
                <div className="bg-[#202C33] text-white p-3 rounded-lg">
                  <div className="text-sm mb-3">Welcome to Priya & Rahul's wedding RSVP</div>
                  <div className="flex space-x-2">
                    <button className="bg-green-600 text-white text-sm py-1 px-4 rounded">Yes, I'll attend</button>
                    <button className="bg-gray-600 text-white text-sm py-1 px-4 rounded">Can't make it</button>
                  </div>
                </div>
                
                <div className="bg-[#202C33] text-white p-3 rounded-lg">
                  <div className="text-sm mb-2">Great! Please tap below to complete your RSVP details.</div>
                  <button className="bg-indigo-600 w-full text-white text-sm py-2 rounded">
                    Complete Your RSVP
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </AnimatedSection>
  );
};

// Footer Component
const Footer = () => {
  return (
    <footer className="bg-black text-white py-16 px-8">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
        <div>
          <h3 className="font-script text-3xl mb-4">Eternally Yours</h3>
          <p className="text-gray-400">The most elegant wedding management platform for Indian weddings.</p>
        </div>
        <div>
          <h4 className="text-lg font-medium mb-4">Platform</h4>
          <ul className="space-y-2">
            {['Features', 'Pricing', 'FAQ', 'Testimonials'].map((item, i) => (
              <li key={i}><a href="#" className="text-gray-400 hover:text-white transition-colors">{item}</a></li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="text-lg font-medium mb-4">Company</h4>
          <ul className="space-y-2">
            {['About Us', 'Blog', 'Careers', 'Contact'].map((item, i) => (
              <li key={i}><a href="#" className="text-gray-400 hover:text-white transition-colors">{item}</a></li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="text-lg font-medium mb-4">Legal</h4>
          <ul className="space-y-2">
            {['Terms', 'Privacy', 'Cookies', 'Licenses'].map((item, i) => (
              <li key={i}><a href="#" className="text-gray-400 hover:text-white transition-colors">{item}</a></li>
            ))}
          </ul>
        </div>
      </div>
      <div className="max-w-7xl mx-auto mt-12 pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center">
        <p className="text-gray-500">© 2025 Eternally Yours. All rights reserved.</p>
        <div className="flex space-x-6 mt-4 md:mt-0">
          {['facebook', 'twitter', 'instagram', 'youtube'].map((social) => (
            <a key={social} href="#" className="text-gray-400 hover:text-white transition-colors">
              <span className="sr-only">{social}</span>
              <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
              </svg>
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
};

// Main component
export default function ImmersiveLanding() {
  const { user, isLoading } = useAuth();
  
  // Navigation links with scroll indicators - fixed with proper IDs that match section elements
  const navLinks = [
    { label: 'Story', href: '#chaos', id: 'chaos' },
    { label: 'Features', href: '#breakthrough', id: 'breakthrough' },
    { label: 'RSVP', href: '#two-stage-rsvp', id: 'two-stage-rsvp' },
    { label: 'AI', href: '#ai-concierge', id: 'ai-concierge' },
    { label: 'Rooms', href: '#room-assignment', id: 'room-assignment' },
    { label: 'Transport', href: '#transport-planning', id: 'transport-planning' },
    { label: 'Dashboard', href: '#command-center', id: 'command-center' },
    { label: 'Testimonials', href: '#testimonials', id: 'testimonials' }
  ];
  
  // Track active section for navigation highlights
  const [activeSection, setActiveSection] = useState('');
  
  // Intersection Observer for better scroll performance
  useEffect(() => {
    // Use Intersection Observer API for better performance
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          // Only update if the section is entering the viewport with significant visibility
          if (entry.isIntersecting && entry.intersectionRatio > 0.2) {
            const id = entry.target.getAttribute('id');
            if (id) {
              console.log('Section visible:', id);
              setActiveSection(id);
            }
          }
        });
      },
      {
        rootMargin: "-20% 0px -20% 0px", // Section must be 20% in viewport
        threshold: [0.2, 0.5] // Trigger when 20% or 50% visible
      }
    );
    
    // Observe all sections with IDs
    const sections = document.querySelectorAll('section[id]');
    sections.forEach(section => {
      observer.observe(section);
    });
    
    // Initial active section
    if (sections.length > 0) {
      const firstSection = sections[0];
      const firstId = firstSection.getAttribute('id');
      if (firstId) setActiveSection(firstId);
    }
    
    return () => {
      // Clean up observer
      sections.forEach(section => {
        observer.unobserve(section);
      });
    };
  }, []);
  
  // Smooth scroll function using GSAP
  const smoothScrollTo = (id: string) => {
    const section = document.getElementById(id);
    if (section) {
      try {
        // Use GSAP for smooth scrolling with easing
        gsap.to(window, {
          duration: 1.2,
          scrollTo: {
            y: section,
            offsetY: 70, // Account for fixed header
            autoKill: true
          },
          ease: "power3.inOut", // Cinematic easing
          onComplete: () => {
            setActiveSection(id);
          }
        });
      } catch (error) {
        console.error("Error scrolling:", error);
        
        // Fallback to native scrolling
        section.scrollIntoView({ behavior: 'smooth', block: 'start' });
        setActiveSection(id);
      }
    }
  };
  
  // Navbar animation for transparency on scroll
  const [navbarBg, setNavbarBg] = useState('transparent');
  
  // Enhanced scrolling functionality
  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
    e.preventDefault();
    
    // Find the target section
    const targetSection = document.getElementById(targetId);
    
    if (targetSection) {
      console.log(`Scrolling to section: ${targetId}`);
      
      // Smoothly scroll to the target section
      targetSection.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
      
      // Update active section after scrolling
      setTimeout(() => {
        setActiveSection(targetId);
      }, 500);
    }
  };
  
  // Update navbar background opacity on scroll
  useEffect(() => {
    const handleNavScroll = () => {
      if (window.scrollY > 100) {
        setNavbarBg('rgba(0, 0, 0, 0.8)');
      } else {
        setNavbarBg('transparent');
      }
    };
    
    window.addEventListener('scroll', handleNavScroll);
    return () => {
      window.removeEventListener('scroll', handleNavScroll);
    };
  }, []);
  
  // Render the full cinematic landing page
  return (
    <div className="bg-black text-white relative">
      {/* Fixed Navigation */}
      <header 
        className="fixed top-0 left-0 right-0 z-50 py-4 px-6 flex justify-between items-center backdrop-blur-sm transition-all duration-300"
        style={{ 
          backgroundColor: navbarBg,
          boxShadow: navbarBg !== 'transparent' ? '0 4px 20px rgba(0, 0, 0, 0.3)' : 'none'
        }}
      >
        <Link href="/" className="relative group">
          <span className="font-script text-3xl bg-gradient-to-r from-rose-300 via-purple-300 to-indigo-300 text-transparent bg-clip-text transition-all duration-300">
            Eternally Yours
          </span>
          <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-rose-300 via-purple-300 to-indigo-300 transition-all duration-300 group-hover:w-full"></span>
        </Link>
        
        <nav className="hidden md:flex space-x-1">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              onClick={(e) => handleNavClick(e, link.id)}
              className={`
                px-4 py-2 text-sm font-medium rounded-full transition-all duration-200
                ${activeSection === link.id
                  ? 'text-white bg-gradient-to-r from-purple-600/80 to-indigo-600/80' 
                  : 'text-white/70 hover:text-white hover:bg-white/10'}
              `}
            >
              {link.label}
            </a>
          ))}
        </nav>
        
        <Link 
          href="/auth" 
          className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white px-6 py-2 rounded-full text-sm font-medium transition-all duration-300 shadow-lg hover:shadow-purple-500/30"
        >
          Login
        </Link>
      </header>
      
      {/* Main Content */}
      <main>
        <Hero />
        <ChaosSection />
        <BreakthroughSection />
        <TwoStageRSVPSection />
        <AIConciergeSection />
        <RoomAssignmentSection />
        <TransportSection />
        <DashboardSection />
        <TestimonialsSection />
        <CTASection />
      </main>
      
      <Footer />
    </div>
  );
}