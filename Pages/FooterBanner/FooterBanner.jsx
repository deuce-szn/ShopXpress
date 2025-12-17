"use client";
import React from 'react';
import './Banner.css';
import { BannerImages, Categories, FooterBannerIcons } from '@/Constants/data';


const FooterBanner = () => {
  return (
    
    <div className='footer-banner1'>
     
      {FooterBannerIcons.map((data, index) => (
        <div  key={index} style={{display:"flex", flexDirection:"column", gap:"10px", alignItems:"center", minWidth:"150px"}}>
          <div>{data.icon}</div>
          <div>{data.title}</div>
          <div>{data.description}</div>
        </div>
      ))}
       
    </div>
  );
};

export default FooterBanner;
