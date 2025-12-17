"use client"
import React, { useEffect, useState } from 'react'
import "./profile.css"
import Navbar from '@/Pages/Navbar/Navbar'
import LastFooter from '@/Pages/Footer/LastFooter'
import Footer from '@/Pages/Footer/Footer'
import { Accounts, apiServer, ShortName } from '@/Constants/data'
import { useRouter } from 'next/navigation'
import { AES, enc } from 'crypto-js';
import { Show } from '@/Constants/Alerts'
import { FiUser, FiPhone, FiMail, FiLock, FiLogOut } from 'react-icons/fi'
import { motion } from 'framer-motion'

const ProfilePage = () => {
  const router = useRouter();
  const [userInfo, setUserInfo] = useState({});
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    phoneNumber: ''
  });
  const [isLoading, setIsLoading] = useState(false);

  // Navigation handler
  const navigate = (path) => router.push(path);

  // Get current user data
  useEffect(() => {
    const loadUserData = () => {
      try {
        const encryptedData = sessionStorage.getItem("userDataEnc");
        if (!encryptedData) throw new Error("No session data");
        
        const encryptionKey = '$2a$11$3lkLrAOuSzClGFmbuEAYJeueRET0ujZB2TkY9R/E/7J1Rr2u522CK';
        const decryptedData = AES.decrypt(encryptedData, encryptionKey);
        const decryptedString = decryptedData.toString(enc.Utf8);
        const parsedData = JSON.parse(decryptedString);
        
        setUserInfo(parsedData);
        setFormData({
          fullName: parsedData.FullName || '',
          email: parsedData.Email || '',
          phoneNumber: parsedData.Phone || '',
          password: ''
        });
      } catch (error) {
        Show.Attention("Please login to continue");
        navigate("/authenticate");
      }
    };

    loadUserData();
  }, []);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Submit form data
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      Show.showLoading("Updating profile...");

      const postData = new FormData();
      postData.append("Username", formData.fullName);
      postData.append("Phone", formData.phoneNumber);
      postData.append("Email", formData.email);
      postData.append("Password", formData.password);
      postData.append("UserId", userInfo.UserId);

      const res = await fetch(apiServer + "UpdateCustomer", {
        method: "POST",
        headers: {
          "UserId": userInfo.UserId,
          "SessionId": userInfo.SessionId,
          "ShortName":ShortName
        },
        
        body: postData,
      });

      const data = await res.json();

      if (res.ok) {
        Show.Success(data.message || "Profile updated successfully");
      } else {
        throw new Error(data.message || "Update failed");
      }
    } catch (err) {
      Show.Attention(err.message || "Something went wrong");
    } finally {
      setIsLoading(false);
      Show.hideLoading();
    }
  };

  const handleLogout = () => {
    sessionStorage.clear();
    Show.Success("Logged out successfully");
    navigate("/");
  };

  return (
    <div className="profile-container" style={{marginTop: "10rem"}}>
      <Navbar />
      
      <main className="profile-main">
        {/* Sidebar Navigation */}
        <aside className="profile-sidebar">
          <div className="user-profile-card">
            <div className="profile-avatar">
              {userInfo?.FullName?.charAt(0)?.toUpperCase() || ""}
            </div>
            <div className="user-info">
              <h3>{userInfo.FullName || "User"}</h3>
              <p>{userInfo.Email || ""}</p>
            </div>
          </div>

          <nav className="sidebar-nav">
            {Accounts.map((item, index) => (
              <motion.div 
                key={index}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div 
                  className={`nav-item ${item.url === "/profile" ? "active" : ""}`}
                  onClick={() => navigate(item.url)}
                >
                  <span className="nav-icon">{item.icon}</span>
                  <span className="nav-text">{item.text}</span>
                </div>
              </motion.div>
            ))}
          </nav>
        </aside>

        {/* Profile Form Section */}
        <section className="profile-content">
          <header className="profile-header">
            <h1>My Profile</h1>
          </header>

          <form onSubmit={handleSubmit} className="profile-form">
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="fullName">
                  <FiUser className="input-icon" />
                  Full Name
                </label>
                <input
                  id="fullName"
                  name="fullName"
                  type="text"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter your full name"
                />
              </div>

              <div className="form-group">
                <label htmlFor="phoneNumber">
                  <FiPhone className="input-icon" />
                  Phone Number
                </label>
                <input
                  id="phoneNumber"
                  name="phoneNumber"
                  type="tel"
                  value={formData.phoneNumber}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter your phone number"
                />
              </div>

              <div className="form-group">
                <label htmlFor="email">
                  <FiMail className="input-icon" />
                  Email Address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter your email"
                />
              </div>

              <div className="form-group">
                <label htmlFor="password">
                  <FiLock className="input-icon" />
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Enter new password (leave blank to keep current)"
                />
              </div>
            </div>

            <div className="form-actions">
              <motion.button
                type="submit"
                className="primary-button"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                disabled={isLoading}
              >
                {isLoading ? "Updating..." : "Update Profile"}
              </motion.button>

              <motion.button
                type="button"
                className="secondary-button"
                onClick={handleLogout}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <FiLogOut className="button-icon" />
                Log Out
              </motion.button>
            </div>
          </form>
        </section>
      </main>

      <Footer />
      <LastFooter />
    </div>
  )
}

export default ProfilePage