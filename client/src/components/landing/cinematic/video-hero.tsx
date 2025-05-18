import React, { useRef, useEffect, useState } from 'react';
import { gsap } from 'gsap';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Link } from 'wouter';

interface VideoHeroProps {
  videoSrc?: string;
  title: string;
  subtitle: string;
  ctaText?: string;
  ctaLink?: string;
  secondaryCtaText?: string;
  secondaryCtaLink?: string;
}

export const VideoHero: React.FC<VideoHeroProps> = ({
  videoSrc = "https://assets.mixkit.co/videos/preview/mixkit-traditional-indian-wedding-ceremony-with-fire-40618-large.mp4",
  title,
  subtitle,
  ctaText = "Get Started",
  ctaLink = "/auth",
  secondaryCtaText = "Learn More",
  secondaryCtaLink = "#the-chaos"
}) => {
  const heroRef = useRef<HTMLDivElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  // Text animation variants for Framer Motion
  const titleVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        duration: 1.2,
        delay: 0.5,
        ease: [0.25, 0.1, 0.25, 1]
      }
    }
  };
  
  const subtitleVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        duration: 1,
        delay: 1,
        ease: [0.25, 0.1, 0.25, 1]
      }
    }
  };
  
  const buttonVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        duration: 0.8,
        delay: 1.4,
      }
    }
  };

  // Video loaded handler
  const handleVideoLoaded = () => {
    setIsLoaded(true);
  };

  // GSAP animations on scroll
  useEffect(() => {
    if (heroRef.current) {
      // Parallax scroll effect for video
      gsap.to(".hero-video-container", {
        y: "30%",
        scale: 1.1,
        scrollTrigger: {
          trigger: heroRef.current,
          start: "top top",
          end: "bottom top",
          scrub: true
        }
      });
      
      // Fade out content on scroll
      gsap.to(".hero-content", {
        y: "-30%",
        opacity: 0,
        scrollTrigger: {
          trigger: heroRef.current,
          start: "10% top",
          end: "40% top",
          scrub: true
        }
      });
    }
  }, [isLoaded]);

  return (
    <div 
      ref={heroRef}
      className="relative w-full h-screen overflow-hidden"
    >
      {/* Video background */}
      <div className="hero-video-container absolute inset-0 w-full h-full">
        {videoSrc && (
          <video 
            autoPlay 
            muted 
            loop 
            playsInline
            className="absolute w-full h-full object-cover"
            style={{ opacity: 0.6, filter: 'brightness(0.5)' }}
            onLoadedData={handleVideoLoaded}
          >
            <source src={videoSrc} type="video/mp4" />
          </video>
        )}
        
        {/* Overlay gradient for better text visibility */}
        <div 
          className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/40 to-black/80"
        />
      </div>
      
      {/* Content */}
      <div className="hero-content relative z-10 h-full w-full flex flex-col items-center justify-center text-white p-8">
        <motion.h1 
          className="font-script text-5xl md:text-6xl lg:text-8xl text-center mb-6 leading-tight"
          initial="hidden"
          animate="visible"
          variants={titleVariants}
        >
          <span className="bg-gradient-to-r from-rose-300 via-purple-300 to-indigo-300 text-transparent bg-clip-text">
            {title}
          </span>
        </motion.h1>
        
        <motion.p 
          className="text-xl md:text-2xl text-center max-w-3xl mb-12 leading-relaxed"
          initial="hidden"
          animate="visible"
          variants={subtitleVariants}
        >
          {subtitle}
        </motion.p>
        
        <motion.div 
          className="flex flex-col sm:flex-row gap-4"
          initial="hidden"
          animate="visible"
          variants={buttonVariants}
        >
          <Button 
            size="lg" 
            className="text-lg bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 border-0"
            asChild
          >
            <Link href={ctaLink}>{ctaText}</Link>
          </Button>
          <Button 
            size="lg" 
            variant="outline" 
            className="text-lg border-white text-white hover:bg-white/10"
            asChild
          >
            <a href={secondaryCtaLink}>{secondaryCtaText}</a>
          </Button>
        </motion.div>
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
          transition={{ repeat: Infinity, duration: 1.5 }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 5v14M19 12l-7 7-7-7"/>
          </svg>
        </motion.div>
      </motion.div>
    </div>
  );
};