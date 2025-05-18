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
