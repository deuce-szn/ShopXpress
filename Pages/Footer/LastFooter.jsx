import React, { useEffect, useState } from 'react'
import "./Footer.css"
import { apiServer, ShortName, Socials } from '@/Constants/data'
import { FaFacebook, FaInstagramSquare, FaTiktok } from 'react-icons/fa'

const LastFooter = () => {

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

        <div style={{display:"flex", flexDirection:"row", gap:"10px"}}>
            <a href={person.Facebook}  target='_blank'>
            <div><FaFacebook style={{width:"30px", height:"30px"}}/></div>
            </a>
            <a href={person.Instagram}  target='_blank'>
            <div><FaInstagramSquare style={{width:"30px", height:"30px"}}/></div>
            </a>
            <a href={person.TikTok}  target='_blank'>
            <div><FaTiktok style={{width:"30px", height:"30px"}}/></div>
            </a>

        </div>

        <div> © {new Date().getFullYear()} {person.BusinessName}. All rights reserved.</div>

            <div className='theEnd'></div>


    </div>
  )
}

export default LastFooter