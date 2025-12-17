"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AES, enc } from 'crypto-js';
import Utf8 from "crypto-js/enc-utf8";

import "./checkout.css";
import { apiServer, ShortName } from "@/Constants/data";
import { Show } from "@/Constants/Alerts";
import Navbar from "@/Pages/Navbar/Navbar";
import Footer from "@/Pages/Footer/Footer";
import LastFooter from "@/Pages/Footer/LastFooter";
import { FaEyeSlash, FaRegEye } from "react-icons/fa";
import Selector from "@/Constants/Selector";
import { useCartStore } from "@/Components/CartStore";
import NewSelector from "@/Constants/NewSelector";

export default function LoginSignupForm() {
  const [step, setStep] = useState("signup"); // signup | login | verify
  const [showPassword, setShowPassword] = useState(false);
  const [focusField, setFocusField] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});

   const router = useRouter();
    const navigate = (path) => {
      router.push(path);
    };

  const validate = () => {
    const newErrors = {};
 
       if (!formData.TransactionAmount) newErrors.TransactionAmount = "Amount is required";
              
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

 

  const Field = ({ label, name, type = "text" }) => (
    <div className="form-group">
      {focusField === name ? (
        <fieldset className="animated-fieldset">
          <legend>{label}</legend>
          <input
            type={type}
            value={formData[name] || ""}
            onChange={(e) => setFormData({ ...formData, [name]: e.target.value })}
           
            onBlur={() => setFocusField("")}
            autoFocus
          />
        </fieldset>
      ) : (
        <>
          <label>{label}</label>
          <input
            type={type}
            value={formData[name] || ""}
            onChange={(e) => setFormData({ ...formData, [name]: e.target.value })}
            onFocus={() => setFocusField(name)}
           
          />
        </>
      )}
      <p className="error">{errors[name]}</p>
    </div>
  );

    const [userInfo, setUserInfo] = useState({});
     const [pay, setPay] = useState("");
    
    
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
    

   const thePaymentMethod = [
   {"PaymentMethod":"TopUp ShoppingCard" },
   {"PaymentMethod":"Buy New ShoppingCard" },
   

  ]

   const handlePaymentMethodSelect = (method) => {
    setPay(method);
    // if (method === "Mobile Money or Credit Card") {
    //   setMomoC(true);
    //   GetTotalPaymentAmount()
    // }

    // if (method === "Payment On Delivery") {
    //   setPayOnDel(true);
    //   GetTotalPaymentAmount()
    // }

    // if (method === "Credit Sales") {
    //   setCreditS(true);
    //   GetTotalPaymentAmount()
    // }

    // if (method === "Shopping Card") {
    //   setShoppingC(true);
    //   GetTotalPaymentAmount()
    // }

    // if (method === "Test Payment") {
    //   processTheOrder()
    // }

  };

    const Processor = async () => {
      
      if (!Country || !Region || !City || !DetailedAddress) {
        Show.Attention("All fields are required.");
        return;
      }
  
      
  
  
  
  
      Show.showLoading("Processing Data.....");
      try {
        const formData = new FormData();
        formData.append("UserId", userInfo.UserId);
        formData.append("Country", Country);
        formData.append("Region", Region);
        formData.append("City", City);
        formData.append("DigitalAddress", DigitalAddress);
        formData.append("DetailedAddress", DetailedAddress);
        formData.append("OrderId", orderId);
        formData.append("PaymentMethod", pay);
        formData.append("NationalIDType", NationalIDType);
        formData.append("NationalID", NationalID);
        formData.append("UserPic",  UserPic);
        formData.append("IDFront", IDFront);
        formData.append("IDBack", IDBack);
        formData.append("CardNumber", CardNumber);
        formData.append("PaymentMethod", pay);
        formData.append("FullName",userInfo.FullName?userInfo.FullName:FullName);
        formData.append("Email", userInfo.Email?userInfo.Email:Email);
        formData.append("PhoneNumber", userInfo.Phone?userInfo.Phone:PhoneNumber);
        formData.append("OrderList", JSON.stringify(theOrder));
        
  
        const response = await fetch(apiServer + "OrderProcessing", {
          method: "POST",
          headers: {
            UserId: userInfo.UserId,
            SessionId: userInfo.SessionId,
            "ShortName":ShortName
          },
          
          body: formData,
        });
  
        const data = await response.json();
  
        if (response.ok) {
          Show.hideLoading();
  
          if (pay === "Mobile Money or Credit Card") {
            const link = document.createElement("a");
            link.href = data.message; // make sure this is a full valid URL
            link.target = "_blank"; // open in new tab (optional)
            link.rel = "noopener noreferrer"; // optional but recommended for security
            document.body.appendChild(link); // needed for some browsers
            link.click();
            document.body.removeChild(link); // clean up
  
          } else {
            Show.Success(data.message);
          }
  
        
          clearOrder();
          if(!userInfo?.Email){
            navigate("/")
          }else{
            navigate("/myOrders");
          }
          
  
        } else {
         
          Show.Attention(data.message);
        }
      } catch (error) {
     
        Show.Attention("An error has occurred");
      }
    };


const { clearOrder,loadOrder, theOrder } = useCartStore();
  
  useEffect(()=>{
    loadOrder()
  },[])


  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
        Show.showLoading("Processing Data.....");

        const postData = new FormData();
        
        postData.append("CardNumber", formData.CardNumber);
        postData.append("TransactionAmount", formData.TransactionAmount);
        postData.append("BearerName",formData.username);
        postData.append("BearerEmail", formData.email);
        postData.append("BearerPhone", formData.phone);
        

        const res = await fetch(apiServer + "ScheduleShoppingCard", {
          method: "POST",
          headers: {"ShortName":ShortName},
          body: postData,
        });

        const data = await res.json();
       

        if (res.ok) {
           Show.hideLoading();

          const link = document.createElement("a");
            link.href = data.message; // make sure this is a full valid URL
            link.target = "_blank"; // open in new tab (optional)
            link.rel = "noopener noreferrer"; // optional but recommended for security
            document.body.appendChild(link); // needed for some browsers
            link.click();
            document.body.removeChild(link); // clean up

        
        } else {
          Show.Attention(data.message || "Signup failed");
        }
      


    } catch (err) {
      console.log(err);
      Show.Attention("Something went wrong. Try again.");
    }
  };

 const [person, setPerson] = useState([])
  
  useEffect(() => {
          if (userInfo.UserId) {
            const formData = new FormData();
            formData.append("BearerEmail", userInfo.Email);
      
            fetch(apiServer + "ViewSpecificShoppingCards", {
              method: "POST",
              headers: {
                'UserId': userInfo.UserId,         
                'SessionId': userInfo.SessionId,
                "ShortName":ShortName
              },
                
             
              body: formData
            })
              .then(res => res.json())
              .then(data=>setPerson(data))
              .catch(err => console.log(err));
          }
    }, [userInfo.UserId]);





  return (
    <div>
      <Navbar />
      <div className="login-wrapper">
        <form onSubmit={handleSubmit} className="login-form">

          <h2>
           Shopping Card
          </h2>

{
  person.length === 0 ? (
    <div className="no-card-message">
      <p>You have no shopping cards available.</p>
      <p>Please purchase a shopping card.</p>
    </div>
  ) : (
    Array.isArray(person)&&person.map((item, index) => (
      <div style={{ 
  width: '100%', 
  height: '150px', 
  backgroundColor: '#1e1e2f', 
  color: '#fff', 
  borderRadius: '15px', 
  padding: '1.5rem', 
  boxShadow: '0 4px 8px rgba(0, 0, 0, 0.3)', 
  display: 'flex', 
  flexDirection: 'column', 
  justifyContent: 'space-between',
  fontFamily: 'Arial, sans-serif',
  position: 'relative',
  marginBottom:'1rem'
}}
key={index}

>



<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>

<div style={{ 
    fontSize: '1.1rem', 
    letterSpacing: '1px', 
    fontWeight: 'bold', 
    marginBottom: '1rem' 
  }}>
  {item.CardNumber} 
  </div>

  <div style={{ 
    fontSize: '1.1rem', 
    letterSpacing: '1px', 
    marginBottom: '1rem' 
  }}>
   
  {Number(item.CardAmount).toLocaleString('en-GH', {
  style: 'currency',
  currency: 'GHS',
  minimumFractionDigits: 2
})}


  </div>


</div>





  {/* Cardholder Name and Expiry Date */}
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexDirection:"row" }}>
    <div style={{ fontSize: '1rem', fontWeight: 500 }}>{item.BearerName?.toUpperCase()}</div>
    <div style={{ fontSize: '0.8rem' }}>
      <span>VALIDITY: FOREVER</span><br />
      
    </div>
  </div>

  {/* Account Balance */}


</div>
    ))
  )
}



            <NewSelector
              placeholder="Select Action"
              dataList={thePaymentMethod}
              dataKey="PaymentMethod"
              dataValue="PaymentMethod"
              setMethod={handlePaymentMethodSelect}
            />
       
          {
            pay=== "Buy New ShoppingCard" ? (
              <>
                <Field label="Bearer Name" name="username" />
                <Field label="Bearer Email" name="email" type="email" />
                <Field label="Bearer Phone Number" name="phone" type="tel" />
                <Field label="Amount" name="TransactionAmount" type="number" />
 
              </>
            ) :null
          }


           {
            pay=== "TopUp ShoppingCard" ? (
              <>
              <Field label="Card Number" name="CardNumber" type="text" />
              <Field label="TopUp Amount" name="TransactionAmount" type="number" />
 
              </>
            ) :null
          }
           
       

          <button type="submit" className="submit-btn">
            Pay
          </button>

        
        </form>
      </div>
      <Footer />
      <LastFooter />
    </div>
  );
}
