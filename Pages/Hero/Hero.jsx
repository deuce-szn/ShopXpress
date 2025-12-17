"use client";
import React, { useState, useEffect, useCallback } from 'react';
import { apiMedia, apiServer, ShortName } from '@/Constants/data';
import './Hero.css';


const Hero = () => {
  const [person, setPerson] = useState(null);
  const [slides, setSlides] = useState([]);
  const [current, setCurrent] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch person object from API
  useEffect(() => {
    const formData = new FormData();
    setIsLoading(true);

    fetch(apiServer + "WebsiteDetails", {
      method: "POST",
      headers: {"ShortName": ShortName},
      body: formData,
    })
      .then((res) => res.json())
      .then((data) => {
        setPerson(data);

        try {
          const parsedHeroList = JSON.parse(data.HeroList || '[]');
          const formattedSlides = parsedHeroList.map((img, idx) => ({
            id: idx + 1,
            image: apiMedia + img,
            alt: `Hero image ${idx + 1}`,
          }));
          setSlides(formattedSlides);
        } catch (err) {
          console.log("Error parsing HeroList:", err);
          setSlides([]);
        }
      })
      .catch((err) => console.log("Error fetching website details:", err))
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  // Auto-slide with pause on hover
  useEffect(() => {
    if (slides.length <= 1) return;

    const interval = setInterval(() => {
      if (!isHovered) {
        setCurrent((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [slides, isHovered]);

  const nextSlide = useCallback(() => {
    setCurrent((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
  }, [slides.length]);

  const prevSlide = useCallback(() => {
    setCurrent((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  }, [slides.length]);

  const goToSlide = useCallback((index) => {
    setCurrent(index);
  }, []);

  if (isLoading) {
    return (
      <div className="hero-container shimmer">
        <div className="hero-skeleton">
          <div className="shimmer-effect"></div>
        </div>
      </div>
    );
  }

  if (!person || slides.length === 0) {
    return (
      <div className="hero-container empty-state">
        <div className="empty-content">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M4 16L8 12L4 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M10 20H18C19.1046 20 20 19.1046 20 18V6C20 4.89543 19.1046 4 18 4H10C8.89543 4 8 4.89543 8 6V18C8 19.1046 8.89543 20 10 20Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <p>No images available</p>
        </div>
      </div>
    );
  }

  return (
    <section 
      className="hero-container"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      aria-label="Image carousel"
    >
      <div className="hero-slides">
        {slides.map((slide, index) => (
          <div
            className={`slide ${index === current ? 'active' : ''} ${index < current ? 'prev' : 'next'}`}
            key={slide.id}
            aria-hidden={index !== current}
          >
            <div className="image-wrapper">
              <img
                src={slide.image}
                alt={slide.alt}
                className="slide-image"
                loading={index === 0 ? 'eager' : 'lazy'}
              />
              <div className="slide-overlay"></div>
            </div>
          </div>
        ))}
      </div>

      {slides.length > 1 && (
        <>
          <button 
            className="hero-nav prev"
            onClick={prevSlide}
            aria-label="Previous slide"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <button 
            className="hero-nav next"
            onClick={nextSlide}
            aria-label="Next slide"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>

          <div className="hero-pagination">
            {slides.map((_, index) => (
              <button
                key={`dot-${index}`}
                className={`pagination-dot ${index === current ? 'active' : ''}`}
                onClick={() => goToSlide(index)}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
};

export default Hero;