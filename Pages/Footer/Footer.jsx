import React, { useEffect, useState } from 'react'
import "./Footer.css"
import CustomButton from '@/Components/Button'
import { useRouter } from 'next/navigation';
import { apiServer, ShortName } from '@/Constants/data';

const Footer = () => {
   const router = useRouter();
          const navigate = (path) => {
            router.push(path);
          };

          const [person, setPerson] = useState({})
                          
              useEffect(() => {
                    
                        const formData = new FormData();
                                
                        fetch(apiServer + "WebsiteDetails", {
                          method: "POST",
                         headers: {"ShortName":ShortName},
                         
                          body: formData
                        })
                          .then(res => res.json())
                          .then(data=>setPerson(data))
                          .catch(err => console.log(err));
                      
                }, []);
            

  
  return (
    <div className='footer'>
    
    <div style={{display:"flex", flexDirection:"column", gap:"10px"}}>
        <div className="title">Contact us</div>
        <div>{person.Address1}</div>
        <div>{person.Address2}</div>
        <div style={{fontSize:"1.5rem", color:"#FF5252"}}>{person.PhoneNumber}</div>
    </div>

    <div style={{display:"flex", flexDirection:"column", gap:"10px"}}>
        <div className="title" onClick={()=>navigate("/search")}>What do you want?</div>
         <div>Whatever your business needs are, we have got you covered...</div>    
    </div>

    {/* <div style={{display:"flex", flexDirection:"column", gap:"10px"}}>
        <div className="title">Subscribe to newsletter</div>
        <div>Subscribe to our latest newsletter to get news about special discounts.</div>
       
       <input type='text' style={{background:"white", padding:"1rem", borderRadius:"1rem", color:"black"}}/>
       <CustomButton
       width='100px'
       title={"Subscribe"}
       backgroundColor='#FF5252'
       />
    </div> */}



    </div>
  )
}

export default Footer