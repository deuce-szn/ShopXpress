"use client";

import React, { useState, useEffect, useRef } from 'react';
import './Products.css';
import { useRouter, useSearchParams } from 'next/navigation';
import Navbar from '@/Pages/Navbar/Navbar';
import Footer from '@/Pages/Footer/Footer';
import LastFooter from '@/Pages/Footer/LastFooter';
import { FaHeart, FaRegStar, FaStar, FaStarHalfAlt } from 'react-icons/fa';
import { FiHeart, FiShoppingCart } from 'react-icons/fi';
import { PiRepeatOnceBold } from 'react-icons/pi';
import ProductLoader from '@/Components/ProductLoader';
import { useCartStore } from '@/Components/CartStore';
import { apiMedia } from '@/Constants/data';

const ProductDetails = () => {
  const searchParams = useSearchParams();
  const productId = searchParams.get("productId");
  const router = useRouter();

  const {
    loadProducts, productList,
    loadCategory,
    cart, wishlist,
    loadCart, loadWishlist,
    updateCartQuantity, addToCartWithSize,
    addToWishList, deleteFromWishlist
  } = useCartStore();

  const [modalContent, setModalContent] = useState(null);
  const [activeImage, setActiveImage] = useState('');
  const [selectedSize, setSelectedSize] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);

  const magnifierRef = useRef(null);
  const mainImageRef = useRef(null);

  // Load products/categories/cart/wishlist
  useEffect(() => {
    loadProducts();
    loadCategory();
    loadCart();
    loadWishlist();
  }, []);

  // When products are loaded, get the matching product
  useEffect(() => {
    if (productId && productList.length > 0) {
      // Convert productId to number for comparison since we're using productId from transformed data
      const productIdNum = parseInt(productId);
      const foundProduct = productList.find(p => p.productId === productIdNum);
      setModalContent(foundProduct);
      setActiveImage(foundProduct?.mainPicture || foundProduct?.productImage || '');
      setLoading(false);
      console.log("Found Product:", foundProduct);
    }
  }, [productId, productList]);

  // Magnifier effect
  const handleMouseMove = (e) => {
    const magnifier = magnifierRef.current;
    const image = mainImageRef.current;
    if (!magnifier || !image) return;

    const rect = image.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const magnifierSize = 150;
    const zoom = 2;

    magnifier.style.left = `${x - magnifierSize / 2}px`;
    magnifier.style.top = `${y - magnifierSize / 2}px`;
    magnifier.style.backgroundImage = `url(${image.src})`;
    magnifier.style.backgroundRepeat = 'no-repeat';
    magnifier.style.backgroundSize = `${image.width * zoom}px ${image.height * zoom}px`;
    magnifier.style.backgroundPosition = `${(x / rect.width) * 100}% ${(y / rect.height) * 100}%`;
    magnifier.style.display = 'block';
  };

  const handleMouseLeave = () => {
    if (magnifierRef.current) magnifierRef.current.style.display = 'none';
  };

  const formatCurrency = (value) => {
    const numValue = parseFloat(value) || 0;
    return new Intl.NumberFormat('en-GH', {
      style: 'currency',
      currency: 'GHS',
      minimumFractionDigits: 2,
    }).format(numValue);
  };

  // Fixed star rendering function
  const renderStars = (rating) => {
    // Ensure rating is a valid number
    const safeRating = typeof rating === 'number' && !isNaN(rating) ? rating : 0;
    const fullStars = Math.floor(safeRating);
    const hasHalfStar = safeRating - fullStars >= 0.5;
    const emptyStars = Math.max(0, 5 - fullStars - (hasHalfStar ? 1 : 0));

    return (
      <>
        {[...Array(Math.max(0, fullStars))].map((_, i) => (
          <FaStar key={`full-${i}`} color="#FFD700" />
        ))}
        {hasHalfStar && <FaStarHalfAlt key="half" color="#FFD700" />}
        {[...Array(Math.max(0, emptyStars))].map((_, i) => (
          <FaRegStar key={`empty-${i}`} color="#FFD700" />
        ))}
      </>
    );
  };

  if (loading) {
    return <ProductLoader />;
  }

  if (!modalContent) {
    return (
      <div style={{ backgroundColor: "#fff", minHeight: "100vh" }}>
        <Navbar />
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '50vh',
          flexDirection: 'column',
          textAlign: 'center'
        }}>
          <h1 style={{ fontSize: '24px', color: '#666', marginBottom: '16px' }}>
            Product Not Found
          </h1>
          <p style={{ color: '#999', marginBottom: '24px' }}>
            The product you're looking for doesn't exist or has been removed.
          </p>
          <button
            onClick={() => router.push('/')}
            style={{
              padding: '12px 24px',
              backgroundColor: '#ff5252',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '16px'
            }}
          >
            Back to Home
          </button>
        </div>
        <Footer />
        <LastFooter />
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: "#fff" }}>
      <Navbar />

      <div className="product-details-container">
        <div className="product-images">
          <div className="sub-images">
            {/* Use subPictures if available, otherwise show main picture */}
            {(modalContent?.subPictures && modalContent.subPictures.length > 0 ? modalContent.subPictures : [modalContent.mainPicture || modalContent.productImage])
              .map((subImage, idx) => (
                <img
                  key={idx}
                  src={apiMedia + subImage}
                  alt="Sub"
                  className="sub-image-item"
                  onMouseEnter={() => setActiveImage(subImage)}
                />
              ))}
          </div>

          <div className="main-image-container">
            <img
              src={apiMedia + (activeImage || modalContent.mainPicture || modalContent.productImage)}
              alt="Main"
              className="main-image"
              ref={mainImageRef}
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
            />
            <div className="magnifier-glass" ref={magnifierRef}></div>
          </div>
        </div>

        <div className="product-info">
          <h1>{modalContent.title}</h1>

          <div className="product-meta">
            <span>Category: {modalContent.category}</span>
            <span className="rating">{renderStars(modalContent.starRating || 0)}</span>
            <span>Review (3)</span>
          </div>

          <div className="product-price">
            {modalContent.discountPercent < 1 ? (
              <span className="new-price">{formatCurrency(modalContent.price)}</span>
            ) : (
              <>
                <span className="old-price">{formatCurrency(modalContent.price)}</span>
                <span className="new-price">
                  {formatCurrency(
                    ((100 - modalContent.discountPercent) / 100) * modalContent.price
                  )}
                </span>
              </>
            )}
          </div>

          <div className="product-stock">
            Available In Stock: 
            <span style={{ color: "#17a34a", fontFamily: "Hydot-SemiBold", marginLeft: "8px" }}>
              {modalContent.quantity} {modalContent.quantity > 1 ? "items" : "item"}
            </span>
          </div>

          <p className="product-description">{modalContent.description}</p>

          {Array.isArray(modalContent.size) && modalContent.size.some(size => size) && (
            <div className="product-sizes">
              <span>SIZE: </span>
              <div className="size-options">
                {modalContent.size.map((size, idx) => (
                  size && (
                    <div
                      key={idx}
                      className={`size-option ${selectedSize === size ? "active" : ""}`}
                      onClick={() => setSelectedSize(size)}
                    >
                      {size}
                    </div>
                  )
                ))}
              </div>
            </div>
          )}

          <div className="shipping-info">
            Free Shipping (Est. Delivery Time 2-3 Days)
          </div>

          <div className="product-actions">
            {cart.find(item => item.productId === modalContent.productId) ? (
              <div className="quantity-control">
                <button 
                  className="quantity-btn-left" 
                  onClick={() => updateCartQuantity(modalContent, -1)}
                >
                  -
                </button>
                <input 
                  type="text" 
                  className="quantity-input" 
                  value={cart.find(cartItem => cartItem.productId === modalContent.productId)?.quantity || 1} 
                  readOnly
                />
                <button 
                  className="quantity-btn-right" 
                  onClick={() => updateCartQuantity(modalContent, 1)}
                >
                  +
                </button>
              </div>
            ) : (
              <div 
                className="add-to-cart-btn1" 
                onClick={() => {
                  if (modalContent.size?.length > 0 && !selectedSize) {
                    alert("Please select a size before adding to cart");
                    return;
                  }
                  addToCartWithSize(modalContent, 1, selectedSize);
                }}
              >
                <FiShoppingCart style={{ marginRight: '8px' }} />
                Add to Cart
              </div>
            )}
          </div>

          <div className="wishlist-compare">
            <div className="wishlist-item">
              {wishlist.find(item => item.productId === modalContent.productId) ? (
                <div onClick={() => deleteFromWishlist(modalContent.productId)}>
                  <FaHeart color="red" size={30} />
                  <span>Remove From Wishlist</span>
                </div>
              ) : (
                <div onClick={() => addToWishList(modalContent, 1)}>
                  <FiHeart size={30} />
                  <span>Add to Wishlist</span>
                </div>
              )}
            </div>

            <div className="wishlist-item">
              <PiRepeatOnceBold size={30} />
              <span>Add to Compare</span>
            </div>
          </div>
        </div>
      </div>

      <Footer />
      <LastFooter />
    </div>
  );
};

export default ProductDetails;