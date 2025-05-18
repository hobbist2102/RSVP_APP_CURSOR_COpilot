import React, { useRef } from 'react';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';
import { FloatingShapes } from './floating-shapes';

interface Layer {
  id: string;
  content: React.ReactNode;
  depth?: number;
  position?: 'center' | 'left' | 'right' | 'top' | 'bottom';
  opacity?: number;
  scale?: number;
}

interface NarrativeSceneProps {
  title: string;
  tagline: string;
  layers: Layer[];
  backgroundColor?: string;
  textColor?: string;
  hasShapes?: boolean;
  pinnedDuration?: number; // How long the scene stays pinned during scroll
}

/**
 * A complex cinematic scene component that creates a layered, parallax storytelling experience
 */
export const NarrativeScene: React.FC<NarrativeSceneProps> = ({
  title,
  tagline,
  layers,
  backgroundColor = '#000',
  textColor = 'white',
  hasShapes = true,
  pinnedDuration = 1
}) => {
  const sceneRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  
  // Create unique ID for this scene
  const sceneId = title.toLowerCase().replace(/\s+/g, '-');
  
  useGSAP(() => {
    if (sceneRef.current && contentRef.current) {
      // Import ScrollTrigger dynamically
      import('gsap/ScrollTrigger').then(({ ScrollTrigger }) => {
        gsap.registerPlugin(ScrollTrigger);
        
        // Create master timeline for the scene
        const masterTl = gsap.timeline({
          scrollTrigger: {
            trigger: sceneRef.current,
            start: "top top",
            end: `+=${pinnedDuration * 100}%`,
            pin: true,
            pinSpacing: true,
            scrub: true,
            anticipatePin: 1,
            markers: false
          }
        });
        
        // Animate title with split text
        const titleElement = sceneRef.current.querySelector('.scene-title');
        const taglineElement = sceneRef.current.querySelector('.scene-tagline');
        
        if (titleElement) {
          // Reveal title word by word
          gsap.set(titleElement.querySelectorAll('.word'), { autoAlpha: 0, y: 50 });
          
          masterTl.to(titleElement.querySelectorAll('.word'), {
            autoAlpha: 1,
            y: 0,
            stagger: 0.1,
            duration: 0.3,
            ease: "power2.out"
          }, 0);
        }
        
        if (taglineElement) {
          gsap.set(taglineElement, { autoAlpha: 0 });
          masterTl.to(taglineElement, {
            autoAlpha: 1,
            duration: 0.3,
            ease: "power2.out"
          }, 0.3);
        }
        
        // Animate each layer with parallax effect based on its depth
        const layerElements = sceneRef.current.querySelectorAll('.scene-layer');
        layerElements.forEach((layerEl) => {
          const depth = parseFloat(layerEl.getAttribute('data-depth') || '1');
          const position = layerEl.getAttribute('data-position') || 'center';
          
          // Create starting position based on layer position
          let xStart = 0, yStart = 0;
          switch (position) {
            case 'left': xStart = -50; break;
            case 'right': xStart = 50; break;
            case 'top': yStart = -30; break;
            case 'bottom': yStart = 30; break;
          }
          
          // Set initial position
          gsap.set(layerEl, { 
            x: xStart, 
            y: yStart, 
            autoAlpha: 0,
            scale: 0.9
          });
          
          // Animate to center
          masterTl.to(layerEl, {
            x: 0,
            y: 0,
            autoAlpha: 1,
            scale: 1,
            duration: 0.5,
            ease: "power2.out"
          }, 0.2 + (0.1 * depth));
          
          // Add parallax movement based on depth
          masterTl.to(layerEl, {
            y: position === 'top' ? 30 : position === 'bottom' ? -30 : 0,
            x: position === 'left' ? 30 : position === 'right' ? -30 : 0,
            scale: 1 + (0.1 * depth),
            ease: "none"
          }, 0.5);
        });
      });
    }
  }, { scope: sceneRef });

  // Split text into words for animation
  const renderTitle = () => {
    return title.split(' ').map((word, index) => (
      <span key={index} className="word inline-block mr-[0.25em] transform-gpu">
        {word}
      </span>
    ));
  };

  return (
    <div 
      ref={sceneRef}
      className="narrative-scene h-screen w-full relative overflow-hidden"
      style={{ backgroundColor, color: textColor }}
      id={sceneId}
    >
      {/* Background floating shapes for visual interest */}
      {hasShapes && (
        <FloatingShapes 
          count={15} 
          color={textColor} 
          opacity={0.05} 
          size={30} 
          speed={30}
        />
      )}
      
      {/* Main content container */}
      <div 
        ref={contentRef}
        className="w-full h-full flex flex-col items-center justify-center relative z-10 px-8"
      >
        {/* Title with word-by-word animation */}
        <h2 
          className="scene-title text-4xl md:text-6xl lg:text-7xl font-bold mb-4 text-center"
        >
          {renderTitle()}
        </h2>
        
        {/* Tagline */}
        <p className="scene-tagline text-xl md:text-2xl lg:text-3xl mb-16 text-center opacity-80 max-w-3xl">
          {tagline}
        </p>
        
        {/* Content layers with parallax effects */}
        <div className="scene-layers relative h-full max-h-[60vh] w-full max-w-6xl flex items-center justify-center">
          {layers.map((layer) => (
            <div 
              key={layer.id}
              className={`scene-layer absolute inset-0 flex items-center justify-center`}
              data-depth={layer.depth || 1}
              data-position={layer.position || 'center'}
              style={{ 
                opacity: layer.opacity !== undefined ? layer.opacity : 1,
                zIndex: Math.round(10 - (layer.depth || 1))
              }}
            >
              {layer.content}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};