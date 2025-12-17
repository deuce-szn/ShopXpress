import React from "react";
import "./modal.css"; // Add your modal styles here

const Modal = ({ isOpen, children }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        {children}
      </div>
    </div>
  );
};

export default Modal;
