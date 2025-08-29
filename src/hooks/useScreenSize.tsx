import { useState, useEffect } from 'react';

export const useScreenSize = () => {
  const [screenSize, setScreenSize] = useState(() => {
    // Provide safe defaults for SSR
    if (typeof window === 'undefined') {
      return {
        isDesktop: false,
        isTablet: false,
        isMobile: true
      };
    }
    
    const width = window.innerWidth;
    return {
      isDesktop: width >= 1024,
      isTablet: width >= 768 && width < 1024,
      isMobile: width < 768
    };
  });

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      setScreenSize({
        isDesktop: width >= 1024,
        isTablet: width >= 768 && width < 1024,
        isMobile: width < 768
      });
    };

    window.addEventListener('resize', handleResize);
    
    // Call handleResize immediately to set the correct initial state
    handleResize();

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return screenSize;
};