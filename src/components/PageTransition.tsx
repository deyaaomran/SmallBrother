import React from 'react';

interface PageTransitionProps {
  children: React.ReactNode;
  isVisible: boolean;
}

const PageTransition: React.FC<PageTransitionProps> = ({ children, isVisible }) => {
  return (
    <div
      className={`transition-all duration-500 ease-in-out transform ${
        isVisible
          ? 'opacity-100 translate-y-0 scale-100'
          : 'opacity-0 translate-y-4 scale-95'
      }`}
    >
      {children}
    </div>
  );
};

export default PageTransition; 