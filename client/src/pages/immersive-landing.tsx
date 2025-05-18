import React, { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';

// Import custom styles for immersive landing page
import '@/styles/immersive-landing.css';

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger, SplitText);

// Define section IDs for navigation
const SECTIONS = {
  HERO: 'hero',
  PROBLEM: 'problem',
  SOLUTION: 'solution',
  GUEST_MANAGEMENT: 'guest-management',
  TRANSPORT: 'transport',
  ACCOMMODATION: 'accommodation',
  COMMUNICATION: 'communication',
  AI_ASSISTANT: 'ai-assistant',
  TESTIMONIALS: 'testimonials',
  CTA: 'cta'
};

export default function ImmersiveLanding() {
  const [location, setLocation] = useLocation();
  const pageRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const problemRef = useRef<HTMLDivElement>(null);
  const solutionRef = useRef<HTMLDivElement>(null);
  const transportRef = useRef<HTMLDivElement>(null);
  const communicationRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  
  const scrollToSection = (sectionId: string) => {
    const section = document.getElementById(sectionId);
    if (section) {
      window.scrollTo({
        top: section.offsetTop,
        behavior: 'smooth'
      });
    }
  };
  
  // Setup animations
  useEffect(() => {
    // Only run on client
    if (typeof window === 'undefined') return;
    
    // Clear any existing ScrollTriggers
    ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    
    const ctx = gsap.context(() => {
      // Hero animations
      if (heroRef.current) {
        // Hero title animation
        gsap.from('.hero-title .char', {
          opacity: 0,
          y: 100,
          rotateX: -90,
          stagger: 0.03,
          duration: 1.2,
          ease: 'power4.out',
          delay: 0.5
        });
        
        // Hero subtitle animation
        gsap.from('.hero-subtitle', {
          opacity: 0,
          y: 30,
          duration: 1,
          delay: 1.5
        });
        
        // Hero buttons animation
        gsap.from('.hero-buttons', {
          opacity: 0,
          y: 20,
          duration: 0.8,
          delay: 1.8
        });
        
        // Background elements parallax
        gsap.to('.bg-element-1', {
          y: '-20%',
          scrollTrigger: {
            trigger: heroRef.current,
            start: 'top top',
            end: 'bottom top',
            scrub: 0.5
          }
        });
        
        gsap.to('.bg-element-2', {
          y: '-35%',
          scrollTrigger: {
            trigger: heroRef.current,
            start: 'top top',
            end: 'bottom top',
            scrub: 0.8
          }
        });
      }
      
      // Problem section animations
      if (problemRef.current) {
        // Floating papers animation
        gsap.to('.floating-paper', {
          y: '-20px',
          rotation: 5,
          duration: 2,
          repeat: -1,
          yoyo: true,
          ease: 'power1.inOut',
          stagger: 0.2
        });
        
        // Section title reveal
        gsap.from('.problem-title', {
          opacity: 0,
          y: 50,
          duration: 0.8,
          scrollTrigger: {
            trigger: problemRef.current,
            start: 'top 80%',
            toggleActions: 'play none none reverse'
          }
        });
        
        // Chaotic elements
        const chaosElements = document.querySelectorAll('.chaos-element');
        chaosElements.forEach((element, index) => {
          gsap.from(element, {
            scale: 0,
            opacity: 0,
            rotation: -15 + Math.random() * 30,
            duration: 0.6,
            delay: 0.1 * index,
            scrollTrigger: {
              trigger: problemRef.current,
              start: 'top 70%',
              toggleActions: 'play none none reverse'
            }
          });
        });
      }
      
      // Solution section animations
      if (solutionRef.current) {
        // Section title reveal
        gsap.from('.solution-title', {
          opacity: 0,
          y: 50,
          duration: 0.8,
          scrollTrigger: {
            trigger: solutionRef.current,
            start: 'top 80%',
            toggleActions: 'play none none reverse'
          }
        });
        
        // Organized elements
        const solutionElements = document.querySelectorAll('.solution-element');
        solutionElements.forEach((element, index) => {
          gsap.from(element, {
            x: index % 2 === 0 ? -100 : 100,
            opacity: 0,
            duration: 0.7,
            delay: 0.15 * index,
            scrollTrigger: {
              trigger: solutionRef.current,
              start: 'top 70%',
              toggleActions: 'play none none reverse'
            }
          });
        });
      }
      
      // Transport section animations
      if (transportRef.current) {
        // Vehicles animation
        gsap.fromTo('.vehicle-element', 
          { x: -200, opacity: 0 },
          { 
            x: 0, 
            opacity: 1, 
            stagger: 0.2,
            duration: 0.8,
            scrollTrigger: {
              trigger: transportRef.current,
              start: 'top 70%',
              toggleActions: 'play none none reverse'
            }
          }
        );
        
        // Route animation
        gsap.from('.route-path', {
          strokeDashoffset: 1000,
          duration: 2,
          scrollTrigger: {
            trigger: transportRef.current,
            start: 'top 60%',
            toggleActions: 'play none none reverse'
          }
        });
      }
      
      // Communication section animations
      if (communicationRef.current) {
        // Message bubbles animation
        gsap.from('.message-bubble', {
          scale: 0,
          opacity: 0,
          duration: 0.5,
          stagger: 0.15,
          scrollTrigger: {
            trigger: communicationRef.current,
            start: 'top 70%',
            toggleActions: 'play none none reverse'
          }
        });
      }
      
      // CTA section animations
      if (ctaRef.current) {
        // Gold particles
        gsap.to('.gold-particle', {
          y: -20,
          x: 'random(-20, 20)',
          rotation: 'random(-15, 15)',
          opacity: 'random(0.4, 1)',
          duration: 'random(1, 3)',
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
          stagger: 0.1
        });
        
        // CTA button pulse
        gsap.to('.cta-button', {
          scale: 1.05,
          duration: 1.5,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut'
        });
      }
    }, pageRef);
    
    // Cleanup function
    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
      ctx.revert();
    };
  }, []);
  
  return (
    <div ref={pageRef} className="immersive-landing">
      {/* Hero Section */}
      <section 
        id={SECTIONS.HERO} 
        ref={heroRef}
        className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-gradient-to-b from-[#5E239D] to-[#3A1562] scroll-section"
      >
        {/* Background Elements - Parallax Effect */}
        <div className="absolute inset-0 overflow-hidden">
          {/* Floating particles */}
          <div className="absolute inset-0">
            {Array.from({ length: 20 }).map((_, i) => (
              <div 
                key={i} 
                className="gold-particle absolute"
                style={{
                  top: `${Math.random() * 100}%`,
                  left: `${Math.random() * 100}%`,
                  width: `${Math.random() * 8 + 2}px`,
                  height: `${Math.random() * 8 + 2}px`,
                  animationDelay: `${Math.random() * 5}s`
                }}
              ></div>
            ))}
          </div>
          
          {/* Glowing orbs */}
          <div className="parallax-layer" data-speed="0.2">
            <div className="absolute w-[700px] h-[700px] rounded-full bg-gradient-to-r from-[#7f33d3]/10 to-[#5E239D]/5 blur-3xl -top-64 -left-64"></div>
          </div>
          <div className="parallax-layer" data-speed="0.3">
            <div className="absolute w-[900px] h-[900px] rounded-full bg-gradient-to-r from-[#BFA76F]/10 to-[#e9d9a8]/5 blur-3xl -bottom-96 -right-96"></div>
          </div>
          
          {/* Decorative patterns */}
          <div className="parallax-layer absolute inset-0 opacity-5 pointer-events-none" data-speed="0.1">
            <div className="absolute top-0 left-0 w-full h-full bg-[url('/patterns/mandala-pattern.svg')] bg-repeat opacity-10"></div>
          </div>
        </div>
        
        {/* Hero content */}
        <div className="relative z-10 text-center px-6 max-w-5xl mx-auto">
          {/* Main headline with text gradient */}
          <h1 className="mb-8">
            <span className="block text-6xl md:text-8xl font-serif font-bold text-gradient tracking-wider">
              Eternally Yours
            </span>
          </h1>
          
          {/* Subtitle */}
          <p className="text-base md:text-xl mb-12 text-white/80 max-w-3xl mx-auto leading-relaxed">
            The most elegant wedding management platform for Indian weddings. From guest management to itinerary planning, we make it seamless.
          </p>
          
          {/* Call to action buttons */}
          <div className="hero-buttons flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              className="hero-button hero-button-primary rounded-full py-6 px-10 text-base font-medium bg-gradient-to-r from-[#5E239D] to-[#7f33d3] border-0 shadow-lg shadow-primary/20"
              asChild
            >
              <Link href="/auth">Get Started</Link>
            </Button>
            
            <Button 
              size="lg" 
              variant="outline" 
              className="hero-button hero-button-secondary rounded-full py-6 px-10 text-base font-medium backdrop-blur-md bg-white/5 border-[#BFA76F]/30"
              onClick={() => scrollToSection(SECTIONS.PROBLEM)}
            >
              See How It Works
            </Button>
          </div>
        </div>
        
        {/* Scroll indicator */}
        <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 flex flex-col items-center text-white/50 animate-bounce">
          <span className="text-sm mb-2">Scroll to explore</span>
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      </section>
      
      {/* Problem Section - The Wedding Planning Chaos */}
      <section 
        id={SECTIONS.PROBLEM} 
        ref={problemRef}
        className="relative py-24 bg-gradient-to-b from-primary to-primary-900 text-white"
      >
        <div className="container mx-auto px-6">
          <h2 className="problem-title text-4xl md:text-5xl font-serif font-bold mb-12 text-center text-accent">
            Behind the Beauty: <span className="text-white">The Wedding Planning Chaos</span>
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="relative h-[400px] md:h-[500px] overflow-hidden">
              {/* Chaotic elements - papers, calendars, phones, lists */}
              <div className="chaos-element absolute top-10 left-10 w-48 h-64 bg-white rounded-md shadow-lg transform rotate-[-10deg] z-10">
                <div className="p-3">
                  <div className="w-full h-4 bg-red-500 mb-2"></div>
                  <div className="w-3/4 h-3 bg-gray-300 mb-2"></div>
                  <div className="w-full h-3 bg-gray-300 mb-2"></div>
                  <div className="w-5/6 h-3 bg-gray-300 mb-2"></div>
                  <div className="flex gap-1 mt-4">
                    <div className="w-8 h-8 rounded-sm bg-red-200"></div>
                    <div className="w-8 h-8 rounded-sm bg-red-200"></div>
                    <div className="w-8 h-8 rounded-sm bg-red-200"></div>
                  </div>
                </div>
              </div>
              
              <div className="chaos-element absolute top-20 right-10 w-56 h-40 bg-white rounded-md shadow-lg transform rotate-[5deg] z-20">
                <div className="p-3">
                  <div className="w-full h-4 bg-blue-500 mb-2"></div>
                  <div className="w-full h-20 bg-blue-100"></div>
                  <div className="absolute bottom-2 right-2 w-8 h-8 rounded-full bg-blue-500"></div>
                </div>
              </div>
              
              <div className="chaos-element absolute bottom-20 left-20 w-40 h-60 bg-gray-800 rounded-md shadow-lg transform rotate-[8deg] z-30">
                <div className="p-2">
                  <div className="w-full h-2 bg-gray-600 rounded-full mt-1"></div>
                  <div className="w-full h-32 bg-gray-700 mt-2 rounded-sm"></div>
                  <div className="flex justify-center mt-2">
                    <div className="w-8 h-8 rounded-full bg-gray-600"></div>
                  </div>
                </div>
              </div>
              
              <div className="chaos-element floating-paper absolute bottom-40 right-20 w-48 h-32 bg-amber-100 rounded-sm shadow-lg transform rotate-[-3deg] z-40">
                <div className="p-2">
                  <div className="w-full flex justify-between">
                    <div className="w-20 h-3 bg-amber-300"></div>
                    <div className="w-8 h-3 bg-amber-300"></div>
                  </div>
                  <div className="w-full flex mt-2 gap-1">
                    <div className="w-4 h-4 rounded-sm bg-amber-300"></div>
                    <div className="w-32 h-4 bg-amber-200"></div>
                  </div>
                  <div className="w-full flex mt-2 gap-1">
                    <div className="w-4 h-4 rounded-sm bg-amber-300"></div>
                    <div className="w-28 h-4 bg-amber-200"></div>
                  </div>
                  <div className="w-full flex mt-2 gap-1">
                    <div className="w-4 h-4 rounded-sm bg-amber-300"></div>
                    <div className="w-36 h-4 bg-amber-200"></div>
                  </div>
                </div>
              </div>
              
              <div className="chaos-element floating-paper absolute top-40 left-40 w-36 h-36 bg-green-100 rounded-sm shadow-lg transform rotate-[10deg] z-15">
                <div className="p-2">
                  <div className="w-full h-4 bg-green-500 mb-2"></div>
                  <div className="w-full flex flex-col gap-1">
                    <div className="w-full h-3 bg-green-200"></div>
                    <div className="w-full h-3 bg-green-200"></div>
                    <div className="w-full h-3 bg-green-200"></div>
                    <div className="w-full h-3 bg-green-200"></div>
                    <div className="w-full h-3 bg-green-200"></div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="text-white/90 space-y-6">
              <p className="text-xl leading-relaxed">
                Planning an Indian wedding involves coordinating hundreds of moving parts, from extensive guest lists to multiple ceremonies spanning several days.
              </p>
              
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-red-500/20 flex items-center justify-center text-red-300 flex-shrink-0 mt-1">!</div>
                  <p>Managing RSVPs from hundreds of guests across different events becomes overwhelming</p>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-red-500/20 flex items-center justify-center text-red-300 flex-shrink-0 mt-1">!</div>
                  <p>Coordinating transportation and accommodations leads to endless spreadsheets and phone calls</p>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-red-500/20 flex items-center justify-center text-red-300 flex-shrink-0 mt-1">!</div>
                  <p>Communication breakdowns result in confused guests and last-minute emergencies</p>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-red-500/20 flex items-center justify-center text-red-300 flex-shrink-0 mt-1">!</div>
                  <p>Traditional planning methods collapse under the complexity of multi-day celebrations</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Solution Section - Elegant Simplicity */}
      <section 
        id={SECTIONS.SOLUTION} 
        ref={solutionRef}
        className="relative py-24 bg-gradient-to-b from-primary-900 to-background text-foreground"
      >
        <div className="container mx-auto px-6">
          <h2 className="solution-title text-4xl md:text-5xl font-serif font-bold mb-16 text-center">
            <span className="text-accent">Elegant Simplicity</span> in Every Detail
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="text-foreground/90 space-y-6 order-2 md:order-1">
              <p className="text-xl leading-relaxed">
                Our platform transforms the chaotic planning process into a seamless, elegant experience with purpose-built tools for Indian weddings.
              </p>
              
              <div className="space-y-6">
                <div className="solution-element flex items-start gap-4 p-4 rounded-lg bg-background border">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-medium text-lg mb-1">Centralized Management</h3>
                    <p className="text-foreground/70">Every aspect of your wedding in one elegant dashboard</p>
                  </div>
                </div>
                
                <div className="solution-element flex items-start gap-4 p-4 rounded-lg bg-background border">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-medium text-lg mb-1">Family-Centered Design</h3>
                    <p className="text-foreground/70">Keep families together in travel, seating, and communication</p>
                  </div>
                </div>
                
                <div className="solution-element flex items-start gap-4 p-4 rounded-lg bg-background border">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-medium text-lg mb-1">Multi-Day Event Support</h3>
                    <p className="text-foreground/70">Seamlessly manage all your ceremonies and celebrations</p>
                  </div>
                </div>
                
                <div className="solution-element flex items-start gap-4 p-4 rounded-lg bg-background border">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-medium text-lg mb-1">Integrated Communication</h3>
                    <p className="text-foreground/70">Email and WhatsApp integration for seamless guest updates</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="relative order-1 md:order-2">
              <div className="solution-element relative mx-auto w-[320px] h-[600px] bg-background rounded-[36px] border-8 border-gray-800 shadow-xl overflow-hidden">
                <div className="absolute top-0 w-full h-6 bg-gray-800 rounded-t-lg"></div>
                <div className="absolute bottom-0 w-full h-6 bg-gray-800 rounded-b-lg"></div>
                
                <div className="h-full overflow-hidden">
                  <div className="h-14 w-full bg-primary flex items-center justify-between px-4">
                    <div className="text-white font-medium">Eternally Yours</div>
                    <div className="w-6 h-6 rounded-full bg-white/20"></div>
                  </div>
                  
                  <div className="p-3 bg-gray-100 h-[calc(100%-3.5rem)]">
                    <div className="bg-white rounded-lg shadow-sm p-4 mb-3">
                      <div className="flex justify-between items-center mb-2">
                        <div className="w-36 h-5 bg-gray-200 rounded"></div>
                        <div className="w-16 h-5 bg-primary/20 rounded-full"></div>
                      </div>
                      <div className="space-y-1">
                        <div className="w-full h-3 bg-gray-100 rounded"></div>
                        <div className="w-5/6 h-3 bg-gray-100 rounded"></div>
                        <div className="w-4/6 h-3 bg-gray-100 rounded"></div>
                      </div>
                      <div className="flex gap-2 mt-3">
                        <div className="w-20 h-6 bg-primary/10 rounded-full"></div>
                        <div className="w-20 h-6 bg-accent/10 rounded-full"></div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3 mb-3">
                      <div className="bg-white rounded-lg shadow-sm p-3">
                        <div className="w-8 h-8 rounded-full bg-green-100 mb-2 flex items-center justify-center">
                          <div className="w-4 h-4 rounded-full bg-green-500"></div>
                        </div>
                        <div className="w-full h-3 bg-gray-200 rounded mb-1"></div>
                        <div className="w-2/3 h-3 bg-gray-200 rounded"></div>
                      </div>
                      
                      <div className="bg-white rounded-lg shadow-sm p-3">
                        <div className="w-8 h-8 rounded-full bg-blue-100 mb-2 flex items-center justify-center">
                          <div className="w-4 h-4 rounded-full bg-blue-500"></div>
                        </div>
                        <div className="w-full h-3 bg-gray-200 rounded mb-1"></div>
                        <div className="w-2/3 h-3 bg-gray-200 rounded"></div>
                      </div>
                    </div>
                    
                    <div className="bg-white rounded-lg shadow-sm p-3 mb-3">
                      <div className="flex justify-between items-center mb-3">
                        <div className="w-24 h-4 bg-gray-200 rounded"></div>
                        <div className="w-6 h-6 rounded-full bg-primary/10"></div>
                      </div>
                      <div className="flex gap-2 items-center mb-2">
                        <div className="w-8 h-8 rounded-full bg-gray-200"></div>
                        <div>
                          <div className="w-20 h-3 bg-gray-200 rounded mb-1"></div>
                          <div className="w-16 h-2 bg-gray-100 rounded"></div>
                        </div>
                      </div>
                      <div className="flex gap-2 items-center mb-2">
                        <div className="w-8 h-8 rounded-full bg-gray-200"></div>
                        <div>
                          <div className="w-24 h-3 bg-gray-200 rounded mb-1"></div>
                          <div className="w-16 h-2 bg-gray-100 rounded"></div>
                        </div>
                      </div>
                      <div className="flex gap-2 items-center">
                        <div className="w-8 h-8 rounded-full bg-gray-200"></div>
                        <div>
                          <div className="w-28 h-3 bg-gray-200 rounded mb-1"></div>
                          <div className="w-16 h-2 bg-gray-100 rounded"></div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-white rounded-lg shadow-sm p-3">
                      <div className="w-full h-32 bg-gradient-to-br from-primary/20 to-accent/20 rounded-md mb-2"></div>
                      <div className="w-full h-3 bg-gray-200 rounded mb-1"></div>
                      <div className="w-5/6 h-3 bg-gray-200 rounded"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Transport Section */}
      <section 
        id={SECTIONS.TRANSPORT} 
        ref={transportRef}
        className="relative py-24 bg-gradient-to-b from-background via-background to-background"
      >
        <div className="container mx-auto px-6">
          <h2 className="text-4xl md:text-5xl font-serif font-bold mb-12 text-center">
            <span className="text-accent">Moving Together</span>
          </h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="relative h-[400px]">
              {/* SVG Map with Routes */}
              <svg className="w-full h-full" viewBox="0 0 800 600" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* Map Background */}
                <rect width="800" height="600" fill="#f8f9fa" rx="8" />
                
                {/* Roads */}
                <path className="route-path" d="M100,300 C200,200 300,400 400,300 S600,200 700,300" stroke="#d1d5db" strokeWidth="20" strokeLinecap="round" strokeDasharray="1000" strokeDashoffset="0" />
                <path className="route-path" d="M200,100 C250,200 350,250 400,300" stroke="#d1d5db" strokeWidth="15" strokeLinecap="round" strokeDasharray="1000" strokeDashoffset="0" />
                <path className="route-path" d="M600,100 C550,200 450,250 400,300" stroke="#d1d5db" strokeWidth="15" strokeLinecap="round" strokeDasharray="1000" strokeDashoffset="0" />
                <path className="route-path" d="M400,300 L400,500" stroke="#d1d5db" strokeWidth="20" strokeLinecap="round" strokeDasharray="1000" strokeDashoffset="0" />
                
                {/* Primary Route */}
                <path className="route-path" d="M100,300 C200,200 300,400 400,300 S600,200 700,300" stroke="#5E239D" strokeWidth="10" strokeLinecap="round" strokeDasharray="1000" strokeDashoffset="0" />
                
                {/* Airport */}
                <circle cx="100" cy="300" r="30" fill="#e0f2fe" stroke="#7dd3fc" strokeWidth="4" />
                <path d="M85,300 L115,300 M100,285 L100,315 M80,280 L120,320" stroke="#0284c7" strokeWidth="3" />
                
                {/* Hotel */}
                <rect x="370" y="270" width="60" height="60" rx="4" fill="#f0fdf4" stroke="#86efac" strokeWidth="4" />
                <path d="M385,300 L415,300 M400,285 L400,315" stroke="#16a34a" strokeWidth="3" />
                
                {/* Venue */}
                <circle cx="700" cy="300" r="30" fill="#fef3c7" stroke="#fcd34d" strokeWidth="4" />
                <path d="M685,300 L715,300 M700,285 L700,315 M685,285 L715,315 M685,315 L715,285" stroke="#f59e0b" strokeWidth="3" />
                
                {/* Vehicles */}
                <g className="vehicle-element" transform="translate(200, 250)">
                  <rect x="0" y="0" width="40" height="20" rx="5" fill="#5E239D" />
                  <circle cx="10" cy="20" r="5" fill="#1e293b" />
                  <circle cx="30" cy="20" r="5" fill="#1e293b" />
                </g>
                
                <g className="vehicle-element" transform="translate(350, 350)">
                  <rect x="0" y="0" width="50" height="25" rx="5" fill="#BFA76F" />
                  <circle cx="15" cy="25" r="6" fill="#1e293b" />
                  <circle cx="35" cy="25" r="6" fill="#1e293b" />
                </g>
                
                <g className="vehicle-element" transform="translate(500, 250)">
                  <rect x="0" y="0" width="60" height="30" rx="5" fill="#5E239D" />
                  <circle cx="15" cy="30" r="7" fill="#1e293b" />
                  <circle cx="45" cy="30" r="7" fill="#1e293b" />
                </g>
                
                {/* Labels */}
                <text x="100" y="360" textAnchor="middle" fill="#0284c7" fontSize="16" fontWeight="500">Airport</text>
                <text x="400" y="360" textAnchor="middle" fill="#16a34a" fontSize="16" fontWeight="500">Hotel</text>
                <text x="700" y="360" textAnchor="middle" fill="#f59e0b" fontSize="16" fontWeight="500">Venue</text>
              </svg>
            </div>
            
            <div className="space-y-6">
              <h3 className="text-3xl font-serif font-semibold mb-4 text-foreground">Family-Centric Transportation</h3>
              
              <p className="text-lg text-foreground/80">
                Our revolutionary transport management system ensures that families travel together comfortably, with intelligent allocation based on arrival times and group sizes.
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
                <Card className="p-4 border border-border/50 bg-card">
                  <div className="flex flex-col h-full">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-3">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                      </svg>
                    </div>
                    <h4 className="text-lg font-medium mb-2">Smart Fleet Management</h4>
                    <p className="text-foreground/70 text-sm flex-grow">Define your available fleet with vehicle types and capacities</p>
                  </div>
                </Card>
                
                <Card className="p-4 border border-border/50 bg-card">
                  <div className="flex flex-col h-full">
                    <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center text-accent mb-3">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                    </div>
                    <h4 className="text-lg font-medium mb-2">Family Grouping</h4>
                    <p className="text-foreground/70 text-sm flex-grow">Automatically keep families together in the same vehicle</p>
                  </div>
                </Card>
                
                <Card className="p-4 border border-border/50 bg-card">
                  <div className="flex flex-col h-full">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-3">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </div>
                    <h4 className="text-lg font-medium mb-2">Arrival Optimization</h4>
                    <p className="text-foreground/70 text-sm flex-grow">Group travelers by arrival time to optimize vehicle usage</p>
                  </div>
                </Card>
                
                <Card className="p-4 border border-border/50 bg-card">
                  <div className="flex flex-col h-full">
                    <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center text-accent mb-3">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                      </svg>
                    </div>
                    <h4 className="text-lg font-medium mb-2">Guest Notifications</h4>
                    <p className="text-foreground/70 text-sm flex-grow">Automated updates about pickup times and locations</p>
                  </div>
                </Card>
              </div>
              
              <Button
                className="mt-8"
                onClick={() => scrollToSection(SECTIONS.COMMUNICATION)}
              >
                Explore Guest Communication
              </Button>
            </div>
          </div>
        </div>
      </section>
      
      {/* Communication Section */}
      <section 
        id={SECTIONS.COMMUNICATION} 
        ref={communicationRef}
        className="relative py-24 bg-gradient-to-b from-background via-background/80 to-primary/10"
      >
        <div className="container mx-auto px-6">
          <h2 className="text-4xl md:text-5xl font-serif font-bold mb-12 text-center">
            <span className="text-accent">Seamless Communication</span>
          </h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-6 order-2 lg:order-1">
              <h3 className="text-3xl font-serif font-semibold mb-4 text-foreground">Multichannel Guest Engagement</h3>
              
              <p className="text-lg text-foreground/80">
                Keep your guests informed and engaged through personalized WhatsApp messages and email communications.
              </p>
              
              <div className="space-y-4 mt-6">
                <div className="flex items-start gap-4 p-4 rounded-lg bg-white shadow-sm">
                  <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center text-white flex-shrink-0">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-medium text-lg mb-1">WhatsApp Integration</h4>
                    <p className="text-foreground/70">Send updates, collect RSVPs, and answer questions through WhatsApp</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4 p-4 rounded-lg bg-white shadow-sm">
                  <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white flex-shrink-0">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-medium text-lg mb-1">Beautiful Email Templates</h4>
                    <p className="text-foreground/70">Send elegant, branded emails for invitations and updates</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4 p-4 rounded-lg bg-white shadow-sm">
                  <div className="w-10 h-10 rounded-full bg-purple-500 flex items-center justify-center text-white flex-shrink-0">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-medium text-lg mb-1">Automated Reminders</h4>
                    <p className="text-foreground/70">Schedule timely reminders for transportation and events</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4 p-4 rounded-lg bg-white shadow-sm">
                  <div className="w-10 h-10 rounded-full bg-cyan-500 flex items-center justify-center text-white flex-shrink-0">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-medium text-lg mb-1">Dynamic Follow-Ups</h4>
                    <p className="text-foreground/70">Personalized follow-up based on guest responses</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="relative order-1 lg:order-2">
              <div className="bg-white rounded-xl shadow-lg p-6 max-w-md mx-auto">
                <div className="flex items-center gap-3 pb-4 border-b">
                  <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center text-white">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </div>
                  <div>
                    <h5 className="font-medium">Sharma & Patel Wedding</h5>
                    <p className="text-xs text-foreground/70">WhatsApp Communication</p>
                  </div>
                </div>
                
                <div className="py-4 space-y-4">
                  <div className="message-bubble flex justify-start">
                    <div className="bg-gray-200 rounded-lg p-3 max-w-[80%]">
                      <p className="text-sm">Namaste Priya! We're excited to welcome you to Raj & Anita's wedding celebration. Your RSVP has been confirmed for all 3 days of ceremonies.</p>
                    </div>
                  </div>
                  
                  <div className="message-bubble flex justify-end">
                    <div className="bg-green-100 rounded-lg p-3 max-w-[80%]">
                      <p className="text-sm">Thank you! I'm looking forward to it. Will there be transportation from the hotel to the venue?</p>
                    </div>
                  </div>
                  
                  <div className="message-bubble flex justify-start">
                    <div className="bg-gray-200 rounded-lg p-3 max-w-[80%]">
                      <p className="text-sm">Yes! We've arranged transportation for you. A car will pick you up from JW Marriott at 5:30 PM on Friday. We've made sure you'll be with your family members.</p>
                    </div>
                  </div>
                  
                  <div className="message-bubble flex justify-start">
                    <div className="bg-gray-200 rounded-lg p-3 max-w-[80%] space-y-2">
                      <p className="text-sm">Here are the transportation details:</p>
                      <div className="bg-white rounded-md p-2 text-sm">
                        <p className="font-medium">🚗 Your Transport Details</p>
                        <p className="text-xs mt-1">Date: June 17, 2025</p>
                        <p className="text-xs">Pickup: JW Marriott, 5:30 PM</p>
                        <p className="text-xs">Vehicle: White Innova (Sharma Family)</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="message-bubble flex justify-end">
                    <div className="bg-green-100 rounded-lg p-3 max-w-[80%]">
                      <p className="text-sm">Perfect! Thank you for organizing this so well.</p>
                    </div>
                  </div>
                </div>
                
                <div className="pt-3 border-t flex gap-2">
                  <div className="bg-gray-100 rounded-full flex-grow p-2 text-sm text-gray-400">Type a message...</div>
                  <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center text-white">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section 
        id={SECTIONS.CTA} 
        ref={ctaRef}
        className="relative py-24 bg-gradient-to-b from-primary/10 to-primary"
      >
        <div className="container mx-auto px-6 text-center relative z-10">
          {/* Gold particles */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {Array(15).fill(0).map((_, i) => (
              <div 
                key={i}
                className="gold-particle absolute w-3 h-3 rounded-full bg-accent/80"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  opacity: 0.4 + Math.random() * 0.6
                }}
              ></div>
            ))}
          </div>
          
          <h2 className="text-4xl md:text-6xl font-serif font-bold mb-6 text-white">
            Begin Your <span className="text-accent">Journey</span>
          </h2>
          
          <p className="text-xl text-white/80 max-w-3xl mx-auto mb-12">
            Transform your wedding planning experience today. Our platform brings elegance to every detail, letting you focus on what truly matters.
          </p>
          
          <Button 
            size="lg" 
            className="cta-button bg-accent hover:bg-accent/90 text-primary text-xl py-6 px-10 rounded-md"
            asChild
          >
            <Link href="/auth">Get Started Now</Link>
          </Button>
          
          <p className="text-white/60 mt-6">
            No credit card required • Free 14-day trial • Cancel anytime
          </p>
        </div>
      </section>
    </div>
  );
}