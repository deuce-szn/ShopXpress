import React from 'react';
import './Page.css';

const Page = () => {
  return (
    <div className="maintenance-container">
      {/* Animated Metal Bars */}
      <div className="metal-bars">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="metal-bar" style={{ '--delay': i * 0.2 + 's' }}></div>
        ))}
      </div>
      
      {/* Main Content */}
      <div className="maintenance-content">
        <div className="gear-container">
          <div className="gear gear-large">
            <div className="gear-teeth"></div>
            <div className="gear-center"></div>
          </div>
          <div className="gear gear-small">
            <div className="gear-teeth"></div>
            <div className="gear-center"></div>
          </div>
        </div>
        
        <h1 className="maintenance-title">
          <span className="title-text">System Maintenance</span>
          <span className="title-underline"></span>
        </h1>
        
        <p className="maintenance-message">
          We're performing critical upgrades to serve you better. Our systems will be back online shortly.
        </p>
        
        <div className="progress-container">
          <div className="progress-bar">
            <div className="progress-fill"></div>
          </div>
          <div className="progress-text">Rebuilding systems...</div>
        </div>
        
        <div className="contact-info">
          <p>For urgent inquiries, please contact:</p>
          <a href="mailto:support@hydotstore.com" className="contact-link">
            support@hydotstore.com
          </a>
        </div>
      </div>
      
      {/* Floating Metal Particles */}
      <div className="metal-particles">
        {[...Array(20)].map((_, i) => (
          <div 
            key={i} 
            className="particle"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              transform: `scale(${0.5 + Math.random() * 0.5})`
            }}
          ></div>
        ))}
      </div>
    </div>
  );
};

export default Page;