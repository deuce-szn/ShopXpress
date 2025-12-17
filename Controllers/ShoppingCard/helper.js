"use client";
import React, { useState, useEffect } from "react";
import "./checkout.css";
import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";
import Modal from "./Modal";
import { apiServer, ShortName } from "@/Constants/data";
import { Show } from "@/Constants/Alerts";
import Selector from "@/Constants/Selector";
import Navbar from "@/Pages/Navbar/Navbar";
import LastFooter from "@/Pages/Footer/LastFooter";
import Footer from "@/Pages/Footer/Footer";
import { useCartStore } from "@/Components/CartStore";
import { AES, enc } from 'crypto-js';




const Checkout = () => {
  const router = useRouter();
  const navigate = (path) => {
    router.push(path);
  };

  const [userInfo, setUserInfo] = useState({});
  const [paymentMethod, setPaymentMethod] = useState([]);
  const [pay, setPay] = useState("");
  const [Country, setCountry] = useState("");
  const [Region, setRegion] = useState("");
  const [City, setCity] = useState("");
  const [DigitalAddress, setDigitalAddress] = useState("");
  const [DetailedAddress, setDetailedAddress] = useState("");
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");
  const currency = "GH₵";

  const [NationalIDType, setNationalIDType] = useState("");
  const [NationalID, setNationalID] = useState("");
  const [UserPic, setUserPic] = useState(null);
  const [IDFront, setIDFront] = useState("");
  const [IDBack, setIDBack] = useState("");
  const [CardNumber, setCardNumber] = useState("");

  const [FullName, setFullName] = useState("");
  const [Email, setEmail] = useState("");
  const [PhoneNumber, setPhoneNumber] = useState("");


  const { clearOrder,loadOrder, theOrder } = useCartStore();
  
  useEffect(()=>{
    loadOrder()
  },[])



  
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




const Payment = async () => {

    Show.showLoading("Processing your payment request...");
      try {
     
    const url = `${apiServer}payment/${userInfo.UserId}/${orderId}`;
  
        const response = await fetch(url, {
          method: "GET",
          headers: {
            'UserId': userInfo.UserId,         
            'SessionId': userInfo.SessionId,
            "ShortName":ShortName    
          },
          
        });

        const data = await response.json();
      
        if (response.ok) {
          
          Show.hideLoading();
          window.location.href = data.message;
          
        } else {
          Show.Attention(data.message);
        }
      } catch (error) {
        console.log(error)
        Show.Attention("An error has occured");
       
      }
    
    }
  




  const [payInfo, setPayInfo] = useState({})

  const GetTotalPaymentAmount = async () => {
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

      const response = await fetch(apiServer + "GetTotalPaymentAmount", {
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
        setPayInfo(data)
      } else {
        setPayInfo({})
        Show.Attention(data.message);
      }
    } catch (error) {
      Show.Attention("An error has occurred");
    }
  };



  const [MomoC, setMomoC] = useState(false);
  const [PayOnDel, setPayOnDel] = useState(false);
  const [CreditS, setCreditS] = useState(false);
  const [ShoppingC, setShoppingC] = useState(false);


  

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

  const thePaymentMethod = [
   {"PaymentMethod":"Mobile Money or Credit Card" },
   {"PaymentMethod":"Payment On Delivery" },
   {"PaymentMethod":"Shopping Card" },
   

  ]

  
  useEffect(() => {
    if(pay === "Credit Sales"){

      const video = document.getElementById('video');
      navigator.mediaDevices.getUserMedia({ video: true })
        .then((stream) => {
          video.srcObject = stream;
        })
        .catch((err) => {
          console.log("Error accessing camera: ", err);
        });

    }
  }, [pay]);
  
  function snapPicture() {
    const canvas = document.getElementById('canvas');
    const video = document.getElementById('video');
    const context = canvas.getContext('2d');
  
    if (video && video.srcObject) {
      // Set canvas dimensions to match the video
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
  
      // Draw the current frame from the video to the canvas
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
  
      // Stop the video stream after capturing the image
      const stream = video.srcObject;
      if (stream) {
        const tracks = stream.getTracks();
        tracks.forEach(track => track.stop());
      }
  
      // Convert the canvas to an image URL and display it in the modal
      const capturedImage = document.getElementById('captured-image');
      const imageURL = canvas.toDataURL('image/png');
      setUserPic(imageURL);
      capturedImage.src = imageURL;
      capturedImage.style.display = 'block';
  
      // Hide video and canvas, show the captured image
      video.style.display = 'none';
      canvas.style.display = 'none';
    } else {
      console.log("Error: Video stream not available.");
    }
  }
  
  function retakePicture() {
    const video = document.getElementById('video');
    const canvas = document.getElementById('canvas');
    const capturedImage = document.getElementById('captured-image');
  
    // Clear the captured image and reset the state
    setUserPic(null);
    capturedImage.src = '';
    capturedImage.style.display = 'none';
  
    // Restart the camera
    navigator.mediaDevices.getUserMedia({ video: true })
      .then((stream) => {
        video.srcObject = stream;
        video.style.display = 'block';
        canvas.style.display = 'none';
      });
  }
  
  
  const [previewIDFront, setPreviewIDFront] = useState(null); // For image preview
  const [previewIDBack, setPreviewIDBack] = useState(null); // For image preview


  const handleIDFront = (e) => {
    const file = e.target.files[0];
    setIDFront(file);
  
    // Preview the selected image
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewIDFront(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleIDBack = (e) => {
    const file = e.target.files[0];
    setIDBack(file);
  
    // Preview the selected image
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewIDBack(reader.result);
    };
    reader.readAsDataURL(file);
  };
  






  return (
    <div>
<Navbar/>
<div className="container">
  
      <div className="main">

{
  !userInfo?.Email?(
  <>
  
  <span style={{ fontSize: "1.2rem" }}>Basic Info</span>

      <fieldset>
          <legend>Full Name *</legend>
          <input
            className="signup-input"
            type="text"
            onChange={(e) => setFullName(e.target.value)}
            required
          />
        </fieldset>

        <fieldset>
          <legend>Email *</legend>
          <input
            className="signup-input"
            type="email"
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </fieldset>

        <fieldset>
          <legend>Phone Number *</legend>
          <input
            className="signup-input"
            type="tel"
            onChange={(e) => setPhoneNumber(e.target.value)}
            required
          />
        </fieldset>

  
  </>):(<></>)
}


      
        <span style={{ fontSize: "1.2rem" }}>Delivery Address</span>

        {/* Address Form */}
        <fieldset>
          <legend>Country *</legend>
          <input
            className="signup-input"
            type="text"
            onChange={(e) => setCountry(e.target.value)}
            required
          />
        </fieldset>
        <fieldset>
          <legend>Region *</legend>
          <input
            className="signup-input"
            type="text"
            onChange={(e) => setRegion(e.target.value)}
            required
          />
        </fieldset>
        <fieldset>
          <legend>City *</legend>
          <input
            className="signup-input"
            type="text"
            onChange={(e) => setCity(e.target.value)}
            required
          />
        </fieldset>
        <fieldset>
          <legend>Digital Address *</legend>
          <input
            className="signup-input"
            type="text"
            onChange={(e) => setDigitalAddress(e.target.value)}
            required
          />
        </fieldset>
        <fieldset>
          <legend>Detailed Address *</legend>
          <input
            className="signup-input"
            type="text"
            onChange={(e) => setDetailedAddress(e.target.value)}
            required
          />
        </fieldset>

        {/* Payment Method Selector */}
        <Selector
          placeholder="Select Payment Method"
          dataList={thePaymentMethod}
          dataKey="PaymentMethod"
          dataValue="PaymentMethod"
          setMethod={handlePaymentMethodSelect}
        />

<button className="button" onClick={() => Processor()}>Pay</button>

        {/* Payment Modal */}

        <Modal isOpen={MomoC} >
          <div className="modal-content">
            <h2>Make Payment for your order</h2>
            <div>
              <p>Order Id: {payInfo.OrderId}</p>
              <p>Delivery Fee: {payInfo.Delivery}</p>
              <p>Amount: {payInfo.Amount}</p>
              <hr/>
              <p>Total Amount: {currency} {payInfo.Total}</p>
              <hr/>
              <button className="button" onClick={() => Processor()}>Pay</button>
            </div>
            <button className="close-button" onClick={() => setMomoC(false)}>
              Close
            </button>
          </div>
        </Modal>

        <Modal isOpen={PayOnDel}>
          <div className="modal-content">
            <h2>Make Payment On Delivery</h2>
            <div>
              <p>Order Id: {payInfo.OrderId}</p>
              <p>Delivery Fee: {payInfo.Delivery}</p>
              <p>Amount: {payInfo.Amount}</p>
              <hr/>
              <p>Total Amount: {currency} {payInfo.Total}</p>
              <hr/>
              <button className="button" onClick={() => Processor()}>Process</button>
            </div>
            <button className="close-button" onClick={() => setPayOnDel(false)}>
              Close
            </button>
          </div>
        </Modal>

      <Modal isOpen={CreditS}>
        <div className="modal-content scrollable-modal">
          <h2>Make Payment On Credit</h2>
          <div>

            {/* Capture User Picture */}
            <fieldset style={{marginTop:"1rem"}}>
              <legend>Your Picture *</legend>
              <div>
                <video id="video" width="100%" autoPlay></video>
                <canvas id="canvas" style={{ display: "none" }}></canvas>
                <img id="captured-image" style={{ display: "none", width: '100%' }} alt="Captured" />
              </div>
              <button onClick={snapPicture}>Snap Picture</button>
              <button onClick={retakePicture}>Retake</button>
            </fieldset>

            <fieldset style={{marginTop:"1rem"}}>
              <legend>NationalID Type *</legend>
              <input
                className="signup-input"
                type="text"
                onChange={(e) => setNationalIDType(e.target.value)}
                required
              />
            </fieldset>

            <fieldset style={{marginTop:"1rem"}}>
              <legend>NationalID Number *</legend>
              <input
                className="signup-input"
                type="text"
                onChange={(e) => setNationalID(e.target.value)}
                required
              />
            </fieldset>

            {previewIDFront && (
                    <div style={{ marginTop: "1rem" }}>
                      <img src={previewIDFront} alt="Preview" style={{ maxWidth: "200px", maxHeight: "200px" }} />
                    </div>
                  )}


            {/* ID Card Front */}
            <fieldset style={{marginTop:"1rem"}}>
              <legend>ID Card (Front) *</legend>
              <input
                className="signup-input"
                type="file"
                accept=".jpg, .png, .jpeg, .ico, .webp"
                onChange={handleIDFront}
                required
              />
            </fieldset>

            {previewIDBack && (
                    <div style={{ marginTop: "1rem" }}>
                      <img src={previewIDBack} alt="Preview" style={{ maxWidth: "200px", maxHeight: "200px" }} />
                    </div>
                  )}

            {/* ID Card Back */}
            <fieldset style={{marginTop:"1rem"}}>
              <legend>ID Card (Back) *</legend>
              <input
                className="signup-input"
                type="file"
                accept=".jpg, .png, .jpeg, .ico, .webp"
                onChange={handleIDBack}
                required
              />
            </fieldset>
          </div>

          {/* Payment Details */}
          <div>
            <p>Order Id: {payInfo.OrderId}</p>
            <p>Delivery Fee: {payInfo.Delivery}</p>
            <p>Amount: {payInfo.Amount}</p>
            <hr />
            <p>Total Amount: {currency} {payInfo.Total}</p>
            <hr />
            <button className="button" onClick={() => Processor()}>Pay</button>
          </div>

          {/* Close Button */}
          <button className="close-button" onClick={() => setCreditS(false)}>
            Close
          </button>
        </div>
      </Modal>



        <Modal isOpen={ShoppingC}>
          <div className="modal-content">
            <h2>Make Payment with Shopping Card</h2>
            <div>
            <p>Order Id: {payInfo.OrderId}</p>
              <p>Delivery Fee: {payInfo.Delivery}</p>
              <p>Amount: {payInfo.Amount}</p>
              <hr/>
              <p>Total Amount: {currency} {payInfo.Total}</p>

              <fieldset style={{marginTop:"1rem"}}>
                <legend>Card Number *</legend>
                <input
                  className="signup-input"
                  type="text"
                  onChange={(e) => setCardNumber(e.target.value)}
                  required
                />
              </fieldset>

              <hr/>
              <button className="button" onClick={() => Processor()}>Pay</button>
            </div>
            <button className="close-button" onClick={() => setShoppingC(false)}>
              Close
            </button>
          </div>
        </Modal>




      </div>
      
</div>

<Footer/>
<LastFooter/>

    </div>
    
  );
};

export default Checkout;
