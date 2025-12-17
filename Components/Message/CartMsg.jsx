
import { MdDelete } from "react-icons/md";
import { useCartStore } from "../CartStore";
import { useRouter } from "next/navigation";
import { apiMedia } from "@/Constants/data";
import { AES, enc } from 'crypto-js';
import { useEffect, useState } from "react";
import { Show } from "@/Constants/Alerts";

const CartMsg = ({ mobileOpen, toggler = () => {} }) => {
  const { cart, deleteFromCart,processTheOrder } = useCartStore();

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
      router.push(path);
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
    }
  }, []);




    const LoginNotRequired = () => {
      processTheOrder();
      navigate("/checkout")
    }

     const LoginRequired = () => {
      processTheOrder();
      navigate("/checkoutauth")
    }

    const Checkout = () => {
  if (!userInfo?.Email) {
    Show.Confirm(
      "Would you like to Log in for a faster order tracking",
      LoginRequired,    // ✅ Pass function, do not call it
      LoginNotRequired  // ✅ Pass function, do not call it
    );
  } else {
    // User is already logged in
    processTheOrder();
    navigate("/checkout");
  }
  
};










  return (
    <div >
      {mobileOpen && <div className="overlay" onClick={toggler}></div>}
      <div className={`message-container ${mobileOpen ? "active" : ""} right`}>
        <div style={{display:"flex", justifyContent:"space-between", alignItems:"center"}}>
          <div style={{fontSize:"1rem"}}>Shopping Cart ({cart.length})</div>
          <div style={{fontSize:"2rem", cursor: "pointer", color:"red"}} onClick={toggler}>&times;</div>
        </div>

        <div style={{display:"flex", flexDirection:"column", gap:"0.5rem", marginTop:"1rem"}}>
          {cart.map((item, index) => (
            <div key={index} style={{display:"flex", justifyContent:"space-between", alignItems:"center"}}>
              <img src={apiMedia+item.mainPicture} alt="Product" style={{width:"100px", height:"100px"}} />
              <div style={{display:"flex", flexDirection:"column", gap:"0.5rem"}}>
                <div style={{fontSize:"0.8rem"}}>{item.title}</div>
                <div>Size: {item.size}</div>
                <div style={{display:"flex", gap:"0.5rem"}}>
                  <div>Qty: {item.quantity}</div>
                 
                 {
                  item.discountPercent<1?<>
                   <div style={{color:"#ff5252"}}>{formatCurrency(item.price)}</div>
                  </>:<>
                  <div style={{textDecoration:"line-through"}}>{formatCurrency(item.price)}</div>
                  <div style={{color:"#ff5252"}}>{formatCurrency(((100-item.discountPercent)/100)*item.price)}</div>
                
                  </>
                 }
                  
                
                </div>
                <div>Amt: <span style={{color:"green", fontFamily:"Hydot-Bold"}}>{formatCurrency(item.quantity*((100-item.discountPercent)/100)*item.price)}</span></div>
              </div>
              <MdDelete 
                style={{ fontSize:"1.5rem", color:"#f06040", cursor:"pointer" }}
                onClick={() => deleteFromCart(item.productId)}
              />
            </div>
          ))}
        </div>


 {/* Subtotal, Discount and Total */}
 <div style={{marginTop:"1.5rem", borderTop:"1px solid #ccc", paddingTop:"1rem", display:"flex", flexDirection:"column", gap:"0.5rem", fontSize:"0.9rem"}}>
          <div style={{display:"flex", justifyContent:"space-between"}}>
            <span>Subtotal:</span>
            <span style={{fontFamily:"Hydot-Bold"}}>{formatCurrency(subtotal)}</span>
          </div>
          <div style={{display:"flex", justifyContent:"space-between", color:"red"}}>
            <span>Discount:</span>
            <span style={{fontFamily:"Hydot-Bold"}}>- {formatCurrency(discount)}</span>
          </div>
          <div style={{display:"flex", justifyContent:"space-between", fontWeight:"bold", fontSize:"1rem"}}>
            <span>Total:</span>
            <span style={{fontFamily:"Hydot-Bold"}}>{formatCurrency(total)} + Delivery Fee</span>
          </div>
 </div>

 <div style={{marginTop:"1rem", display:"flex", justifyContent:"space-between", alignItems:"center", flexDirection:"row", padding:"0.5rem 1rem"}}>


<div className="add-to-cart-btn1" style={{width:"150px"}} onClick={()=>{Checkout()}}>
     
      Checkout
</div>

 </div>




      </div>
    </div>
  );
};

export default CartMsg;
