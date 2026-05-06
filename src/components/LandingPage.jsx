import React, { useEffect, useRef, useState, useCallback } from 'react';
import './LandingPage.css';

const SEQUENCE_COUNT = 4;
const FRAMES_PER_SEQUENCE = 160;
const TOTAL_FRAMES = (SEQUENCE_COUNT * FRAMES_PER_SEQUENCE) + 1; // +1 for start frame

const sequences = [
  { name: 'chaos', path: '/sequences/sequence_1', text: 'Too distracted to focus.' },
  { name: 'transition', path: '/sequences/sequence_2', text: 'Getting clearer now.' },
  { name: 'focus', path: '/sequences/sequence_3', text: 'Focus locked in.' },
  { name: 'achievement', path: '/sequences/sequence_4', text: 'Made it. Progress.' }
];

export default function LandingPage({ onLoginClick }) {
  const canvasRef = useRef(null);
  const imagesRef = useRef([]);
  const startFrameRef = useRef(null);
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [showMenu, setShowMenu] = useState(false);
  const [activeSection, setActiveSection] = useState(0);

  const scrollRef = useRef({
    current: 0,
    target: 0,
    ease: 0.05
  });

  const requestRef = useRef();


  useEffect(() => {
    let loadedCount = 0;
    const totalToLoad = TOTAL_FRAMES;

    const preloadImages = async () => {
      // 1. Load Start Frame
      const startImg = new Image();
      startImg.src = '/assets/kitten/start frame.jpeg';
      const startPromise = new Promise((resolve) => {
        startImg.onload = () => {
          loadedCount++;
          setProgress(Math.floor((loadedCount / totalToLoad) * 100));
          resolve(startImg);
        };
        startImg.onerror = () => {
          console.error('Failed to load start frame');
          loadedCount++;
          resolve(null);
        };
      });

      // 2. Load Sequences
      const sequencePromises = [];
      for (let s = 0; s < SEQUENCE_COUNT; s++) {
        for (let f = 1; f <= FRAMES_PER_SEQUENCE; f++) {
          const img = new Image();
          const frameStr = f.toString().padStart(3, '0');
          img.src = `${sequences[s].path}/ezgif-frame-${frameStr}.jpg`;
          
          const promise = new Promise((resolve) => {
            img.onload = () => {
              loadedCount++;
              setProgress(Math.floor((loadedCount / totalToLoad) * 100));
              resolve(img);
            };
            img.onerror = () => {
              console.error(`Failed to load image: ${img.src}`);
              loadedCount++;
              resolve(null);
            };
          });
          sequencePromises.push(promise);
        }
      }

      const [startFrame, ...seqFrames] = await Promise.all([startPromise, ...sequencePromises]);
      const allImages = [startFrame, ...seqFrames].filter(img => img !== null);
      
      imagesRef.current = allImages;
      setImages(allImages);
      setLoading(false);
    };

    preloadImages();
  }, []);

  const renderCanvas = useCallback((frameIndex) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const img = imagesRef.current[frameIndex];
    if (!img || !img.complete) return;

    const ctx = canvas.getContext('2d', { alpha: false });

    // High-quality rendering settings
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Calculate aspect ratio (Cover)
    const canvasRatio = canvas.width / canvas.height;
    const imgRatio = img.width / img.height;
    let drawWidth, drawHeight, offsetX, offsetY;

    if (canvasRatio > imgRatio) {
      drawWidth = canvas.width;
      drawHeight = canvas.width / imgRatio;
      offsetX = 0;
      offsetY = (canvas.height - drawHeight) / 2;
    } else {
      drawWidth = canvas.height * imgRatio;
      drawHeight = canvas.height;
      offsetX = (canvas.width - drawWidth) / 2;
      offsetY = 0;
    }

    ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
  }, []);

  const animate = useCallback(() => {
    // Smooth lerp
    scrollRef.current.current += (scrollRef.current.target - scrollRef.current.current) * scrollRef.current.ease;
    
    const frameIndex = Math.min(
      TOTAL_FRAMES - 1,
      Math.max(0, Math.floor(scrollRef.current.current * (TOTAL_FRAMES - 1)))
    );

    renderCanvas(frameIndex);

    // Determine active section for text overlays
    const sectionIndex = Math.floor(scrollRef.current.current * SEQUENCE_COUNT);
    setActiveSection(Math.min(SEQUENCE_COUNT - 1, sectionIndex));

    requestRef.current = requestAnimationFrame(animate);
  }, [renderCanvas]);

  useEffect(() => {
    const handleResize = () => {
      if (canvasRef.current) {
        canvasRef.current.width = window.innerWidth;
        canvasRef.current.height = window.innerHeight;
      }
    };

    const handleScroll = () => {
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollTop = window.scrollY;
      scrollRef.current.target = scrollTop / scrollHeight;
    };

    handleResize();
    
    window.addEventListener('scroll', handleScroll);
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  useEffect(() => {
    if (!loading && imagesRef.current.length > 0 && canvasRef.current) {
      // Ensure canvas has proper size before rendering
      canvasRef.current.width = window.innerWidth;
      canvasRef.current.height = window.innerHeight;
      // Render the first frame immediately
      renderCanvas(0);
      requestRef.current = requestAnimationFrame(animate);
    }
    return () => cancelAnimationFrame(requestRef.current);
  }, [loading, animate, renderCanvas]);

  if (loading) {
    return (
      <div className="landing-loader">
        <div className="loader-content">
          <div className="loader-paw">🐾</div>
          <h2>Loading PawTime Experience</h2>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${progress}%` }}></div>
          </div>
          <span>{progress}%</span>
        </div>
      </div>
    );
  }

  return (
    <div className="landing-page">
      <canvas ref={canvasRef} className="story-canvas" />

      <nav className="landing-nav">
        <div className="nav-left">
          <span className="nav-logo">🐾</span>
          <span className="nav-title">PawTime</span>
        </div>
        <div className="nav-right">
          <button className="nav-login" onClick={onLoginClick}>Login</button>
          <div className="menu-container">
            <button className="menu-trigger" onClick={() => setShowMenu(!showMenu)}>
              <span className="dot"></span>
              <span className="dot"></span>
              <span className="dot"></span>
            </button>
            {showMenu && (
              <div className="glass-menu">
                <a href="#about">About</a>
                <a href="#story">Story</a>
                <a href="https://www.linkedin.com/in/anubrata--ghosh/" target="_blank" rel="noopener noreferrer">Support</a>
              </div>
            )}
          </div>
        </div>
      </nav>
      
      <div className="scroll-container">
        {sequences.map((seq, index) => (
          <section key={seq.name} className={`story-section ${activeSection === index ? 'active' : ''}`}>
            <div className="section-content">
              <h1 className="story-text">
                {seq.text.split(' ').map((word, wordIndex) => (
                  <span key={wordIndex} className="word">
                    {word.split('').map((char, charIndex) => {
                      // Calculate global index for staggered animation
                      const globalIndex = seq.text.split(' ').slice(0, wordIndex).join(' ').length + (wordIndex > 0 ? 1 : 0) + charIndex;
                      return (
                        <span key={charIndex} className="char" style={{ '--index': globalIndex }}>
                          {char}
                        </span>
                      );
                    })}
                    {'\u00A0'}
                  </span>
                ))}
              </h1>
              {index === 3 && (
                <button className="cta-button" onClick={onLoginClick}>
                  Start Focusing
                </button>
              )}
            </div>
          </section>
        ))}
      </div>

      {/* Hidden Anchor targets for menu */}
      <div id="about" className="overlay-panel">
         <div className="panel-content">
            <button className="close-panel" onClick={() => window.location.hash = ''}>&times;</button>
            <h3>About PawTime</h3>
            <div className="typewriter">
              <p>I built PawTime because I was tired of overly complicated productivity apps. I wanted something simple—just a to-do list and a timer. The kitten is there because doing work alone felt boring. Having a little friend react to what you're doing actually makes it more fun.</p>
            </div>
         </div>
      </div>
      <div id="story" className="overlay-panel">
         <div className="panel-content">
            <button className="close-panel" onClick={() => window.location.hash = ''}>&times;</button>
            <h3>Why I Made This</h3>
            <div className="typewriter">
              <p>I noticed I was switching between different apps for tasks and timers, which defeated the purpose of focusing. I also realized I work better when there's something visual happening—animations, a character, something that gives feedback. So I put it all in one place and added a kitten that changes based on what you're doing.</p>
            </div>
         </div>
      </div>
    </div>
  );
}