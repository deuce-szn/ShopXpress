"use client";
import React, { useEffect } from 'react';
import './HeroBar.css';
import { apiMedia, Categories } from '@/Constants/data';
import { useRouter } from 'next/navigation';
import { useCartStore } from '@/Components/CartStore';


const HeroBar = () => {

  const { loadProducts, productList, loadCategory, categoryList } = useCartStore();
    
      useEffect(() => {
        loadProducts(); // Initial fetch on mount
        loadCategory();
      }, []);

  const router = useRouter();
      const navigate = (path) => {
        router.push(path);
      };

  return (
    <div className='hero-bar'>
      {categoryList.map((data, index) => (
        <div className='hero-card' key={index} onClick={()=>navigate(`/products?category=${data.name}`)}>
          <img src={apiMedia +data.categoryImage} alt={data.name} className="banner-hero-icon" />
          <span className="hero-label">{data.name}</span>
        </div>
      ))}
    </div>
  );
};

export default HeroBar;
