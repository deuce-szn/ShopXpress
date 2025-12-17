/* eslint-disable @typescript-eslint/no-explicit-any */

import { prisma } from "@/prisma/PrismaClient";
import "dotenv/config";
import { NextRequest, NextResponse } from "next/server";
import fs from 'fs';
import path from 'path';
import { randomBytes } from 'crypto';
import {IdGenerator} from "../Helper.js";

// ---------------------------------------------------
// 🧩 Helper Functions
// ---------------------------------------------------

function generateId(prefix: string = 'id'): string {
  return `${prefix}_${randomBytes(16).toString('hex')}`;
}

async function saveFile(file: File, folder: string): Promise<string | null> {
  try {
    if (!file || !(file instanceof File) || file.size === 0) {
      return null;
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      throw new Error(`File size must be less than ${maxSize / 1024 / 1024}MB`);
    }

    // Validate image types
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
    if (file.type.startsWith('image/') && !allowedTypes.includes(file.type)) {
      throw new Error('Invalid image format. Allowed: JPEG, PNG, GIF, WebP, SVG');
    }

    // Generate filename
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 10);
    const originalName = file.name.replace(/[^a-zA-Z0-9.]/g, '_');
    const fileExtension = file.type.split('/')[1] || originalName.split('.').pop() || 'bin';
    const fileName = `${folder}_${timestamp}_${randomString}.${fileExtension}`;

    // Setup upload directory
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', folder);
    
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    
    // Save file
    const buffer = Buffer.from(await file.arrayBuffer());
    const filePath = path.join(uploadDir, fileName);
    fs.writeFileSync(filePath, buffer);
    
    return `/uploads/${folder}/${fileName}`;
  } catch (error) {
    console.error('Error saving file:', error);
    return null;
  }
}

function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// ---------------------------------------------------
// 🧩 POST Method — Action-Based Handler
// ---------------------------------------------------

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const formData = await request.formData();
    const action = formData.get('action') as string;
    
    if (!action) {
      return NextResponse.json(
        { success: false, message: "Action parameter is required", status: 400 },
        { status: 400 }
      );
    }

    let result;

    switch (action.toLowerCase()) {
      case 'createuser':
        result = await handleCreateUser(formData);
        break;
      case 'updateuser':
        result = await handleUpdateUser(formData);
        break;
      case 'deleteuser':
        result = await handleDeleteUser(formData);
        break;
      case 'getuser':
        result = await handleGetUser(formData);
        break;
      case 'createcategory':
        result = await handleCreateCategory(formData);
        break;
      case 'updatecategory':
        result = await handleUpdateCategory(formData);
        break;
      case 'deletecategory':
        result = await handleDeleteCategory(formData);
        break;
      case 'getcategories':
        result = await handleGetCategories(formData);
        break;
      case 'createproduct':
        result = await handleCreateProduct(formData);
        break;
      case 'updateproduct':
        result = await handleUpdateProduct(formData);
        break;
      case 'deleteproduct':
        result = await handleDeleteProduct(formData);
        break;
      case 'getproducts':
        result = await handleGetProducts(formData);
        break;
      case 'createorder':
        result = await handleCreateOrder(formData);
        break;
      case 'updateorder':
        result = await handleUpdateOrder(formData);
        break;
      case 'getorders':
        result = await handleGetOrders(formData);
        break;
      case 'createpayment':
        result = await handleCreatePayment(formData);
        break;
      case 'updatepayment':
        result = await handleUpdatePayment(formData);
        break;
      case 'createbagging':
        result = await handleCreateBagging(formData);
        break;
      case 'updatedelivery':
        result = await handleUpdateDelivery(formData);
        break;
      case 'bulkcreate':
        result = await handleBulkCreate(formData);
        break;
      case 'search':
        result = await handleSearch(formData);
        break;
      default:
        return NextResponse.json(
          { success: false, message: "Unknown action", status: 400 },
          { status: 400 }
        );
    }

    return NextResponse.json(result, { status: result.status });
  } catch (error) {
    console.error('POST Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json(
      { success: false, message: errorMessage, status: 500 },
      { status: 500 }
    );
  }
}

// ---------------------------------------------------
// 🧩 User Handlers
// ---------------------------------------------------

async function handleCreateUser(formData: FormData) {
  try {
    const email = formData.get('email') as string;
    const name = formData.get('name') as string;
    const password = formData.get('password') as string;
    const userRole = formData.get('userRole') as string || 'customer';
    const gRole = formData.get('gRole') as string || 'user';
    const profilePic = formData.get('profilePic') as File;

    // Validation
    if (!email || !validateEmail(email)) {
      return { success: false, message: 'Valid email is required', status: 400 };
    }

    // Check if user already exists
    const existingUser = await prisma.users.findUnique({
      where: { email }
    });

    if (existingUser) {
      return { success: false, message: 'User with this email already exists', status: 409 };
    }

    // Handle profile picture upload
    let profilePicPath: string | null = null;
    if (profilePic) {
      profilePicPath = await saveFile(profilePic, 'users');
    }

    // Create user
    const userId = IdGenerator();
    const newUser = await prisma.users.create({
      data: {
        email,
        name: name || null,
        UserId: userId,
        ProfilePic: profilePicPath,
        Password: password ? Buffer.from(password).toString('base64') : null,
        UserRole: userRole,
        GRole: gRole
      }
    });

    // Remove sensitive data from response
    const { Password, Token, ...safeUser } = newUser;

    return {
      success: true,
      message: 'User created successfully',
      data: safeUser,
      status: 201
    };
  } catch (error:any ) {
    console.error('Create user error:', error);
    
    if (error.code === 'P2002') {
      return { success: false, message: 'User already exists', status: 409 };
    }
    
    return { success: false, message: 'Failed to create user', status: 500 };
  }
}

async function handleUpdateUser(formData: FormData) {
  try {
    const userId = formData.get('userId') as string;
    const email = formData.get('email') as string;
    const name = formData.get('name') as string;
    const password = formData.get('password') as string;
    const userRole = formData.get('userRole') as string;
    const gRole = formData.get('gRole') as string;
    const profilePic = formData.get('profilePic') as File;

    if (!userId) {
      return { success: false, message: 'User ID is required', status: 400 };
    }

    // Check if user exists
    const existingUser = await prisma.users.findUnique({
      where: { UserId: userId }
    });

    if (!existingUser) {
      return { success: false, message: 'User not found', status: 404 };
    }

    // Prepare update data
    const updateData: any = {};
    if (email && validateEmail(email)) updateData.email = email;
    if (name) updateData.name = name;
    if (password) updateData.Password = Buffer.from(password).toString('base64');
    if (userRole) updateData.UserRole = userRole;
    if (gRole) updateData.GRole = gRole;

    // Handle profile picture upload
    if (profilePic) {
      const profilePicPath = await saveFile(profilePic, 'users');
      if (profilePicPath) {
        updateData.ProfilePic = profilePicPath;
      }
    }

    // Update user
    const updatedUser = await prisma.users.update({
      where: { UserId: userId },
      data: updateData
    });

    // Remove sensitive data from response
    const { Password, Token, ...safeUser } = updatedUser;

    return {
      success: true,
      message: 'User updated successfully',
      data: safeUser,
      status: 200
    };
  } catch (error: any) {
    console.error('Update user error:', error);
    
    if (error.code === 'P2025') {
      return { success: false, message: 'User not found', status: 404 };
    }
    
    if (error.code === 'P2002') {
      return { success: false, message: 'Email already in use', status: 409 };
    }
    
    return { success: false, message: 'Failed to update user', status: 500 };
  }
}

async function handleDeleteUser(formData: FormData) {
  try {
    const userId = formData.get('userId') as string;

    if (!userId) {
      return { success: false, message: 'User ID is required', status: 400 };
    }

    // Check if user exists
    const existingUser = await prisma.users.findUnique({
      where: { UserId: userId }
    });

    if (!existingUser) {
      return { success: false, message: 'User not found', status: 404 };
    }

    // Delete user
    await prisma.users.delete({
      where: { UserId: userId }
    });

    return {
      success: true,
      message: 'User deleted successfully',
      data: null,
      status: 200
    };
  } catch (error: any) {
    console.error('Delete user error:', error);
    
    if (error.code === 'P2025') {
      return { success: false, message: 'User not found', status: 404 };
    }
    
    return { success: false, message: 'Failed to delete user', status: 500 };
  }
}

async function handleGetUser(formData: FormData) {
  try {
    const userId = formData.get('userId') as string;
    const email = formData.get('email') as string;

    if (!userId && !email) {
      return { success: false, message: 'User ID or Email is required', status: 400 };
    }

    let user;
    if (userId) {
      user = await prisma.users.findUnique({
        where: { UserId: userId }
      });
    } else if (email) {
      user = await prisma.users.findUnique({
        where: { email }
      });
    }

    if (!user) {
      return { success: false, message: 'User not found', status: 404 };
    }

    // Remove sensitive data from response
    const { Password, Token, ...safeUser } = user;

    return {
      success: true,
      message: 'User retrieved successfully',
      data: safeUser,
      status: 200
    };
  } catch (error) {
    console.error('Get user error:', error);
    return { success: false, message: 'Failed to retrieve user', status: 500 };
  }
}

// ---------------------------------------------------
// 🧩 Category Handlers
// ---------------------------------------------------

async function handleCreateCategory(formData: FormData) {
  try {
    const name = formData.get('name') as string;
    const categoryImage = formData.get('categoryImage') as File;

    if (!name) {
      return { success: false, message: 'Category name is required', status: 400 };
    }

    // Check if category already exists
    const existingCategory = await prisma.category.findUnique({
      where: { name }
    });

    if (existingCategory) {
      return { success: false, message: 'Category with this name already exists', status: 409 };
    }

    // Handle category image upload
    let categoryImagePath: string | null = null;
    if (categoryImage) {
      categoryImagePath = await saveFile(categoryImage, 'categories');
    }

    // Create category
    const categoryId = generateId('cat');
    const newCategory = await prisma.category.create({
      data: {
        name,
        categoryId,
        categoryImage: categoryImagePath
      }
    });

    return {
      success: true,
      message: 'Category created successfully',
      data: newCategory,
      status: 201
    };
  } catch (error: any) {
    console.error('Create category error:', error);
    
    if (error.code === 'P2002') {
      return { success: false, message: 'Category already exists', status: 409 };
    }
    
    return { success: false, message: 'Failed to create category', status: 500 };
  }
}

async function handleUpdateCategory(formData: FormData) {
  try {
    const categoryId = formData.get('categoryId') as string;
    const name = formData.get('name') as string;
    const categoryImage = formData.get('categoryImage') as File;

    if (!categoryId) {
      return { success: false, message: 'Category ID is required', status: 400 };
    }

    // Check if category exists
    const existingCategory = await prisma.category.findUnique({
      where: { categoryId }
    });

    if (!existingCategory) {
      return { success: false, message: 'Category not found', status: 404 };
    }

    // Prepare update data
    const updateData: any = {};
    if (name) updateData.name = name;

    // Handle category image upload
    if (categoryImage) {
      const categoryImagePath = await saveFile(categoryImage, 'categories');
      if (categoryImagePath) {
        updateData.categoryImage = categoryImagePath;
      }
    }

    // Update category
    const updatedCategory = await prisma.category.update({
      where: { categoryId },
      data: updateData
    });

    return {
      success: true,
      message: 'Category updated successfully',
      data: updatedCategory,
      status: 200
    };
  } catch (error: any) {
    console.error('Update category error:', error);
    
    if (error.code === 'P2025') {
      return { success: false, message: 'Category not found', status: 404 };
    }
    
    if (error.code === 'P2002') {
      return { success: false, message: 'Category name already exists', status: 409 };
    }
    
    return { success: false, message: 'Failed to update category', status: 500 };
  }
}

async function handleDeleteCategory(formData: FormData) {
  try {
    const categoryId = formData.get('categoryId') as string;

    if (!categoryId) {
      return { success: false, message: 'Category ID is required', status: 400 };
    }

    // Check if category exists and has no products
    const categoryWithProducts = await prisma.category.findUnique({
      where: { categoryId },
      include: { products: true }
    });

    if (!categoryWithProducts) {
      return { success: false, message: 'Category not found', status: 404 };
    }

    if (categoryWithProducts.products.length > 0) {
      return { success: false, message: 'Cannot delete category with existing products', status: 400 };
    }

    // Delete category
    await prisma.category.delete({
      where: { categoryId }
    });

    return {
      success: true,
      message: 'Category deleted successfully',
      data: null,
      status: 200
    };
  } catch (error: any) {
    console.error('Delete category error:', error);
    
    if (error.code === 'P2025') {
      return { success: false, message: 'Category not found', status: 404 };
    }
    
    return { success: false, message: 'Failed to delete category', status: 500 };
  }
}

async function handleGetCategories(formData: FormData) {
  try {
    const withProducts = formData.get('withProducts') === 'true';
    
    const categories = await prisma.category.findMany({
      include: {
        products: withProducts
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return {
      success: true,
      message: 'Categories retrieved successfully',
      data: categories,
      status: 200
    };
  } catch (error) {
    console.error('Get categories error:', error);
    return { success: false, message: 'Failed to retrieve categories', status: 500 };
  }
}

// ---------------------------------------------------
// 🧩 Product Handlers
// ---------------------------------------------------

async function handleCreateProduct(formData: FormData) {
  try {
    const productName = formData.get('productName') as string;
    const productDescription = formData.get('productDescription') as string;
    const productPrice = parseFloat(formData.get('productPrice') as string);
    const categoryId = formData.get('categoryId') as string;
    const productImage = formData.get('productImage') as File;

    // Validation
    if (!productName) {
      return { success: false, message: 'Product name is required', status: 400 };
    }

    if (!productPrice || isNaN(productPrice) || productPrice <= 0) {
      return { success: false, message: 'Valid product price is required', status: 400 };
    }

    if (!categoryId) {
      return { success: false, message: 'Category ID is required', status: 400 };
    }

    // Check if category exists
    const category = await prisma.category.findUnique({
      where: { categoryId }
    });

    if (!category) {
      return { success: false, message: 'Category not found', status: 404 };
    }

    // Handle product image upload
    let productImagePath: string | null = null;
    if (productImage) {
      productImagePath = await saveFile(productImage, 'products');
    }

    // Create product
    const newProduct = await prisma.products.create({
      data: {
        productName,
        productDescription: productDescription || null,
        productPrice,
        categoryId,
        productImage: productImagePath
      },
      include: {
        Category: true
      }
    });

    return {
      success: true,
      message: 'Product created successfully',
      data: newProduct,
      status: 201
    };
  } catch (error: any) {
    console.error('Create product error:', error);
    
    if (error.code === 'P2003') {
      return { success: false, message: 'Invalid category ID', status: 400 };
    }
    
    return { success: false, message: 'Failed to create product', status: 500 };
  }
}

async function handleUpdateProduct(formData: FormData) {
  try {
    const productId = parseInt(formData.get('productId') as string);
    const productName = formData.get('productName') as string;
    const productDescription = formData.get('productDescription') as string;
    const productPrice = formData.get('productPrice') as string;
    const categoryId = formData.get('categoryId') as string;
    const productImage = formData.get('productImage') as File;

    if (!productId || isNaN(productId)) {
      return { success: false, message: 'Valid product ID is required', status: 400 };
    }

    // Check if product exists
    const existingProduct = await prisma.products.findUnique({
      where: { id: productId }
    });

    if (!existingProduct) {
      return { success: false, message: 'Product not found', status: 404 };
    }

    // Prepare update data
    const updateData: any = {};
    if (productName) updateData.productName = productName;
    if (productDescription) updateData.productDescription = productDescription;
    if (productPrice) {
      const price = parseFloat(productPrice);
      if (!isNaN(price) && price > 0) {
        updateData.productPrice = price;
      }
    }
    if (categoryId) updateData.categoryId = categoryId;

    // Handle product image upload
    if (productImage) {
      const productImagePath = await saveFile(productImage, 'products');
      if (productImagePath) {
        updateData.productImage = productImagePath;
      }
    }

    // Update product
    const updatedProduct = await prisma.products.update({
      where: { id: productId },
      data: updateData,
      include: {
        Category: true
      }
    });

    return {
      success: true,
      message: 'Product updated successfully',
      data: updatedProduct,
      status: 200
    };
  } catch (error: any) {
    console.error('Update product error:', error);
    
    if (error.code === 'P2025') {
      return { success: false, message: 'Product not found', status: 404 };
    }
    
    if (error.code === 'P2003') {
      return { success: false, message: 'Invalid category ID', status: 400 };
    }
    
    return { success: false, message: 'Failed to update product', status: 500 };
  }
}

async function handleDeleteProduct(formData: FormData) {
  try {
    const productId = parseInt(formData.get('productId') as string);

    if (!productId || isNaN(productId)) {
      return { success: false, message: 'Valid product ID is required', status: 400 };
    }

    // Check if product exists
    const existingProduct = await prisma.products.findUnique({
      where: { id: productId }
    });

    if (!existingProduct) {
      return { success: false, message: 'Product not found', status: 404 };
    }

    // Delete product
    await prisma.products.delete({
      where: { id: productId }
    });

    return {
      success: true,
      message: 'Product deleted successfully',
      data: null,
      status: 200
    };
  } catch (error: any) {
    console.error('Delete product error:', error);
    
    if (error.code === 'P2025') {
      return { success: false, message: 'Product not found', status: 404 };
    }
    
    return { success: false, message: 'Failed to delete product', status: 500 };
  }
}

async function handleGetProducts(formData: FormData) {
  try {
    const categoryId = formData.get('categoryId') as string;
    const minPrice = parseFloat(formData.get('minPrice') as string);
    const maxPrice = parseFloat(formData.get('maxPrice') as string);
    const search = formData.get('search') as string;
    const page = parseInt(formData.get('page') as string) || 1;
    const limit = parseInt(formData.get('limit') as string) || 20;
    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};
    
    if (categoryId) {
      where.categoryId = categoryId;
    }
    
    if (!isNaN(minPrice) || !isNaN(maxPrice)) {
      where.productPrice = {};
      if (!isNaN(minPrice)) where.productPrice.gte = minPrice;
      if (!isNaN(maxPrice)) where.productPrice.lte = maxPrice;
    }
    
    if (search) {
      where.OR = [
        { productName: { contains: search, mode: 'insensitive' } },
        { productDescription: { contains: search, mode: 'insensitive' } }
      ];
    }

    // Get products with pagination
    const [products, total] = await Promise.all([
      prisma.products.findMany({
        where,
        include: {
          Category: true
        },
        orderBy: {
          createdAt: 'desc'
        },
        skip,
        take: limit
      }),
      prisma.products.count({ where })
    ]);

    return {
      success: true,
      message: 'Products retrieved successfully',
      data: {
        products,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
          hasNext: page * limit < total,
          hasPrev: page > 1
        }
      },
      status: 200
    };
  } catch (error) {
    console.error('Get products error:', error);
    return { success: false, message: 'Failed to retrieve products', status: 500 };
  }
}

// ---------------------------------------------------
// 🧩 Order Handlers
// ---------------------------------------------------

async function handleCreateOrder(formData: FormData) {
  try {
    const userId = formData.get('userId') as string;
    const productsJson = formData.get('products') as string;
    const quantity = parseInt(formData.get('quantity') as string);
    const totalPrice = parseFloat(formData.get('totalPrice') as string);
    const orderStatus = formData.get('orderStatus') as string || 'pending';

    // Validation
    if (!userId) {
      return { success: false, message: 'User ID is required', status: 400 };
    }

    if (!productsJson) {
      return { success: false, message: 'Products are required', status: 400 };
    }

    let products;
    try {
      products = JSON.parse(productsJson);
    } catch (e) {
      return { success: false, message: 'Invalid products JSON format', status: 400 };
    }

    if (!quantity || quantity <= 0) {
      return { success: false, message: 'Valid quantity is required', status: 400 };
    }

    if (!totalPrice || totalPrice <= 0) {
      return { success: false, message: 'Valid total price is required', status: 400 };
    }

    // Check if user exists
    const user = await prisma.users.findUnique({
      where: { UserId: userId }
    });

    if (!user) {
      return { success: false, message: 'User not found', status: 404 };
    }

    // Create order
    const orderId = generateId('ord');
    const newOrder = await prisma.orders.create({
      data: {
        orderId,
        userId,
        products,
        quantity,
        totalPrice,
        orderStatus
      }
    });

    return {
      success: true,
      message: 'Order created successfully',
      data: newOrder,
      status: 201
    };
  } catch (error: any) {
    console.error('Create order error:', error);
    return { success: false, message: 'Failed to create order', status: 500 };
  }
}

async function handleUpdateOrder(formData: FormData) {
  try {
    const orderId = formData.get('orderId') as string;
    const orderStatus = formData.get('orderStatus') as string;

    if (!orderId) {
      return { success: false, message: 'Order ID is required', status: 400 };
    }

    if (!orderStatus) {
      return { success: false, message: 'Order status is required', status: 400 };
    }

    // Check if order exists
    const existingOrder = await prisma.orders.findUnique({
      where: { orderId }
    });

    if (!existingOrder) {
      return { success: false, message: 'Order not found', status: 404 };
    }

    // Update order
    const updatedOrder = await prisma.orders.update({
      where: { orderId },
      data: { orderStatus }
    });

    return {
      success: true,
      message: 'Order updated successfully',
      data: updatedOrder,
      status: 200
    };
  } catch (error: any) {
    console.error('Update order error:', error);
    
    if (error.code === 'P2025') {
      return { success: false, message: 'Order not found', status: 404 };
    }
    
    return { success: false, message: 'Failed to update order', status: 500 };
  }
}

async function handleGetOrders(formData: FormData) {
  try {
    const userId = formData.get('userId') as string;
    const orderStatus = formData.get('orderStatus') as string;
    const startDate = formData.get('startDate') as string;
    const endDate = formData.get('endDate') as string;
    const page = parseInt(formData.get('page') as string) || 1;
    const limit = parseInt(formData.get('limit') as string) || 20;
    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};
    
    if (userId) {
      where.userId = userId;
    }
    
    if (orderStatus) {
      where.orderStatus = orderStatus;
    }
    
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) where.createdAt.lte = new Date(endDate);
    }

    // Get orders with pagination
    const [orders, total] = await Promise.all([
      prisma.orders.findMany({
        where,
        orderBy: {
          createdAt: 'desc'
        },
        skip,
        take: limit
      }),
      prisma.orders.count({ where })
    ]);

    return {
      success: true,
      message: 'Orders retrieved successfully',
      data: {
        orders,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
          hasNext: page * limit < total,
          hasPrev: page > 1
        }
      },
      status: 200
    };
  } catch (error) {
    console.error('Get orders error:', error);
    return { success: false, message: 'Failed to retrieve orders', status: 500 };
  }
}

// ---------------------------------------------------
// 🧩 Payment Handler
// ---------------------------------------------------

async function handleCreatePayment(formData: FormData) {
  try {
    const orderId = formData.get('orderId') as string;
    const userId = formData.get('userId') as string;
    const amount = parseFloat(formData.get('amount') as string);
    const paymentMethod = formData.get('paymentMethod') as string;
    const paymentStatus = formData.get('paymentStatus') as string || 'pending';

    // Validation
    if (!orderId) {
      return { success: false, message: 'Order ID is required', status: 400 };
    }

    if (!userId) {
      return { success: false, message: 'User ID is required', status: 400 };
    }

    if (!amount || amount <= 0) {
      return { success: false, message: 'Valid amount is required', status: 400 };
    }

    if (!paymentMethod) {
      return { success: false, message: 'Payment method is required', status: 400 };
    }

    // Check if order exists
    const order = await prisma.orders.findUnique({
      where: { orderId }
    });

    if (!order) {
      return { success: false, message: 'Order not found', status: 404 };
    }

    // Check if user exists
    const user = await prisma.users.findUnique({
      where: { UserId: userId }
    });

    if (!user) {
      return { success: false, message: 'User not found', status: 404 };
    }

    // Create payment
    const paymentId = generateId('pay');
    const newPayment = await prisma.payments.create({
      data: {
        paymentId,
        orderId,
        userId,
        amount,
        paymentMethod,
        paymentStatus
      }
    });

    return {
      success: true,
      message: 'Payment created successfully',
      data: newPayment,
      status: 201
    };
  } catch (error: any) {
    console.error('Create payment error:', error);
    return { success: false, message: 'Failed to create payment', status: 500 };
  }
}

async function handleUpdatePayment(formData: FormData) {
  try {
    const paymentId = formData.get('paymentId') as string;
    const paymentStatus = formData.get('paymentStatus') as string;

    if (!paymentId) {
      return { success: false, message: 'Payment ID is required', status: 400 };
    }

    if (!paymentStatus) {
      return { success: false, message: 'Payment status is required', status: 400 };
    }

    // Check if payment exists
    const existingPayment = await prisma.payments.findUnique({
      where: { paymentId }
    });

    if (!existingPayment) {
      return { success: false, message: 'Payment not found', status: 404 };
    }

    // Update payment
    const updatedPayment = await prisma.payments.update({
      where: { paymentId },
      data: { paymentStatus }
    });

    return {
      success: true,
      message: 'Payment updated successfully',
      data: updatedPayment,
      status: 200
    };
  } catch (error: any) {
    console.error('Update payment error:', error);
    
    if (error.code === 'P2025') {
      return { success: false, message: 'Payment not found', status: 404 };
    }
    
    return { success: false, message: 'Failed to update payment', status: 500 };
  }
}

// ---------------------------------------------------
// 🧩 Bagging Handler
// ---------------------------------------------------

async function handleCreateBagging(formData: FormData) {
  try {
    const customerId = formData.get('customerId') as string;
    const baggerId = formData.get('baggerId') as string;
    const productsJson = formData.get('products') as string;
    const totalItems = parseInt(formData.get('totalItems') as string);
    const totalPrice = parseFloat(formData.get('totalPrice') as string);

    // Validation
    if (!customerId) {
      return { success: false, message: 'Customer ID is required', status: 400 };
    }

    if (!baggerId) {
      return { success: false, message: 'Bagger ID is required', status: 400 };
    }

    if (!productsJson) {
      return { success: false, message: 'Products are required', status: 400 };
    }

    let products;
    try {
      products = JSON.parse(productsJson);
    } catch (e) {
      return { success: false, message: 'Invalid products JSON format', status: 400 };
    }

    if (!totalItems || totalItems <= 0) {
      return { success: false, message: 'Valid total items is required', status: 400 };
    }

    if (!totalPrice || totalPrice <= 0) {
      return { success: false, message: 'Valid total price is required', status: 400 };
    }

    // Create bagging
    const bagId = generateId('bag');
    const newBagging = await prisma.bagging.create({
      data: {
        bagId,
        CustomerId: customerId,
        BaggerId: baggerId,
        products,
        totalItems,
        totalPrice
      }
    });

    return {
      success: true,
      message: 'Bagging created successfully',
      data: newBagging,
      status: 201
    };
  } catch (error: any) {
    console.error('Create bagging error:', error);
    return { success: false, message: 'Failed to create bagging', status: 500 };
  }
}

// ---------------------------------------------------
// 🧩 Delivery Handler
// ---------------------------------------------------

async function handleUpdateDelivery(formData: FormData) {
  try {
    const deliveryId = formData.get('deliveryId') as string;
    const deliveryStatus = formData.get('deliveryStatus') as string;

    if (!deliveryId) {
      return { success: false, message: 'Delivery ID is required', status: 400 };
    }

    if (!deliveryStatus) {
      return { success: false, message: 'Delivery status is required', status: 400 };
    }

    // Check if delivery exists
    const existingDelivery = await prisma.delivery.findUnique({
      where: { deliveryId }
    });

    if (!existingDelivery) {
      return { success: false, message: 'Delivery not found', status: 404 };
    }

    // Update delivery
    const updatedDelivery = await prisma.delivery.update({
      where: { deliveryId },
      data: { deliveryStatus }
    });

    return {
      success: true,
      message: 'Delivery updated successfully',
      data: updatedDelivery,
      status: 200
    };
  } catch (error: any) {
    console.error('Update delivery error:', error);
    
    if (error.code === 'P2025') {
      return { success: false, message: 'Delivery not found', status: 404 };
    }
    
    return { success: false, message: 'Failed to update delivery', status: 500 };
  }
}

// ---------------------------------------------------
// 🧩 Bulk Operations
// ---------------------------------------------------

async function handleBulkCreate(formData: FormData) {
  try {
    const entity = formData.get('entity') as string;
    const dataJson = formData.get('data') as string;

    if (!entity || !dataJson) {
      return { success: false, message: 'Entity and data are required', status: 400 };
    }

    let data;
    try {
      data = JSON.parse(dataJson);
    } catch (e) {
      return { success: false, message: 'Invalid data JSON format', status: 400 };
    }

    if (!Array.isArray(data)) {
      return { success: false, message: 'Data must be an array', status: 400 };
    }

    let result;
    switch (entity.toLowerCase()) {
      case 'products':
        // Add categoryId to each product if not provided
        const categoryId = formData.get('categoryId') as string;
        if (categoryId) {
          data = data.map(product => ({
            ...product,
            categoryId: product.categoryId || categoryId
          }));
        }
        result = await prisma.products.createMany({ data });
        break;
      case 'categories':
        result = await prisma.category.createMany({ data });
        break;
      case 'users':
        // Hash passwords before creating users
        data = data.map(user => ({
          ...user,
          Password: user.Password ? Buffer.from(user.Password).toString('base64') : null
        }));
        result = await prisma.users.createMany({ data });
        break;
      default:
        return { success: false, message: `Bulk create not supported for entity: ${entity}`, status: 400 };
    }

    return {
      success: true,
      message: `Bulk ${entity} created successfully`,
      data: result,
      status: 201
    };
  } catch (error: any) {
    console.error('Bulk create error:', error);
    return { success: false, message: 'Failed to perform bulk create', status: 500 };
  }
}

// ---------------------------------------------------
// 🧩 Search Handler
// ---------------------------------------------------

async function handleSearch(formData: FormData) {
  try {
    const query = formData.get('query') as string;
    const entity = formData.get('entity') as string || 'all';
    const limit = parseInt(formData.get('limit') as string) || 10;

    if (!query) {
      return { success: false, message: 'Search query is required', status: 400 };
    }

    // Convert query to lowercase for case-insensitive search
    const searchQuery = query.toLowerCase();
    const searchResults: any = {};

    if (entity === 'all' || entity === 'products') {
      const products = await prisma.products.findMany({
        where: {
          OR: [
            { 
              productName: { 
                contains: searchQuery  // Use lowercase query
              } 
            },
            { 
              productDescription: { 
                contains: searchQuery  // Use lowercase query
              } 
            }
          ]
        },
        include: { Category: true },
        take: limit
      });
      searchResults.products = products;
    }

    if (entity === 'all' || entity === 'categories') {
      const categories = await prisma.category.findMany({
        where: {
          name: { 
            contains: searchQuery  // Use lowercase query
          }
        },
        take: limit
      });
      searchResults.categories = categories;
    }

    if (entity === 'all' || entity === 'users') {
      const users = await prisma.users.findMany({
        where: {
          OR: [
            { 
              email: { 
                contains: searchQuery  // Use lowercase query
              } 
            },
            { 
              name: { 
                contains: searchQuery  // Use lowercase query
              } 
            }
          ]
        },
        select: {
          id: true,
          email: true,
          UserId: true,
          name: true,
          ProfilePic: true,
          UserRole: true,
          GRole: true,
          createdAt: true
        },
        take: limit
      });
      searchResults.users = users;
    }

    return {
      success: true,
      message: 'Search completed successfully',
      data: searchResults,
      status: 200
    };
  } catch (error) {
    console.error('Search error:', error);
    return { success: false, message: 'Failed to perform search', status: 500 };
  }
}

// ---------------------------------------------------
// 🧩 GET Method for simple retrievals
// ---------------------------------------------------

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url);
    const entity = searchParams.get('entity');
    const id = searchParams.get('id');

    if (!entity) {
      return NextResponse.json(
        { success: false, message: 'Entity parameter is required', status: 400 },
        { status: 400 }
      );
    }

    let result;

    switch (entity.toLowerCase()) {
      case 'users':
        if (id) {
          const user = await prisma.users.findUnique({
            where: { UserId: id },
            select: {
              id: true,
              email: true,
              UserId: true,
              name: true,
              ProfilePic: true,
              UserRole: true,
              GRole: true,
              createdAt: true,
              updatedAt: true
            }
          });
          result = user 
            ? { success: true, message: 'User retrieved successfully', data: user, status: 200 }
            : { success: false, message: 'User not found', status: 404 };
        } else {
          const users = await prisma.users.findMany({
            select: {
              id: true,
              email: true,
              UserId: true,
              name: true,
              ProfilePic: true,
              UserRole: true,
              GRole: true,
              createdAt: true,
              updatedAt: true
            },
            orderBy: { createdAt: 'desc' }
          });
          result = { success: true, message: 'Users retrieved successfully', data: users, status: 200 };
        }
        break;

      case 'categories':
        if (id) {
          const category = await prisma.category.findUnique({
            where: { categoryId: id },
            include: { products: true }
          });
          result = category 
            ? { success: true, message: 'Category retrieved successfully', data: category, status: 200 }
            : { success: false, message: 'Category not found', status: 404 };
        } else {
          const categories = await prisma.category.findMany({
            include: { products: true },
            orderBy: { createdAt: 'desc' }
          });
          result = { success: true, message: 'Categories retrieved successfully', data: categories, status: 200 };
        }
        break;

      case 'products':
        if (id) {
          const product = await prisma.products.findUnique({
            where: { id: parseInt(id) },
            include: { Category: true }
          });
          result = product 
            ? { success: true, message: 'Product retrieved successfully', data: product, status: 200 }
            : { success: false, message: 'Product not found', status: 404 };
        } else {
          const products = await prisma.products.findMany({
            include: { Category: true },
            orderBy: { createdAt: 'desc' },
            take: 100
          });
          result = { success: true, message: 'Products retrieved successfully', data: products, status: 200 };
        }
        break;

      case 'orders':
        if (id) {
          const order = await prisma.orders.findUnique({
            where: { orderId: id }
          });
          result = order 
            ? { success: true, message: 'Order retrieved successfully', data: order, status: 200 }
            : { success: false, message: 'Order not found', status: 404 };
        } else {
          const orders = await prisma.orders.findMany({
            orderBy: { createdAt: 'desc' },
            take: 50
          });
          result = { success: true, message: 'Orders retrieved successfully', data: orders, status: 200 };
        }
        break;

      default:
        result = { success: false, message: `Invalid entity: ${entity}`, status: 400 };
    }

    return NextResponse.json(result, { status: result.status });
  } catch (error) {
    console.error('GET Error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error', status: 500 },
      { status: 500 }
    );
  }
}