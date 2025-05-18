import React, { useEffect, useRef, useState } from 'react';
import { 
  motion, 
  useScroll, 
  useTransform,
  MotionProps,
  HTMLMotionProps 
} from 'framer-motion';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';
import { gsap, ScrollTrigger } from '@/utils/gsap-config';

// Immersive Wedding RSVP Landing Page with enhanced visual storytelling
export default function ImmersiveStorytelling() {
  const { user } = useAuth();
  const mainRef = useRef<HTMLElement>(null);
  const [activeSection, setActiveSection] = useState('hero');
  const [isLoaded, setIsLoaded] = useState(false);
  
  // Global scroll progress for progress bar
  const { scrollYProgress } = useScroll();
  const scrollProgress = useTransform(scrollYProgress, [0, 1], [0, 100]);
  
  // Navigation links
  const navLinks = [
    { id: 'hero', label: 'Home' },
    { id: 'chaos', label: 'Problem' },
    { id: 'solution', label: 'Solution' },
    { id: 'transport', label: 'Transport' },
    { id: 'ai-concierge', label: 'AI Assistant' },
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'cta', label: 'Get Started' }
  ];
  
  // Handle scroll to section with smooth animation
  const scrollToSection = (sectionId: string) => {
    const section = document.getElementById(sectionId);
    if (section) {
      // Use GSAP for smooth scrolling
      gsap.to(window, {
        duration: 1,
        scrollTo: {
          y: section,
          offsetY: 80,
          autoKill: true
        },
        ease: "power3.inOut",
        onComplete: () => {
          setActiveSection(sectionId);
        }
      });
    }
  };
  
  // Track section visibility for navigation highlighting
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio > 0.5) {
            const id = entry.target.id;
            if (id) setActiveSection(id);
          }
        });
      },
      {
        rootMargin: "-20% 0px -20% 0px",
        threshold: 0.5
      }
    );
    
    // Observe all sections
    const sections = document.querySelectorAll('section[id]');
    sections.forEach(section => observer.observe(section));
    
    return () => {
      sections.forEach(section => observer.unobserve(section));
    };
  }, [isLoaded]);
  
  // Initialize animations when component mounts
  useEffect(() => {
    if (user) {
      window.location.href = '/dashboard';
      return;
    }
    
    // Delay setting loaded state to ensure DOM is fully rendered
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 500);
    
    return () => {
      clearTimeout(timer);
    };
  }, [user]);
  
  // Set up scroll-triggered animations
  useEffect(() => {
    if (!isLoaded || !mainRef.current) return;
    
    // Global setup for scroll animations
    ScrollTrigger.batch('.fade-in-element', {
      onEnter: (elements) => {
        gsap.to(elements, {
          autoAlpha: 1,
          y: 0,
          stagger: 0.1,
          duration: 0.8,
          ease: "power2.out"
        });
      },
      once: true
    });
    
    // Set up parallax elements
    document.querySelectorAll('.parallax-element').forEach((element, i) => {
      const depth = element.getAttribute('data-depth') || '0.2';
      
      gsap.to(element, {
        y: `-${30 * parseFloat(depth)}%`,
        ease: "none",
        scrollTrigger: {
          trigger: element.parentElement,
          start: "top bottom",
          end: "bottom top",
          scrub: true
        }
      });
    });
    
    return () => {
      // Clean up all animations when component unmounts
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, [isLoaded]);
  
  // Helper for section transitions
  const SectionTransition = () => (
    <div className="section-transition">
      <div className="line"></div>
      <div className="dot"></div>
      <div className="line"></div>
    </div>
  );
  
  return (
    <div className="bg-black text-white overflow-x-hidden min-h-screen">
      {/* Progress bar */}
      <motion.div 
        className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 z-50"
        style={{ scaleX: scrollYProgress, transformOrigin: "0% 50%" }}
      />
      
      {/* Fixed navigation */}
      <header className="fixed top-0 left-0 right-0 z-40 backdrop-blur-md bg-black/70 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-script bg-gradient-to-r from-rose-300 via-purple-300 to-indigo-300 text-transparent bg-clip-text">
            Eternally Yours
          </h1>
          
          <nav className="hidden md:flex gap-1">
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => scrollToSection(link.id)}
                className={`px-4 py-2 text-sm font-medium rounded-full transition-all duration-300
                  ${activeSection === link.id 
                    ? 'bg-gradient-to-r from-purple-600/90 to-indigo-600/90 text-white' 
                    : 'text-white/70 hover:bg-white/10 hover:text-white'
                  }`}
              >
                {link.label}
              </button>
            ))}
          </nav>
          
          <Button
            size="sm"
            className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
            asChild
          >
            <Link href="/auth">Login</Link>
          </Button>
        </div>
      </header>
      
      <main ref={mainRef} className="pt-16">
        {/* HERO SECTION: "Eternally Yours" */}
        <section id="hero" className="min-h-screen relative flex items-center justify-center overflow-hidden">
          {/* Animated background with geometric shapes */}
          <div className="absolute inset-0 bg-gradient-to-b from-purple-900 via-indigo-900 to-black">
            {/* Geometric elements */}
            <div className="absolute w-96 h-96 rounded-full border-2 border-purple-500/20 top-1/4 left-1/4 animate-float1 transform -translate-x-1/2 -translate-y-1/2"></div>
            <div className="absolute w-64 h-64 rounded-full border border-indigo-400/30 top-2/3 right-1/4 animate-float2 transform translate-x-1/2 -translate-y-1/2"></div>
            <div className="absolute w-80 h-80 border border-indigo-600/10 top-1/2 right-1/3 animate-float3 transform rotate-45 translate-x-1/2 -translate-y-1/2"></div>
            
            {/* Blurred orbs */}
            <div className="absolute w-40 h-40 rounded-full bg-purple-800/10 blur-xl top-1/3 left-2/3"></div>
            <div className="absolute w-32 h-32 rounded-full bg-indigo-600/10 blur-xl bottom-1/3 right-2/3"></div>
            <div className="absolute w-24 h-24 rounded-full bg-pink-700/10 blur-xl top-2/3 right-1/2"></div>
          </div>
          
          {/* Overlay for better text contrast */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/70"></div>
          
          {/* Hero content */}
          <div className="relative z-10 text-center px-6 max-w-5xl mx-auto">
            {/* Main headline with 3D typography */}
            <motion.h1 
              className="text-6xl md:text-8xl font-script mb-8 bg-gradient-to-r from-rose-300 via-purple-300 to-indigo-300 text-transparent bg-clip-text"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.2, ease: [0.19, 1, 0.22, 1] }}
            >
              <span className="text-3d">
                Eternally Yours
              </span>
            </motion.h1>
            
            {/* Subtitle */}
            <motion.p
              className="text-xl md:text-2xl mb-12 text-white/90 max-w-3xl mx-auto"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.3 }}
            >
              The most elegant wedding management platform for Indian weddings.
              From guest management to itinerary planning, we make it seamless.
            </motion.p>
            
            {/* CTA buttons */}
            <motion.div
              className="flex flex-col sm:flex-row gap-4 justify-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-lg shadow-lg shadow-purple-900/20"
                asChild
              >
                <Link href="/auth">Get Started</Link>
              </Button>
              
              <Button 
                size="lg" 
                variant="outline" 
                className="border-white text-white hover:bg-white/10 text-lg"
                onClick={() => scrollToSection('chaos')}
              >
                See How It Works
              </Button>
            </motion.div>
            
            {/* Scroll indicator */}
            <motion.div 
              className="absolute bottom-10 left-1/2 transform -translate-x-1/2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.5, duration: 1 }}
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
        </section>
        
        {/* Subtle connector element */}
        <SectionTransition />
        
        {/* CHAOS SECTION: "Behind the Beauty" */}
        <section id="chaos" className="min-h-screen relative py-20 overflow-hidden">
          {/* Background */}
          <div className="absolute inset-0 bg-gradient-to-b from-black to-indigo-950"></div>
          
          <div className="container mx-auto px-4 relative z-10">
            {/* Section header */}
            <div className="text-center mb-16 max-w-4xl mx-auto">
              <motion.h2 
                className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-rose-300 to-indigo-300 text-transparent bg-clip-text fade-in-element"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-20% 0px" }}
                transition={{ duration: 0.8 }}
              >
                The ceremony is beautiful.<br />The backend is broken.
              </motion.h2>
              
              <motion.p
                className="text-xl text-white/80 fade-in-element"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-20% 0px" }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                Behind every perfect wedding is a chaotic mess of spreadsheets,<br />
                WhatsApp threads, and manual coordination.
              </motion.p>
            </div>
            
            {/* Split screen content */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
              {/* Left side: Chaos visualization */}
              <div className="bg-black/30 backdrop-blur-sm p-8 rounded-xl border border-white/10 shadow-2xl fade-in-element"
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-10% 0px" }}
                transition={{ duration: 0.8 }}
              >
                <h3 className="text-2xl font-bold mb-6 text-purple-300">The Wedding Planning Chaos</h3>
                
                <div className="space-y-6">
                  {/* Problem 1: Spreadsheets */}
                  <motion.div 
                    className="flex items-start gap-4"
                    whileHover={{ x: 5 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <div className="w-12 h-12 rounded-full bg-purple-500/20 flex-shrink-0 flex items-center justify-center text-purple-300">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="text-xl font-medium text-white">15+ Spreadsheets</h4>
                      <p className="text-white/70 mt-1">Different formats, inconsistent data, and manually tracking hundreds of guests across multiple documents.</p>
                    </div>
                  </motion.div>
                  
                  {/* Problem 2: Communication */}
                  <motion.div 
                    className="flex items-start gap-4"
                    whileHover={{ x: 5 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <div className="w-12 h-12 rounded-full bg-indigo-500/20 flex-shrink-0 flex items-center justify-center text-indigo-300">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="text-xl font-medium text-white">WhatsApp Chaos</h4>
                      <p className="text-white/70 mt-1">Losing track of RSVPs, special requests, and important conversations in endless group chats.</p>
                    </div>
                  </motion.div>
                  
                  {/* Problem 3: Manual tasks */}
                  <motion.div 
                    className="flex items-start gap-4"
                    whileHover={{ x: 5 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <div className="w-12 h-12 rounded-full bg-rose-500/20 flex-shrink-0 flex items-center justify-center text-rose-300">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="text-xl font-medium text-white">Manual Coordination</h4>
                      <p className="text-white/70 mt-1">Hours spent matching guests to rooms, vehicles, and events with complex family preferences.</p>
                    </div>
                  </motion.div>
                </div>
              </div>
              
              {/* Right side: Real consequences */}
              <div className="bg-black/30 backdrop-blur-sm p-8 rounded-xl border border-white/10 shadow-2xl fade-in-element"
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-10% 0px" }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                <h3 className="text-2xl font-bold mb-6 text-indigo-300">Real Consequences</h3>
                
                {/* Stats visualization */}
                <div className="space-y-6">
                  {/* Time wasted */}
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-white font-medium">Time Wasted</span>
                      <span className="text-indigo-300 font-bold">120+ hours</span>
                    </div>
                    <div className="h-3 bg-white/10 rounded-full overflow-hidden">
                      <motion.div 
                        className="h-full bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full"
                        initial={{ width: 0 }}
                        whileInView={{ width: '90%' }}
                        viewport={{ once: true }}
                        transition={{ duration: 1, delay: 0.5 }}
                      />
                    </div>
                    <p className="text-white/60 text-sm">That's 5 full days lost to administration</p>
                  </div>
                  
                  {/* Error rate */}
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-white font-medium">Error Rate</span>
                      <span className="text-rose-300 font-bold">23%</span>
                    </div>
                    <div className="h-3 bg-white/10 rounded-full overflow-hidden">
                      <motion.div 
                        className="h-full bg-gradient-to-r from-rose-600 to-red-600 rounded-full"
                        initial={{ width: 0 }}
                        whileInView={{ width: '23%' }}
                        viewport={{ once: true }}
                        transition={{ duration: 1, delay: 0.7 }}
                      />
                    </div>
                    <p className="text-white/60 text-sm">Nearly 1 in 4 guest details has errors</p>
                  </div>
                  
                  {/* Guest experience */}
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-white font-medium">Guest Experience Impact</span>
                      <span className="text-amber-300 font-bold">High</span>
                    </div>
                    <div className="h-3 bg-white/10 rounded-full overflow-hidden">
                      <motion.div 
                        className="h-full bg-gradient-to-r from-amber-600 to-yellow-600 rounded-full"
                        initial={{ width: 0 }}
                        whileInView={{ width: '75%' }}
                        viewport={{ once: true }}
                        transition={{ duration: 1, delay: 0.9 }}
                      />
                    </div>
                    <p className="text-white/60 text-sm">Confusion and miscommunication for guests</p>
                  </div>
                  
                  {/* Stress level */}
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-white font-medium">Planner Stress Level</span>
                      <span className="text-red-300 font-bold">Critical</span>
                    </div>
                    <div className="h-3 bg-white/10 rounded-full overflow-hidden">
                      <motion.div 
                        className="h-full bg-gradient-to-r from-red-600 to-rose-600 rounded-full"
                        initial={{ width: 0 }}
                        whileInView={{ width: '95%' }}
                        viewport={{ once: true }}
                        transition={{ duration: 1, delay: 1.1 }}
                      />
                    </div>
                    <p className="text-white/60 text-sm">Overwhelming pressure before the ceremony</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* Subtle connector element */}
        <SectionTransition />
        
        {/* SOLUTION SECTION: "Elegant Simplicity" */}
        <section id="solution" className="min-h-screen relative py-20 overflow-hidden">
          {/* Background */}
          <div className="absolute inset-0 bg-gradient-to-b from-indigo-950 to-purple-950"></div>
          
          <div className="container mx-auto px-4 relative z-10">
            {/* Section header */}
            <div className="text-center mb-16 max-w-4xl mx-auto">
              <motion.h2 
                className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-indigo-300 to-purple-300 text-transparent bg-clip-text fade-in-element"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-20% 0px" }}
                transition={{ duration: 0.8 }}
              >
                The most elegant RSVP<br />you'll never have to explain.
              </motion.h2>
              
              <motion.p
                className="text-xl text-white/80 fade-in-element"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-20% 0px" }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                An intuitive system that handles everything from attendance<br />
                to dietary requirements in one beautiful interface.
              </motion.p>
            </div>
            
            {/* RSVP Form Showcase */}
            <div className="max-w-5xl mx-auto">
              <motion.div 
                className="bg-white rounded-xl overflow-hidden shadow-2xl fade-in-element"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-10% 0px" }}
                transition={{ duration: 0.8 }}
              >
                {/* Form header */}
                <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6">
                  <h3 className="text-white text-xl font-medium">Wedding RSVP</h3>
                  <p className="text-white/80">Priya & Rahul • May 20-22, 2025 • Delhi, India</p>
                </div>
                
                {/* Form content */}
                <div className="p-8 text-gray-800">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Left column */}
                    <div className="space-y-6">
                      {/* Attendance section */}
                      <div className="space-y-3">
                        <label className="block text-lg font-medium text-gray-700">Will you be attending?</label>
                        <div className="flex flex-wrap gap-3">
                          <div className="bg-indigo-50 border-2 border-indigo-600 text-indigo-700 px-4 py-2 rounded-full font-medium">
                            Yes, I will attend
                          </div>
                          <div className="bg-gray-100 border border-gray-300 text-gray-600 px-4 py-2 rounded-full font-medium">
                            No, I can't make it
                          </div>
                        </div>
                      </div>
                      
                      {/* Guest count section */}
                      <div className="space-y-3">
                        <label className="block text-lg font-medium text-gray-700">Number of guests in your party</label>
                        <div className="flex items-center">
                          <div className="h-12 w-12 bg-indigo-50 border-2 border-indigo-200 rounded-l-lg flex items-center justify-center text-indigo-700">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 12H4" />
                            </svg>
                          </div>
                          <div className="h-12 w-12 bg-white border-y-2 border-indigo-200 flex items-center justify-center text-gray-800 font-bold">
                            2
                          </div>
                          <div className="h-12 w-12 bg-indigo-50 border-2 border-indigo-200 rounded-r-lg flex items-center justify-center text-indigo-700">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                            </svg>
                          </div>
                        </div>
                      </div>
                      
                      {/* Events section */}
                      <div className="space-y-3">
                        <label className="block text-lg font-medium text-gray-700">Which events will you attend?</label>
                        <div className="space-y-2">
                          <div className="bg-indigo-50 rounded-lg p-3 flex items-center">
                            <div className="w-5 h-5 rounded bg-indigo-600 flex items-center justify-center mr-3">
                              <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                              </svg>
                            </div>
                            <div>
                              <p className="font-medium text-gray-800">Mehendi Night</p>
                              <p className="text-sm text-gray-600">May 20, 6:00 PM</p>
                            </div>
                          </div>
                          
                          <div className="bg-indigo-50 rounded-lg p-3 flex items-center">
                            <div className="w-5 h-5 rounded bg-indigo-600 flex items-center justify-center mr-3">
                              <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                              </svg>
                            </div>
                            <div>
                              <p className="font-medium text-gray-800">Wedding Ceremony</p>
                              <p className="text-sm text-gray-600">May 21, 10:00 AM</p>
                            </div>
                          </div>
                          
                          <div className="bg-white border border-gray-200 rounded-lg p-3 flex items-center">
                            <div className="w-5 h-5 rounded border border-gray-300 flex items-center justify-center mr-3">
                            </div>
                            <div>
                              <p className="font-medium text-gray-800">Reception</p>
                              <p className="text-sm text-gray-600">May 22, 7:00 PM</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Right column */}
                    <div className="space-y-6">
                      {/* Dietary preferences */}
                      <div className="space-y-3">
                        <label className="block text-lg font-medium text-gray-700">Dietary preferences</label>
                        <div className="flex flex-wrap gap-2">
                          <div className="bg-indigo-50 border-2 border-indigo-600 text-indigo-700 px-3 py-1 rounded-full text-sm font-medium">
                            Vegetarian
                          </div>
                          <div className="bg-gray-100 border border-gray-300 text-gray-600 px-3 py-1 rounded-full text-sm font-medium">
                            Non-vegetarian
                          </div>
                          <div className="bg-gray-100 border border-gray-300 text-gray-600 px-3 py-1 rounded-full text-sm font-medium">
                            Vegan
                          </div>
                          <div className="bg-gray-100 border border-gray-300 text-gray-600 px-3 py-1 rounded-full text-sm font-medium">
                            Gluten-free
                          </div>
                        </div>
                      </div>
                      
                      {/* Accommodation need */}
                      <div className="space-y-3">
                        <label className="block text-lg font-medium text-gray-700">Do you need accommodation?</label>
                        <div className="flex flex-wrap gap-3">
                          <div className="bg-indigo-50 border-2 border-indigo-600 text-indigo-700 px-4 py-2 rounded-full font-medium">
                            Yes, please arrange
                          </div>
                          <div className="bg-gray-100 border border-gray-300 text-gray-600 px-4 py-2 rounded-full font-medium">
                            No, I'll arrange myself
                          </div>
                        </div>
                      </div>
                      
                      {/* Special message */}
                      <div className="space-y-3">
                        <label className="block text-lg font-medium text-gray-700">Any special message for the couple?</label>
                        <textarea 
                          className="w-full h-24 bg-white border-2 border-indigo-200 rounded-lg p-3 text-gray-700"
                          placeholder="Write your message here..."
                        ></textarea>
                      </div>
                    </div>
                  </div>
                  
                  {/* Submit button */}
                  <div className="mt-8">
                    <button className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 rounded-lg font-medium text-lg hover:from-indigo-700 hover:to-purple-700 transition duration-300 shadow-lg shadow-indigo-600/30">
                      Submit RSVP
                    </button>
                  </div>
                </div>
              </motion.div>
              
              {/* Key benefits */}
              <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Benefit 1 */}
                <motion.div 
                  className="bg-white/5 backdrop-blur-sm p-6 rounded-xl border border-white/10 fade-in-element"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  whileHover={{ y: -5 }}
                >
                  <div className="w-12 h-12 rounded-full bg-indigo-500/20 flex items-center justify-center mb-4">
                    <svg className="w-6 h-6 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <h4 className="text-xl font-medium text-white mb-2">Lightning Fast</h4>
                  <p className="text-white/70">RSVP process takes under 60 seconds for guests to complete with minimal effort.</p>
                </motion.div>
                
                {/* Benefit 2 */}
                <motion.div 
                  className="bg-white/5 backdrop-blur-sm p-6 rounded-xl border border-white/10 fade-in-element"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  whileHover={{ y: -5 }}
                >
                  <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center mb-4">
                    <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                    </svg>
                  </div>
                  <h4 className="text-xl font-medium text-white mb-2">Comprehensive</h4>
                  <p className="text-white/70">Captures all important information in one place, from attendance to special requirements.</p>
                </motion.div>
                
                {/* Benefit 3 */}
                <motion.div 
                  className="bg-white/5 backdrop-blur-sm p-6 rounded-xl border border-white/10 fade-in-element"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                  whileHover={{ y: -5 }}
                >
                  <div className="w-12 h-12 rounded-full bg-rose-500/20 flex items-center justify-center mb-4">
                    <svg className="w-6 h-6 text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                    </svg>
                  </div>
                  <h4 className="text-xl font-medium text-white mb-2">Automated</h4>
                  <p className="text-white/70">Instant data organization with zero manual entry, eliminating errors and saving hours.</p>
                </motion.div>
              </div>
            </div>
          </div>
        </section>
        
        {/* Subtle connector element */}
        <SectionTransition />
        
        {/* TRANSPORT SECTION: "Moving Together" */}
        <section id="transport" className="min-h-screen relative py-20 overflow-hidden">
          {/* Background */}
          <div className="absolute inset-0 bg-gradient-to-b from-purple-950 to-indigo-950"></div>
          
          <div className="container mx-auto px-4 relative z-10">
            {/* Section header */}
            <div className="text-center mb-16 max-w-4xl mx-auto">
              <motion.h2 
                className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-purple-300 to-indigo-300 text-transparent bg-clip-text fade-in-element"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-20% 0px" }}
                transition={{ duration: 0.8 }}
              >
                Seamless Transport Management
              </motion.h2>
              
              <motion.p
                className="text-xl text-white/80 fade-in-element"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-20% 0px" }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                Keep families together with intelligent vehicle allocation<br />
                and optimize routes automatically.
              </motion.p>
            </div>
            
            {/* Content grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Transport visualization */}
              <div className="lg:col-span-7 bg-black/30 backdrop-blur-sm rounded-xl border border-white/10 shadow-2xl overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-indigo-800 to-purple-800 p-4 flex justify-between items-center">
                  <h3 className="text-white font-medium">Transport Management Dashboard</h3>
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 rounded-full bg-red-400"></div>
                    <div className="w-2 h-2 rounded-full bg-yellow-400"></div>
                    <div className="w-2 h-2 rounded-full bg-green-400"></div>
                  </div>
                </div>
                
                {/* Dashboard content */}
                <div className="p-6 space-y-6">
                  {/* Transport groups */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Group 1 */}
                    <motion.div 
                      className="bg-white/5 p-4 rounded-lg border border-white/10"
                      whileHover={{ y: -5 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      <div className="flex justify-between items-center mb-3">
                        <h4 className="font-medium text-indigo-300">Group A: Airport Pickup</h4>
                        <span className="bg-indigo-500/20 text-indigo-300 px-2 py-1 rounded text-xs">6 guests</span>
                      </div>
                      
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-white/70">Vehicle:</span>
                          <span className="text-white">Luxury SUV</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-white/70">Pickup:</span>
                          <span className="text-white">Delhi Airport, T3</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-white/70">Time:</span>
                          <span className="text-white">May 19, 10:30 AM</span>
                        </div>
                        
                        <div className="mt-3 flex items-center">
                          <div className="flex -space-x-2">
                            <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-xs text-white">SK</div>
                            <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center text-xs text-white">AJ</div>
                            <div className="w-6 h-6 rounded-full bg-purple-500 flex items-center justify-center text-xs text-white">RK</div>
                            <div className="w-6 h-6 rounded-full bg-orange-500 flex items-center justify-center text-xs text-white">+3</div>
                          </div>
                          <span className="ml-2 text-white/60 text-xs">All from Sharma family</span>
                        </div>
                      </div>
                    </motion.div>
                    
                    {/* Group 2 */}
                    <motion.div 
                      className="bg-white/5 p-4 rounded-lg border border-white/10"
                      whileHover={{ y: -5 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      <div className="flex justify-between items-center mb-3">
                        <h4 className="font-medium text-purple-300">Group B: Hotel to Venue</h4>
                        <span className="bg-purple-500/20 text-purple-300 px-2 py-1 rounded text-xs">12 guests</span>
                      </div>
                      
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-white/70">Vehicle:</span>
                          <span className="text-white">Mini Bus</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-white/70">Pickup:</span>
                          <span className="text-white">Grand Hyatt Hotel</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-white/70">Time:</span>
                          <span className="text-white">May 20, 5:00 PM</span>
                        </div>
                        
                        <div className="mt-3 flex items-center">
                          <div className="flex -space-x-2">
                            <div className="w-6 h-6 rounded-full bg-pink-500 flex items-center justify-center text-xs text-white">MS</div>
                            <div className="w-6 h-6 rounded-full bg-yellow-500 flex items-center justify-center text-xs text-white">PG</div>
                            <div className="w-6 h-6 rounded-full bg-indigo-500 flex items-center justify-center text-xs text-white">VS</div>
                            <div className="w-6 h-6 rounded-full bg-red-500 flex items-center justify-center text-xs text-white">+9</div>
                          </div>
                          <span className="ml-2 text-white/60 text-xs">Multiple families grouped</span>
                        </div>
                      </div>
                    </motion.div>
                  </div>
                  
                  {/* Route visualization */}
                  <div className="relative h-56 bg-black/50 rounded-lg border border-white/10 flex items-center justify-center overflow-hidden">
                    {/* Grid pattern background */}
                    <div className="absolute inset-0 opacity-20 grid-pattern"></div>
                    
                    {/* Route line */}
                    <motion.div 
                      className="absolute h-1 bg-gradient-to-r from-indigo-500 to-purple-500 w-0 left-[15%] top-1/2 transform -translate-y-1/2 z-10"
                      initial={{ width: 0 }}
                      whileInView={{ width: '70%' }}
                      viewport={{ once: true }}
                      transition={{ duration: 1.5, delay: 0.5 }}
                    />
                    
                    {/* Start point */}
                    <motion.div 
                      className="absolute left-[15%] top-1/2 w-4 h-4 bg-indigo-500 rounded-full transform -translate-y-1/2 z-20 shadow-lg shadow-indigo-500/50"
                      initial={{ scale: 0 }}
                      whileInView={{ scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.4, delay: 0.3 }}
                    />
                    
                    {/* Waypoint */}
                    <motion.div 
                      className="absolute left-[45%] top-1/2 w-3 h-3 bg-pink-500 rounded-full transform -translate-y-1/2 z-20 shadow-lg shadow-pink-500/50"
                      initial={{ scale: 0 }}
                      whileInView={{ scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.4, delay: 0.8 }}
                    />
                    
                    {/* End point */}
                    <motion.div 
                      className="absolute right-[15%] top-1/2 w-4 h-4 bg-purple-500 rounded-full transform -translate-y-1/2 z-20 shadow-lg shadow-purple-500/50"
                      initial={{ scale: 0 }}
                      whileInView={{ scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.4, delay: 1.3 }}
                    />
                    
                    <div className="text-white text-center z-10">
                      <p className="text-lg font-medium text-white/80">Intelligent Route Planning</p>
                      <p className="text-sm text-white/60">Optimized for guest comfort and efficiency</p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Transport features */}
              <div className="lg:col-span-5 space-y-6">
                <h3 className="text-2xl font-bold text-indigo-300 mb-4">Family-First Transport</h3>
                
                <div className="space-y-4">
                  {/* Feature 1 */}
                  <motion.div 
                    className="flex p-4 bg-white/5 backdrop-blur-sm rounded-lg border border-white/10"
                    whileHover={{ x: 10 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <div className="mr-4 flex-shrink-0">
                      <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium text-white">Family Priority Mode</h4>
                      <p className="text-white/70 text-sm mt-1">Intelligently groups related guests in the same vehicle, ensuring families stay together throughout the journey.</p>
                    </div>
                  </motion.div>
                  
                  {/* Feature 2 */}
                  <motion.div 
                    className="flex p-4 bg-white/5 backdrop-blur-sm rounded-lg border border-white/10"
                    whileHover={{ x: 10 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <div className="mr-4 flex-shrink-0">
                      <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                        </svg>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium text-white">Smart Route Optimization</h4>
                      <p className="text-white/70 text-sm mt-1">Calculates the most efficient routes between venues, accommodations, and airports to minimize travel time.</p>
                    </div>
                  </motion.div>
                  
                  {/* Feature 3 */}
                  <motion.div 
                    className="flex p-4 bg-white/5 backdrop-blur-sm rounded-lg border border-white/10"
                    whileHover={{ x: 10 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <div className="mr-4 flex-shrink-0">
                      <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                        </svg>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium text-white">Real-time Notifications</h4>
                      <p className="text-white/70 text-sm mt-1">Automatically notifies guests of pickup times, delays, and schedule changes via WhatsApp or SMS.</p>
                    </div>
                  </motion.div>
                  
                  {/* Feature 4 */}
                  <motion.div 
                    className="flex p-4 bg-white/5 backdrop-blur-sm rounded-lg border border-white/10"
                    whileHover={{ x: 10 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <div className="mr-4 flex-shrink-0">
                      <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                        </svg>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium text-white">Vehicle Capacity Management</h4>
                      <p className="text-white/70 text-sm mt-1">Intelligently assigns vehicles based on group size, luggage requirements, and special needs.</p>
                    </div>
                  </motion.div>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* Subtle connector element */}
        <SectionTransition />
        
        {/* AI CONCIERGE SECTION: "Your Digital Assistant" */}
        <section id="ai-concierge" className="min-h-screen relative py-20 overflow-hidden">
          {/* Background */}
          <div className="absolute inset-0 bg-gradient-to-b from-indigo-950 to-purple-950"></div>
          
          <div className="container mx-auto px-4 relative z-10">
            {/* Section header */}
            <div className="text-center mb-16 max-w-4xl mx-auto">
              <motion.h2 
                className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-indigo-300 to-purple-300 text-transparent bg-clip-text fade-in-element"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-20% 0px" }}
                transition={{ duration: 0.8 }}
              >
                AI Wedding Concierge
              </motion.h2>
              
              <motion.p
                className="text-xl text-white/80 fade-in-element"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-20% 0px" }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                Personalized assistance for you and your guests,<br />
                available 24/7 to answer questions and solve problems.
              </motion.p>
            </div>
            
            {/* Content grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
              {/* AI Chat Interface */}
              <div className="bg-black/30 backdrop-blur-sm rounded-xl border border-white/10 shadow-2xl overflow-hidden h-[500px] flex flex-col">
                {/* Chat header */}
                <div className="bg-gradient-to-r from-purple-800 to-indigo-800 p-3 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-indigo-300 flex items-center justify-center text-indigo-800 font-bold">AI</div>
                  <h3 className="text-white font-medium">Wedding Assistant</h3>
                </div>
                
                {/* Chat messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {/* Assistant message */}
                  <motion.div 
                    className="flex items-start gap-2"
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4 }}
                  >
                    <div className="w-8 h-8 rounded-full bg-indigo-300 flex-shrink-0 flex items-center justify-center text-indigo-800 font-bold">AI</div>
                    <div className="bg-white/10 rounded-2xl rounded-tl-none p-3 text-white max-w-[80%]">
                      <p className="text-sm">Hello! I'm your wedding assistant. How can I help you today?</p>
                    </div>
                  </motion.div>
                  
                  {/* User message */}
                  <motion.div 
                    className="flex items-start gap-2 justify-end"
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: 0.4 }}
                  >
                    <div className="bg-indigo-600/30 rounded-2xl rounded-tr-none p-3 text-white max-w-[80%]">
                      <p className="text-sm">I need to find out which guests have dietary restrictions for the reception dinner.</p>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-purple-500 flex-shrink-0 flex items-center justify-center text-white font-bold">U</div>
                  </motion.div>
                  
                  {/* Assistant response with analysis */}
                  <motion.div 
                    className="flex items-start gap-2"
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: 0.8 }}
                  >
                    <div className="w-8 h-8 rounded-full bg-indigo-300 flex-shrink-0 flex items-center justify-center text-indigo-800 font-bold">AI</div>
                    <div className="bg-white/10 rounded-2xl rounded-tl-none p-3 text-white max-w-[80%]">
                      <p className="text-sm">I've analyzed your guest list and found 12 guests with dietary restrictions:</p>
                      <ul className="mt-2 space-y-1 text-xs text-white/80">
                        <li>• 8 vegetarian guests</li>
                        <li>• 2 vegan guests</li>
                        <li>• 1 gluten-free guest</li>
                        <li>• 1 guest with nut allergies</li>
                      </ul>
                      <p className="mt-2 text-sm">Would you like me to send this information to your caterer?</p>
                    </div>
                  </motion.div>
                  
                  {/* User confirmation */}
                  <motion.div 
                    className="flex items-start gap-2 justify-end"
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: 1.2 }}
                  >
                    <div className="bg-indigo-600/30 rounded-2xl rounded-tr-none p-3 text-white max-w-[80%]">
                      <p className="text-sm">Yes, please! Also, can you tell me which hotel has the most guests staying in it?</p>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-purple-500 flex-shrink-0 flex items-center justify-center text-white font-bold">U</div>
                  </motion.div>
                  
                  {/* Assistant accommodation analysis */}
                  <motion.div 
                    className="flex items-start gap-2"
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: 1.6 }}
                  >
                    <div className="w-8 h-8 rounded-full bg-indigo-300 flex-shrink-0 flex items-center justify-center text-indigo-800 font-bold">AI</div>
                    <div className="bg-white/10 rounded-2xl rounded-tl-none p-3 text-white max-w-[80%]">
                      <p className="text-sm">I've sent the dietary information to Urban Spice Catering via email.</p>
                      <p className="mt-2 text-sm">Regarding accommodations, the Grand Hyatt Delhi has the most guests with 28 rooms booked, followed by The Imperial with 12 rooms.</p>
                      <p className="mt-2 text-sm">Would you like me to arrange transportation between these hotels and the venue?</p>
                    </div>
                  </motion.div>
                </div>
                
                {/* Chat input */}
                <div className="p-3 bg-black/60 flex gap-2">
                  <input 
                    type="text" 
                    className="flex-1 bg-white/10 border border-white/20 rounded-full px-4 py-2 text-white text-sm"
                    placeholder="Ask anything about your wedding..."
                  />
                  <button className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-full w-10 h-10 flex items-center justify-center">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>
              
              {/* AI Features */}
              <div className="space-y-6">
                <h3 className="text-2xl font-bold text-purple-300 mb-6">How AI Transforms Your Wedding</h3>
                
                <div className="space-y-5">
                  {/* Feature 1 */}
                  <motion.div 
                    className="bg-white/5 p-5 rounded-lg border border-white/10"
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                    whileHover={{ scale: 1.02 }}
                  >
                    <div className="flex items-center mb-3">
                      <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center mr-4">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div>
                        <h4 className="text-xl font-medium text-white">Instant Guest Support</h4>
                        <p className="text-white/70 mt-1">Answers questions about venues, timings, dress codes, and local information in multiple languages.</p>
                      </div>
                    </div>
                  </motion.div>
                  
                  {/* Feature 2 */}
                  <motion.div 
                    className="bg-white/5 p-5 rounded-lg border border-white/10"
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    whileHover={{ scale: 1.02 }}
                  >
                    <div className="flex items-center mb-3">
                      <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center mr-4">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                        </svg>
                      </div>
                      <div>
                        <h4 className="text-xl font-medium text-white">Smart Task Management</h4>
                        <p className="text-white/70 mt-1">Proactively identifies tasks, sends reminders, and tracks completion to ensure nothing is missed.</p>
                      </div>
                    </div>
                  </motion.div>
                  
                  {/* Feature 3 */}
                  <motion.div 
                    className="bg-white/5 p-5 rounded-lg border border-white/10"
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                    whileHover={{ scale: 1.02 }}
                  >
                    <div className="flex items-center mb-3">
                      <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center mr-4">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                      </div>
                      <div>
                        <h4 className="text-xl font-medium text-white">Data Analysis & Insights</h4>
                        <p className="text-white/70 mt-1">Analyzes RSVP patterns, identifies potential issues, and provides actionable recommendations.</p>
                      </div>
                    </div>
                  </motion.div>
                  
                  {/* Feature 4 */}
                  <motion.div 
                    className="bg-white/5 p-5 rounded-lg border border-white/10"
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.6 }}
                    whileHover={{ scale: 1.02 }}
                  >
                    <div className="flex items-center mb-3">
                      <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center mr-4">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
                        </svg>
                      </div>
                      <div>
                        <h4 className="text-xl font-medium text-white">Multilingual Support</h4>
                        <p className="text-white/70 mt-1">Provides assistance in multiple languages to accommodate international guests and family members.</p>
                      </div>
                    </div>
                  </motion.div>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* Subtle connector element */}
        <SectionTransition />
        
        {/* DASHBOARD SECTION: "Command Center" */}
        <section id="dashboard" className="min-h-screen relative py-20 overflow-hidden">
          {/* Background */}
          <div className="absolute inset-0 bg-gradient-to-b from-purple-950 to-black"></div>
          
          <div className="container mx-auto px-4 relative z-10">
            {/* Section header */}
            <div className="text-center mb-16 max-w-4xl mx-auto">
              <motion.h2 
                className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-purple-300 to-indigo-300 text-transparent bg-clip-text fade-in-element"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-20% 0px" }}
                transition={{ duration: 0.8 }}
              >
                Your Wedding Command Center
              </motion.h2>
              
              <motion.p
                className="text-xl text-white/80 fade-in-element"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-20% 0px" }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                All your wedding planning tools in one beautiful,<br />
                intuitive dashboard.
              </motion.p>
            </div>
            
            {/* Dashboard visualization */}
            <motion.div 
              className="bg-black/30 backdrop-blur-sm rounded-xl border border-white/10 shadow-2xl overflow-hidden"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <div className="grid grid-cols-1 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-white/10">
                {/* Dashboard stats */}
                <div className="p-6">
                  <h4 className="text-lg font-medium text-white mb-4">Event Overview</h4>
                  
                  <div className="space-y-4">
                    {/* Total guests */}
                    <motion.div 
                      className="bg-white/5 rounded-lg p-3"
                      whileHover={{ scale: 1.03 }}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-white/70">Total Guests</span>
                        <span className="text-white font-medium">248</span>
                      </div>
                      <div className="mt-2 h-2 bg-white/10 rounded-full overflow-hidden">
                        <motion.div 
                          className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"
                          initial={{ width: 0 }}
                          whileInView={{ width: '85%' }}
                          viewport={{ once: true }}
                          transition={{ duration: 1, delay: 0.2 }}
                        />
                      </div>
                      <div className="flex justify-between mt-1 text-xs">
                        <span className="text-white/60">Invited: 290</span>
                        <span className="text-indigo-400">85% Responded</span>
                      </div>
                    </motion.div>
                    
                    {/* RSVP status */}
                    <motion.div 
                      className="bg-white/5 rounded-lg p-3"
                      whileHover={{ scale: 1.03 }}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-white/70">RSVP Status</span>
                        <span className="text-green-400 font-medium">198 Attending</span>
                      </div>
                      <div className="mt-2 h-2 bg-white/10 rounded-full overflow-hidden">
                        <motion.div 
                          className="h-full bg-gradient-to-r from-green-500 to-teal-500 rounded-full"
                          initial={{ width: 0 }}
                          whileInView={{ width: '80%' }}
                          viewport={{ once: true }}
                          transition={{ duration: 1, delay: 0.3 }}
                        />
                      </div>
                      <div className="flex justify-between mt-1 text-xs">
                        <span className="text-white/60">Not Attending: 50</span>
                        <span className="text-green-400">80% Acceptance</span>
                      </div>
                    </motion.div>
                    
                    {/* Tasks */}
                    <motion.div 
                      className="bg-white/5 rounded-lg p-3"
                      whileHover={{ scale: 1.03 }}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-white/70">Tasks Completed</span>
                        <span className="text-indigo-400 font-medium">32/38</span>
                      </div>
                      <div className="mt-2 h-2 bg-white/10 rounded-full overflow-hidden">
                        <motion.div 
                          className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full"
                          initial={{ width: 0 }}
                          whileInView={{ width: '84%' }}
                          viewport={{ once: true }}
                          transition={{ duration: 1, delay: 0.4 }}
                        />
                      </div>
                      <div className="flex justify-between mt-1 text-xs">
                        <span className="text-white/60">6 Remaining</span>
                        <span className="text-indigo-400">84% Complete</span>
                      </div>
                    </motion.div>
                  </div>
                </div>
                
                {/* Recent activity */}
                <div className="p-6">
                  <h4 className="text-lg font-medium text-white mb-4">Recent Activity</h4>
                  
                  <div className="space-y-3">
                    <motion.div 
                      className="flex items-start gap-3"
                      initial={{ opacity: 0, x: -10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.4 }}
                    >
                      <div className="w-8 h-8 rounded-full bg-green-400/10 flex items-center justify-center text-green-400 flex-shrink-0">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-white text-sm font-medium">New RSVP: Sharma Family (4)</p>
                        <p className="text-white/50 text-xs">2 minutes ago</p>
                      </div>
                    </motion.div>
                    
                    <motion.div 
                      className="flex items-start gap-3"
                      initial={{ opacity: 0, x: -10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.4, delay: 0.1 }}
                    >
                      <div className="w-8 h-8 rounded-full bg-indigo-400/10 flex items-center justify-center text-indigo-400 flex-shrink-0">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-white text-sm font-medium">Catering appointment confirmed</p>
                        <p className="text-white/50 text-xs">35 minutes ago</p>
                      </div>
                    </motion.div>
                    
                    <motion.div 
                      className="flex items-start gap-3"
                      initial={{ opacity: 0, x: -10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.4, delay: 0.2 }}
                    >
                      <div className="w-8 h-8 rounded-full bg-purple-400/10 flex items-center justify-center text-purple-400 flex-shrink-0">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-white text-sm font-medium">12 new guests added to list</p>
                        <p className="text-white/50 text-xs">2 hours ago</p>
                      </div>
                    </motion.div>
                    
                    <motion.div 
                      className="flex items-start gap-3"
                      initial={{ opacity: 0, x: -10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.4, delay: 0.3 }}
                    >
                      <div className="w-8 h-8 rounded-full bg-blue-400/10 flex items-center justify-center text-blue-400 flex-shrink-0">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-white text-sm font-medium">RSVP reminders sent (24)</p>
                        <p className="text-white/50 text-xs">5 hours ago</p>
                      </div>
                    </motion.div>
                  </div>
                </div>
                
                {/* Tasks */}
                <div className="p-6 md:col-span-2">
                  <h4 className="text-lg font-medium text-white mb-4">Upcoming Tasks</h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <motion.div 
                      className="bg-white/5 rounded-lg p-3 flex items-center gap-3"
                      initial={{ opacity: 0, y: 10 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5 }}
                      whileHover={{ x: 5 }}
                    >
                      <div className="w-10 h-10 rounded-lg bg-indigo-500/20 flex items-center justify-center text-indigo-400">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <div>
                        <h5 className="text-white text-sm font-medium">Finalize menu selections</h5>
                        <p className="text-white/60 text-xs">Due in 2 days</p>
                      </div>
                      <div className="ml-auto">
                        <span className="bg-indigo-500/20 text-indigo-300 text-xs px-2 py-1 rounded">High</span>
                      </div>
                    </motion.div>
                    
                    <motion.div 
                      className="bg-white/5 rounded-lg p-3 flex items-center gap-3"
                      initial={{ opacity: 0, y: 10 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, delay: 0.1 }}
                      whileHover={{ x: 5 }}
                    >
                      <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center text-purple-400">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z" />
                        </svg>
                      </div>
                      <div>
                        <h5 className="text-white text-sm font-medium">Confirm floral arrangements</h5>
                        <p className="text-white/60 text-xs">Due in 3 days</p>
                      </div>
                      <div className="ml-auto">
                        <span className="bg-purple-500/20 text-purple-300 text-xs px-2 py-1 rounded">Medium</span>
                      </div>
                    </motion.div>
                    
                    <motion.div 
                      className="bg-white/5 rounded-lg p-3 flex items-center gap-3"
                      initial={{ opacity: 0, y: 10 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, delay: 0.2 }}
                      whileHover={{ x: 5 }}
                    >
                      <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center text-green-400">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                      <div>
                        <h5 className="text-white text-sm font-medium">Schedule final dress fitting</h5>
                        <p className="text-white/60 text-xs">Due in 5 days</p>
                      </div>
                      <div className="ml-auto">
                        <span className="bg-green-500/20 text-green-300 text-xs px-2 py-1 rounded">Normal</span>
                      </div>
                    </motion.div>
                    
                    <motion.div 
                      className="bg-white/5 rounded-lg p-3 flex items-center gap-3"
                      initial={{ opacity: 0, y: 10 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, delay: 0.3 }}
                      whileHover={{ x: 5 }}
                    >
                      <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center text-blue-400">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                      </div>
                      <div>
                        <h5 className="text-white text-sm font-medium">Review seating arrangements</h5>
                        <p className="text-white/60 text-xs">Due in 6 days</p>
                      </div>
                      <div className="ml-auto">
                        <span className="bg-blue-500/20 text-blue-300 text-xs px-2 py-1 rounded">Normal</span>
                      </div>
                    </motion.div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>
        
        {/* Subtle connector element */}
        <SectionTransition />
        
        {/* CALL TO ACTION SECTION: "Begin Your Journey" */}
        <section id="cta" className="min-h-screen relative py-20 overflow-hidden flex items-center">
          {/* Background */}
          <div className="absolute inset-0 bg-gradient-to-b from-black to-indigo-950"></div>
          
          {/* Decorative elements */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute w-64 h-64 rounded-full border border-indigo-600/10 top-10 left-10 animate-float1"></div>
            <div className="absolute w-96 h-96 rounded-full border-2 border-purple-500/10 bottom-20 right-10 animate-float2"></div>
            <div className="absolute top-1/3 right-1/4 w-72 h-72 bg-purple-900/10 rounded-full blur-3xl"></div>
            <div className="absolute bottom-1/3 left-1/4 w-72 h-72 bg-indigo-900/10 rounded-full blur-3xl"></div>
          </div>
          
          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-3xl mx-auto text-center">
              <motion.h2 
                className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-rose-300 via-purple-300 to-indigo-300 text-transparent bg-clip-text"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
              >
                Begin Your Perfect Wedding Journey
              </motion.h2>
              
              <motion.p
                className="text-xl text-white/80 mb-10"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                Join thousands of couples who planned their dream wedding with Eternally Yours.
                Get started today and transform your wedding planning experience.
              </motion.p>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.4 }}
              >
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-lg shadow-lg shadow-purple-900/20 px-8"
                  asChild
                >
                  <Link href="/auth">Create Your Wedding</Link>
                </Button>
              </motion.div>
              
              {/* Testimonial */}
              <motion.div
                className="mt-16 bg-white/5 backdrop-blur-sm p-6 rounded-xl border border-white/10"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.6 }}
              >
                <div className="flex items-center justify-center mb-4">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <svg key={star} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="text-white italic mb-4">
                  "Eternally Yours transformed our wedding planning from chaos to clarity. 
                  The RSVP system and family transport planning saved us countless hours and eliminated so many headaches."
                </p>
                <div>
                  <p className="text-indigo-300 font-medium">Priya & Rahul Sharma</p>
                  <p className="text-white/60 text-sm">Married May 2025 • Delhi</p>
                </div>
              </motion.div>
            </div>
          </div>
        </section>
      </main>
      
      {/* Footer */}
      <footer className="bg-black border-t border-white/10 py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-white font-medium mb-4">Product</h3>
              <ul className="space-y-2">
                <li><a href="#" onClick={() => scrollToSection('breakthrough')} className="text-white/60 hover:text-white transition text-sm">Features</a></li>
                <li><a href="#" onClick={() => scrollToSection('rsvp')} className="text-white/60 hover:text-white transition text-sm">RSVP System</a></li>
                <li><a href="#" onClick={() => scrollToSection('transport')} className="text-white/60 hover:text-white transition text-sm">Transport Planning</a></li>
                <li><a href="#" onClick={() => scrollToSection('ai-concierge')} className="text-white/60 hover:text-white transition text-sm">AI Assistant</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-white font-medium mb-4">Company</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-white/60 hover:text-white transition text-sm">About</a></li>
                <li><a href="#" className="text-white/60 hover:text-white transition text-sm">Team</a></li>
                <li><a href="#" className="text-white/60 hover:text-white transition text-sm">Careers</a></li>
                <li><a href="#" className="text-white/60 hover:text-white transition text-sm">Contact</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-white font-medium mb-4">Resources</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-white/60 hover:text-white transition text-sm">Blog</a></li>
                <li><a href="#" className="text-white/60 hover:text-white transition text-sm">Wedding Guide</a></li>
                <li><a href="#" className="text-white/60 hover:text-white transition text-sm">Support Center</a></li>
                <li><a href="#" className="text-white/60 hover:text-white transition text-sm">Privacy Policy</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-white font-medium mb-4">Connect</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-white/60 hover:text-white transition text-sm">Instagram</a></li>
                <li><a href="#" className="text-white/60 hover:text-white transition text-sm">Twitter</a></li>
                <li><a href="#" className="text-white/60 hover:text-white transition text-sm">Facebook</a></li>
                <li><a href="#" className="text-white/60 hover:text-white transition text-sm">LinkedIn</a></li>
              </ul>
            </div>
          </div>
          
          <div className="mt-8 pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center">
            <p className="text-white/60 text-sm">© 2025 Eternally Yours. All rights reserved.</p>
            <div className="mt-4 md:mt-0 flex space-x-4">
              <a href="#" className="text-white/60 hover:text-white transition text-sm">Terms</a>
              <a href="#" className="text-white/60 hover:text-white transition text-sm">Privacy</a>
              <a href="#" className="text-white/60 hover:text-white transition text-sm">Cookies</a>
            </div>
          </div>
        </div>
      </footer>
      
      {/* Custom styles */}
      <style jsx>{`
        .section-transition {
          display: flex;
          flex-direction: column;
          align-items: center;
          height: 6rem;
          margin: -3rem 0;
          position: relative;
          z-index: 20;
        }
        
        .section-transition .line {
          width: 1px;
          height: 2.5rem;
          background: linear-gradient(to bottom, rgba(255,255,255,0.3), rgba(255,255,255,0));
        }
        
        .section-transition .dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: rgba(255,255,255,0.5);
          margin: 0.25rem 0;
        }
        
        .text-3d {
          transform-style: preserve-3d;
          perspective: 1000px;
          display: inline-block;
        }
        
        .grid-pattern {
          background-image: url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAwIDEwIEwgNDAgMTAgTSAxMCAwIEwgMTAgNDAgTSAwIDIwIEwgNDAgMjAgTSAyMCAwIEwgMjAgNDAgTSAwIDMwIEwgNDAgMzAgTSAzMCAwIEwgMzAgNDAiIHN0cm9rZT0iI2ZmZiIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+');
        }
      `}</style>
    </div>
  );
}