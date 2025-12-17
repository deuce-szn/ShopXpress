"use client"
import React, { useEffect } from 'react'

import Hero from '@/Pages/Hero/Hero'
import Navbar from '@/Pages/Navbar/Navbar'
import HeroBar from '@/Pages/HeroBar/HeroBar'
import Product from '@/Pages/ProductCard/Product'
import Banner from '@/Pages/Banner/Banner'
import { apiServer, Categories, ShortName } from '@/Constants/data'
import MultiProduct from '@/Pages/MultiProduct/MultiProduct'
import FooterBanner from '@/Pages/FooterBanner/FooterBanner'
import Footer from '@/Pages/Footer/Footer'
import LastFooter from '@/Pages/Footer/LastFooter'
import ForYou from '@/Pages/ForYou/ForYou'
import ForYouContainer from '@/Pages/ForYou/ForYouContainer'
import { useCartStore } from '@/Components/CartStore'
import { useRouter } from 'next/navigation'
import VisualSearch from '@/Pages/ProductCard/VisualImage'


const Page = () => {

const { loadProducts, productList, loadCategory, categoryList } = useCartStore();

  // Load products and categories once on mount
  useEffect(() => {
    loadProducts();
    loadCategory();
  }, [loadProducts,loadCategory ]);

 useEffect(() => {
 
}, []);

 useEffect(() => {
    const storedValue = sessionStorage.getItem("he7dvavd1783bsdcgdas");
   
     const BrowserId = localStorage.getItem("BrowserId");

  if (!BrowserId) {
    const random20DigitNumber = Array.from({ length: 20 }, () =>
      Math.floor(Math.random() * 10)
    ).join("");

    localStorage.setItem("BrowserId", random20DigitNumber);
  }

    if (!storedValue) {
      const random20DigitNumber = Array.from({ length: 20 }, () =>
      Math.floor(Math.random() * 10)
    ).join("");

      const handleVisits = async () => {
        try {
          const response = await fetch(apiServer+"Visitors", {
            method: "POST",
            headers: {
              "ShortName":ShortName
            },
          });

          if (response.ok) {
           
            sessionStorage.setItem("he7dvavd1783bsdcgdas", random20DigitNumber);
           
          } else {
 
          }
        } catch (error) {

        }
      };

      handleVisits(); // Call the function inside the if block
    } 
  }, []);

  const router = useRouter();

  useEffect(() => {
    fetch(apiServer + "CheckSubscriptionStatus", {
      method: "POST",
      headers: {
        "ShortName": ShortName,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.status === "SUBSCRIPTION_EXPIRED") {
          router.push("/MaintainancePage");
        }
      })
      .catch((err) => console.log("Error checking subscription:", err));
  }, [router]);


  return (
    <div>

<Navbar/>
<Hero/>
<HeroBar/>


{
  categoryList.map((data, index)=>(
  <div key={index}>
<MultiProduct cate={data.name} cateId = {data.categoryId}/>
  </div>))
}

{/* <VisualSearch/> */}


<FooterBanner/>
<Footer/>
<LastFooter/>


    </div>
  )
}

export default Page