import { create } from 'zustand';
import CryptoJS from 'crypto-js';
import { Show } from '@/Constants/Alerts';
import { apiServer, apiAInML, ShortName } from '@/Constants/data';


const secretKey = "NXds7IUykdbiy2sDk7c2LsAuh7lxmiy68wFmRyGttVW3wbj12tGRi2dI185N10NmIO7wIOEut9Dz9KHKaj+Urm8T9LXYceag";



export const useCartStore = create((set, get) => ({




  cart: [],
  wishlist:[],
  searchTerm: '',
  searchedProductsList: [],
  forYouList:[],
  theOrder:[],
  productList: [],
  categoryList:[],

  loadCategory: async () => {
    const formData = new FormData();
    formData.append("action", "getcategories");
    try {
      const response = await fetch(apiServer, {
        method: "POST",
        headers: {"ShortName":ShortName},
        body: formData
      });

      const data = await response.json();
      

      if (response.ok) {
        set({ categoryList: data.data });
       
        
      } else {
        console.log("Data", data)
        console.log("Invalid category response format", data);
      }
    } catch (error) {
      console.log("Error loading products:", error);
    }
  },

  loadProductsOld: async () => {
    const formData = new FormData();
    formData.append("action", "getproducts");
    try {
      const response = await fetch(apiServer, {
        method: "POST",
        headers: {"ShortName":ShortName},
        body: formData
      });

      const data = await response.json();
       

      if (Array.isArray(data)) {
       
        set({ productList: data.data.products });
      } else {
        console.log("Invalid product response format", data);
      }
    } catch (error) {
      console.log("Error loading products:", error);
    }
  },

loadProducts: async () => {
  const formData = new FormData();
  formData.append("action", "getproducts");
  try {
    const response = await fetch(apiServer, {
      method: "POST",
      headers: {"ShortName": ShortName},
      body: formData
    });

    const data = await response.json();
    
    // Check if data is an object and has the expected structure
    if (data && data.success && data.data && Array.isArray(data.data.products)) {
      
      
      // Transform the API data to match ProductCard component expectations
      const transformedProducts = data.data.products.map(product => ({
        productId: product.id,
        title: product.productName,
        price: product.productPrice,
        mainPicture: product.productImage,
        description: product.productDescription,
        category: product.Category?.name || 'Uncategorized',
        starRating: 0, // Default value since API doesn't provide this
        discountPercent: 0, // Default value since API doesn't provide this
        secondPicture: product.productImage, // Use main image as fallback for hover
        quantity: 0, // Default value - you might want to get this from API if available
        size: [], // Default empty array - update if you have size data
        // Include original data if needed elsewhere
        originalData: product
      }));
      
      // Store the transformed data
      set({ 
        productList: transformedProducts,
        // Optionally store original data separately
        originalProductList: data.data.products 
      });
      
    } else {
      console.log("Invalid product response format", data);
    }
  } catch (error) {
    console.log("Error loading products:", error);
  }
},
  
  setSearchTerm: (term) => {
    set({ searchTerm: term });
  },

  searchedProducts: () => {
    const { searchTerm, productList } = get();
    if (!searchTerm) {
      set({ searchedProductsList: productList });
      return productList;
    }
  
    const lowerTerm = searchTerm.toLowerCase();
    const searchProducts = productList.filter(product =>
      product.title.toLowerCase().includes(lowerTerm) ||
      product.description?.toLowerCase().includes(lowerTerm) ||
      product.category?.toLowerCase().includes(lowerTerm) ||
      product.subCate?.toLowerCase().includes(lowerTerm)
    );
  
    set({ searchedProductsList: searchProducts });
    return searchProducts;
  },

  
   forYouProducts: async () => {
    try {
      const response = await fetch(apiAInML + "recommendations/"+localStorage.getItem("BrowserId")+"/", {
        method: "POST",
        headers: {
        'ShortName': ShortName,
        "Content-Type": "application/json",  
      },
      });

      const data = await response.json();
       if (data.status === "SUBSCRIPTION_EXPIRED") {
          router.push("/MaintainancePage");
        }

      if (Array.isArray(data)) {
        set({ forYouList: data });
      } else {
        console.log("Invalid recommended product response format", data);
      }
    } catch (error) {
      console.log("Error loading products:", error);
    }
  },
  


  saveCart: (cartData) => {
    const encrypted = CryptoJS.AES.encrypt(JSON.stringify(cartData), secretKey).toString();
    localStorage.setItem('cartData', encrypted);
  },

  loadCart: () => {
    const encryptedCart = localStorage.getItem('cartData');
    if (encryptedCart) {
      const bytes = CryptoJS.AES.decrypt(encryptedCart, secretKey);
      const decryptedData = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
      set({ cart: decryptedData });
    }
  },

  addToCart: (item, qty = 1) => {

    console.log("Items To Be Added", item)


    const { cart, saveCart, loadCart } = get();

    Show.Alert(item.title + " item added to cart");

    const existingIndex = cart.findIndex(cartItem => cartItem.productId === item.productId);
    let updatedCart;

    if (existingIndex !== -1) {
      const currentQty = cart[existingIndex].quantity;
      if (currentQty + qty > item.Quantity) {
        Show.Alert(`You cannot add more than ${item.Quantity} items.`);
        return;
      }
      updatedCart = cart.map((cartItem, idx) =>
        idx === existingIndex
          ? { ...cartItem, quantity: currentQty + qty }
          : cartItem
      );
    } else {
      if (qty > item.Quantity) {
        Show.Alert(`You cannot add more than ${item.Quantity} items.`);
        return;
      }
      updatedCart = [...cart, { ...item, quantity: qty }];
    }

    set({ cart: updatedCart });
    saveCart(updatedCart);
    loadCart();
  },

  addToCartWithSize: (item, qty = 1, size) => {

    const { cart, saveCart, loadCart } = get();
  
    Show.Alert(item.title + " added to cart");
  
    const existingIndex = cart.findIndex(
      cartItem => cartItem.productId === item.productId && cartItem.size === size
    );
  
    let updatedCart;
  
    if (existingIndex !== -1) {
      const currentQty = cart[existingIndex].quantity;
      if (currentQty + qty > item.Quantity) {
        Show.Alert(`You cannot add more than ${item.Quantity} items.`);
        return;
      }
      updatedCart = cart.map((cartItem, idx) =>
        idx === existingIndex
          ? { ...cartItem, quantity: currentQty + qty }
          : cartItem
      );
    } else {
      if (qty > item.Quantity) {
        Show.Alert(`You cannot add more than ${item.Quantity} items.`);
        return;
      }
      updatedCart = [...cart, { ...item, quantity: qty, size: size }];
    }
  
    set({ cart: updatedCart });
    saveCart(updatedCart);
    loadCart();
  },
  

  deleteFromCart: (productId) => {
    const { cart, saveCart } = get();
    const updatedCart = cart.filter(item => item.productId !== productId);
    set({ cart: updatedCart });
    saveCart(updatedCart);
  },

  updateCartQuantity: (item, change) => {
    const { cart, saveCart,productList } = get();

    const product = productList.find(p => p.productId === item.productId);
    const stockAvailable = product ? product.quantity : item.quantity;

    const updatedCart = cart.map(cartItem => {
      if (cartItem.productId === item.productId) {
        let newQuantity = cartItem.quantity + change;

        if (newQuantity < 1) newQuantity = 1;

        if (newQuantity > stockAvailable) {
          Show.Error(`Only ${stockAvailable} items in stock.`);
          newQuantity = stockAvailable;
        }

        return { ...cartItem, quantity: newQuantity };
      }
      return cartItem;
    });

    set({ cart: updatedCart });
    saveCart(updatedCart);
  },

  clearCart: () => {
    localStorage.removeItem('cartData');
    set({ cart: [] });
  },

  saveWishlist: (cartData) => {
    const encrypted = CryptoJS.AES.encrypt(JSON.stringify(cartData), secretKey).toString();
    localStorage.setItem('wishlistData', encrypted);
  },

  loadWishlist: () => {
    const encryptedCart = localStorage.getItem('wishlistData');
    if (encryptedCart) {
      const bytes = CryptoJS.AES.decrypt(encryptedCart, secretKey);
      const decryptedData = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
      set({ wishlist: decryptedData });
    }
  },

  addToWishList: (item, qty = 1) => {
    const { wishlist, saveWishlist, loadWishlist } = get();

    Show.Alert(item.title + " item added to wishlist");

    const existingIndex = wishlist.findIndex(cartItem => cartItem.productId === item.productId);
    let updatedCart;

    if (existingIndex !== -1) {
      const currentQty = wishlist[existingIndex].quantity;
      if (currentQty + qty > item.Quantity) {
        Show.Alert(`You cannot add more than ${item.Quantity} items.`);
        return;
      }
      updatedCart = wishlist.map((cartItem, idx) =>
        idx === existingIndex
          ? { ...cartItem, quantity: currentQty + qty }
          : cartItem
      );
    } else {
      if (qty > item.Quantity) {
        Show.Alert(`You cannot add more than ${item.Quantity} items.`);
        return;
      }
      updatedCart = [...wishlist, { ...item, quantity: qty }];
    }

    set({ wishlist: updatedCart });
    saveWishlist(updatedCart);
    loadWishlist();
  },
  deleteFromWishlist: (productId) => {
    const { wishlist, saveWishlist, } = get();
    const updatedCart = wishlist.filter(item => item.productId !== productId);
    set({ wishlist: updatedCart });
    saveWishlist(updatedCart);
  },

  processTheOrder: () => {
    const { cart, clearCart } = get();
  
    if (!cart || cart.length === 0) {
      Show.Error("No items in cart to process.");

      return;
    }
  
    const encryptedOrder = CryptoJS.AES.encrypt(JSON.stringify(cart), secretKey).toString();
    localStorage.setItem('orderData', encryptedOrder);
    clearCart();
    Show.Alert("Order processed successfully.");
  },
  
  loadOrder: () => {
    const encryptedOrder = localStorage.getItem('orderData');

    if (encryptedOrder) {
      try {
        const bytes = CryptoJS.AES.decrypt(encryptedOrder, secretKey);
        const decryptedOrder = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
        set({ theOrder: decryptedOrder }); // <-- update the store
        return decryptedOrder;
      } catch (e) {
        Show.Error("An error has occurred");
        return [];
      }
    }

    return [];
  },
  
  clearOrder: () => {
    localStorage.removeItem('orderData');
    set({ cart: [] });
  },




}));
