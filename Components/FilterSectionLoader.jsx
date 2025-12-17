import React from 'react';
import './Loader.css';

const FilteredSectionLoader = () => {
  return (
    <div className="filtered-loader">
      <div className="filtered-loader__header">
        <div className="shimmer title"></div>
        <div className="shimmer subtitle"></div>
      </div>

      <div className="filtered-loader__grid">
        {Array.from({ length: 12 }).map((_, i) => (
          <div className="filtered-loader__card" key={i}>
            <div className="shimmer image"></div>
            <div className="shimmer line short"></div>
            <div className="shimmer line"></div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FilteredSectionLoader;
