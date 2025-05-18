import React, { useEffect, useState, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { motion } from 'framer-motion';
import { StorySection } from '@/components/landing/story-section';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';

// Register GSAP plugins to ensure proper scrolling
gsap.registerPlugin(ScrollTrigger);

/**
 * A completely redesigned immersive landing page with visual storytelling
 * similar to high-end websites like cornrevolution
 */
export default function VisualStorytelling() {
  const [activeSection, setActiveSection] = useState('hero');
  
  // Enhanced navigation with visual indicators
  const navigationItems = [
    { id: 'hero', label: 'Home' },
    { id: 'problem', label: 'Challenge' },
    { id: 'solution', label: 'Solution' },
    { id: 'rsvp', label: 'RSVP System' },
    { id: 'rooms', label: 'Accommodations' },
    { id: 'transport', label: 'Transport' },
    { id: 'dashboard', label: 'Dashboard' }
  ];
  
  // Handle smooth scrolling to sections
  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      // Smooth scroll with browser API
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setActiveSection(id);
    }
  };
  
  // Track visible sections for navigation highlighting and implement scroll-driven animations
  useEffect(() => {
    // Set up IntersectionObserver for section visibility
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio > 0.5) {
            const id = entry.target.id;
            setActiveSection(id);
            
            // Add animation class for elements that should animate on enter
            const animateOnEnter = entry.target.querySelectorAll('.animate-on-enter');
            animateOnEnter.forEach(el => {
              el.classList.add('section-visible');
            });
            
            // Handle lazy-loaded elements
            const lazyElements = entry.target.querySelectorAll('.lazy-load');
            lazyElements.forEach(el => {
              setTimeout(() => {
                el.classList.add('loaded');
              }, 300);
            });
          }
        });
      },
      {
        rootMargin: "-20% 0px -20% 0px",
        threshold: 0.5
      }
    );
    
    // Observe all sections for visibility changes
    document.querySelectorAll('section[id]').forEach(section => {
      observer.observe(section);
    });
    
    // Set up scroll-driven animations
    const handleScroll = () => {
      // Calculate scroll percentage for parallax effects
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight;
      const winHeight = window.innerHeight;
      const scrollPercent = scrollTop / (docHeight - winHeight);
      
      // Apply scroll percentage to parallax elements
      document.documentElement.style.setProperty('--scroll-percentage', String(scrollPercent));
      
      // Apply different parallax speeds to elements
      const parallaxElements = document.querySelectorAll('.parallax-element');
      parallaxElements.forEach(el => {
        const speed = el.classList.contains('parallax-slow') ? 0.3 :
                      el.classList.contains('parallax-fast') ? 0.7 : 0.5;
                      
        const yMove = scrollTop * speed;
        (el as HTMLElement).style.transform = `translateY(-${yMove}px)`;
      });
    };
    
    // Add scroll listener for parallax effects
    window.addEventListener('scroll', handleScroll);
    
    // Initial call to set positions
    handleScroll();
    
    // Cleanup
    return () => {
      document.querySelectorAll('section[id]').forEach(section => {
        observer.unobserve(section);
      });
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <div className="bg-black text-white overflow-hidden">
      {/* Fixed navigation */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-black/60 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-script bg-gradient-to-r from-rose-300 via-purple-300 to-indigo-300 text-transparent bg-clip-text">
            Eternally Yours
          </h1>
          
          <nav className="hidden md:flex space-x-1">
            {navigationItems.map(item => (
              <a
                key={item.id}
                href={`#${item.id}`}
                onClick={(e) => handleNavClick(e, item.id)}
                className={`px-4 py-2 text-sm font-medium rounded-full transition-all duration-300 
                  ${activeSection === item.id 
                    ? 'bg-gradient-to-r from-purple-600/80 to-indigo-600/80 text-white' 
                    : 'text-white/70 hover:bg-white/10 hover:text-white'}`}
              >
                {item.label}
              </a>
            ))}
          </nav>
          
          <Button 
            className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
            asChild
          >
            <Link href="/auth">Get Started</Link>
          </Button>
        </div>
      </header>

      {/* Hero Section with 3D Typography */}
      <section 
        id="hero" 
        className="h-screen flex items-center justify-center relative overflow-hidden bg-gradient-to-b from-purple-900 via-indigo-900 to-black"
      >
        <div className="absolute inset-0 overflow-hidden">
          {/* Animated geometric shapes */}
          <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full border-2 border-purple-500/20 animate-float1"></div>
          <div className="absolute top-2/3 right-1/4 w-64 h-64 rounded-full border border-indigo-400/30 animate-float2"></div>
          <div className="absolute bottom-1/4 left-1/3 w-32 h-32 rounded-full border border-pink-500/20 animate-float3"></div>
          <div className="absolute top-1/2 right-1/3 w-80 h-80 border border-indigo-600/10 transform rotate-45 animate-float4"></div>
          
          {/* Glowing orbs */}
          <div className="absolute top-1/3 left-2/3 w-40 h-40 rounded-full bg-purple-800/10 blur-xl"></div>
          <div className="absolute bottom-1/3 right-2/3 w-32 h-32 rounded-full bg-indigo-600/10 blur-xl"></div>
          <div className="absolute top-2/3 right-1/2 w-24 h-24 rounded-full bg-pink-700/10 blur-xl"></div>
        </div>
        
        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/70"></div>
        
        {/* Hero content */}
        <div className="relative z-10 text-center px-6 max-w-4xl mx-auto">
          <motion.h1 
            className="text-3d text-6xl md:text-8xl font-script mb-8 bg-gradient-to-r from-rose-300 via-purple-300 to-indigo-300 text-transparent bg-clip-text"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, ease: [0.19, 1, 0.22, 1] }}
          >
            Eternally Yours
          </motion.h1>
          
          <motion.p
            className="text-xl md:text-2xl mb-12 text-white/90"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.3, ease: "easeOut" }}
          >
            The most elegant wedding management platform for Indian weddings.
            From guest management to itinerary planning, we make it seamless.
          </motion.p>
          
          <motion.div
            className="flex flex-col sm:flex-row gap-4 justify-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <Button 
              size="lg" 
              className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 border-0 shadow-lg shadow-purple-900/20"
              asChild
            >
              <Link href="/auth">Get Started</Link>
            </Button>
            
            <Button 
              size="lg" 
              variant="outline" 
              className="border-white text-white hover:bg-white/10"
              asChild
            >
              <a href="#problem" onClick={(e) => handleNavClick(e, 'problem')}>See How It Works</a>
            </Button>
          </motion.div>
        </div>
        
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
      </section>
      
      {/* Problem Statement Section with Interactive Elements */}
      <StorySection
        id="problem"
        title="The ceremony is beautiful. The backend is broken."
        subtitle="Behind every perfect wedding is a chaotic mess of spreadsheets, WhatsApp threads, and manual coordination."
        background="bg-gradient-to-b from-indigo-950 to-black"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <div className="interactive-card bg-white/5 backdrop-blur-sm p-8 rounded-xl border border-white/10 shadow-xl transform transition-all duration-500 lazy-load">
            <h3 className="text-2xl font-bold mb-4 text-purple-300">The Chaos</h3>
            <ul className="space-y-4">
              <li className="flex items-start parallax-element parallax-slow">
                <div className="bg-purple-500/20 p-2 rounded-full mr-3 mt-1">
                  <svg className="w-5 h-5 text-purple-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-medium text-lg">15+ Scattered Spreadsheets</h4>
                  <p className="text-white/70">Different formats, inconsistent data, and manually tracking hundreds of guests.</p>
                </div>
              </li>
              
              <li className="flex items-start parallax-element parallax-medium">
                <div className="bg-indigo-500/20 p-2 rounded-full mr-3 mt-1">
                  <svg className="w-5 h-5 text-indigo-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-medium text-lg">Endless WhatsApp Threads</h4>
                  <p className="text-white/70">Losing track of RSVPs, special requests, and important conversations in chat noise.</p>
                </div>
              </li>
              
              <li className="flex items-start parallax-element parallax-fast">
                <div className="bg-pink-500/20 p-2 rounded-full mr-3 mt-1">
                  <svg className="w-5 h-5 text-pink-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-medium text-lg">Manual Room Assignments</h4>
                  <p className="text-white/70">Hours spent matching guests to appropriate accommodations with complex family needs.</p>
                </div>
              </li>
            </ul>
          </div>
          
          <div className="interactive-card bg-white/5 backdrop-blur-sm p-8 rounded-xl border border-white/10 shadow-xl transform transition-all duration-500 lazy-load" style={{transitionDelay: '0.2s'}}>
            <h3 className="text-2xl font-bold mb-4 text-indigo-300">Real Consequences</h3>
            <div className="space-y-6">
              <motion.div 
                className="flex items-center story-element"
                whileHover={{ scale: 1.03, x: 5 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div className="w-16 h-16 flex items-center justify-center bg-indigo-500/10 rounded-lg mr-4">
                  <svg className="w-8 h-8 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-medium">100+ Hours Wasted</h4>
                  <p className="text-white/70">Time that could be spent on meaningful wedding experiences.</p>
                </div>
              </motion.div>
              
              <motion.div 
                className="flex items-center story-element"
                whileHover={{ scale: 1.03, x: 5 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div className="w-16 h-16 flex items-center justify-center bg-purple-500/10 rounded-lg mr-4">
                  <svg className="w-8 h-8 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 11.5V14m0-2.5v-6a2.5 2.5 0 015 0v6M7 7h1m-1 3h1m3-3h1m-1 3h1M3 21h18M3 10h18M3 7h18M4 4h16v3H4V4z" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-medium">Increased Stress</h4>
                  <p className="text-white/70">When wedding planning becomes a logistics nightmare.</p>
                </div>
              </motion.div>
              
              <motion.div 
                className="flex items-center story-element"
                whileHover={{ scale: 1.03, x: 5 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div className="w-16 h-16 flex items-center justify-center bg-rose-500/10 rounded-lg mr-4">
                  <svg className="w-8 h-8 text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-medium">Guest Experience Suffers</h4>
                  <p className="text-white/70">Information gaps lead to confusion and miscommunication.</p>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </StorySection>
      
      {/* Solution Section */}
      <StorySection
        id="solution"
        title="The most elegant RSVP you'll never have to explain."
        subtitle="An intuitive system that handles everything from attendance to dietary requirements."
        background="bg-gradient-to-b from-black to-purple-950"
      >
        <div className="bg-white rounded-xl overflow-hidden shadow-2xl">
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
              <div className="h-10 w-24 bg-gray-100 rounded-md flex items-center justify-center text-gray-800">2</div>
            </div>
            
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Which events will you attend?</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="bg-indigo-100 p-3 rounded-lg flex items-center">
                  <div className="bg-indigo-200 rounded-md p-1 mr-3">
                    <svg className="w-5 h-5 text-indigo-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-indigo-800 font-medium">Mehendi Night</p>
                    <p className="text-indigo-600 text-xs">May 20, 6:00 PM</p>
                  </div>
                </div>
                
                <div className="bg-indigo-100 p-3 rounded-lg flex items-center">
                  <div className="bg-indigo-200 rounded-md p-1 mr-3">
                    <svg className="w-5 h-5 text-indigo-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-indigo-800 font-medium">Wedding Ceremony</p>
                    <p className="text-indigo-600 text-xs">May 21, 10:00 AM</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Dietary restrictions</label>
              <div className="flex flex-wrap gap-2">
                <span className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm">Vegetarian</span>
                <span className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm">No Seafood</span>
                <span className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm">Gluten Free</span>
              </div>
            </div>
            
            <button className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 rounded-md font-medium shadow-md">
              Submit RSVP
            </button>
          </div>
        </div>
      </StorySection>
      
      {/* Transport Management Section */}
      <StorySection
        id="transport"
        title="Seamless Transport Management"
        subtitle="Keep families together with intelligent vehicle allocation and optimize routes automatically."
        background="bg-gradient-to-b from-indigo-900 to-purple-950"
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Transport System Visualization */}
          <div className="lg:col-span-7 bg-white/5 backdrop-blur-sm rounded-xl overflow-hidden border border-white/10 shadow-xl lazy-load">
            <div className="bg-gradient-to-r from-indigo-800 to-purple-800 p-3 flex justify-between items-center">
              <h3 className="text-white font-medium">Transport Management Dashboard</h3>
              <div className="flex space-x-1">
                <div className="w-2 h-2 rounded-full bg-red-400"></div>
                <div className="w-2 h-2 rounded-full bg-yellow-400"></div>
                <div className="w-2 h-2 rounded-full bg-green-400"></div>
              </div>
            </div>
            
            <div className="p-5 space-y-4">
              {/* Transport Groups */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <motion.div 
                  className="bg-white/10 p-3 rounded-lg interactive-card"
                  whileHover={{ y: -5 }}
                >
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="font-medium text-indigo-300">Group A: Airport Pickup</h4>
                    <span className="bg-indigo-600/30 text-indigo-300 px-2 py-1 rounded text-xs">6 guests</span>
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-white/70">Vehicle:</span>
                      <span className="text-white">Luxury SUV</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/70">Pickup:</span>
                      <span className="text-white">Delhi Airport, Terminal 3</span>
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
                
                <motion.div 
                  className="bg-white/10 p-3 rounded-lg interactive-card"
                  whileHover={{ y: -5 }}
                >
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="font-medium text-purple-300">Group B: Hotel to Venue</h4>
                    <span className="bg-purple-600/30 text-purple-300 px-2 py-1 rounded text-xs">12 guests</span>
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
              
              {/* Route Map Placeholder */}
              <div className="h-56 bg-gradient-to-b from-indigo-900/40 to-purple-900/40 rounded-lg border border-white/10 flex items-center justify-center relative overflow-hidden group">
                <div className="absolute inset-0 opacity-20 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAwIDEwIEwgNjAgMTAgTSAxMCAwIEwgMTAgNjAgTSAwIDIwIEwgNjAgMjAgTSAyMCAwIEwgMjAgNjAgTSAwIDMwIEwgNjAgMzAgTSAzMCAwIEwgMzAgNjAgTSAwIDQwIEwgNjAgNDAgTSA0MCAwIEwgNDAgNjAgTSAwIDUwIEwgNjAgNTAgTSA1MCAwIEwgNTAgNjAiIHN0cm9rZT0iI2ZmZiIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')]"></div>
                
                {/* Route Line */}
                <div className="absolute h-1 bg-gradient-to-r from-indigo-500 to-purple-500 w-[70%] left-[15%] top-1/2 transform -translate-y-1/2 z-10 parallax-element parallax-slow"></div>
                
                {/* Start Point */}
                <div className="absolute left-[15%] top-1/2 w-4 h-4 bg-indigo-500 rounded-full transform -translate-y-1/2 z-20 shadow-lg shadow-indigo-500/50 parallax-element parallax-medium"></div>
                
                {/* End Point */}
                <div className="absolute right-[15%] top-1/2 w-4 h-4 bg-purple-500 rounded-full transform -translate-y-1/2 z-20 shadow-lg shadow-purple-500/50 parallax-element parallax-fast"></div>
                
                {/* Waypoint */}
                <div className="absolute left-[45%] top-1/2 w-3 h-3 bg-pink-500 rounded-full transform -translate-y-1/2 z-20 shadow-lg shadow-pink-500/50 parallax-element parallax-medium"></div>
                
                <div className="text-white text-center z-10">
                  <p className="text-lg font-medium text-white/80">Intelligent Route Planning</p>
                  <p className="text-sm text-white/60">Optimized for guest comfort and efficiency</p>
                </div>
                
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-800/0 via-indigo-800/0 to-indigo-800/0 group-hover:from-indigo-800/20 group-hover:via-purple-800/20 group-hover:to-indigo-800/20 transition-all duration-500"></div>
              </div>
            </div>
          </div>
          
          {/* Transport Features */}
          <div className="lg:col-span-5 space-y-6">
            <h3 className="text-2xl font-bold text-indigo-300 mb-4">Family-First Transport</h3>
            
            <div className="space-y-4 lazy-load">
              <motion.div 
                className="flex p-4 bg-white/5 backdrop-blur-sm rounded-lg border border-white/10 story-element"
                whileHover={{ x: 10 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div className="mr-4 flex-shrink-0">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium text-white">Family Priority Mode</h4>
                  <p className="text-white/70 text-sm mt-1">Intelligently groups related guests in the same vehicle, ensuring families stay together.</p>
                </div>
              </motion.div>
              
              <motion.div 
                className="flex p-4 bg-white/5 backdrop-blur-sm rounded-lg border border-white/10 story-element"
                whileHover={{ x: 10 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div className="mr-4 flex-shrink-0">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                    </svg>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium text-white">Smart Route Optimization</h4>
                  <p className="text-white/70 text-sm mt-1">Calculates the most efficient routes between venues, accommodations, and airports.</p>
                </div>
              </motion.div>
              
              <motion.div 
                className="flex p-4 bg-white/5 backdrop-blur-sm rounded-lg border border-white/10 story-element"
                whileHover={{ x: 10 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div className="mr-4 flex-shrink-0">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium text-white">Real-time Notifications</h4>
                  <p className="text-white/70 text-sm mt-1">Automatically notifies guests of pickup times, delays, and schedule changes.</p>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </StorySection>
      
      {/* AI Concierge Section */}
      <StorySection
        id="ai-concierge"
        title="AI Wedding Concierge"
        subtitle="Personalized assistance for you and your guests, available 24/7."
        background="bg-gradient-to-b from-purple-950 to-black"
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* AI Chat Interface */}
          <div className="bg-black/40 backdrop-blur-sm rounded-xl border border-white/10 shadow-xl overflow-hidden h-[500px] flex flex-col lazy-load">
            <div className="bg-gradient-to-r from-purple-800 to-indigo-800 p-3 flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-indigo-300 flex items-center justify-center text-indigo-800 font-bold">AI</div>
              <h3 className="text-white font-medium">Wedding Assistant</h3>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-4 parallax-element parallax-slow">
              {/* Chat Messages */}
              <div className="flex items-start gap-2">
                <div className="w-8 h-8 rounded-full bg-indigo-300 flex-shrink-0 flex items-center justify-center text-indigo-800 font-bold">AI</div>
                <div className="bg-white/10 rounded-2xl rounded-tl-none p-3 text-white max-w-[80%]">
                  <p className="text-sm">Hello! I'm your wedding assistant. How can I help you today?</p>
                </div>
              </div>
              
              <div className="flex items-start gap-2 justify-end">
                <div className="bg-indigo-600/30 rounded-2xl rounded-tr-none p-3 text-white max-w-[80%]">
                  <p className="text-sm">I need to find out which guests have dietary restrictions for the reception dinner.</p>
                </div>
                <div className="w-8 h-8 rounded-full bg-purple-500 flex-shrink-0 flex items-center justify-center text-white font-bold">U</div>
              </div>
              
              <div className="flex items-start gap-2">
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
              </div>
              
              <div className="flex items-start gap-2 justify-end">
                <div className="bg-indigo-600/30 rounded-2xl rounded-tr-none p-3 text-white max-w-[80%]">
                  <p className="text-sm">Yes, please! Also, can you tell me which hotel has the most guests staying in it?</p>
                </div>
                <div className="w-8 h-8 rounded-full bg-purple-500 flex-shrink-0 flex items-center justify-center text-white font-bold">U</div>
              </div>
              
              <div className="flex items-start gap-2">
                <div className="w-8 h-8 rounded-full bg-indigo-300 flex-shrink-0 flex items-center justify-center text-indigo-800 font-bold">AI</div>
                <div className="bg-white/10 rounded-2xl rounded-tl-none p-3 text-white max-w-[80%]">
                  <p className="text-sm">I've sent the dietary information to Urban Spice Catering via email.</p>
                  <p className="mt-2 text-sm">Regarding accommodations, the Grand Hyatt Delhi has the most guests with 28 rooms booked, followed by The Imperial with 12 rooms.</p>
                  <p className="mt-2 text-sm">Would you like me to arrange transportation between these hotels and the venue?</p>
                </div>
              </div>
            </div>
            
            <div className="p-3 bg-black/60 flex gap-2">
              <input type="text" className="flex-1 bg-white/10 border border-white/20 rounded-full px-4 py-2 text-white text-sm" placeholder="Ask anything about your wedding..." />
              <button className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-full w-10 h-10 flex items-center justify-center">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
          
          {/* AI Features */}
          <div className="space-y-6">
            <h3 className="text-2xl font-bold text-purple-300 mb-4">How AI Transforms Your Wedding</h3>
            
            <div className="space-y-4 lazy-load">
              <motion.div 
                className="interactive-card bg-white/5 p-4 rounded-lg border border-white/10"
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div className="flex items-center mb-3">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center mr-3">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h4 className="font-medium text-white">Instant Guest Support</h4>
                </div>
                <p className="text-white/70 pl-13">Answers questions about venues, timings, dress codes, and local information in multiple languages.</p>
              </motion.div>
              
              <motion.div 
                className="interactive-card bg-white/5 p-4 rounded-lg border border-white/10"
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div className="flex items-center mb-3">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center mr-3">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                    </svg>
                  </div>
                  <h4 className="font-medium text-white">Smart Task Management</h4>
                </div>
                <p className="text-white/70 pl-13">Proactively identifies tasks, sends reminders, and tracks completion to ensure nothing is missed.</p>
              </motion.div>
              
              <motion.div 
                className="interactive-card bg-white/5 p-4 rounded-lg border border-white/10"
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div className="flex items-center mb-3">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center mr-3">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <h4 className="font-medium text-white">Data Analysis & Insights</h4>
                </div>
                <p className="text-white/70 pl-13">Analyzes RSVP patterns, identifies potential issues, and provides actionable recommendations.</p>
              </motion.div>
              
              <motion.div 
                className="interactive-card bg-white/5 p-4 rounded-lg border border-white/10"
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div className="flex items-center mb-3">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center mr-3">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                    </svg>
                  </div>
                  <h4 className="font-medium text-white">Budget Optimization</h4>
                </div>
                <p className="text-white/70 pl-13">Tracks expenses, identifies cost-saving opportunities, and helps allocate resources efficiently.</p>
              </motion.div>
            </div>
          </div>
        </div>
      </StorySection>
      
      {/* Dashboard Section - Command Center */}
      <StorySection
        id="command-center"
        title="Your Wedding Command Center"
        subtitle="All your wedding planning tools in one beautiful, intuitive dashboard."
        background="bg-gradient-to-b from-black to-indigo-950"
      >
        <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 shadow-xl overflow-hidden lazy-load">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-px bg-white/10">
            {/* Dashboard Stats */}
            <div className="bg-black/60 p-6">
              <h4 className="text-lg font-medium text-white mb-4">Event Overview</h4>
              
              <div className="space-y-4">
                <motion.div 
                  className="bg-white/5 rounded-lg p-3 story-element"
                  whileHover={{ scale: 1.03 }}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-white/70">Total Guests</span>
                    <span className="text-white font-medium">248</span>
                  </div>
                  <div className="mt-2 h-2 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full w-[85%] bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"></div>
                  </div>
                  <div className="flex justify-between mt-1 text-xs">
                    <span className="text-white/60">Invited: 290</span>
                    <span className="text-indigo-400">85% Responded</span>
                  </div>
                </motion.div>
                
                <motion.div 
                  className="bg-white/5 rounded-lg p-3 story-element"
                  whileHover={{ scale: 1.03 }}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-white/70">RSVP Status</span>
                    <span className="text-green-400 font-medium">198 Attending</span>
                  </div>
                  <div className="mt-2 h-2 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full w-[80%] bg-gradient-to-r from-green-500 to-teal-500 rounded-full"></div>
                  </div>
                  <div className="flex justify-between mt-1 text-xs">
                    <span className="text-white/60">Not Attending: 50</span>
                    <span className="text-green-400">80% Acceptance</span>
                  </div>
                </motion.div>
                
                <motion.div 
                  className="bg-white/5 rounded-lg p-3 story-element"
                  whileHover={{ scale: 1.03 }}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-white/70">Tasks Completed</span>
                    <span className="text-indigo-400 font-medium">32/38</span>
                  </div>
                  <div className="mt-2 h-2 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full w-[84%] bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full"></div>
                  </div>
                  <div className="flex justify-between mt-1 text-xs">
                    <span className="text-white/60">6 Remaining</span>
                    <span className="text-indigo-400">84% Complete</span>
                  </div>
                </motion.div>
              </div>
            </div>
            
            {/* Recent Activity */}
            <div className="bg-black/60 p-6">
              <h4 className="text-lg font-medium text-white mb-4">Recent Activity</h4>
              
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-green-400/10 flex items-center justify-center text-green-400 flex-shrink-0">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-white text-sm font-medium">New RSVP: Sharma Family (4)</p>
                    <p className="text-white/50 text-xs">2 minutes ago</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-indigo-400/10 flex items-center justify-center text-indigo-400 flex-shrink-0">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-white text-sm font-medium">Catering appointment confirmed</p>
                    <p className="text-white/50 text-xs">35 minutes ago</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-purple-400/10 flex items-center justify-center text-purple-400 flex-shrink-0">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-white text-sm font-medium">12 new guests added to list</p>
                    <p className="text-white/50 text-xs">2 hours ago</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-400/10 flex items-center justify-center text-blue-400 flex-shrink-0">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-white text-sm font-medium">RSVP reminders sent (24)</p>
                    <p className="text-white/50 text-xs">5 hours ago</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Tasks */}
            <div className="bg-black/60 p-6 md:col-span-2">
              <h4 className="text-lg font-medium text-white mb-4">Upcoming Tasks</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <motion.div 
                  className="bg-white/5 rounded-lg p-3 flex items-center gap-3 story-element"
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
                  className="bg-white/5 rounded-lg p-3 flex items-center gap-3 story-element"
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
                  className="bg-white/5 rounded-lg p-3 flex items-center gap-3 story-element"
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
                  className="bg-white/5 rounded-lg p-3 flex items-center gap-3 story-element"
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
        </div>
      </StorySection>
      
      {/* Footer with visual connector */}
      <footer className="bg-black py-20 border-t border-white/10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-white font-medium text-lg mb-4">Product</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-white/60 hover:text-white transition text-sm">Features</a></li>
                <li><a href="#" className="text-white/60 hover:text-white transition text-sm">Pricing</a></li>
                <li><a href="#" className="text-white/60 hover:text-white transition text-sm">Testimonials</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-white font-medium text-lg mb-4">Company</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-white/60 hover:text-white transition text-sm">About</a></li>
                <li><a href="#" className="text-white/60 hover:text-white transition text-sm">Careers</a></li>
                <li><a href="#" className="text-white/60 hover:text-white transition text-sm">Contact</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-white font-medium text-lg mb-4">Resources</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-white/60 hover:text-white transition text-sm">Blog</a></li>
                <li><a href="#" className="text-white/60 hover:text-white transition text-sm">Support</a></li>
                <li><a href="#" className="text-white/60 hover:text-white transition text-sm">Privacy</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-white font-medium text-lg mb-4">Connect</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-white/60 hover:text-white transition text-sm">Instagram</a></li>
                <li><a href="#" className="text-white/60 hover:text-white transition text-sm">Twitter</a></li>
                <li><a href="#" className="text-white/60 hover:text-white transition text-sm">LinkedIn</a></li>
              </ul>
            </div>
          </div>
          
          <div className="mt-12 pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center">
            <p className="text-white/60 text-sm">© 2025 Eternally Yours. All rights reserved.</p>
            <div className="mt-4 md:mt-0">
              <span className="text-white/60 text-sm">Made with ❤️ by Eternally Yours Team</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}