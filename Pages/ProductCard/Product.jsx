"use client";
import React, { useEffect, useRef, useState } from 'react';
import "./ProductCard.css";
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import ProductCard from './ProductCard';
import FilteredSectionLoader from '@/Components/FilterSectionLoader';
import { useCartStore } from '@/Components/CartStore';

const Product = () => {
  const scrollRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filteredProducts, setFilteredProducts] = useState([]);

  const { loadProducts, productList, loadCategory, categoryList } = useCartStore();

  // Load products and categories once on mount
  useEffect(() => {
    loadProducts();
    loadCategory();
  }, []);

  // Filter products only when both productList and categoryList are available
  useEffect(() => {
    const bothLoaded = categoryList.length > 0 && productList.length > 0;
    if (!bothLoaded) {
      setLoading(true);
      return;
    }

    setLoading(true);
    const filtered = productList.filter(
      (item) => item.category === categoryList[activeIndex]?.name
    );
    setFilteredProducts(filtered);
    setLoading(false);
  }, [productList, categoryList, activeIndex]);

  const scroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = 130 * 4;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  const monthName = new Date().toLocaleString('default', { month: 'long' });

  return (
    <div className="product-container">
      <div className="product-header">
        <div className="product-header-left">
          <div className='prd-Title'>Popular Products</div>
          <div>Do not miss the current offers until the end of {monthName}.</div>
        </div>

        <div className="product-header-right-wrapper">
          <FiChevronLeft className="scroll-btn left" size={30} color='black' onClick={() => scroll('left')} />

          <div className="product-header-right" ref={scrollRef}>
            {categoryList.length > 0 &&
              categoryList.slice(0, 7).map((data, index) => (
                <div
                  className={`category-item ${activeIndex === index ? 'active' : ''}`}
                  key={index}
                  onClick={() => setActiveIndex(index)}
                >
                  {data.name}
                </div>
              ))}
          </div>

          <FiChevronRight className="scroll-btn left" size={30} color='black' onClick={() => scroll('right')} />
        </div>
      </div>

      {/* Loader or Product Card */}
      {loading ? (
        <FilteredSectionLoader />
      ) : (
        <ProductCard product={filteredProducts} />
      )}
    </div>
  );
};

export default Product;
