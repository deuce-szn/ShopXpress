"use client"
import React from 'react'
import dynamic from 'next/dynamic';

const ProductsContent = dynamic(() => import('@/Controllers/Products/Products'), {
  ssr: false // This ensures the component is not SSR'd
});

const page = () => {
  return (
    <div><ProductsContent/></div>
  )
}

export default page