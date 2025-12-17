"use client"
import React, { useEffect, useState } from 'react';
import "./Message.css";
import Logo from "@/public/assets/images/logo.png"
import { FiPlusSquare, FiMinusSquare  } from "react-icons/fi";
import { useRouter } from 'next/navigation';
import { useCartStore } from '../CartStore';
import { ShortName } from '@/Constants/data';

const CategoryAccordion = ({ mobileOpen, toggler = () => {} }) => {
  const [expandedCategory, setExpandedCategory] = useState(null);
  const [expandedSubcategory, setExpandedSubcategory] = useState({});

   const { loadProducts, productList, loadCategory, categoryList } = useCartStore();
    
      useEffect(() => {
        loadProducts(); // Initial fetch on mount
        loadCategory();
      }, []);

  const toggleCategory = (id) => {
    setExpandedCategory(prev => (prev === id ? null : id));
    setExpandedSubcategory({});
  };

  const toggleSubcategory = (categoryId, subCateName) => {
    setExpandedSubcategory(prev => ({
      ...prev,
      [categoryId]: prev[categoryId] === subCateName ? null : subCateName
    }));
  };

  const router = useRouter();
      const navigate = (path) => {
        router.push(path);
        toggler();
      };

      const formatShortName = (name) => {
  if (!name) return "";
  return name.replace(/^.*?_/, '').replace(/_/g, '').toUpperCase();
};



  return (
    <>
      {mobileOpen && <div className="overlay active" onClick={toggler}></div>}

      <div className={`message-container ${mobileOpen ? "active" : ""} left`}>
        <button className="close-btn" onClick={toggler}>&times;</button>

       <div style={{padding: "10px",borderBottom: "1px solid #ccc", marginBottom: "10px"}}>
        <span style={{ letterSpacing: "4px", fontWeight: "bold" }}>
          Category
        </span>
       </div>


        <div className="category-wrapper">
          {categoryList.map(category => (
            <div key={category.id} className="category-block">
              <div className="category-row">
                <span className="category-name" onClick={()=>navigate(`/products?category=${category.name}`)}>{category.name}</span>
                <span className="toggle-icon" onClick={() => toggleCategory(category.id)}>{expandedCategory === category.id ? <FiMinusSquare/> : <FiPlusSquare />}</span>
              </div>

              {expandedCategory === category.id && (
                <div className="subcategory-wrapper">
                  {category.subcategories.map(sub => (
                    <div key={sub.id} className="subcategory-block">
                      <div
                        className="subcategory-row"
                        
                      >
                        <span className="subcategory-name"  onClick={() => navigate(`/products?category=${category.name}&subcategory=${sub.name}`)}>{sub.name}</span>
                        <span className="toggle-icon" onClick={() => toggleSubcategory(category.id, sub.name)}>
                          {expandedSubcategory[category.id] === sub.name ? <FiMinusSquare/> : <FiPlusSquare />}
                        </span>
                      </div>

                      {expandedSubcategory[category.id] === sub.name && (
                        <ul className="general-category-list">
                          {category.generalCategory
                            .filter(gc => gc.subCate === sub.name)
                            .map((gc, i) => (
                              <li key={i} className="general-category"  onClick={() => navigate(`/products?category=${category.name}&subcategory=${sub.name}&generalCategory=${gc.title}`)}>
                                {gc.title}
                              </li>
                            ))}
                        </ul>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default CategoryAccordion;
