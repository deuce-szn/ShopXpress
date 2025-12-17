import React from 'react';
import './Loader.css';

const NormalSectionLoader = () => {
  return (
    <div className="normal-loader">
      <div className="normal-loader__header">
        <div className="shimmer small-title"></div>
        <div className="shimmer main-title"></div>
        <div className="shimmer subtitle"></div>
      </div>

      <div className="normal-loader__grid">
        {Array.from({ length: 12 }).map((_, i) => (
          <div className="normal-loader__card" key={i}>
            <div className="shimmer image"></div>
            <div className="shimmer line short"></div>
            <div className="shimmer line"></div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NormalSectionLoader;
