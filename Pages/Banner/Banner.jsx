"use client";
import React from 'react';
import './Banner.css';
import { BannerImages, Categories } from '@/Constants/data';


const Banner = () => {
  return (
    <div className='banner'>
      {BannerImages.map((data, index) => (
        <div  key={index}>
          <img src={data} alt={"banner"} className="hero-icon" />
         
        </div>
      ))}
    </div>
  );
};

export default Banner;
