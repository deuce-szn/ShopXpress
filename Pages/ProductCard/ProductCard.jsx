"use client"
import React, { useEffect, useRef, useState } from 'react'
import { FiChevronLeft, FiChevronRight, FiHeart, FiMaximize2, FiRepeat, FiShoppingCart } from 'react-icons/fi'
import "./ProductCard.css"
import { FaStar, FaStarHalfAlt, FaRegStar, FaHeart } from 'react-icons/fa'
import { CgMaximizeAlt } from "react-icons/cg";
import { PiRepeatOnceBold } from "react-icons/pi";
import { useRouter } from 'next/navigation'
import CryptoJS from 'crypto-js';
import { apiAInML, apiMedia, DummyProducts, ShortName } from '@/Constants/data'
import { Show } from '@/Constants/Alerts'
import { useCartStore } from '@/Components/CartStore'

const ProductCard = ({ product }) => {
  const scrollRef = useRef(null);
  const router = useRouter();
 
  const [quantities, setQuantities] = useState({});
  const [modalOpen, setModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState(null);
  const [activeImage, setActiveImage] = useState(null);
  const [imageSrc, setImageSrc] = useState({});
  const [selectedSize, setSelectedSize] = useState(null);
  
  const magnifierRef = useRef(null);
  const mainImageRef = useRef(null);

  const navigate = (path) => router.push(path);

  // Scroll functions
  const scroll = (direction) => {
    const { current } = scrollRef;
    if (direction === 'left') {
      current.scrollBy({ left: -300, behavior: 'smooth' });
    } else {
      current.scrollBy({ left: 300, behavior: 'smooth' });
    }
  };

  // Star rendering
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

  // Modal functions
  const openModal = (item) => {
    setModalContent(item);
    setActiveImage(item.mainPicture);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setModalContent(null);
  };

  // Magnifier functions
  const handleMouseMove = (e) => {
    const magnifier = magnifierRef.current;
    const image = mainImageRef.current;
  
    const rect = image.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
  
    // Size of the magnifier
    const magnifierSize = 150;
    const zoom = 2;
  
    // Position magnifier div
    magnifier.style.left = `${x - magnifierSize / 2}px`;
    magnifier.style.top = `${y - magnifierSize / 2}px`;
  
    // Set background image to image src
    magnifier.style.backgroundImage = `url(${image.src})`;
    magnifier.style.backgroundRepeat = 'no-repeat';
    magnifier.style.backgroundSize = `${image.width * zoom}px ${image.height * zoom}px`;
  
    // Set background position based on mouse
    const bgX = (x / rect.width) * 100;
    const bgY = (y / rect.height) * 100;
    magnifier.style.backgroundPosition = `${bgX}% ${bgY}%`;
  
    magnifier.style.display = 'block';
  };
  

  const handleMouseLeaveMagnifier = () => {
    magnifierRef.current.style.display = 'none';
  };

  // Format price
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-GH', {
      style: 'currency',
      currency: 'GHS',
      minimumFractionDigits: 2
    }).format(value);
  };

  // Image hover
  const handleMouseEnter = (index, secondPicture) => {
    setImageSrc(prev => ({ ...prev, [index]: secondPicture }));
  };

  const handleMouseLeave = (index, mainPicture) => {
    setImageSrc(prev => ({ ...prev, [index]: mainPicture }));
  };

  // Cart Logic
  
  const { cart, loadCart,saveCart,addToCart,deleteFromCart,updateCartQuantity,clearCart, wishlist, addToWishList, deleteFromWishlist, loadWishlist } = useCartStore();

  useEffect(() => {
    loadCart();
    loadWishlist()
  }, []);

  const handleInteractions= async (userData) => {

   
      try {
    
   
    const userProductTracker = {
      "productId":userData.productId,
      "title": userData.title,
      "price": userData.price,
      "description": userData.discountPercent>1?"discount":userData.description,
      "browserId": localStorage.getItem("BrowserId"),
      'ShortName': ShortName,
    }
    
    
    if(ShortName){

      const response = await fetch(apiAInML+"click/", {
      method: "POST",
      headers: {
         'ShortName': ShortName,
        "Content-Type": "application/json",  
      },
      body: JSON.stringify(userProductTracker),
    });

    }
    
        
      } catch (error) {
    
      
       
      }
    
    }

  return (
    <div className="product-card-wrapper">
      {/* <FiChevronLeft color='black' onClick={() => scroll('left')} style={{ width: "100px", height: "100px" }} /> */}

      <div className='products' ref={scrollRef}>
        {Array.isArray(product) ? product.map((item, index) => {
          // Use the image state based on the index of the product
          const currentImage = imageSrc[index] || item.mainPicture;

          return (
            <div className='product-card' key={index}>
              <div className='image-container'>
                <img
                  src={apiMedia+currentImage}
                  alt={item.title}
                  className='product-image'
                  onMouseEnter={() => handleMouseEnter(index, item.secondPicture)}
                  onMouseLeave={() => handleMouseLeave(index, item.mainPicture)}
                  onClick={() => {
                    handleInteractions(item )
                    navigate(`/productDetails?productId=${item.productId}`)}}
                />
                
                <div className='discount-badge'>-{item.discountPercent}%</div>

                <div className='image-icons'>
                  <CgMaximizeAlt
                    className='p-icon'
                    style={{ width: "30px", height: "30px", cursor: "pointer" }}
                    onClick={() => {
                      handleInteractions(item )
                      openModal(item)}}
                  />
                  {wishlist.find(cartItem => cartItem.productId === item.productId)?
                  <FaHeart className='p-icon' style={{ width: "30px", height: "30px", color:"red" }} onClick={() => deleteFromWishlist(item.productId)}/>:
                  <FiHeart className='p-icon' style={{ width: "30px", height: "30px" }} onClick={() => {
                     handleInteractions(item )
                    addToWishList(item, 1)}}/>
                  
                  }

                  <PiRepeatOnceBold className='p-icon' style={{ width: "30px", height: "30px" }} />
                </div>
              </div>

              <div className='product-info'>
                <h3 className='product-title'>{item.title}</h3>
                <p className='product-description'>{item.description}</p>
                <p className='product-category'>Category: {item.category}</p>
                <div className='product-rating'>{renderStars(item.starRating)}</div>
               

                <div className="product-row">

{
  item.discountPercent<1?<>
  <div style={{color:"#ff5252", fontFamily:"Hydot-SemiBold", fontSize:"16px",}}> {formatCurrency(item.price)} </div>
  </>:<>
  <div style={{color:"#6b7280", fontFamily:"Hydot-SemiBold", fontSize:"16px",textDecoration: "line-through" }}> {formatCurrency(item.price)} </div>
  <div style={{color:"#ff5252", fontFamily:"Hydot-SemiBold", fontSize:"16px",}}> {formatCurrency(((100-item.discountPercent)/100)*item.price)} </div>

  </>
}
               
                </div>


              </div>

              {cart.find(cartItem => cartItem.productId === item.productId) ? (
  <div className="quantity-control">
    <button 
      className="quantity-btn-left" 
      onClick={() => updateCartQuantity(item, -1)}
    >-</button>

    <input 
      type="text" 
      className="quantity-input" 
      value={cart.find(cartItem => cartItem.productId === item.productId)?.quantity || 1} 
      readOnly
    />

    <button 
      className="quantity-btn-right" 
      onClick={() => updateCartQuantity(item, 1)}
    >+</button>  {/* <-- HERE: corrected item, not item.productId */}
  </div>
) : (
  <div className="add-to-cart-btn" onClick={() => addToCart(item, 1)}>
    <FiShoppingCart style={{ marginRight: '8px' }} />
    Add to Cart
  </div>
)}

            </div>
          )
        }):<></>}
      </div>

      {/* <FiChevronRight color='black' onClick={() => scroll('right')} style={{ width: "100px", height: "100px" }} />
     */}
      {modalOpen && modalContent && (
        <div className="modal-overlay" onClick={closeModal}>
          
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="close-modal-btn" onClick={closeModal}>x</div>
              <div className="modal-left">
              <div className="sub-image">
              {(modalContent.subPictures || []).map((subImage, subIndex) => (
                <img
                  key={subIndex}
                  src={apiMedia+subImage}
                  alt={`Sub ${subIndex}`}
                  className="sub-image-item"
                  onMouseEnter={() => setActiveImage(subImage)}
                />
              ))}
              </div>


              <div className="magnifier-container">
                <img
                  src={apiMedia+activeImage}
                  alt="Main"
                  className="modal-image"
                  ref={mainImageRef}
                  onMouseMove={handleMouseMove}
                  onMouseLeave={handleMouseLeaveMagnifier}
                />
                <div className="magnifier-glass" ref={magnifierRef}></div>
              </div>


              </div>


              <div className="modal-right">
                
                <div className="modal-right-title">{modalContent.title}</div>
                
                <div className="modal-right-row">
                  <span style={{color:"#9ca3af"}}>Category : </span>
                  <span style={{textDecoration:"capitalize"}}>{modalContent.category}</span>

                <span className='modal-product-rating'>{renderStars(modalContent.starRating)}</span>

                <span>Review (3)</span>

                </div> 

                <div className="modal-right-row">
                  <div className="modal-right-row2">

{
  modalContent.discountPercent<1?
  <>
  <div style={{color:"#ff5252", fontFamily:"Hydot-SemiBold", fontSize:"20px",}}> {formatCurrency(modalContent.price)} </div>

  </>:<>
  <div style={{color:"#6b7280", fontFamily:"Hydot-SemiBold", fontSize:"20px",textDecoration: "line-through" }}> {formatCurrency(modalContent.price)} </div>
  <div style={{color:"#ff5252", fontFamily:"Hydot-SemiBold", fontSize:"20px",}}> {formatCurrency(((100-modalContent.discountPercent)/100)*modalContent.price)} </div>

  </>
}
                 
                  </div>

                  <div className="modal-right-row2">
                      
                    <span className='modal-product-rating'>Available In Stock: </span>
                    <span style={{color:"#17a34a",fontFamily:"Hydot-SemiBold", fontSize:"16px"}}>{modalContent.quantity} {modalContent.quantity>1?"items":"item"}</span>
                     
                  </div>              
               
                </div> 

                <div style={{fontSize:'16px', lineHeight: '1.6'}}>
                  {modalContent.description}
                </div>

                
                {Array.isArray(modalContent.size) && modalContent.size.some(size => size) && (
  <div style={{display:"flex", flexDirection:"row", alignItems:"center", gap:"10px"}}>
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


                <div>
                Free Shipping (Est. Delivery Time 2-3 Days)
                </div>
             


              <div style={{ display: "flex", flexDirection: "row", gap: "0.5rem", alignItems: "center"}}>
     
{cart.find(cartItem => cartItem.productId === modalContent.productId) ? (
  <div className="quantity-control"  style={{ marginTop: "20px" }}>
    <button 
      className="quantity-btn-left" 
      onClick={() => updateCartQuantity(modalContent, -1)}
    >-</button>

    <input 
      type="text" 
      className="quantity-input" 
      value={cart.find(cartItem => cartItem.productId === modalContent.productId)?.quantity || 1} 
      readOnly
    />

    <button 
      className="quantity-btn-right" 
      onClick={() => updateCartQuantity(modalContent, 1)}
    >+</button>  {/* <-- HERE: corrected item, not item.productId */}
  </div>
) : (
  <div className="modal-add-to-cart-btn" onClick={() => addToCart(modalContent, 1)}>
    <FiShoppingCart style={{ marginRight: '8px' }} />
    Add to Cart
  </div>
)}
              </div>


              <div className="modal-right-row">

                <div className="modal-right-row2">
                {wishlist.find(cartItem => cartItem.productId === modalContent.productId)?
                  <FaHeart className='p-icon' style={{ width: "30px", height: "30px", color:"red" }} onClick={() => deleteFromWishlist(modalContent.productId)}/>:
                  <FiHeart className='p-icon' style={{ width: "30px", height: "30px" }} onClick={() => addToWishList(modalContent, 1)}/>
                  
                  }
                <span>Add to Wishlist</span>
                </div>
             
                <div className="modal-right-row2">
                <PiRepeatOnceBold className='p-icon' style={{ width: "30px", height: "30px" }} />
                <span>Add to Compare</span>
                </div>

            

              </div>
             
                
             
             
              </div>




        </div>
        </div>
      )}

    
    
    </div>
  )
}

export default ProductCard
