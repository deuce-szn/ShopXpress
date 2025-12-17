"use client";

import React, { useState, useEffect, useCallback, useRef } from 'react';
import './GalleryView.css';
import { useParams } from 'next/navigation';
import Navbar from '@/Pages/Navbar/Navbar';
import Footer from '@/Pages/Footer/Footer';
import LastFooter from '@/Pages/Footer/LastFooter';
import { FaChevronLeft, FaChevronRight, FaStar, FaRegStar, FaStarHalfAlt, FaHeart, FaShare, FaShoppingBag, FaCheck, FaInfoCircle } from 'react-icons/fa';
import { FiHeart } from 'react-icons/fi';
import { useCartStore } from '@/Components/CartStore';
import { apiMedia, apiServer, ShortName } from '@/Constants/data';
import { Show } from '@/Constants/Alerts';
import { useRouter, useSearchParams } from 'next/navigation';

const GalleryView = () => {
  const searchParams = useSearchParams();
  const GalleryID = searchParams.get("CatalogueID");
  const [galleryData, setGalleryData] = useState(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const carouselRef = useRef(null);
  
  // Get wishlist and cart store methods
  const { 
    cart, 
    wishlist, 
    addToCart, 
    addToWishList, 
    deleteFromWishlist, 
    loadWishlist 
  } = useCartStore();
  
  const router = useRouter();

  // Fetch gallery data
  useEffect(() => {
    const fetchGalleryData = async () => {
      const formData = new FormData();
      formData.append("GalleryID", GalleryID);

      try {
        const response = await fetch(`${apiServer}ViewSingleGallery`, {
          method: "POST",
          headers: { "ShortName": ShortName },
          body: formData
        });

        const data = await response.json();

        if (response.ok && Array.isArray(data.Data)) {
          setGalleryData(data);
        } else {
          setGalleryData({ Data: [] });
          Show.Attention(data.message || "No gallery data found");
        }
      } catch (error) {
        console.error("Error fetching gallery:", error);
        Show.Attention("Failed to load gallery data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchGalleryData();
    // Load wishlist from store
    loadWishlist();
  }, [GalleryID]);

  // REMOVED AUTO-SLIDE FUNCTIONALITY COMPLETELY

  const handleSlideChange = useCallback((index) => {
    setCurrentSlide(index);
  }, []);

  const formatMoney = (value) => {
    return new Intl.NumberFormat('en-GH', {
      style: 'currency',
      currency: 'GHS',
      minimumFractionDigits: 2
    }).format(value);
  };

  const renderStars = (rating) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating - fullStars >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

    return (
      <div className="star-rating">
        {[...Array(fullStars)].map((_, i) => (
          <FaStar key={`full-${i}`} className="star-icon" />
        ))}
        {hasHalfStar && <FaStarHalfAlt className="star-icon" />}
        {[...Array(emptyStars)].map((_, i) => (
          <FaRegStar key={`empty-${i}`} className="star-icon" />
        ))}
        <span className="rating-text">{rating.toFixed(1)}</span>
      </div>
    );
  };

  // Check if current item is in wishlist
  const isItemInWishlist = (itemId) => {
    return wishlist.some(item => item.productId === itemId);
  };

  // Check if current item is in cart
  const isItemInCart = (itemId) => {
    return cart.some(item => item.productId === itemId);
  };

  const handleAddToCart = (item) => {
    const price = parseFloat(item.discountedPrice || item.currentPrice || item.price) || 0;
    
    addToCart({
      ...item,
      quantity: 1,
      price: price,
      currentPrice: parseFloat(item.currentPrice) || 0,
      discountedPrice: parseFloat(item.discountedPrice) || 0
    });
    
    Show.Success(`Added ${item.title} to cart`);
  };

  const handleWishlistToggle = (item) => {
    const isInWishlist = isItemInWishlist(item.productId);
    
    if (isInWishlist) {
      deleteFromWishlist(item.productId);
      Show.Success("Removed from wishlist");
    } else {
      addToWishList(item, 1);
      Show.Success("Added to wishlist");
    }
  };

  const handleShare = async () => {
    const currentItem = galleryData.Data[currentSlide];
    if (navigator.share) {
      try {
        await navigator.share({
          title: currentItem?.title,
          text: `Check out this beautiful product from ${galleryData?.Title}`,
          url: window.location.href,
        });
      } catch (error) {
        console.log('Sharing cancelled');
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      Show.Success("Link copied to clipboard!");
    }
  };

  if (isLoading) {
    return (
      <div className="luxury-loading">
        <div className="loading-animation">
          <div className="loading-circle"></div>
          <div className="loading-circle"></div>
          <div className="loading-circle"></div>
        </div>
        <p className="loading-text">Curating your collection...</p>
      </div>
    );
  }

  if (!galleryData?.Data?.length) {
    return (
      <div className="luxury-error">
        <div className="error-icon">✧</div>
        <h2>Collection Unavailable</h2>
        <p>This gallery appears to be empty or doesn't exist.</p>
        <button 
          className="back-button"
          onClick={() => router.back()}
        >
          Return to Collections
        </button>
      </div>
    );
  }

  const currentItem = galleryData.Data[currentSlide];
  const isInWishlist = isItemInWishlist(currentItem.productId);
  const isInCart = isItemInCart(currentItem.productId);

  return (
    <div className="luxury-gallery">
      <Navbar />
      
      <div className="gallery-container" style={{marginTop:"12rem"}}>
        {/* Gallery Header */}
        <div className="gallery-header">
          <div className="header-content">
            <h1 className="gallery-title">{galleryData.Title}</h1>
            <p className="gallery-subtitle">
              A curated collection of {galleryData.ItemCount} exclusive pieces
            </p>
            <div className="header-meta">
              <span className="meta-item">Total Value: {formatMoney(galleryData.TotalValue)}</span>
              <span className="meta-divider">•</span>
              <span className="meta-item">{galleryData.Data.length} Items</span>
            </div>
          </div>
        </div>

        {/* Main Product Display */}
        <div className="product-display">
          {/* Product Images */}
          <div className="product-images">
            <div className="main-image-container">
              <img 
                src={`${apiMedia}${currentItem.mainPicture}`} 
                alt={currentItem.title}
                className="main-image"
                onError={(e) => {
                  e.target.src = '/placeholder-image.jpg';
                  e.target.classList.add('error-fallback');
                }}
              />
              {currentItem.currentDiscount > 0 && (
                <div className="discount-badge">
                  <span className="discount-percent">-{currentItem.currentDiscount}%</span>
                  <span className="discount-label">EXCLUSIVE</span>
                </div>
              )}
              <button className="image-zoom" aria-label="Zoom image">
                <FaInfoCircle />
              </button>
            </div>
            
            <div className="image-thumbnails">
              {[currentItem.mainPicture, ...(currentItem.additionalPictures || [])].slice(0, 4).map((img, index) => (
                <button
                  key={index}
                  className={`thumbnail ${selectedImage === index ? 'active' : ''}`}
                  onClick={() => setSelectedImage(index)}
                >
                  <img 
                    src={`${apiMedia}${img}`} 
                    alt={`${currentItem.title} view ${index + 1}`}
                    onError={(e) => e.target.src = '/placeholder-thumb.jpg'}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Product Details */}
          <div className="product-details">
            {/* Header Actions */}
            <div className="product-header-actions">
              <button 
                className={`wishlist-button ${isInWishlist ? 'active' : ''}`}
                onClick={() => handleWishlistToggle(currentItem)}
                aria-label={isInWishlist ? "Remove from wishlist" : "Add to wishlist"}
              >
                {isInWishlist ? <FaHeart /> : <FiHeart />}
              </button>
              <button 
                className="share-button"
                onClick={handleShare}
                aria-label="Share product"
              >
                <FaShare />
              </button>
            </div>

            {/* Product Info */}
            <div className="product-info">
              <div className="product-category">CURATED COLLECTION</div>
              <h1 className="product-title">{currentItem.title}</h1>
              
              <div className="product-rating">
                {renderStars(currentItem.starRating || 4.5)}
              </div>

              <p className="product-description">
                {currentItem.description || "An exquisite piece from our curated collection, crafted with attention to detail and premium materials."}
              </p>

              {/* Price Section */}
              <div className="price-section">
                {currentItem.currentDiscount > 0 ? (
                  <>
                    <div className="price-display">
                      <span className="original-price">{formatMoney(currentItem.currentPrice)}</span>
                      <span className="current-price">{formatMoney(currentItem.discountedPrice)}</span>
                    </div>
                    <div className="savings-badge">
                      You save {formatMoney(currentItem.currentPrice - currentItem.discountedPrice)}
                    </div>
                  </>
                ) : (
                  <div className="price-display">
                    <span className="current-price">{formatMoney(currentItem.currentPrice)}</span>
                  </div>
                )}
              </div>

              {/* Stock Information */}
              <div className="stock-section">
                <div className="stock-status">
                  <div className={`stock-indicator ${currentItem.currentStock > 10 ? 'in-stock' : 'low-stock'}`}></div>
                  <span className="stock-text">
                    {currentItem.currentStock > 10 ? 'In Stock' : `Only ${currentItem.currentStock} left`}
                  </span>
                </div>
                <div className="gallery-stock">
                  <span className="gallery-count">{currentItem.galleryQuantity} in this gallery</span>
                </div>
              </div>

               <div className="carousel-controls" style={{display:"flex", flexDirection:"row", justifyContent:"space-between", padding:"1rem"}}>
              <button 
                className="carousel-nav prev"
                onClick={() => handleSlideChange((currentSlide - 1 + galleryData.Data.length) % galleryData.Data.length)}
                aria-label="Previous item"
              >
                <FaChevronLeft />
              </button>
              <div className="slide-counter">
                <span className="current-slide">{currentSlide + 1}</span>
                <span className="total-slides">/{galleryData.Data.length}</span>
              </div>
              <button 
                className="carousel-nav next"
                onClick={() => handleSlideChange((currentSlide + 1) % galleryData.Data.length)}
                aria-label="Next item"
              >
                <FaChevronRight />
              </button>
            </div>

              {/* Add to Cart */}
              <div className="cart-section">
                <button 
                  className={`add-to-cart-button ${isInCart ? 'added' : ''}`}
                  onClick={() => handleAddToCart(currentItem)}
                  disabled={isInCart}
                >
                  <span className="button-icon">
                    {isInCart ? <FaCheck /> : <FaShoppingBag />}
                  </span>
                  <span className="button-text">
                    {isInCart ? 'Added to Cart' : 'Add to Collection'}
                  </span>
                </button>

               
                
                <div className="secure-checkout">
                  <span className="secure-icon">🔒</span>
                  <span className="secure-text">Secure checkout · Free returns</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Gallery Carousel */}
        <div className="gallery-carousel-container">
          <div className="carousel-header">
            <h3 className="carousel-title">More from this collection</h3>
            <div className="carousel-controls">
              <button 
                className="carousel-nav prev"
                onClick={() => handleSlideChange((currentSlide - 1 + galleryData.Data.length) % galleryData.Data.length)}
                aria-label="Previous item"
              >
                <FaChevronLeft />
              </button>
              <div className="slide-counter">
                <span className="current-slide">{currentSlide + 1}</span>
                <span className="total-slides">/{galleryData.Data.length}</span>
              </div>
              <button 
                className="carousel-nav next"
                onClick={() => handleSlideChange((currentSlide + 1) % galleryData.Data.length)}
                aria-label="Next item"
              >
                <FaChevronRight />
              </button>
            </div>
          </div>

          <div className="gallery-carousel" ref={carouselRef}>
            {galleryData.Data.map((item, index) => (
              <div 
                key={item.productId}
                className={`carousel-item ${index === currentSlide ? 'active' : ''}`}
                onClick={() => handleSlideChange(index)}
              >
                <div className="carousel-image-container">
                  <img 
                    src={`${apiMedia}${item.mainPicture}`} 
                    alt={item.title}
                    className="carousel-image"
                    onError={(e) => e.target.src = '/placeholder-thumb.jpg'}
                  />
                  {/* Wishlist button for carousel items */}
                  <button 
                    className={`carousel-wishlist-button ${isItemInWishlist(item.productId) ? 'active' : ''}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleWishlistToggle(item);
                    }}
                    aria-label={isItemInWishlist(item.productId) ? "Remove from wishlist" : "Add to wishlist"}
                  >
                    {isItemInWishlist(item.productId) ? <FaHeart /> : <FiHeart />}
                  </button>
                  {index === currentSlide && <div className="active-indicator"></div>}
                </div>
                <div className="carousel-item-info">
                  <h4 className="carousel-item-title">{item.title}</h4>
                  <div className="carousel-item-price">
                    {item.currentDiscount > 0 ? (
                      <span className="carousel-price">{formatMoney(item.discountedPrice)}</span>
                    ) : (
                      <span className="carousel-price">{formatMoney(item.currentPrice)}</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="carousel-indicators">
            {galleryData.Data.map((_, index) => (
              <button
                key={index}
                className={`indicator ${index === currentSlide ? 'active' : ''}`}
                onClick={() => handleSlideChange(index)}
                aria-label={`Go to item ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>

      <Footer />
      <LastFooter />
    </div>
  );
};

export default GalleryView;