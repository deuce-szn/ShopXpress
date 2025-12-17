"use client";
import React, { useState, useRef, useEffect } from 'react';
import { FaStar, FaStarHalfAlt, FaRegStar, FaHeart, FaSearch, FaImage } from 'react-icons/fa';
import { CgMaximizeAlt } from "react-icons/cg";
import { PiRepeatOnceBold } from "react-icons/pi";
import { useRouter } from 'next/navigation';
import { useCartStore } from '@/Components/CartStore';
import './VisualSearch.css';
import { FaCloudBolt } from 'react-icons/fa6';
import { IoListCircleSharp } from 'react-icons/io5';
import { FiShoppingCart } from 'react-icons/fi';

const VisualSearch = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [recommendedProducts, setRecommendedProducts] = useState([]); // NEW: For recommended products
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState({ show: false, message: '', error: false });
  const [modalOpen, setModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState(null);
  const [activeImage, setActiveImage] = useState(null);
  const fileInputRef = useRef(null);
  const dropZoneRef = useRef(null);
  const router = useRouter();

  const API_BASE = 'http://localhost:9002';
  const apiMedia = 'http://localhost:8000'; // Adjust based on your constant

  const { cart, addToCart, updateCartQuantity, deleteFromWishlist, addToWishList, wishlist, loadWishlist } = useCartStore();

  useEffect(() => {
    loadWishlist();
  }, []);

  // Handle file selection
  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file && file.type.startsWith('image/')) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Drag and drop handlers
  const handleDragOver = (e) => {
    e.preventDefault();
    dropZoneRef.current.style.borderColor = 'var(--primary)';
    dropZoneRef.current.style.backgroundColor = 'var(--gray-light)';
  };

  const handleDragLeave = () => {
    dropZoneRef.current.style.borderColor = 'var(--border)';
    dropZoneRef.current.style.backgroundColor = 'transparent';
  };

  const handleDrop = (e) => {
    e.preventDefault();
    handleDragLeave();
    
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Search functionality
  const handleSearch = async () => {
    if (!selectedFile) {
      showNotification('Please upload an image first', true);
      return;
    }

    setLoading(true);
    setSearchResults([]);
    setRecommendedProducts([]); // Clear previous recommendations
    
    try {
      const formData = new FormData();
      formData.append('image', selectedFile);
      
      const response = await fetch(`${API_BASE}/upload`, {
        method: 'POST',
        body: formData
      });
      
      const data = await response.json();
      
      if (data.success) {
        setSearchResults(data.results || []);
        setRecommendedProducts(data.recommendedProducts || []); // NEW: Set recommended products
        showNotification(`Found ${data.totalMatches} similar images and ${data.totalRecommendations} recommendations`);
      } else {
        showNotification(data.error || 'Search failed', true);
        setSearchResults([]);
        setRecommendedProducts([]);
      }
    } catch (error) {
      console.log('Search error:', error);
      showNotification('Error connecting to server', true);
      setSearchResults([]);
      setRecommendedProducts([]);
    } finally {
      setLoading(false);
    }
  };

  // Show notification
  const showNotification = (message, isError = false) => {
    setNotification({ show: true, message, error: isError });
    setTimeout(() => {
      setNotification({ show: false, message: '', error: false });
    }, 3000);
  };

  // Star rendering function
  const renderStars = (rating) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating - fullStars >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

    return (
      <>
        {[...Array(fullStars)].map((_, i) => <FaStar key={`full-${i}`} color="#FFD700" />)}
        {hasHalfStar && <FaStarHalfAlt color="#FFD700" />}
        {[...Array(emptyStars)].map((_, i) => <FaRegStar key={`empty-${i}`} color="#FFD700" />)}
      </>
    );
  };

  // Format price
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-GH', {
      style: 'currency',
      currency: 'GHS',
      minimumFractionDigits: 2
    }).format(value);
  };

  // Modal functions
  const openModal = (item) => {
    setModalContent(item);
    setActiveImage(item.mainPicture || item.image_url);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setModalContent(null);
  };

  // Handle product interactions
  const handleInteractions = async (userData) => {
    try {
      const userProductTracker = {
        "productId": userData.productId,
        "title": userData.title,
        "price": userData.price,
        "description": userData.discountPercent > 1 ? "discount" : userData.description,
        "browserId": typeof window !== 'undefined' ? localStorage.getItem("BrowserId") : null,
      };
      
      const response = await fetch("http://localhost:8000/api/click/", { // Adjust API URL
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userProductTracker),
      });
    } catch (error) {
      console.log('Interaction tracking error:', error);
    }
  };

  return (
    <div className="visual-search-container">


      {/* Main Content */}
      <main className="container">
        <h2>Visual Search</h2>
        
        {/* Upload Card */}
        <div className="card">
          <div className="card-title">
            <FaSearch />
            Upload Query Image
          </div>
          
          <div 
            className="upload-area" 
            id="drop-zone"
            ref={dropZoneRef}
            onClick={() => fileInputRef.current?.click()}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <FaCloudBolt />
            <h3>Drag & Drop your image here</h3>
            <p>or click to browse files</p>
            <input 
              type="file" 
              ref={fileInputRef}
              style={{ display: 'none' }} 
              accept="image/*"
              onChange={handleFileSelect}
            />
          </div>
          
          {imagePreview && (
            <img src={imagePreview} alt="Preview" className="image-preview" />
          )}
          
          <button 
            className="btn search-btn" 
            onClick={handleSearch}
            disabled={!selectedFile || loading}
          >
            {loading ? (
              <>
                <div className="spinner"></div>
                Searching...
              </>
            ) : (
              <>
                <  FaSearch/>
                Search Similar Images
              </>
            )}
          </button>
        </div>
        
        {/* Similar Images Results */}
{/* Similar Images Results */}
{searchResults.length > 0 && (() => {
  const filteredResults = searchResults.filter(result => (result.similarity * 100) >= 20);

  return (
    <div className="card">
      <div className="card-title">
        <IoListCircleSharp />
        Similar Images ({filteredResults.length} found)
      </div>

      {filteredResults.length > 0 ? (
        <div className="results-grid">
          {filteredResults.map((result, index) => {
            const metadata = typeof result.metadata === 'string' 
              ? JSON.parse(result.metadata) 
              : result.metadata;

            const similarityPercent = (result.similarity * 100).toFixed(1);

            return (
              <div key={`similar-${index}`} className="result-card">
                <div className="result-image-container">
                  <img 
                    src={result.image_url ? `${apiMedia}${result.metadata.mainPicture}` : '/placeholder-image.jpg'}
                    alt={metadata?.title || `Result ${index + 1}`}
                    className="result-img"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                  <div className="result-img-placeholder">
                    <FaImage />
                  </div>

                  <div className="result-overlay">
                    <CgMaximizeAlt 
                      className="overlay-icon"
                      onClick={() => openModal({ ...metadata, image_url: result.image_url })}
                    />
                    {wishlist.find(item => item.productId === metadata?.productId) ? (
                      <FaHeart 
                        className="overlay-icon" 
                        style={{ color: "red" }} 
                        onClick={() => deleteFromWishlist(metadata?.productId)}
                      />
                    ) : (
                      <FaHeart 
                        className="overlay-icon"
                        onClick={() => metadata && addToWishList(metadata, 1)}
                      />
                    )}
                    <PiRepeatOnceBold className="overlay-icon" />
                  </div>

                  <div className="similarity-badge">{similarityPercent}% match</div>
                </div>

                <div className="result-content">
                  <div className="result-title">
                    {metadata?.title || 'Unknown Product'}
                  </div>

                  {metadata && (
                    <>
                      <div className="result-rating">
                        {renderStars(metadata.starRating || 0)}
                      </div>

                      <div className="result-price">
                        {metadata.discountPercent > 0 ? (
                          <>
                            <span className="original-price">
                              {formatCurrency(metadata.price)}
                            </span>
                            <span className="discounted-price">
                              {formatCurrency(((100 - metadata.discountPercent) / 100) * metadata.price)}
                            </span>
                          </>
                        ) : (
                          <span className="current-price">
                            {formatCurrency(metadata.price)}
                          </span>
                        )}
                      </div>

                      {cart.find(item => item.productId === metadata.productId) ? (
                        <div className="quantity-control result-quantity">
                          <button 
                            className="quantity-btn-left" 
                            onClick={() => updateCartQuantity(metadata, -1)}
                          >-</button>
                          <input 
                            type="text" 
                            className="quantity-input" 
                            value={cart.find(item => item.productId === metadata.productId)?.quantity || 1} 
                            readOnly
                          />
                          <button 
                            className="quantity-btn-right" 
                            onClick={() => updateCartQuantity(metadata, 1)}
                          >+</button>
                        </div>
                      ) : (
                        <button 
                          className="add-to-cart-btn result-cart-btn"
                          onClick={() => {
                            handleInteractions(metadata);
                            addToCart(metadata, 1);
                          }}
                        >
                          <FiShoppingCart />
                          Add to Cart
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="no-results">
          No similar products found with at least 50% similarity.
        </div>
      )}
    </div>
  );
})()}


        {/* Recommended Products Section */}
        {recommendedProducts.length > 0 && (
          <div className="card">
            <div className="card-title">
              <IoListCircleSharp />
              Recommended Products ({recommendedProducts.length} found)
            </div>
            
            <div className="results-grid">
              {recommendedProducts.map((product, index) => {
                const currentImage = product.mainPicture;

                return (
                  <div key={`recommended-${index}`} className="result-card">
                    <div className="result-image-container">
                      <img 
                        src={apiMedia + currentImage}
                        alt={product.title}
                        className="result-img"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                        onClick={() => {
                          handleInteractions(product);
                          router.push(`/productDetails?productId=${product.productId}`);
                        }}
                      />
                      <div className="result-img-placeholder">
                        <FaImage />
                      </div>
                      
                      <div className="result-overlay">
                        <CgMaximizeAlt 
                          className="overlay-icon"
                          onClick={() => openModal(product)}
                        />
                        {wishlist.find(item => item.productId === product.productId) ? (
                          <FaHeart 
                            className="overlay-icon" 
                            style={{ color: "red" }} 
                            onClick={() => deleteFromWishlist(product.productId)}
                          />
                        ) : (
                          <FaHeart 
                            className="overlay-icon"
                            onClick={() => {
                              handleInteractions(product);
                              addToWishList(product, 1);
                            }}
                          />
                        )}
                        <PiRepeatOnceBold className="overlay-icon" />
                      </div>
                      
                      {product.discountPercent > 0 && (
                        <div className="discount-badge">-{product.discountPercent}%</div>
                      )}
                    </div>
                    
                    <div className="result-content">
                      <div className="result-title">
                        {product.title}
                      </div>
                      
                      <div className="result-rating">
                        {renderStars(product.starRating || 0)}
                      </div>
                      
                      <div className="result-price">
                        {product.discountPercent > 0 ? (
                          <>
                            <span className="original-price">
                              {formatCurrency(product.price)}
                            </span>
                            <span className="discounted-price">
                              {formatCurrency(((100 - product.discountPercent) / 100) * product.price)}
                            </span>
                          </>
                        ) : (
                          <span className="current-price">
                            {formatCurrency(product.price)}
                          </span>
                        )}
                      </div>
                      
                      {cart.find(item => item.productId === product.productId) ? (
                        <div className="quantity-control result-quantity">
                          <button 
                            className="quantity-btn-left" 
                            onClick={() => updateCartQuantity(product, -1)}
                          >-</button>
                          <input 
                            type="text" 
                            className="quantity-input" 
                            value={cart.find(item => item.productId === product.productId)?.quantity || 1} 
                            readOnly
                          />
                          <button 
                            className="quantity-btn-right" 
                            onClick={() => updateCartQuantity(product, 1)}
                          >+</button>
                        </div>
                      ) : (
                        <button 
                          className="add-to-cart-btn result-cart-btn"
                          onClick={() => {
                            handleInteractions(product);
                            addToCart(product, 1);
                          }}
                        >
                          <FiShoppingCart />
                          Add to Cart
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* No Results Message */}
        {!loading && searchResults.length === 0 && recommendedProducts.length === 0 && (
          <div className="card">
            <div className="no-results">
              Upload an image and click search to find similar products and recommendations.
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer>
        <div className="container">
          <p>&copy; 2024 ImageMatch Visual Search System | Powered by TensorFlow.js & MySQL</p>
        </div>
      </footer>

      {/* Notification */}
      {notification.show && (
        <div className={`notification ${notification.error ? 'error' : ''}`}>
          {notification.message}
        </div>
      )}

      {/* Product Modal */}
      {modalOpen && modalContent && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="close-modal-btn" onClick={closeModal}>×</div>
            
            <div className="modal-left">
              <div className="sub-image">
                {(modalContent.subPictures || []).map((subImage, subIndex) => (
                  <img
                    key={subIndex}
                    src={apiMedia + subImage}
                    alt={`Sub ${subIndex}`}
                    className="sub-image-item"
                    onMouseEnter={() => setActiveImage(subImage)}
                  />
                ))}
              </div>

              <div className="modal-image-container">
                <img
                  src={apiMedia + activeImage}
                  alt="Main"
                  className="modal-image"
                />
              </div>
            </div>

            <div className="modal-right">
              <div className="modal-right-title">{modalContent.title}</div>
              
              <div className="modal-right-row">
                <span style={{color: "#9ca3af"}}>Category: </span>
                <span style={{textTransform: "capitalize"}}>{modalContent.category}</span>
                <span className="modal-product-rating">
                  {renderStars(modalContent.starRating || 0)}
                </span>
                <span>Review (3)</span>
              </div>

              <div className="modal-right-row">
                <div className="modal-right-row2">
                  {modalContent.discountPercent > 0 ? (
                    <>
                      <div className="original-price-modal">
                        {formatCurrency(modalContent.price)}
                      </div>
                      <div className="discounted-price-modal">
                        {formatCurrency(((100 - modalContent.discountPercent) / 100) * modalContent.price)}
                      </div>
                    </>
                  ) : (
                    <div className="current-price-modal">
                      {formatCurrency(modalContent.price)}
                    </div>
                  )}
                </div>

                <div className="modal-right-row2">
                  <span className="stock-label">Available In Stock: </span>
                  <span className="stock-quantity">
                    {modalContent.quantity} {modalContent.quantity > 1 ? "items" : "item"}
                  </span>
                </div>
              </div>

              <div className="modal-description">
                {modalContent.description}
              </div>

              {Array.isArray(modalContent.size) && modalContent.size.some(size => size) && (
                <div className="size-selection">
                  <span>SIZE: </span>
                  <div className="size-options">
                    {modalContent.size.map((size, idx) => (
                      size && (
                        <div
                          key={idx}
                          className="size-option"
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

              <div className="modal-actions">
                {cart.find(item => item.productId === modalContent.productId) ? (
                  <div className="quantity-control modal-quantity">
                    <button 
                      className="quantity-btn-left" 
                      onClick={() => updateCartQuantity(modalContent, -1)}
                    >-</button>
                    <input 
                      type="text" 
                      className="quantity-input" 
                      value={cart.find(item => item.productId === modalContent.productId)?.quantity || 1} 
                      readOnly
                    />
                    <button 
                      className="quantity-btn-right" 
                      onClick={() => updateCartQuantity(modalContent, 1)}
                    >+</button>
                  </div>
                ) : (
                  <button 
                    className="modal-add-to-cart-btn"
                    onClick={() => addToCart(modalContent, 1)}
                  >
                    <FiShoppingCart />
                    Add to Cart
                  </button>
                )}
              </div>

              <div className="modal-secondary-actions">
                <div className="action-item">
                  {wishlist.find(item => item.productId === modalContent.productId) ? (
                    <FaHeart 
                      style={{ color: "red" }} 
                      onClick={() => deleteFromWishlist(modalContent.productId)}
                    />
                  ) : (
                    <FaHeart onClick={() => addToWishList(modalContent, 1)} />
                  )}
                  <span>Add to Wishlist</span>
                </div>
                
                <div className="action-item">
                  <PiRepeatOnceBold />
                  <span>Add to Compare</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VisualSearch;