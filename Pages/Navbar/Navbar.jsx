"use client"
import React, { useState, useRef, useEffect } from 'react'
import './Navbar.css'
import Logo from "@/public/assets/images/logo.png"
import { IoIosSearch, IoMdArrowDropdown, IoMdPerson } from "react-icons/io";
import { GiShoppingCart } from "react-icons/gi";
import { RiMenu2Fill } from "react-icons/ri";
import { apiMedia, apiServer, Categories, ShortName } from '@/Constants/data';
import { IoHome, IoRocketOutline } from "react-icons/io5";
import CateMsg from '@/Components/Message/CateMsg';
import CartMsg from '@/Components/Message/CartMsg';
import { LuClipboardCheck } from "react-icons/lu";
import { useRouter } from 'next/navigation';
import { AES, enc } from 'crypto-js';
import { useCartStore } from '@/Components/CartStore';
import FooterNavCard from '@/Components/Message/FooterNavCard';
import { FiShoppingCart } from 'react-icons/fi';

const Navbar = () => {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [hoveredSubcategory, setHoveredSubcategory] = useState(null);
  const [isCategoryHovered, setIsCategoryHovered] = useState(false);

  const { loadProducts, productList, loadCategory, categoryList } = useCartStore();
  
  useEffect(() => {
    loadProducts(); // Initial fetch on mount
    loadCategory();
  }, []);

  const router = useRouter();
  const navigate = (path) => {
    router.push(path);
  };

  const openCategoryModal = (category) => {
    setSelectedCategory(category);
    setHoveredSubcategory(null);
  };

  const closeModal = () => {
    setSelectedCategory(null);
    setHoveredSubcategory(null);
  };

  const [msgOpen, setmsgOpen] = useState(false)
  const theMsg = () => {
    setmsgOpen(!msgOpen);
    toggleZIndex()
  };

  const [cartOpen, setcartOpen] = useState(false)
  const theCart = () => {
    setcartOpen(!cartOpen);
    toggleZIndex()
  };

  const [toggleNavFooter, setToggleNavFooter] = useState(false)
  const toggleZIndex = () =>{
    if(msgOpen == true || cartOpen ==true){
      setToggleNavFooter(true)
    }
    else{
      setToggleNavFooter(false)
    }
  }

  const { cart, loadCart } = useCartStore();

  useEffect(() => {
    loadCart();
  }, []);

  const { setSearchTerm, searchedProducts } = useCartStore();

  const handleSearch = (e) => {
    const term = e.target.value;
    setSearchTerm(term);
    searchedProducts(); // trigger the filtering based on the current search term
  };

  const [searchCardOpen, setsearchCardOpen] = useState(false)
  const theSearchCard = () => {
    setsearchCardOpen(!searchCardOpen);
    toggleZIndex()
  };

  const { saveCart, addToCart, deleteFromCart, updateCartQuantity, clearCart, loadWishlist } = useCartStore();

  useEffect(() => {
    loadCart();
  }, []);

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
      console.log("No user data found or error decrypting");
    }
  }, []);

  const [person, setPerson] = useState({})
  const [imageLoaded, setImageLoaded] = useState(false);
    
  useEffect(() => {
    const formData = new FormData();
    
    fetch(apiServer + "WebsiteDetails", {
      method: "POST",
      headers: {"ShortName":ShortName},
      body: formData
    })
      .then(res => res.json())
      .then(data => setPerson(data))
      .catch(err => console.log(err));
  }, []);

  return (
    <div>
      <div className={`navbar ${isCategoryHovered ? "navbar-long" : ""}`}>
        <CateMsg mobileOpen={msgOpen} toggler={()=>{theMsg()}}/>
        <CartMsg mobileOpen={cartOpen} toggler={()=>{theCart()}}/>
        <FooterNavCard mobileOpen={searchCardOpen} toggler={()=>{theSearchCard()}}/>

        <div className="section-1">
          <div>Get up to 50% off new season styles, limited time only</div>
          <div className="section-1-links">
            <div>Affordable Product</div>
            <div>Faster delivery</div>
          </div>
        </div>

        <div className="section-2">
          <div className="icon viewer" style={{ backgroundColor: "white" }} onClick={()=>theMsg()}>
            <RiMenu2Fill size={25} />
          </div>

          {!imageLoaded && (
            <div>
              <FiShoppingCart size={32} />
            </div>
          )}

          {person.Logo && (
            <img
              src={apiMedia + person.Logo}
              alt="Logo"
              className={`${!imageLoaded ? 'invisible' : ''}`}
              onClick={() => navigate('/')}
              onLoad={() => setImageLoaded(true)}
              onError={() => setImageLoaded(false)}
              style={{
                width: "70px",
                height: "70px",
                borderRadius: "50%",
                color: "white",
                textAlign: "center",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexDirection: "column",
                fontSize: "50px",
                fontWeight: "bold"
              }}
            />
          )}

          <div className="search remover" onClick={()=>navigate("/search")}>
            <input
              type="text"
              placeholder="What do you want?"
              className="search-input"
              onChange={handleSearch}
            />
            <div className="search-icon">
              <IoIosSearch color="#000000" size={20} />
            </div>
          </div>

          <div className="user-actions">
            <div className="user-profile remover" onClick={()=>{userInfo.UserId?navigate("/profile"): navigate("/authenticate")}}>
              <div className="icon">
                <IoMdPerson size={20} />
              </div>
              <div className="user-info">
                <div>{userInfo.FullName || "Guest"}</div>
                <div>{userInfo.Email || "Sign in to your account"}</div>
              </div>
            </div>

            <div className="icon" style={{ backgroundColor: "white" }} onClick={()=>theCart()}>
              <GiShoppingCart size={25} />
              <span style={{color:"red", fontFamily:"Hydot-Bold"}}>{cart.length}</span>
            </div>
          </div>
        </div>
        <hr />

        <div className="section-3">
          <div className="shop-by-category remover" onClick={()=>theMsg()}>
            <RiMenu2Fill size={20} />
            <div className="shop-by-category-text">
              Shop By Categories
            </div>
            <IoMdArrowDropdown />
          </div>

          <div className="categories-container">
            {categoryList.slice(0, 7).map((category) => (
              <div
                key={category.id}
                className="category-item-wrapper"
                onMouseEnter={() => {
                  setSelectedCategory(category);
                  setIsCategoryHovered(true);
                }}
                onMouseLeave={() => {
                  setSelectedCategory(null);
                  setHoveredSubcategory(null);
                  setIsCategoryHovered(false);
                }}
              >
                <div 
                  className="category-item" 
                  onClick={()=>navigate(`/products?category=${category.name}`)}
                >
                  {category.name}
                </div>
              </div>
            ))}
          </div>
          <hr />

          <div style={{ display: "flex", alignItems: "center", flexDirection:'row', gap:'5px', paddingLeft:"10px"}}>
            <IoRocketOutline />
            <div style={{ whiteSpace: "nowrap"}}>Faster Delivery</div>
          </div>
        </div>
      </div>

      <div className="navbar-Footer">
        <div 
          style={{ display: "flex", alignItems: "center", flexDirection:'column', gap:'5px', paddingLeft:"10px"}}
          onClick={()=>{navigate("/")}}
        >
          <IoHome size={22}/>
          <div style={{fontSize:"0.8rem"}}>Home</div>
        </div>

        <div 
          style={{ display: "flex", alignItems: "center", flexDirection:'column', gap:'5px', paddingLeft:"10px"}}
          onClick={()=>theSearchCard()}
        >
          <IoIosSearch size={22}/>
          <div style={{fontSize:"0.8rem"}}>Search</div>
        </div>

        <div 
          style={{ display: "flex", alignItems: "center", flexDirection:'column', gap:'5px', paddingLeft:"10px"}}
          onClick={()=>navigate("/myOrders")}
        >
          <LuClipboardCheck size={22}/>
          <div style={{fontSize:"0.8rem"}}>Orders</div>
        </div>

        <div 
          style={{ display: "flex", alignItems: "center", flexDirection:'column', gap:'5px', paddingLeft:"10px"}}
          onClick={()=>{userInfo.UserId?navigate("/profile"): navigate("/authenticate")}}
        >
          <IoMdPerson size={22}/>
          <div style={{fontSize:"0.8rem"}}>Account</div>
        </div>
      </div>
    </div>
  )
}

export default Navbar;