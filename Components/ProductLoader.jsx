import React from 'react'
import "./Loader.css"

const ProductLoader = () => {
  return (
    <div className="normal-loader">
  <div className="shimmer" style={{ width: '100%', height: '400px', marginBottom: '20px' }}></div>
  <div className="shimmer" style={{ width: '60%', height: '30px', marginBottom: '10px' }}></div>
  <div className="shimmer" style={{ width: '40%', height: '20px', marginBottom: '20px' }}></div>
  <div className="shimmer" style={{ width: '80%', height: '15px', marginBottom: '10px' }}></div>
  <div className="shimmer" style={{ width: '90%', height: '15px', marginBottom: '10px' }}></div>
</div>
  )
}

export default ProductLoader