"use client"
import React, { useEffect, useState } from 'react'
import "./profile.css"
import Navbar from '@/Pages/Navbar/Navbar'
import LastFooter from '@/Pages/Footer/LastFooter'
import Footer from '@/Pages/Footer/Footer'
import { Accounts, apiMedia, Countries } from '@/Constants/data'
import { useRouter } from 'next/navigation'
import { FaStar, FaStarHalfAlt, FaRegStar, FaHeart } from 'react-icons/fa'
import { useCartStore } from '@/Components/CartStore'
import { MdDelete } from 'react-icons/md'
import { AES, enc } from 'crypto-js';

const Page = () => {

    const router = useRouter();
        const navigate = (path) => {
          router.push(path);
        };


const current = "/favourite"
const { loadCart,saveCart,addToCartWithSize,addToCart,deleteFromCart,updateCartQuantity,clearCart, wishlist, addToWishList, deleteFromWishlist, loadWishlist } = useCartStore();
          
            useEffect(() => {
              loadCart();
              loadWishlist()
            }, [loadCart,loadWishlist]);

            const formatCurrency = (value) => {
              return new Intl.NumberFormat('en-GH', {
                style: 'currency',
                currency: 'GHS',
                minimumFractionDigits: 2
              }).format(value);
            };


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
      console.log("Error decrypting user data:");
    }
  }, []);



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


  return (
    <div>
<Navbar/>
<div className='profile'>

<div className='profile-left'>

<div className='profile-left-1'>
<div style={{width:"120px", height:"120px", borderRadius:"50%", backgroundColor:"#EC407A", color:"white", textAlign:"center", display:"flex", alignItems:"center", justifyContent:"center", flexDirection:"column", fontSize:"50px", fontWeight:"bold"}}> {userInfo?.FullName?.charAt(0)?.toUpperCase() || ""}</div>
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
   <div style={{fontSize:"1.2rem", fontFamily:"Hydot-SemiBold", paddingBottom:"1rem"}}>My Favourite ({wishlist.length})</div><hr/>

 <div style={{display:"flex", flexDirection:"column", gap:"0.5rem", marginTop:"1rem"}}>
          {wishlist.map((item, index) => (
            <div key={index} style={{display:"flex", alignItems:"center", justifyContent:"space-between"}} onClick={() => {
              navigate(`/productDetails?productId=${item.productId}`)
             
            }}>
            <div style={{display:"flex", flexDirection:"row", gap:"1rem", alignItems:"center"}}>
            <img src={ apiMedia+item.mainPicture} alt="Product" style={{width:"150px", height:"150px"}} />

            <div style={{display:"flex", flexDirection:"column", gap:"0.5rem"}}>
                <div style={{fontSize:"0.8rem"}}>{item.category}</div>
                <div style={{fontSize:"1rem", fontFamily:"Hydot-SemiBold"}}>{item.title}</div>
                <div>{renderStars(item.starRating)}</div>
                <div className="fav-prices">
                 
                 {
                  item.discountPercent<1?<>
                  <div style={{color:"#008001", fontFamily:"Hydot-Bold"}}>{formatCurrency(item.price)}</div>
                  </>:<>
                  
                  <div style={{textDecoration:"line-through"}}>{formatCurrency(item.price)}</div>
                  <div style={{color:"#008001", fontFamily:"Hydot-Bold"}}>{formatCurrency(((100-item.discountPercent)/100)*item.price)}</div>
                  <div style={{color:"#FF5252"}}>{item.discountPercent} % OFF</div>
               
                  </>
                 }
                                  
                
                </div>
                </div>
                
            </div>
             
              <MdDelete 
                style={{ fontSize:"1.5rem", color:"#f06040", cursor:"pointer" }}
                onClick={() => deleteFromWishlist(item.productId)}
              />
            </div>
          ))}
</div>

   

</div>


</div>

<LastFooter/>
<Footer/>

    </div>
    
  )
}

export default Page