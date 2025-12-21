"use client"
import React, { useEffect, useRef, useState } from 'react';
import "./ProductCard.css"
import { Categories, DummyProducts } from '@/Constants/data'
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi'
import FilteredSectionLoader from '@/Components/FilterSectionLoader';
import ForYou from './ForYou';
import { useCartStore } from '@/Components/CartStore';

const ForYouContainer = ({cate}) => {
  const scrollRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(0); // Active category index
  const [loading, setLoading] = useState(true); // Loader state
  const [filteredProducts, setFilteredProducts] = useState([]);


const { loadProducts, productList, loadCategory, forYouList,forYouProducts } = useCartStore();

  // Load products and categories once on mount
  useEffect(() => {
    loadProducts();
    loadCategory();
    forYouProducts();
  }, []);

  useEffect(() => {
    setLoading(true);

    const filtered = productList.filter(
        (item) => item.category === cate
      );
      setFilteredProducts(filtered);
      setLoading(false);

  }, [activeIndex]);



  const scroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = 130 * 4;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  return (
    <div className="product-container">
      <div className="product-header">

        <div className="product-header-left">
          <div className='prd-Title'>Selected Product For You.</div>
      
        </div>

       



      </div>


      {loading ? (
        <FilteredSectionLoader />
      ) : (
        <ForYou product={forYouList} />
      )}


    </div>
  );
};

export default ForYouContainer;
