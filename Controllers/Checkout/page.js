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
 
      if (!formData.username || formData.username.length < 2) newErrors.username = "Full name is required";
      if (!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = "Valid email required";
      if (!formData.phone || formData.phone.length < 10) newErrors.phone = "Phone is required";
      if (!formData.Country) newErrors.Country = "Country is required";
      if (!formData.Region) newErrors.Region = "Region is required";
      if (!formData.City) newErrors.City = "City is required";
      if (!formData.DigitalAddress) newErrors.DigitalAddress = "Digital Address is required";
      if (!formData.DetailedAddress) newErrors.DetailedAddress = "Detailed Address is required";
      // if (!formData.NationalIDType) newErrors.NationalIDType = "National ID Type is required";
      // if (!formData.NationalID || formData.NationalID.length < 5) newErrors.NationalID = "National ID is required";
      // if (!formData.UserPic) newErrors.UserPic = "User Picture is required";
      // if (!formData.IDFront) newErrors.IDFront = "ID Front is required";
      // if (!formData.IDBack) newErrors.IDBack = "ID Back is required";
      // if (!formData.CardNumber || formData.CardNumber.length < 16) newErrors.CardNumber = "Card Number is required";
        
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
    }
  }, []);

   const thePaymentMethod = [
   {"PaymentMethod":"Mobile Money or Credit Card" },
   {"PaymentMethod":"Payment On Delivery" },
   {"PaymentMethod":"Shopping Card" },
   

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
    // if (!validate()) return;

    try {
        Show.showLoading("Processing Data.....");

        const postData = new FormData();
        
        postData.append("UserId", userInfo.UserId);
        postData.append("Country", formData.Country);
        postData.append("Region", formData.Region);
        postData.append("City", formData.City);
        postData.append("DigitalAddress", formData.DigitalAddress);
        postData.append("DetailedAddress", formData.DetailedAddress);
        postData.append("OrderId", formData.orderId);
        postData.append("PaymentMethod", formData.pay);
        postData.append("NationalIDType", formData.NationalIDType);
        postData.append("NationalID", formData.NationalID);
        postData.append("UserPic",  formData.UserPic);
        postData.append("IDFront", formData.IDFront);
        postData.append("IDBack", formData.IDBack);
        postData.append("CardNumber", formData.CardNumber);
        postData.append("PaymentMethod", pay);
        postData.append("FullName",userInfo.FullName?userInfo.FullName:formData.username);
        postData.append("Email", userInfo.Email?userInfo.Email:formData.email);
        postData.append("PhoneNumber", userInfo.Phone?userInfo.Phone:formData.phone);
        postData.append("OrderList", JSON.stringify(theOrder));
        postData.append("SessionId", userInfo.SessionId);
        

        const res = await fetch(apiServer + "OrderProcessing", {
          method: "POST",
          headers: {"ShortName":ShortName},
          body: postData,
        });

        const data = await res.json();
       

        if (res.ok) {
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
  
          setFormData({});
        } else {
          Show.Attention(data.message || "Signup failed");
        }
      


    } catch (err) {
      Show.Attention("Something went wrong. Try again.");
    }
  };


  return (
    <div>
      <Navbar />
      <div className="login-wrapper">
        <form onSubmit={handleSubmit} className="login-form">

{
  !userInfo?.Email?(
  <>
  
    <h2>
        Basic Info
    </h2>

    <Field label="Full Name" name="username" />
    <Field label="Phone" name="phone" type="tel" />
    <Field label="Email" name="email" type="email" />

     
  
  </>):(<></>)
}

          <h2>
           Delivery Address
          </h2>

          <Field label="Country" name="Country" />
          <Field label="Region" name="Region"  />
          <Field label="City" name="City"  />
           <Field label="Digital Address" name="DigitalAddress" />
          <Field label="Detailed Address" name="DetailedAddress"  />
           <NewSelector
                    placeholder="Select Payment Method"
                    dataList={thePaymentMethod}
                    dataKey="PaymentMethod"
                    dataValue="PaymentMethod"
                    setMethod={handlePaymentMethodSelect}
                  />
          {
            pay==="Shopping Card" && (
              <Field label="Card Number" name="CardNumber" />
            )
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
