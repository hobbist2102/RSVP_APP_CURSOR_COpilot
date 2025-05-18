import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';
import { Link } from 'wouter';
import { ScrollContainer } from '@/components/landing/cinematic/scroll-container';
import { AnimatedSection } from '@/components/landing/cinematic/animated-section';
import { ParallaxText } from '@/components/landing/cinematic/parallax-text';
import { NarrativeScene } from '@/components/landing/cinematic/narrative-scene';
import { VideoHero } from '@/components/landing/cinematic/video-hero';
import { FloatingShapes } from '@/components/landing/cinematic/floating-shapes';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';
import { motion } from 'framer-motion';

// SVG Icons and Visual Elements for the sections
const MessySVG = () => (
  <svg viewBox="0 0 200 200" width="100%" height="100%">
    <rect x="20" y="30" width="160" height="40" rx="4" fill="#6b46c1" opacity="0.3" />
    <rect x="50" y="80" width="100" height="40" rx="4" fill="#6b46c1" opacity="0.5" />
    <rect x="30" y="130" width="140" height="40" rx="4" fill="#6b46c1" opacity="0.7" />
    <line x1="20" y1="40" x2="180" y2="170" stroke="white" strokeWidth="2" opacity="0.2" />
    <line x1="180" y1="40" x2="20" y2="170" stroke="white" strokeWidth="2" opacity="0.2" />
    <circle cx="100" cy="100" r="60" stroke="white" strokeWidth="2" fill="none" opacity="0.2" />
  </svg>
);

const CleanRSVPUISVG = () => (
  <svg viewBox="0 0 200 200" width="100%" height="100%">
    <rect x="20" y="20" width="160" height="160" rx="8" fill="#f8fafc" />
    <rect x="30" y="30" width="140" height="20" rx="4" fill="#e0e7ff" />
    <rect x="30" y="60" width="140" height="10" rx="2" fill="#e2e8f0" />
    <rect x="30" y="80" width="140" height="10" rx="2" fill="#e2e8f0" />
    <rect x="30" y="100" width="140" height="10" rx="2" fill="#e2e8f0" />
    <rect x="30" y="130" width="60" height="30" rx="4" fill="#818cf8" />
    <rect x="110" y="130" width="60" height="30" rx="4" fill="#e2e8f0" />
  </svg>
);

const TwoStageRSVPSVG = () => (
  <div className="grid grid-cols-2 gap-4 w-full max-w-2xl">
    <div className="bg-white rounded-lg p-4 shadow-lg">
      <div className="h-6 w-32 bg-indigo-100 rounded mb-3"></div>
      <div className="space-y-2">
        <div className="h-5 w-full bg-gray-100 rounded"></div>
        <div className="h-5 w-full bg-gray-100 rounded"></div>
        <div className="h-5 w-3/4 bg-gray-100 rounded"></div>
      </div>
      <div className="h-10 w-full bg-indigo-500 rounded mt-4 flex items-center justify-center text-white">Step 1</div>
    </div>
    <div className="bg-white rounded-lg p-4 shadow-lg">
      <div className="h-6 w-32 bg-indigo-100 rounded mb-3"></div>
      <div className="space-y-2">
        <div className="h-5 w-full bg-gray-100 rounded"></div>
        <div className="h-5 w-full bg-gray-100 rounded"></div>
        <div className="h-5 w-3/4 bg-gray-100 rounded"></div>
      </div>
      <div className="h-10 w-full bg-indigo-500 rounded mt-4 flex items-center justify-center text-white">Step 2</div>
    </div>
  </div>
);

const WhatsAppUILayer = () => (
  <div className="relative w-64 h-96 bg-[#f0f2f5] rounded-xl overflow-hidden shadow-2xl transform perspective-1200">
    <div className="bg-[#128C7E] text-white py-3 px-4">
      <div className="text-lg font-medium">Wedding Concierge</div>
    </div>
    <div className="h-full bg-[#e5ddd5] p-3 space-y-2 overflow-y-auto">
      <div className="bg-white rounded-lg p-2 shadow-sm ml-auto max-w-[80%]">
        Hello! Will you be attending Priya and Rahul's wedding?
      </div>
      <div className="bg-white rounded-lg p-2 shadow-sm max-w-[80%]">
        Yes, I'm excited to attend!
      </div>
      <div className="bg-white rounded-lg p-2 shadow-sm ml-auto max-w-[80%]">
        Great! How many guests will be in your party?
      </div>
      <div className="bg-white rounded-lg p-2 shadow-sm max-w-[80%]">
        It will be 3 of us.
      </div>
      <div className="bg-white rounded-lg p-2 shadow-sm ml-auto max-w-[80%]">
        Perfect! When will you arrive in Delhi?
      </div>
    </div>
  </div>
);

const RoomAssignmentLayer = () => (
  <div className="bg-white rounded-lg p-6 shadow-xl max-w-2xl w-full">
    <div className="grid grid-cols-2 gap-4">
      {[1, 2, 3, 4].map((room) => (
        <div key={room} className="border border-indigo-100 rounded-lg p-3">
          <div className="flex justify-between items-center mb-2">
            <div className="font-medium">Room {room}</div>
            <div className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Assigned</div>
          </div>
          <div className="text-sm text-gray-500">Sharma Family</div>
          <div className="text-xs mt-2">4 guests • Arriving May 20</div>
        </div>
      ))}
    </div>
    <div className="mt-4 h-8 bg-indigo-500 rounded flex items-center justify-center text-white text-sm">
      Match • Approve • Done
    </div>
  </div>
);

const TransportLayer = () => (
  <div className="bg-white rounded-lg p-6 shadow-xl max-w-2xl w-full">
    <div className="space-y-3">
      {[1, 2, 3].map((group) => (
        <div key={group} className="border border-blue-100 rounded-lg p-3">
          <div className="flex justify-between items-center">
            <div>
              <div className="font-medium">Shuttle Group {group}</div>
              <div className="text-sm text-gray-500">May 20 • 10:00 AM • Airport</div>
            </div>
            <div className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">
              {group * 4} guests
            </div>
          </div>
          <div className="mt-3 pt-2 border-t border-gray-100 text-xs">
            <span className="text-gray-400">Families:</span> Sharma, Patel, Gupta
          </div>
        </div>
      ))}
    </div>
  </div>
);

const DashboardLayer = () => (
  <div className="bg-white rounded-lg p-6 shadow-xl max-w-3xl w-full">
    <div className="flex justify-between items-center mb-4">
      <div className="text-lg font-medium">Event Dashboard</div>
      <div className="text-sm text-gray-500">Priya & Rahul's Wedding</div>
    </div>
    <div className="grid grid-cols-3 gap-4">
      <div className="bg-purple-50 p-4 rounded-lg">
        <div className="text-sm font-medium text-purple-800">RSVP Status</div>
        <div className="text-3xl font-bold mt-2">85%</div>
        <div className="w-full bg-purple-200 h-2 rounded-full mt-2">
          <div className="bg-purple-600 h-2 rounded-full" style={{ width: '85%' }}></div>
        </div>
      </div>
      <div className="bg-blue-50 p-4 rounded-lg">
        <div className="text-sm font-medium text-blue-800">Rooms</div>
        <div className="text-3xl font-bold mt-2">92%</div>
        <div className="w-full bg-blue-200 h-2 rounded-full mt-2">
          <div className="bg-blue-600 h-2 rounded-full" style={{ width: '92%' }}></div>
        </div>
      </div>
      <div className="bg-green-50 p-4 rounded-lg">
        <div className="text-sm font-medium text-green-800">Transport</div>
        <div className="text-3xl font-bold mt-2">78%</div>
        <div className="w-full bg-green-200 h-2 rounded-full mt-2">
          <div className="bg-green-600 h-2 rounded-full" style={{ width: '78%' }}></div>
        </div>
      </div>
    </div>
  </div>
);

const FinalCTALayer = () => (
  <div className="w-64 bg-[#f0f2f5] rounded-xl overflow-hidden shadow-2xl">
    <div className="bg-[#128C7E] text-white p-3">
      <div className="text-base font-medium">Your Wedding Journey</div>
    </div>
    <div className="p-4 bg-[#e5ddd5]">
      <div className="bg-white rounded-lg p-3 shadow-sm">
        <div className="font-medium mb-2">Start Your RSVP Now</div>
        <p className="text-sm mb-3">Your journey begins with a simple message.</p>
        <div className="bg-indigo-500 text-white text-center p-2 rounded text-sm">
          Get Started
        </div>
      </div>
    </div>
  </div>
);

export default function CinematicLanding() {
  const { user, isLoading } = useAuth();
  const mainRef = useRef<HTMLDivElement>(null);
  
  // Create the main scroll animation timeline
  useGSAP(() => {
    if (typeof window !== 'undefined' && mainRef.current) {
      // Dynamically import ScrollTrigger
      import('gsap/ScrollTrigger').then(({ ScrollTrigger }) => {
        gsap.registerPlugin(ScrollTrigger);
        
        // Initialize smooth scrolling
        ScrollTrigger.defaults({
          markers: false,
          scrub: true,
        });
        
        // Create custom scroll effects as needed
        // ...
      });
    }
  }, { scope: mainRef });

  return (
    <div ref={mainRef} className="bg-black text-white overflow-hidden">
      {/* Fixed navigation */}
      <header className="fixed top-0 left-0 right-0 z-50 py-4 px-8 flex justify-between items-center bg-gradient-to-b from-black to-transparent">
        <Link href="/" className="text-white font-script text-3xl">Eternally Yours</Link>
        
        <nav className="hidden md:flex space-x-1">
          {['Story', 'Features', 'AI', 'WhatsApp', 'Rooms', 'Transport'].map((item) => (
            <a
              key={item}
              href={`#${item.toLowerCase()}`}
              className="px-4 py-2 text-sm font-medium text-white/80 hover:text-white hover:bg-white/10 rounded-full transition-colors"
            >
              {item}
            </a>
          ))}
        </nav>
        
        <Link href="/auth" className="bg-purple-600 text-white px-6 py-2 rounded-full text-sm font-medium hover:bg-purple-700 transition-colors">
          Login
        </Link>
      </header>
      
      {/* Hero Section with Video Background */}
      <VideoHero 
        title="Eternally Yours"
        subtitle="The most elegant wedding management platform for Indian weddings. From guest management to itinerary planning, we make it seamless."
        ctaText="Get Started"
        ctaLink="/auth"
        secondaryCtaText="See How It Works"
        secondaryCtaLink="#chaos"
      />
      
      {/* The Chaos Scene */}
      <NarrativeScene
        title="The Chaos Planners Hide"
        tagline="The ceremony is beautiful. The backend is broken."
        backgroundColor="#0f0a20"
        textColor="white"
        layers={[
          {
            id: "chaotic-spreadsheets",
            content: <MessySVG />,
            depth: 1,
            position: "center"
          }
        ]}
        pinnedDuration={1}
      />
      
      {/* The Breakthrough Scene */}
      <NarrativeScene
        title="The Breakthrough"
        tagline="The most elegant RSVP you'll never have to explain."
        backgroundColor="#150d30"
        textColor="white"
        layers={[
          {
            id: "clean-rsvp",
            content: <CleanRSVPUISVG />,
            depth: 1,
            position: "center"
          }
        ]}
        pinnedDuration={1}
      />
      
      {/* 2-Stage RSVP Scene */}
      <AnimatedSection 
        id="two-stage-rsvp" 
        backgroundColor="#1a0d40" 
        textColor="white"
        animationType="slide"
      >
        <div className="max-w-6xl mx-auto">
          <ParallaxText
            text="From invite to itinerary. In two steps."
            align="center"
            size="large"
            gradient={true}
          />
          <div className="mt-16 flex justify-center items-center">
            <TwoStageRSVPSVG />
          </div>
        </div>
      </AnimatedSection>
      
      {/* AI Concierge + WhatsApp Scene */}
      <NarrativeScene
        title="One message. Infinite coordination."
        tagline="Our AI concierge handles guest questions and updates automatically through WhatsApp."
        backgroundColor="#1f0d50"
        textColor="white"
        layers={[
          {
            id: "whatsapp-ui",
            content: <WhatsAppUILayer />,
            depth: 1,
            position: "center"
          }
        ]}
        pinnedDuration={1}
      />
      
      {/* Room Assignment Scene */}
      <NarrativeScene
        title="Match. Approve. Move on."
        tagline="Our room assignment system automatically matches guests to appropriate accommodations."
        backgroundColor="#250d60"
        textColor="white"
        layers={[
          {
            id: "room-assignment",
            content: <RoomAssignmentLayer />,
            depth: 1,
            position: "center"
          }
        ]}
        pinnedDuration={1}
      />
      
      {/* Transport Planning Scene */}
      <NarrativeScene
        title="Arrival time becomes pickup time. Automatically."
        tagline="As guests submit their travel plans, our system organizes them into transport groups."
        backgroundColor="#2a0d70"
        textColor="white"
        layers={[
          {
            id: "transport-planning",
            content: <TransportLayer />,
            depth: 1,
            position: "center"
          }
        ]}
        pinnedDuration={1}
      />
      
      {/* Planner Command Center Scene */}
      <NarrativeScene
        title="From 300 guests to one screen."
        tagline="Our intelligent dashboard gives you complete visibility into your event's status."
        backgroundColor="#300d80"
        textColor="white"
        layers={[
          {
            id: "dashboard",
            content: <DashboardLayer />,
            depth: 1,
            position: "center"
          }
        ]}
        pinnedDuration={1}
      />
      
      {/* Testimonials Section */}
      <AnimatedSection 
        id="testimonials" 
        backgroundColor="#350d90" 
        textColor="white"
        animationType="fade"
      >
        <div className="max-w-6xl mx-auto">
          <ParallaxText
            text="They didn't need tech. Until this."
            align="center"
            size="large"
            gradient={true}
          />
          
          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                quote: "Our wedding planning went from chaotic to streamlined overnight. The RSVP system saved us countless hours.",
                name: "Priya & Rahul",
                role: "Newlyweds"
              },
              {
                quote: "I've planned over 200 weddings, and this platform has revolutionized how I coordinate guests and logistics.",
                name: "Vidya Sharma",
                role: "Wedding Planner"
              },
              {
                quote: "With family coming from across the world, the transportation coordination alone was worth it.",
                name: "Arjun & Meera",
                role: "Parents of the Bride"
              }
            ].map((testimonial, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: i * 0.2 }}
                viewport={{ once: true, margin: "-100px" }}
                className="bg-white/10 backdrop-blur-sm p-6 rounded-lg"
              >
                <div className="text-lg italic mb-4">"{testimonial.quote}"</div>
                <div className="font-medium">{testimonial.name}</div>
                <div className="text-sm opacity-80">{testimonial.role}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </AnimatedSection>
      
      {/* Final CTA Scene */}
      <NarrativeScene
        title="Your event starts where your guests already are."
        tagline="From the first WhatsApp message to the final shuttle dropoff, we handle every detail."
        backgroundColor="#3a0da0"
        textColor="white"
        layers={[
          {
            id: "final-cta",
            content: <FinalCTALayer />,
            depth: 1,
            position: "center"
          }
        ]}
        pinnedDuration={1}
      />
      
      {/* Footer */}
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
    </div>
  );
}