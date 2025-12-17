"use client"
import React, { useEffect, useState } from 'react'
import "./profile.css"
import Navbar from '@/Pages/Navbar/Navbar'
import LastFooter from '@/Pages/Footer/LastFooter'
import Footer from '@/Pages/Footer/Footer'
import { Accounts, apiMedia, apiServer, Countries, ShortName } from '@/Constants/data'
import { useRouter } from 'next/navigation'
import { FaStar, FaStarHalfAlt, FaRegStar, FaHeart } from 'react-icons/fa'
import { useCartStore } from '@/Components/CartStore'
import { MdDelete } from 'react-icons/md'
import { AES, enc } from 'crypto-js';
import { Show } from '@/Constants/Alerts'

const Page = () => {

    const router = useRouter();
        const navigate = (path) => {
          router.push(path);
        };


const current = "/myOrders"

const [userInfo, setUserInfo] = useState({});

    useEffect(() => {
    try {
      const encryptedData = sessionStorage.getItem("userDataEnc");
      const encryptionKey = '$2a$11$3lkLrAOuSzClGFmbuEAYJeueRET0ujZB2TkY9R/E/7J1Rr2u522CK';
      const decryptedData = AES.decrypt(encryptedData, encryptionKey);
      const decryptedString = decryptedData.toString(enc.Utf8);
      const parsedData = JSON.parse(decryptedString);
      setUserInfo(parsedData);
    } catch (error) {
     Show.Attention("You are not logged in, please login to continue");
     navigate("/authenticate")    
    }
  }, []);

 
const formatCurrency = (value) => {
  return new Intl.NumberFormat('en-GH', {
    style: 'currency',
    currency: 'GHS',
    minimumFractionDigits: 2
  }).format(value);
};

const formatDateTime = (isoString) => {
  const date = new Date(isoString);

  // Get date parts
  const day = date.getUTCDate();
  const month = date.toLocaleString("en-US", { month: "long", timeZone: "UTC" });
  const year = date.getUTCFullYear();

  // Get time parts
  let hours = date.getUTCHours();
  const minutes = date.getUTCMinutes().toString().padStart(2, '0');
  const ampm = hours >= 12 ? 'pm' : 'am';

  hours = hours % 12 || 12; // convert 0 to 12, 13 to 1, etc.

  // Get ordinal suffix
  const suffix = (n) => {
    if (n > 3 && n < 21) return 'th';
    switch (n % 10) {
      case 1: return 'st';
      case 2: return 'nd';
      case 3: return 'rd';
      default: return 'th';
    }
  };

  return `${day}${suffix(day)} ${month}, ${year} at ${hours}:${minutes} ${ampm}`;
}




const [orderList, setorderList] = useState([])

useEffect(() => {
 const formData = new FormData();
    formData.append("UserId", userInfo.UserId);
   if (userInfo.UserId) {
      fetch(apiServer + "ViewYourOrders", {
      method: "POST",
       headers: {"ShortName":ShortName},
      body: formData,
    })
    .then(res => res.json())
    .then(data => {
      
      setorderList(data);
    })
    .catch(err => console.log(err));
    }
   
}, [userInfo.UserId]);


const [showModal, setShowModal] = useState(false);
const [selectedOrder, setSelectedOrder] = useState(null);

const [ratings, setRatings] = useState({}); // {productId: rating}

const handleRating = async (productId, orderId, value) => {
  setRatings(prev => ({ ...prev, [productId]: value }));

  const formData = new FormData();
  formData.append("OrderId", orderId);
  formData.append("productId", productId);
  formData.append("rate", value);
  Show.showLoading()

  try {
    const response = await fetch(apiServer + "RatingMaster", {
      method: "POST",
      headers: {"ShortName":ShortName},
      body: formData
    });

    const data = await response.json();
    if(response.ok){
    Show.hideLoading()
    Show.Success(data.message);
    }else{
      Show.Attention(data.message)
    }
    
  } catch (err) {
    Show.Attention("Failed to rate product. Try again.");
    console.log(err);
  }
};

const renderStars = (productId, orderId) => {
  const selectedRating = ratings[productId] || 0;

  const stars = Array.from({ length: 5 }, (_, index) => {
    const value = index + 1;
    const isHalf = selectedRating >= value - 0.5 && selectedRating < value;
    const isFull = selectedRating >= value;

    return (
      <span
        key={index}
        onClick={() => handleRating(productId, orderId, isHalf ? value - 0.5 : value)}
        style={{ color: "#f7c948", cursor: "pointer", fontSize: "1.2rem" }}
      >
        {isFull ? <FaStar /> : isHalf ? <FaStarHalfAlt /> : <FaRegStar />}
      </span>
    );
  });

  return <div style={{ display: "flex", alignItems: "center", gap: "0.2rem" }}>{stars}</div>;
};

  


  return (
    <div>
<Navbar/>
<div className='profile'>

<div className='profile-left'>

<div className='profile-left-1'>
<div style={{width:"120px", height:"120px", borderRadius:"50%", backgroundColor:"#EC407A", color:"white", textAlign:"center", display:"flex", alignItems:"center", justifyContent:"center", flexDirection:"column", fontSize:"50px", fontWeight:"bold"}}>  {userInfo?.FullName?.charAt(0)?.toUpperCase() || ""}</div>
<div style={{display:"flex", flexDirection:"column", justifyContent:"center", alignItems:"center"}}>
    <div style={{fontSize:"1.3rem", fontWeight:"bold"}}>{userInfo.FullName}</div>
    <div>{userInfo.Email}</div>
</div>

</div>

<div className='profile-left-2'>

{
  Accounts.map((data, index) => (
    <div key={index} onClick={() => navigate(data.url)}>
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          gap: "0.5rem",
          padding: "1rem",
          borderLeft: data.url === current ? "4px solid #FF5252" : "4px solid transparent",
          cursor: "pointer"
        }}
      >
        <span style={{ fontSize: "1.2rem", color: data.url === current ? "#FF5252" : "" }}>{data.icon}</span>
        <span style={{ fontSize: "1rem" }}>{data.text}</span>
      </div>
    </div>
  ))
}



</div>



</div>

<div className='profile-right'>
   <div style={{fontSize:"1.2rem", fontFamily:"Hydot-SemiBold", paddingBottom:"1rem"}}>My Orders ({orderList.length})</div><hr/>

   <div className="order-table-wrapper">
  <div className="table-responsive">
    <table className="order-table">
      <thead>
        <tr>
        <th>Status</th>
         <th>Pincode</th>
        <th>View Details</th>
          <th>Order ID</th>
          
          <th>Address</th>
         
          <th>Total</th>
          
          <th>OrderDate</th>
           <th>LatestUpdateDate</th>
        </tr>
      </thead>
      <tbody>
        {orderList.length>0&& orderList.map((order, index) => (
          <tr key={index}>
             <td>
              <span className={`status-badge ${order.Status.toLowerCase()}`}>
                {order.Status}
              </span>
            </td>
             <td>{order.PinCode}</td>
            <td>
  <button 
    className="view-btn1" 
    onClick={() => {
      setSelectedOrder(order);
      setShowModal(true);
    }}
  >
    View
  </button>
</td>

            <td>{order.OrderID}</td>
          
           
            <td>{order.DetailedAddress}</td>
           
            <td>{formatCurrency(order.Total)}</td>
           
          
            <td>{formatDateTime(order.created_at)}</td>
            <td>{formatDateTime(order.updated_at)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
</div>

   

</div>

{showModal && selectedOrder && (
  <div className="order-modal-overlay" onClick={() => setShowModal(false)}>
    <div className="order-modal-container" onClick={e => e.stopPropagation()}>
      
      {/* Header with gradient and elegant close button */}
      <div className="modal-header">
        <div className="header-content">
          <div className="order-badge">ORDER #{selectedOrder.OrderID}</div>
          <h2>Order Details</h2>
        </div>
        <button 
          className="elegant-close-btn" 
          onClick={() => setShowModal(false)}
          aria-label="Close modal"
        >
          <span className="close-icon">✕</span>
        </button>
      </div>

      {/* Main content area */}
      <div className="modal-body">
        
        {/* Order Summary Cards */}
        <div className="info-grid">
          <div className="info-card payment-method">
            <div className="card-icon">💳</div>
            <div>
              <label>Payment Method</label>
              <p>{selectedOrder.PaymentMethod}</p>
            </div>
          </div>
          
          <div className="info-card payment-status">
            <div className="card-icon">📊</div>
            <div>
              <label>Payment Status</label>
              <p className={`status-badge ${selectedOrder.PaymentStatus.toLowerCase()}`}>
                {selectedOrder.PaymentStatus}
              </p>
            </div>
          </div>
          
          <div className="info-card delivery-address">
            <div className="card-icon">📍</div>
            <div>
              <label>Delivery Address</label>
              <p>{selectedOrder.DetailedAddress}, {selectedOrder.City}, {selectedOrder.Region}</p>
            </div>
          </div>
        </div>

        {/* Products Section */}
        <div className="products-section">
          <h3 className="section-title">
            <span className="title-icon">📦</span>
            Ordered Items ({JSON.parse(selectedOrder.OrderList).length})
          </h3>
          
          <div className="products-grid">
            {JSON.parse(selectedOrder.OrderList).map((item, idx) => (
              <div key={idx} className="product-card">
                <div className="product-image-container">
                  <img 
                    src={`${apiMedia}${item.mainPicture}`} 
                    alt={item.title}
                    className="product-image"
                    onError={(e) => {
                      e.target.src = '/api/placeholder/120/120';
                    }}
                  />
                </div>
                
                <div className="product-details">
                  <h4 className="product-title">{item.title}</h4>
                  <p className="product-description">{item.description}</p>
                  
                  <div className="product-meta">
                    <div className="meta-item">
                      <span className="meta-label">Price:</span>
                      <span className="price-tag">GHS {item.price}</span>
                    </div>
                    <div className="meta-item">
                      <span className="meta-label">Quantity:</span>
                      <span className="quantity-badge">{item.quantity}</span>
                    </div>
                  </div>
                  
                  <div className="category-tags">
                    <span className="category-tag">{item.category}</span>
                    <span className="category-tag">{item.subCate}</span>
                    <span className="category-tag">{item.generalCategory}</span>
                  </div>
                  
                  {item.size && Array.isArray(item.size) && item.size.length > 0 && (
                    <div className="sizes-section">
                      <span className="meta-label">Sizes:</span>
                      <div className="size-chips">
                        {item.size.map((size, sizeIdx) => (
                          <span key={sizeIdx} className="size-chip">{size}</span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Rating Section */}
                  {selectedOrder.Status === "Delivered" && (
                    <div className="rating-section">
                      <div className="rating-header">
                        <span className="rating-icon">⭐</span>
                        <strong>Rate this product</strong>
                      </div>
                      {renderStars(item.productId, selectedOrder.OrderID)}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  </div>
)}





</div>

<LastFooter/>
<Footer/>

    </div>
    
  )
}

export default Page