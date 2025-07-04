
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Register plugins
gsap.registerPlugin(ScrollTrigger);

// Default GSAP configuration
gsap.config({
  nullTargetWarn: false, // Suppress warnings for missing targets
  trialWarn: false
});

// Set default ease and duration
gsap.defaults({
  ease: "power2.out",
  duration: 0.8
});

// Animation utility functions
export const fadeIn = (element: string | Element, delay: number = 0) => {
  const target = typeof element === 'string' ? document.querySelector(element) : element;
  if (!target) return null;
  
  return gsap.fromTo(target, 
    { opacity: 0, y: 30 },
    { opacity: 1, y: 0, delay, duration: 0.8, ease: "power2.out" }
  );
};

export const staggerAnimation = (elements: string, delay: number = 0.1) => {
  const targets = document.querySelectorAll(elements);
  if (targets.length === 0) return null;
  
  return gsap.fromTo(targets,
    { opacity: 0, y: 30 },
    { opacity: 1, y: 0, stagger: delay, duration: 0.6, ease: "power2.out" }
  );
};

export const createScrollAnimation = (trigger: string, animation: () => gsap.core.Timeline) => {
  const triggerElement = document.querySelector(trigger);
  if (!triggerElement) return null;
  
  return ScrollTrigger.create({
    trigger: triggerElement,
    start: "top 80%",
    animation: animation(),
    toggleActions: "play none none reverse"
  });
};

// Safe animation runner that checks for element existence
export const safeAnimate = (selector: string, fromVars: gsap.TweenVars, toVars: gsap.TweenVars) => {
  const elements = document.querySelectorAll(selector);
  if (elements.length === 0) {
    console.warn(`GSAP: No elements found for selector "${selector}"`);
    return null;
  }
  return gsap.fromTo(elements, fromVars, toVars);
};

export default gsap;
