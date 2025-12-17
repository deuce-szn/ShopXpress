import React from "react";

const CustomButton = ({ 
  theFunction, 
  title, 
  backgroundColor = "linear-gradient(to right, #F57235, #F7B529, #88C0A7, #8E94B6, #A281A9, #D84081, #B32879, #773482, #46378B)", 
  color = "white", 
  width = "150px", 
  height = "40px" 
}) => {
  const buttonStyles = {
    background: backgroundColor,
    color,
    width,
    height,
    border: "none",
    borderRadius: "10px",
    cursor: "pointer",
    fontSize: "1rem",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "10px",
    transition: "all 0.3s ease",
  };

  return (
    <button 
      onClick={theFunction ? theFunction : undefined} 
      style={buttonStyles} 
      className="custom-button"
    >
      {title}
    </button>
  );
};

export default CustomButton;
