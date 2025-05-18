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
  
  // Track visible sections for navigation highlighting
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio > 0.5) {
            const id = entry.target.id;
            setActiveSection(id);
          }
        });
      },
      {
        rootMargin: "-20% 0px -20% 0px",
        threshold: 0.5
      }
    );
    
    // Observe all sections
    document.querySelectorAll('section[id]').forEach(section => {
      observer.observe(section);
    });
    
    return () => {
      document.querySelectorAll('section[id]').forEach(section => {
        observer.unobserve(section);
      });
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
      
      {/* Problem Statement Section */}
      <StorySection
        id="problem"
        title="The ceremony is beautiful. The backend is broken."
        subtitle="Behind every perfect wedding is a chaotic mess of spreadsheets, WhatsApp threads, and manual coordination."
        background="bg-gradient-to-b from-indigo-950 to-black"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <div className="bg-white/5 backdrop-blur-sm p-8 rounded-xl border border-white/10 shadow-xl">
            <h3 className="text-2xl font-bold mb-4 text-purple-300">The Chaos</h3>
            <ul className="space-y-4">
              <li className="flex items-start">
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
              
              <li className="flex items-start">
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
              
              <li className="flex items-start">
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
          
          <div className="bg-white/5 backdrop-blur-sm p-8 rounded-xl border border-white/10 shadow-xl">
            <h3 className="text-2xl font-bold mb-4 text-indigo-300">Real Consequences</h3>
            <div className="space-y-6">
              <div className="flex items-center">
                <div className="w-16 h-16 flex items-center justify-center bg-indigo-500/10 rounded-lg mr-4">
                  <svg className="w-8 h-8 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-medium">100+ Hours Wasted</h4>
                  <p className="text-white/70">Time that could be spent on meaningful wedding experiences.</p>
                </div>
              </div>
              
              <div className="flex items-center">
                <div className="w-16 h-16 flex items-center justify-center bg-purple-500/10 rounded-lg mr-4">
                  <svg className="w-8 h-8 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 11.5V14m0-2.5v-6a2.5 2.5 0 015 0v6M7 7h1m-1 3h1m3-3h1m-1 3h1M3 21h18M3 10h18M3 7h18M4 4h16v3H4V4z" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-medium">Increased Stress</h4>
                  <p className="text-white/70">When wedding planning becomes a logistics nightmare.</p>
                </div>
              </div>
              
              <div className="flex items-center">
                <div className="w-16 h-16 flex items-center justify-center bg-rose-500/10 rounded-lg mr-4">
                  <svg className="w-8 h-8 text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-medium">Guest Experience Suffers</h4>
                  <p className="text-white/70">Information gaps lead to confusion and miscommunication.</p>
                </div>
              </div>
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
      
      {/* More sections go here... */}
      
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