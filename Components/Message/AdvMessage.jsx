import { useEffect, useState } from "react";
import "./Message.css"
import CustomButton from "@/src/utils/Button";
import { apiServer, ShortName } from "@/src/utils/data";
import { Show } from "@/src/utils/Endpoints";


const AdvMessage = ({mobileOpen, toggler = () =>{}}) => {
  const [username, setUsername] = useState("");
  const [Email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [Message, setMessage] = useState("");




const SubMit = async () => {
          try {
            const fullName = username;
      const email = Email;
      const message = Message;
        
            // Simple email validation regex
            const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        
            // Validate FullName, Email, and Message
            if (!fullName.trim()) {
              Show.Attention("Full Name cannot be empty");
              return;
            }
            if (!emailPattern.test(email)) {
              Show.Attention("Enter a valid email address");
              return;
            }
            if (!message.trim()) {
              Show.Attention("Message cannot be empty");
              return;
            }
        
            const formData = new FormData();
            formData.append("FullName", fullName);
            formData.append("Email", email);
            formData.append("Purpose", "Product Enquiry");
            formData.append("Message", message);
            formData.append("MessageLink", location.href);
        
            Show.showLoading("Sending message......");
        
            const response = await fetch(apiServer+"SendChat", {
              method: "POST",
              headers: {
                "ShortName":ShortName
              },
              body: formData,
            });
        
            const data = await response.json();
            if (response.ok) {
              Show.hideLoading();
              Show.Success(data.message);
  
  
            location.reload();
          
            } else {
              Show.Attention(data.message);
            }
          } catch (e) {
            Show.Attention("An error has occurred");
          }
        };


        const [compInfo, setCompInfo] = useState({});
        
        useEffect(() => {
          fetch(apiServer + "ViewMainWebsite", {
            method: "POST",
            headers: {
              "ShortName":ShortName
            },
          })
            .then(res => res.json())
            .then(data => {
              if (data.status === "SUBSCRIPTION_EXPIRED") {
                router.push("/underConstruction");
              } else {
                setCompInfo(data[0]);
              }
            })
            .catch(err => console.log(err));
        }, []);

        const phoneNumber = compInfo.PhoneNumber;

        const formattedPhoneNumber = phoneNumber?.startsWith("0") ? phoneNumber.substring(1) : phoneNumber;




  return (
    <div style={{marginTop:"5rem"}}>
      {/* Overlay (Click outside to close) */}
      {mobileOpen && <div className="overlay" onClick={toggler}></div>}

      <div className={`message-container ${mobileOpen ? "active" : ""}`}>
        {/* Close Button */}
        <button className="close-btn" onClick={toggler}>&times;</button>

        {/* Form */}
        <div className="enquiry-form" style={{marginTop:"5rem"}}>
          <legend>Send us a Message</legend>

          <label htmlFor="username">Your name</label>
          <input type="text" id="username" name="username"  onChange={(e) => setUsername(e.target.value)}  placeholder="Enter your name" required />

          <label htmlFor="email">Your Email</label>
          <input type="email" id="email" name="email" onChange={(e) => setEmail(e.target.value)} placeholder="Enter your email" required />

          
          <label htmlFor="message">Message</label>
          <textarea id="message" name="message" onChange={(e) => setMessage(e.target.value)} placeholder="Your message" rows="4" required></textarea>
          <a href={`tel:${compInfo.PhoneNumber}`} style={{color:"black", fontSize:"1.5rem", padding:"1rem"}}>Call Us On {compInfo.PhoneNumber}</a>

<div style={{display:"flex", flexDirection:"row", gap:"1rem"}}>
<CustomButton title="Send Enquiry" width="180px" backgroundColor="#00CC61" theFunction={()=>{SubMit()}} />
<CustomButton title="close" width="180px" backgroundColor="#FF5A3D" theFunction={()=>{toggler()}} />


</div>
                 
          <CustomButton
        title="Whatsapp Us"
        width="100%"
        backgroundColor='#00404E'
        color='#ffffff'
        theFunction={()=>{window.open("https://wa.me/233"+formattedPhoneNumber)}}
        />
        
        </div>

       

      </div>
    </div>
  );
};

export default AdvMessage;
