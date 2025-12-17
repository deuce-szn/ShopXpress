"use client";

import React, { useState, useEffect } from 'react';
import './Products.css';
import { useSearchParams } from 'next/navigation';
import Navbar from '@/Pages/Navbar/Navbar';
import Footer from '@/Pages/Footer/Footer';
import LastFooter from '@/Pages/Footer/LastFooter';
import { Categories, DummyProducts } from '@/Constants/data';
import RowProduct from '@/Pages/ProductCard/RowProducts';
import { FaFilter, FaRegStar, FaStar, FaStarHalfAlt } from 'react-icons/fa';
import { useCartStore } from '@/Components/CartStore';

const Products = () => {
  const searchParams = useSearchParams();
  const selectedCategory = searchParams.get("category");
  const selectedSubcategory = searchParams.get("subcategory");
  const selectedGeneralCategory = searchParams.get("generalCategory");

  const [checkedCategories, setCheckedCategories] = useState({});
  const [checkedRatings, setCheckedRatings] = useState({});
  const [priceRange, setPriceRange] = useState(0);
  const [maxPrice, setMaxPrice] = useState(0);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [sortOption, setSortOption] = useState("");

  const { loadCart, loadProducts,productList,loadCategory, categoryList } = useCartStore();

  useEffect(() => {
    loadCart();
    loadProducts();
    loadCategory()
  }, []);



  useEffect(() => {
    const maxProductPrice = Math.max(...productList.map(p => p.price));
    setMaxPrice(maxProductPrice + 10);
    setPriceRange(0);

    const preChecked = {};
    if (selectedCategory) preChecked[selectedCategory] = true;
    if (selectedSubcategory) preChecked[selectedSubcategory] = true;
    if (selectedGeneralCategory) preChecked[selectedGeneralCategory] = true;
    setCheckedCategories(preChecked);
  }, [selectedCategory, selectedSubcategory, selectedGeneralCategory,productList]);

  useEffect(() => {
    filterProducts();
  }, [checkedCategories, priceRange, checkedRatings, sortOption, productList]);

  const handleCheckboxChange = (categoryName) => {
    setCheckedCategories((prev) => ({
      ...prev,
      [categoryName]: !prev[categoryName],
    }));
  };

  const handleRatingChange = (rating) => {
    setCheckedRatings((prev) => ({
      ...prev,
      [rating]: !prev[rating],
    }));
  };

  const handlePriceChange = (e) => {
    setPriceRange(Number(e.target.value));
  };

  const handleSortChange = (e) => {
    setSortOption(e.target.value);
  };

  const filterProducts = () => {
    let filtered = productList.filter(product => product.price >= priceRange);

    const selectedCategories = Object.keys(checkedCategories).filter(key => checkedCategories[key]);
   // console.log("Selected Categories: ", selectedCategories);
    if (selectedCategories.length > 0) {
      filtered = filtered.filter(product => 
        selectedCategories.includes(product.category) ||
        selectedCategories.includes(product.subCate) ||
        selectedCategories.includes(product.generalCategory)
      );
    }


   

    const selectedRatings = Object.keys(checkedRatings).filter(key => checkedRatings[key]);
    if (selectedRatings.length > 0) {
      filtered = filtered.filter(product => {
        return selectedRatings.some(rating => {
          const min = Number(rating) - 0.5;
          const max = Number(rating) + 0.4;
          return product.starRating >= min && product.starRating <= max;
        });
      });
    }

    // Sort the products
    if (sortOption === "priceLowHigh") {
      filtered = [...filtered].sort((a, b) => a.price - b.price);
    } else if (sortOption === "priceHighLow") {
      filtered = [...filtered].sort((a, b) => b.price - a.price);
    } else if (sortOption === "ratingHighLow") {
      filtered = [...filtered].sort((a, b) => b.starRating - a.starRating);
    }else if (sortOption === "ratingLowHigh") {
      filtered.sort((a, b) => a.starRating - b.starRating);
    }

    setFilteredProducts(filtered);
  };

 
  
  

  
  


  const renderStars = (rating) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating - fullStars >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

    return (
      <>
        {[...Array(fullStars)].map((_, i) => (
          <FaStar key={`full-${i}`} color="#FFD700" />
        ))}
        {hasHalfStar && <FaStarHalfAlt color="#FFD700" />}
        {[...Array(emptyStars)].map((_, i) => (
          <FaRegStar key={`empty-${i}`} color="#FFD700" />
        ))}
      </>
    );
  };

  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);

const openFilterModal = () => {
  setIsFilterModalOpen(true);
};

const closeFilterModal = () => {
  setIsFilterModalOpen(false);
};

const toggleFilterModal = () => {
    setIsFilterModalOpen((prev) => !prev);
}




  return (
    <div style={{ backgroundColor: "#ffffff" }}>
      <Navbar />

      <div className='cateProducts'>
        <div className="cateProducts-Left">

          {/* CATEGORY FILTER */}
          <div className="cateProducts-Category">
            <div className="header">Filter By Category</div>
            {categoryList.map((data, index) => (
              <div key={index} className="filter-category-item">
                <input
                  type="checkbox"
                  checked={!!checkedCategories[data.name]}
                  onChange={() => handleCheckboxChange(data.name)}
                />
                <span>{data.name}</span>
              </div>
            ))}
          </div>

          {/* PRICE FILTER */}
          <div className="cateProducts-Category">
            <div className="header">Filter By Price</div>
            <div className="price-filter">
              <input
                type="range"
                min={0}
                max={maxPrice}
                value={priceRange}
                onChange={handlePriceChange}
                className="slider"
              />
              <div className="price-values">
                <span>Min: GHC{priceRange.toFixed(2)}</span>
                <span>Max: GHC{maxPrice.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* RATING FILTER */}
          <div className="cateProducts-Category">
            <div className="header">Filter By Rating</div>
            {[5, 4, 3, 2, 1].map((rating, index) => (
              <div key={index} className="filter-category-item">
                <input
                  type="checkbox"
                  checked={!!checkedRatings[rating]}
                  onChange={() => handleRatingChange(rating)}
                />
                <span>{renderStars(rating)}</span>
              </div>
            ))}
          </div>

         
          

        </div>

        <div className="cateProducts-Right">
        <div className='sortController'>
            <div>
              {filteredProducts.length} {filteredProducts.length === 1 ? "Product" : "Products"} Found
            </div>
            <div style={{display:"flex", flexDirection:"row", alignItems:"center", gap:"0.5rem"}}>
              <span>Sort By</span>
              <select className="sort-select" onChange={handleSortChange} value={sortOption}>
                <option value="">Default</option>
                <option value="priceLowHigh">Price: Low to High</option>
                <option value="priceHighLow">Price: High to Low</option>
                <option value="ratingHighLow">Rating: High to Low</option>
                <option value="ratingLowHigh">Rating: Low to High</option>
              </select>
            </div>
          </div>
          <RowProduct product={filteredProducts} />
        </div>

{/* Floating Filter Button (Only on small screens) */}
{/* Floating Filter Button (Only on small screens) */}
<div className="floating-filter-button" onClick={toggleFilterModal}>
  <FaFilter/>
</div>

{/* Modal */}
{isFilterModalOpen && (
  <div className="filter-modal-overlay">
    <div className="filter-modal-content">
      <button className="close-modal" onClick={closeFilterModal}>X</button>
      
      {/* Put your FILTERS here (same content as cateProducts-Left) */}
      <div className="modal-filters">
        <div className="header">Filter By Category</div>
        {categoryList.map((data, index) => (
          <div key={index} className="filter-category-item">
            <input
              type="checkbox"
              checked={!!checkedCategories[data.name]}
              onChange={() => handleCheckboxChange(data.name)}
            />
            <span>{data.name}</span>
          </div>
        ))}

        <div className="header">Filter By Price</div>
        <div className="price-filter">
          <input
            type="range"
            min={0}
            max={maxPrice}
            value={priceRange}
            onChange={handlePriceChange}
            className="slider"
          />
          <div className="price-values">
            <span>Min: GHC{priceRange.toFixed(2)}</span>
            <span>Max: GHC{maxPrice.toFixed(2)}</span>
          </div>
        </div>

        <div className="header">Filter By Rating</div>
        {[5, 4, 3, 2, 1].map((rating, index) => (
          <div key={index} className="filter-category-item">
            <input
              type="checkbox"
              checked={!!checkedRatings[rating]}
              onChange={() => handleRatingChange(rating)}
            />
            <span>{renderStars(rating)}</span>
          </div>
        ))}
      </div>
    </div>
  </div>
)}




      </div>

      <Footer />
      <LastFooter />
    </div>
  );
};

export default Products;
