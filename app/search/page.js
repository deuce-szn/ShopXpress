"use client"
import React,{ Suspense } from 'react'
import dynamic from 'next/dynamic';

const ProductsContent = dynamic(() => import('@/Controllers/Search/Products'), {
  ssr: false // This ensures the component is not SSR'd
});

const page = () => {
  return (
    <Suspense fallback={
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
         
      </div>
  }>
      <ProductsContent/>
  </Suspense>
   
  )
}

export default page