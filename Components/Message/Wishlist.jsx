"use client"
import { MdDelete } from "react-icons/md";
import { useCartStore } from "../CartStore";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

const Wishlist = ({ mobileOpen, toggler = () => {} }) => {
  const { cart, loadCart,saveCart,addToCartWithSize,addToCart,deleteFromCart,updateCartQuantity,clearCart, wishlist, addToWishList, deleteFromWishlist, loadWishlist } = useCartStore();
          
            useEffect(() => {
              loadCart();
              loadWishlist()
            }, []);


  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-GH', {
      style: 'currency',
      currency: 'GHS',
      minimumFractionDigits: 2
    }).format(value);
  };

  const subtotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const discount = cart.reduce((acc, item) => acc + (item.price * item.discountPercent / 100) * item.quantity, 0);
  const total = subtotal - discount;

 const router = useRouter();
 const navigate = (path) => {
  toggler(); // close modal
  router.push(path);
};            


  return (
    <div >
      {mobileOpen && <div className="overlay" onClick={toggler}></div>}
      <div className={`message-container ${mobileOpen ? "active" : ""} wishlist`}>
        <div style={{display:"flex", justifyContent:"space-between", alignItems:"center"}}>
          <div style={{fontSize:"1rem"}}>Wishlist ({wishlist.length})</div>
          <div style={{fontSize:"2rem", cursor: "pointer", color:"red"}} onClick={toggler}>&times;</div>
        </div>

        <div style={{display:"flex", flexDirection:"column", gap:"0.5rem", marginTop:"1rem"}}>
          {wishlist.map((item, index) => (
            <div key={index} style={{display:"flex", justifyContent:"space-between", alignItems:"center"}} onClick={() => {
              navigate(`/productDetails?productId=${item.productId}`)
             
            }}>
              <img src={item.mainPicture} alt="Product" style={{width:"100px", height:"100px"}} />
             <div>


                
             </div>
              <div style={{display:"flex", flexDirection:"column", gap:"0.5rem"}}>
                <div style={{fontSize:"0.8rem"}}>{item.title}</div>
                <div>Size: {item.size}</div>
                <div style={{display:"flex", gap:"0.5rem"}}>
                 
                 
                  <div style={{textDecoration:"line-through"}}>{formatCurrency(item.price)}</div>
                  <div style={{color:"#ff5252"}}>{formatCurrency(((100-item.discountPercent)/100)*item.price)}</div>
                </div>
                <div>Amt: <span style={{color:"green", fontFamily:"Hydot-Bold"}}>{formatCurrency(item.quantity*((100-item.discountPercent)/100)*item.price)}</span></div>
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
  );
};

export default Wishlist;
