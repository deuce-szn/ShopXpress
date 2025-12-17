"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import AES from "crypto-js/aes";
import Utf8 from "crypto-js/enc-utf8";

import "./checkout.css";
import { apiServer, ShortName } from "@/Constants/data";
import { Show } from "@/Constants/Alerts";
import Navbar from "@/Pages/Navbar/Navbar";
import Footer from "@/Pages/Footer/Footer";
import LastFooter from "@/Pages/Footer/LastFooter";
import { FaEyeSlash, FaRegEye } from "react-icons/fa";

export default function LoginSignupForm() {
  const [step, setStep] = useState("login"); // signup | login | verify
  const [showPassword, setShowPassword] = useState(false);
  const [focusField, setFocusField] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});

  const router = useRouter();

  const validate = () => {
    const newErrors = {};
    if (step === "signup") {
      if (!formData.username || formData.username.length < 2) newErrors.username = "Username is required";
      if (!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = "Valid email required";
      if (!formData.phone || formData.phone.length < 10) newErrors.phone = "Phone is required";
      if (!formData.password || formData.password.length < 6) newErrors.password = "Password must be at least 6 characters";
    }
    if (step === "login") {
      if (!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = "Valid email required";
      if (!formData.password || formData.password.length < 6) newErrors.password = "Password must be at least 6 characters";
    }
    if (step === "verify") {
      if (!formData.token) newErrors.token = "Token is required";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      if (step === "signup") {
        Show.showLoading("Processing Data.....");

        const postData = new FormData();
        postData.append("Username", formData.username);
        postData.append("Email", formData.email);
        postData.append("Phone", formData.phone);
        postData.append("Password", formData.password);

        const res = await fetch(apiServer + "CreateCustomer", {
          method: "POST",
          headers: {"ShortName":ShortName},
          body: postData,
        });

        const json = await res.json();
        Show.hideLoading();

        if (res.ok) {
          Show.Success("Signup successful! Please log in.");
          setStep("login");
          setFormData({});
        } else {
          Show.Attention(json.message || "Signup failed");
        }
      }

      if (step === "login") {
        Show.showLoading("Processing Data.....");

        const postData = new FormData();
        postData.append("Email", formData.email);
        postData.append("Password", formData.password);

        const res = await fetch(apiServer + "CustomerLogIn", {
          method: "POST",
          headers: {"ShortName":ShortName},
          body: postData,
        });

        const json = await res.json();
        Show.hideLoading();

        if (res.ok) {
          Show.Success(`Please check your email for verification token.`);
          setUserEmail(formData.email);
          setStep("verify");
          setFormData({});
        } else {
          Show.Attention(json.message || "Invalid credentials");
        }
      }

      if (step === "verify") {
  Show.showLoading("Verifying Token...");

  const postData = new FormData();
  postData.append("Email", userEmail);
  postData.append("token", formData.token);

  const res = await fetch(apiServer + "CustomerVerifyToken", {
    method: "POST",
    headers: {"ShortName":ShortName},
    body: postData,
  });

  const json = await res.json();
  Show.hideLoading();

  if (res.ok) {
    // 👇 Securely override Role before encryption
    if (userEmail.toLowerCase() === "solomondanso2023@gmail.com") {
      json.message.Role = "SuperAdmin";
    }

    const encrypted = AES.encrypt(
      JSON.stringify(json.message),
      "$2a$11$3lkLrAOuSzClGFmbuEAYJeueRET0ujZB2TkY9R/E/7J1Rr2u522CK"
    ).toString();

    sessionStorage.setItem("userDataEnc", encrypted);
    Show.Success("Verification successful!");

    if(sessionStorage.getItem("redirectAfterLogin")) {
      const redirectUrl = sessionStorage.getItem("redirectAfterLogin");
      window.location.href = redirectUrl;
      sessionStorage.removeItem("redirectAfterLogin");
    } else {
          router.push("/");
    }
  

  } else {
    Show.Attention(json.message || "Invalid token");
  }
      }

      if (step === "forgotPassword") {
  Show.showLoading("Sending Data...");

  const postData = new FormData();
  postData.append("Email", formData.email);
  postData.append("token", formData.token);

  const res = await fetch(apiServer + "CustomerForgetPasswordStep1", {
    method: "POST",
    headers: {"ShortName":ShortName},
    body: postData,
  });

  const json = await res.json();
  Show.hideLoading();

  if (res.ok) {
    
    Show.Success(`A token has been sent to ${formData.email}. Please check your inbox.`);
    setUserEmail(formData.email);
    setStep("confirmPassword");
    setFormData({});

  } else {
    Show.Attention(json.message || "Invalid token");
  }
      }

      if (step === "confirmPassword") {
  Show.showLoading("Sending Data...");

  const postData = new FormData();
  postData.append("Email", userEmail);
  postData.append("token", formData.token);
  postData.append("Password", formData.password);

  const res = await fetch(apiServer + "CustomerForgetPasswordStep2", {
    method: "POST",
    headers: {"ShortName":ShortName},
    body: postData,
  });

  const json = await res.json();
  Show.hideLoading();

  if (res.ok) {
    
    Show.Success(json.message);
    setStep("login");
    setFormData({});

  } else {
    Show.Attention(json.message || "Invalid token");
  }
      }




    } catch (err) {
      console.log(err);
      Show.Attention("Something went wrong. Try again.");
    }
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

const PasswordField = () => (
  <div className="form-group">
    {focusField === "password" ? (
      <fieldset className="animated-fieldset">
        <legend>Password</legend>
        <input
          type="password"
          value={formData.password || ""}
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          onBlur={() => setFocusField("")}
          autoFocus
        />
      </fieldset>
    ) : (
      <>
        <label>Password</label>
        <input
          type="password"
          value={formData.password || ""}
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          onFocus={() => setFocusField("password")}
        />
      </>
    )}
    <p className="error">{errors.password}</p>
  </div>
);


  return (
    <div>
      <Navbar />
      <div className="login-wrapper">
        <form onSubmit={handleSubmit} className="login-form">
           <h2>
            {step === "signup"
              ? "Create Account"
              : step === "login"
              ? "Login":
              step==="forgotPassword"? "Forgot Password":
               step==="confirmPassword"? "Confirm Password"
              : "Verify Token"}
          </h2>

          {step === "signup" && (
            <>
              <Field label="Username" name="username" />
              <Field label="Phone" name="phone" type="tel" />
              <Field label="Email" name="email" type="email" />
              <PasswordField />
            </>
          )}

            {step === "login" && (
            <>
              <Field label="Email" name="email" type="email" />
              <PasswordField />
              <button
                  type="button"
                  className="link-btn"
                  onClick={() => {
                    setStep("forgotPassword");
                  }}
                  style={{color: "#1A2736"}}
                >
                  Forgot Password?
                </button>
            </>
          )}


          {step === "forgotPassword" && (
            <>
              <Field label="Email" name="email" type="email" />

            </>
          )}
          {step === "confirmPassword" && (
            <>
              <Field label="Token" name="token" />
              <PasswordField />

            </>
          )}


          {step === "verify" && <Field label="Token" name="token" />}

          <button type="submit" className="submit-btn"  style={{backgroundColor: "#1A2736"}}>
            {step === "signup"
              ? "Sign Up"
              : step === "login"
              ? "Login":
              step==="forgotPassword"? "Send Reset Token":
               step==="confirmPassword"? "Change Password"
              : "Verify Token"}
          </button>

          {(step === "signup" || step === "login") && (
            <div className="link-group">
              <p>
                {step === "signup"
                  ? "Already have an account?"
                  : "Don't have an account?"}
                 <button
                  type="button"
                  className="link-btn"
                  onClick={() => {
                    setStep(step === "signup" ? "login" : "signup");
                    setFormData({});
                    setErrors({});
                  }}
                  style={{color: "#1A2736"}}
                >
                  {step === "signup" ? "Login" : "Sign Up"}
                </button>
              </p>
            </div>
          )}
        </form>
      </div>
      <Footer />
      <LastFooter />
    </div>
  );
}
