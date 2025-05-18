import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';

// Immersive Wedding RSVP Landing Page with enhanced visual storytelling
export default function ImmersiveStorytelling() {
  const { user } = useAuth();
  const [activeSection, setActiveSection] = useState('hero');
  
  // Navigation links
  const navLinks = [
    { id: 'hero', label: 'Home' },
    { id: 'problem', label: 'Problem' },
    { id: 'solution', label: 'Solution' },
    { id: 'cta', label: 'Get Started' }
  ];
  
  // Handle scroll to section with smooth animation
  const scrollToSection = (sectionId: string) => {
    const section = document.getElementById(sectionId);
    if (section) {
      window.scrollTo({
        top: section.offsetTop - 80,
        behavior: 'smooth'
      });
      setActiveSection(sectionId);
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
  }, []);
  
  // Redirect logged in users to dashboard
  useEffect(() => {
    if (user) {
      window.location.href = '/dashboard';
    }
  }, [user]);
  
  return (
    <div className="bg-gradient-to-b from-[#5E239D] to-black text-white overflow-x-hidden min-h-screen">
      {/* Fixed navigation */}
      <header className="fixed top-0 left-0 right-0 z-40 backdrop-blur-md bg-[#5E239D]/80 border-b border-[#BFA76F]/20">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-script text-gold">
            Eternally Yours
          </h1>
          
          <nav className="hidden md:flex gap-1">
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => scrollToSection(link.id)}
                className={`px-4 py-2 text-sm font-medium rounded-full transition-all duration-300
                  ${activeSection === link.id 
                    ? 'bg-[#5E239D] text-[#BFA76F]' 
                    : 'text-white/70 hover:bg-[#BFA76F]/10 hover:text-[#BFA76F]'
                  }`}
              >
                {link.label}
              </button>
            ))}
          </nav>
          
          <Button
            size="sm"
            className="gold-gradient hover:opacity-90"
            asChild
          >
            <Link href="/auth">Login</Link>
          </Button>
        </div>
      </header>
      
      <main className="pt-16">
        {/* HERO SECTION: "Eternally Yours" */}
        <section id="hero" className="min-h-screen relative flex items-center justify-center overflow-hidden">
          {/* Animated background with geometric shapes */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#2a1b5e] via-[#1f1246] to-black">
            {/* Geometric elements */}
            <div className="absolute w-96 h-96 rounded-full border-2 border-[#8a71d8]/20 top-1/4 left-1/4 animate-float1 transform -translate-x-1/2 -translate-y-1/2"></div>
            <div className="absolute w-64 h-64 rounded-full border border-[#bf953f]/30 top-2/3 right-1/4 animate-float2 transform translate-x-1/2 -translate-y-1/2"></div>
            <div className="absolute w-80 h-80 border border-[#aa771c]/10 top-1/2 right-1/3 animate-float3 transform rotate-45 translate-x-1/2 -translate-y-1/2"></div>
            
            {/* Blurred orbs */}
            <div className="absolute w-40 h-40 rounded-full bg-[#6246ea]/10 blur-xl top-1/3 left-2/3"></div>
            <div className="absolute w-32 h-32 rounded-full bg-[#fcf6ba]/5 blur-xl bottom-1/3 right-2/3"></div>
            <div className="absolute w-24 h-24 rounded-full bg-[#bf953f]/10 blur-xl top-2/3 right-1/2"></div>
          </div>
          
          {/* Overlay for better text contrast */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/70"></div>
          
          {/* Hero content */}
          <div className="relative z-10 text-center px-6 max-w-5xl mx-auto">
            {/* Main headline with 3D typography */}
            <motion.h1 
              className="text-6xl md:text-8xl font-script mb-8 text-gold"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.2, ease: [0.19, 1, 0.22, 1] }}
            >
              Eternally Yours
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
                className="gold-gradient text-white hover:opacity-90 text-lg shadow-lg shadow-amber-900/20"
                asChild
              >
                <Link href="/auth">Get Started</Link>
              </Button>
              
              <Button 
                size="lg" 
                variant="outline" 
                className="border-[#bf953f] text-[#fcf6ba] hover:bg-[#bf953f]/10 text-lg"
                onClick={() => scrollToSection('problem')}
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
        
        {/* PROBLEM SECTION: "Behind the Beauty" */}
        <section id="problem" className="min-h-screen relative py-20 overflow-hidden">
          {/* Background */}
          <div className="absolute inset-0 bg-gradient-to-b from-black to-indigo-950"></div>
          
          <div className="container mx-auto px-4 relative z-10">
            {/* Section header */}
            <div className="text-center mb-16 max-w-4xl mx-auto">
              <motion.h2 
                className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-rose-300 to-indigo-300 text-transparent bg-clip-text"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-20% 0px" }}
                transition={{ duration: 0.8 }}
              >
                The ceremony is beautiful.<br />The backend is broken.
              </motion.h2>
              
              <motion.p
                className="text-xl text-white/80"
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
              <motion.div 
                className="bg-black/30 backdrop-blur-sm p-8 rounded-xl border border-white/10 shadow-2xl"
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
              </motion.div>
              
              {/* Right side: Real consequences */}
              <motion.div 
                className="bg-black/30 backdrop-blur-sm p-8 rounded-xl border border-white/10 shadow-2xl"
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
              </motion.div>
            </div>
          </div>
        </section>
        
        {/* SOLUTION SECTION: "Elegant Simplicity" */}
        <section id="solution" className="min-h-screen relative py-20 overflow-hidden">
          {/* Background */}
          <div className="absolute inset-0 bg-gradient-to-b from-indigo-950 to-purple-950"></div>
          
          <div className="container mx-auto px-4 relative z-10">
            {/* Section header */}
            <div className="text-center mb-16 max-w-4xl mx-auto">
              <motion.h2 
                className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-indigo-300 to-purple-300 text-transparent bg-clip-text"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-20% 0px" }}
                transition={{ duration: 0.8 }}
              >
                The most elegant RSVP<br />you'll never have to explain.
              </motion.h2>
              
              <motion.p
                className="text-xl text-white/80"
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
                className="bg-white rounded-xl overflow-hidden shadow-2xl"
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
                    </div>
                  </div>
                  
                  {/* Submit button */}
                  <div className="mt-8">
                    <button className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 rounded-lg font-medium text-lg hover:from-indigo-700 hover:to-purple-700 transition duration-300">
                      Submit RSVP
                    </button>
                  </div>
                </div>
              </motion.div>
              
              {/* Key benefits */}
              <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Benefit 1 */}
                <motion.div 
                  className="bg-white/5 backdrop-blur-sm p-6 rounded-xl border border-white/10"
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
                  className="bg-white/5 backdrop-blur-sm p-6 rounded-xl border border-white/10"
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
                  className="bg-white/5 backdrop-blur-sm p-6 rounded-xl border border-white/10"
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
        
        {/* CALL TO ACTION SECTION: "Begin Your Journey" */}
        <section id="cta" className="min-h-screen relative py-20 overflow-hidden flex items-center">
          {/* Background */}
          <div className="absolute inset-0 bg-gradient-to-b from-purple-950 to-black"></div>
          
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
        
        {/* Footer */}
        <footer className="bg-black border-t border-white/10 py-8">
          <div className="max-w-6xl mx-auto px-4">
            <div className="text-center">
              <p className="text-white/60 text-sm">© 2025 Eternally Yours. All rights reserved.</p>
              <div className="mt-4 flex justify-center space-x-4">
                <a href="#" className="text-white/60 hover:text-white transition text-sm">Terms</a>
                <a href="#" className="text-white/60 hover:text-white transition text-sm">Privacy</a>
                <a href="#" className="text-white/60 hover:text-white transition text-sm">Contact</a>
              </div>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}