import React, { useEffect, useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Link } from 'wouter';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ScrollSection } from '@/components/landing/scroll-section';
import { StickyNav } from '@/components/landing/sticky-nav';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';

// SVG components for illustrations - These would be replaced with actual SVGs or Lottie animations
const ChaosSVG = () => (
  <div className="relative w-full h-64 md:h-96 overflow-hidden bg-gray-100 rounded-xl flex items-center justify-center">
    <div className="absolute w-1/3 h-1/2 bg-gray-300 rounded-lg left-10 top-10 animate-pulse"></div>
    <div className="absolute w-1/4 h-1/3 bg-gray-400 rounded-lg right-20 bottom-10 animate-bounce"></div>
    <div className="absolute w-1/5 h-1/4 bg-gray-200 rounded-lg right-40 top-20 animate-ping"></div>
    <div className="text-center text-gray-500 font-bold">Chaos Visualization</div>
  </div>
);

const CleanRSVPUI = () => (
  <div className="relative w-full h-64 md:h-96 overflow-hidden bg-white rounded-xl border border-gray-200 shadow-lg flex flex-col">
    <div className="bg-primary/10 p-4 text-primary font-medium">Clean RSVP Interface</div>
    <div className="flex-1 p-6">
      <div className="space-y-4">
        <div className="h-10 bg-gray-100 rounded-md w-3/4"></div>
        <div className="h-10 bg-gray-100 rounded-md"></div>
        <div className="h-10 bg-gray-100 rounded-md w-1/2"></div>
        <div className="flex space-x-4 mt-6">
          <div className="h-12 bg-primary rounded-md w-1/3 flex items-center justify-center text-white">Accept</div>
          <div className="h-12 bg-gray-200 rounded-md w-1/3 flex items-center justify-center">Decline</div>
        </div>
      </div>
    </div>
  </div>
);

const TwoStageRSVP = () => (
  <div className="relative w-full overflow-hidden flex flex-col md:flex-row gap-4">
    <div className="flex-1 bg-white rounded-xl border border-gray-200 shadow-lg p-6">
      <div className="text-lg font-medium mb-4">Step 1: Attendance</div>
      <div className="space-y-3">
        <div className="h-8 bg-gray-100 rounded w-3/4"></div>
        <div className="h-8 bg-gray-100 rounded"></div>
        <div className="h-10 bg-primary/10 rounded mt-6 flex items-center justify-center text-primary">Continue</div>
      </div>
    </div>
    <div className="flex-1 bg-white rounded-xl border border-gray-200 shadow-lg p-6">
      <div className="text-lg font-medium mb-4">Step 2: Travel Info</div>
      <div className="space-y-3">
        <div className="h-8 bg-gray-100 rounded"></div>
        <div className="h-8 bg-gray-100 rounded w-3/4"></div>
        <div className="h-8 bg-gray-100 rounded w-1/2"></div>
        <div className="h-10 bg-primary rounded mt-6 flex items-center justify-center text-white">Complete RSVP</div>
      </div>
    </div>
  </div>
);

const WhatsAppChat = () => (
  <div className="relative w-full md:w-80 h-96 bg-gray-100 rounded-xl overflow-hidden border border-gray-200 shadow-lg">
    <div className="bg-green-600 text-white p-4">WhatsApp Chat</div>
    <div className="bg-[#e5ddd5] h-full p-4 space-y-3">
      <div className="bg-white rounded-lg p-2 w-3/4 ml-auto shadow">Hello! Will you attend?</div>
      <div className="bg-white rounded-lg p-2 w-3/4 shadow">Yes, I'll be there!</div>
      <div className="bg-white rounded-lg p-2 w-3/4 ml-auto shadow">Great! When will you arrive?</div>
      <div className="bg-white rounded-lg p-2 w-3/4 shadow">Friday morning, around 10 AM</div>
      <div className="bg-white rounded-lg p-2 w-3/4 ml-auto shadow">Perfect! I've updated your RSVP details.</div>
    </div>
  </div>
);

const RoomAssignment = () => (
  <div className="relative w-full overflow-hidden bg-white rounded-xl border border-gray-200 shadow-lg p-6">
    <div className="text-lg font-medium mb-6 text-center">Room Assignment Dashboard</div>
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      {[1, 2, 3, 4, 5, 6].map((room) => (
        <div key={room} className="bg-gray-50 p-3 rounded-lg border border-gray-100">
          <div className="text-sm font-medium">Room {room}</div>
          <div className="text-xs text-gray-500 mt-1">Sharma Family</div>
          <div className="flex justify-between mt-2">
            <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Assigned</span>
            <span className="text-xs">4 guests</span>
          </div>
        </div>
      ))}
    </div>
  </div>
);

const TransportPlanning = () => (
  <div className="relative w-full overflow-hidden bg-white rounded-xl border border-gray-200 shadow-lg p-6">
    <div className="text-lg font-medium mb-6 text-center">Transport Groups</div>
    <div className="space-y-4">
      {[1, 2, 3].map((group) => (
        <div key={group} className="bg-gray-50 p-4 rounded-lg border border-gray-100">
          <div className="flex justify-between">
            <div>
              <div className="font-medium">Shuttle Group {group}</div>
              <div className="text-sm text-gray-500 mt-1">Pickup: Airport, 10:00 AM</div>
            </div>
            <div className="bg-blue-100 text-blue-800 h-fit px-2 py-1 rounded text-sm">
              {group * 8} passengers
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-gray-200">
            <div className="text-xs text-gray-500">Families: Sharma, Patel, Gupta</div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

const PlannerDashboard = () => (
  <div className="relative w-full overflow-hidden bg-white rounded-xl border border-gray-200 shadow-lg p-6">
    <div className="flex justify-between items-center mb-6">
      <div className="text-lg font-medium">Planner Command Center</div>
      <div className="text-sm text-gray-500">May 18-20, 2025</div>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="bg-purple-50 p-4 rounded-lg">
        <div className="text-purple-800 text-sm font-medium">RSVP Status</div>
        <div className="text-3xl font-bold mt-2">81%</div>
        <div className="text-sm text-gray-600 mt-1">243/300 Responded</div>
        <div className="w-full bg-purple-200 h-2 rounded-full mt-2">
          <div className="bg-purple-600 h-2 rounded-full" style={{ width: '81%' }}></div>
        </div>
      </div>
      <div className="bg-blue-50 p-4 rounded-lg">
        <div className="text-blue-800 text-sm font-medium">Room Allocation</div>
        <div className="text-3xl font-bold mt-2">92%</div>
        <div className="text-sm text-gray-600 mt-1">46/50 Rooms Assigned</div>
        <div className="w-full bg-blue-200 h-2 rounded-full mt-2">
          <div className="bg-blue-600 h-2 rounded-full" style={{ width: '92%' }}></div>
        </div>
      </div>
      <div className="bg-green-50 p-4 rounded-lg">
        <div className="text-green-800 text-sm font-medium">Transport</div>
        <div className="text-3xl font-bold mt-2">75%</div>
        <div className="text-sm text-gray-600 mt-1">225/300 Guests</div>
        <div className="w-full bg-green-200 h-2 rounded-full mt-2">
          <div className="bg-green-600 h-2 rounded-full" style={{ width: '75%' }}></div>
        </div>
      </div>
    </div>
  </div>
);

const Testimonials = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
    {[
      {
        name: 'Priya & Rahul',
        role: 'Newlyweds',
        text: 'Our wedding planning went from chaotic to streamlined overnight. The RSVP system saved us countless hours of back-and-forth.',
      },
      {
        name: 'Vidya Sharma',
        role: 'Wedding Planner',
        text: 'I\'ve planned over 200 weddings, and this platform has revolutionized how I coordinate guests and logistics. It\'s a must-have.',
      },
      {
        name: 'Arjun & Meera',
        role: 'Parents of the Bride',
        text: 'With family coming from across the world, the transportation coordination alone was worth it. Our guests felt well taken care of.',
      },
    ].map((testimonial, i) => (
      <div key={i} className="bg-white/10 backdrop-blur-sm p-6 rounded-lg">
        <div className="text-lg italic mb-4">"{testimonial.text}"</div>
        <div className="font-medium">{testimonial.name}</div>
        <div className="text-sm opacity-80">{testimonial.role}</div>
      </div>
    ))}
  </div>
);

const WhatsAppCTA = () => (
  <div className="relative w-full md:w-80 h-96 bg-gray-100 rounded-xl overflow-hidden border border-gray-200 shadow-lg mx-auto">
    <div className="bg-green-600 text-white p-4">Wedding RSVP</div>
    <div className="bg-[#e5ddd5] h-full p-4 space-y-3">
      <div className="bg-white rounded-lg p-3 shadow">
        <div className="font-medium">Ravi & Sunita's Wedding</div>
        <div className="text-sm mt-1">Are you attending?</div>
        <div className="flex space-x-2 mt-3">
          <div className="bg-green-500 text-white text-sm py-1 px-3 rounded">Yes</div>
          <div className="bg-gray-300 text-gray-700 text-sm py-1 px-3 rounded">No</div>
        </div>
      </div>
      <div className="bg-white rounded-lg p-3 shadow">
        <div className="text-sm">Great! Please tap below to complete your RSVP details.</div>
        <div className="bg-blue-500 text-white text-center mt-2 py-2 rounded text-sm">Complete RSVP</div>
      </div>
    </div>
  </div>
);

export default function LandingPage() {
  const { user, isLoading } = useAuth();
  const mainContainerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    
    // Initialize scroll animations
    const sections = document.querySelectorAll('section[id]');
    sections.forEach((section) => {
      gsap.to(section, {
        scrollTrigger: {
          trigger: section,
          start: 'top center',
          end: 'bottom center',
          toggleClass: 'active',
          markers: false,
        },
      });
    });
    
    return () => {
      // Cleanup scroll triggers
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, []);

  return (
    <div ref={mainContainerRef} className="bg-black text-white">
      <StickyNav />
      
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <video 
          autoPlay 
          muted 
          loop 
          className="absolute w-full h-full object-cover opacity-40"
          style={{ filter: 'brightness(0.6)' }}
        >
          <source src="https://assets.mixkit.co/videos/preview/mixkit-traditional-indian-wedding-ceremony-with-fire-40618-large.mp4" type="video/mp4" />
        </video>
        
        <div className="relative z-10 text-center px-4 max-w-5xl mx-auto">
          <motion.h1 
            initial={{ opacity: 0, y: 50 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 1, delay: 0.5 }}
            className="font-script text-6xl md:text-8xl mb-6 bg-gradient-to-r from-rose-300 via-purple-300 to-indigo-300 text-transparent bg-clip-text"
          >
            Eternally Yours
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            transition={{ duration: 1, delay: 0.8 }}
            className="text-xl md:text-2xl mb-12 max-w-3xl mx-auto"
          >
            The most elegant wedding management platform for Indian weddings.
            From guest management to itinerary planning, we make it seamless.
          </motion.p>
          <motion.div 
            initial={{ opacity: 0, y: 30 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.8, delay: 1.2 }}
            className="flex flex-col md:flex-row gap-6 justify-center"
          >
            <Button 
              size="lg" 
              className="text-lg bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 border-0"
              asChild
            >
              <Link href="/auth">Get Started</Link>
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="text-lg border-white text-white hover:bg-white/10"
            >
              <Link href="#the-chaos">See How It Works</Link>
            </Button>
          </motion.div>
        </div>
        
        <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 animate-bounce">
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 5v14M19 12l-7 7-7-7"/>
          </svg>
        </div>
      </section>
      
      {/* Section 1: The Chaos Planners Hide */}
      <ScrollSection id="the-chaos" background="bg-gradient-to-b from-gray-900 to-purple-900" textColor="text-white" fadeDirection="up">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl md:text-5xl font-bold mb-6">The ceremony is beautiful.<br />The backend is broken.</h2>
            <p className="text-lg mb-8 opacity-90">
              Behind every perfect wedding is a chaotic mess of spreadsheets, WhatsApp threads, and manual coordination.
              Guest lists change, travel plans shift, and accommodations need last-minute adjustments.
            </p>
            <div className="bg-white/10 backdrop-blur-sm p-4 rounded-lg">
              <p className="italic text-white/80">"I had 15 different spreadsheets and lost track of who was staying where."</p>
            </div>
          </div>
          <ChaosSVG />
        </div>
      </ScrollSection>
      
      {/* Section 2: The Breakthrough */}
      <ScrollSection id="the-breakthrough" background="bg-gradient-to-b from-purple-900 to-indigo-900" textColor="text-white" fadeDirection="up">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <CleanRSVPUI />
          <div>
            <h2 className="text-3xl md:text-5xl font-bold mb-6">The most elegant RSVP you'll never have to explain.</h2>
            <p className="text-lg mb-8 opacity-90">
              An intuitive system that handles everything from attendance to dietary requirements.
              No more lost messages or confusing email chains.
            </p>
            <ul className="space-y-3">
              {['Simple, beautiful forms that guests love', 'Real-time updates for planners', 'Automatic reminders for non-responders'].map((item, i) => (
                <li key={i} className="flex items-start">
                  <svg className="h-6 w-6 text-green-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </ScrollSection>
      
      {/* Section 3: 2-Stage RSVP */}
      <ScrollSection id="two-stage-rsvp" background="bg-gradient-to-b from-indigo-900 to-blue-900" textColor="text-white" fadeDirection="up">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-5xl font-bold mb-6">From invite to itinerary. In two steps.</h2>
          <p className="text-lg max-w-3xl mx-auto opacity-90">
            Our two-part RSVP system gets the essential info first, then collects travel details when they're ready.
          </p>
        </div>
        <TwoStageRSVP />
      </ScrollSection>
      
      {/* Section 4: AI Concierge + WhatsApp */}
      <ScrollSection id="ai-concierge" background="bg-gradient-to-b from-blue-900 to-cyan-900" textColor="text-white" fadeDirection="up">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl md:text-5xl font-bold mb-6">One message. Infinite coordination.</h2>
            <p className="text-lg mb-8 opacity-90">
              Our AI assistant handles guest questions and updates automatically through WhatsApp, 
              collecting RSVP information, travel details, and special requests.
            </p>
            <div className="space-y-4">
              <div className="bg-white/10 backdrop-blur-sm p-4 rounded-lg">
                <p className="font-medium mb-1">24/7 Guest Support</p>
                <p className="text-white/80">Guests get instant answers to common questions without bothering the couple.</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm p-4 rounded-lg">
                <p className="font-medium mb-1">Automatic Data Collection</p>
                <p className="text-white/80">Every conversation updates your central dashboard with the latest information.</p>
              </div>
            </div>
          </div>
          <WhatsAppChat />
        </div>
      </ScrollSection>
      
      {/* Section 5: Room Assignment Automation */}
      <ScrollSection id="room-assignment" background="bg-gradient-to-b from-cyan-900 to-teal-900" textColor="text-white" fadeDirection="up">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-5xl font-bold mb-6">Match. Approve. Move on.</h2>
          <p className="text-lg max-w-3xl mx-auto opacity-90">
            Our room assignment system automatically matches guests to appropriate accommodations
            based on family groups, preferences, and arrival times.
          </p>
        </div>
        <RoomAssignment />
      </ScrollSection>
      
      {/* Section 6: Transport Planning */}
      <ScrollSection id="transport-planning" background="bg-gradient-to-b from-teal-900 to-green-900" textColor="text-white" fadeDirection="up">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <TransportPlanning />
          <div>
            <h2 className="text-3xl md:text-5xl font-bold mb-6">Arrival time becomes pickup time. Automatically.</h2>
            <p className="text-lg mb-8 opacity-90">
              As guests submit their travel plans, our system organizes them into transport groups,
              keeping families together and optimizing vehicle capacity.
            </p>
            <div className="space-y-3">
              {[
                'Automatic shuttle grouping based on arrival times',
                'Family members always stay together',
                'Real-time updates as plans change',
                'Driver instructions and manifests generated automatically'
              ].map((feature, i) => (
                <div key={i} className="flex items-center">
                  <svg className="h-5 w-5 text-green-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <span>{feature}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </ScrollSection>
      
      {/* Section 7: Planner Command Center */}
      <ScrollSection id="command-center" background="bg-gradient-to-b from-green-900 to-yellow-900" textColor="text-white" fadeDirection="up">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-5xl font-bold mb-6">From 300 guests to one screen.</h2>
          <p className="text-lg max-w-3xl mx-auto opacity-90">
            Our intelligent dashboard gives you complete visibility into your event's status,
            from RSVP percentages to room allocations and transport planning.
          </p>
        </div>
        <PlannerDashboard />
      </ScrollSection>
      
      {/* Section 8: Testimonials */}
      <ScrollSection id="testimonials" background="bg-gradient-to-b from-yellow-900 to-orange-900" textColor="text-white" fadeDirection="up">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-5xl font-bold mb-6">They didn't need tech. Until this.</h2>
          <p className="text-lg max-w-3xl mx-auto opacity-90">
            Hear from couples and planners who transformed their wedding management experience.
          </p>
        </div>
        <Testimonials />
      </ScrollSection>
      
      {/* Section 9: Final CTA */}
      <ScrollSection id="cta" background="bg-gradient-to-b from-orange-900 to-red-900" textColor="text-white" fadeDirection="up">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl md:text-5xl font-bold mb-6">Your event starts where your guests already are.</h2>
            <p className="text-lg mb-8 opacity-90">
              From the first WhatsApp message to the final shuttle dropoff, 
              we handle every detail so you can focus on creating memories.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
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
          <WhatsAppCTA />
        </div>
      </ScrollSection>
      
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