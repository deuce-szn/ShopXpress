"use client"
import React, { useEffect, useRef, useState } from 'react';
import "./ProductCard.css"
import { Categories } from '@/Constants/data'
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi'
import ProductCard from './ProductCard';
import FilteredSectionLoader from '@/Components/FilterSectionLoader';
import { useCartStore } from '@/Components/CartStore';

const MultiProduct = ({ cate, cateId }) => {
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

  useEffect(() => {
    setLoading(true);

const filtered = productList.filter(
        (item) => item.originalData.Category.categoryId === cateId
      );
      setFilteredProducts(filtered);
      setLoading(false);
  }, [productList, cateId]);


  return (
    <div className="product-container">
      <div className="product-header">
        <div className="product-header-left">
          <div className='prd-Title'>{cate}</div>
        </div>
      </div>

      {loading ? (
        <FilteredSectionLoader />
      ) : (
        <ProductCard product={filteredProducts} />
      )}
    </div>
  );
};

export default MultiProduct;
