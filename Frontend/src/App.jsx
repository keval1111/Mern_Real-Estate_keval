import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Navbar from './assets/Components/navbar'
import Home from './assets/Pages/home'
import Bestseller from './assets/Pages/bestseller'
import Farmvilla from './assets/Pages/farmvilla'
import Properties from './assets/Pages/properties'
import RoyalHouse from './assets/Pages/royalhouse'
import About from './assets/Pages/about'
import Contact from './assets/Pages/contact'
import Blog from './assets/Pages/blog'
import Login from './assets/Pages/login'
import Register from './assets/Pages/register'
import Wishlist from './assets/Pages/wishlist'
import Cart from './assets/Pages/cart'
import ProductDetail from './assets/Pages/productDetail'
import CustomerDetails from './assets/Pages/CustomerDetails'
import Checkout from './assets/Pages/checkout'
import Footer from './assets/Components/footer'
import PageLoader from './assets/Components/PageLoader'
import { CartProvider } from './assets/Context/CartContext'
import { WishlistProvider } from './assets/Context/WishlistContext'
import { CustomerAuthProvider } from './assets/Context/CustomerAuthContext'
import CartDrawer from './assets/Components/CartDrawer'
import LiveChatWidget from './assets/Components/LiveChatWidget'
import './App.css'

function App() {
  return (
    <BrowserRouter>
      <CustomerAuthProvider>
        <WishlistProvider>
          <CartProvider>
            <PageLoader />
          <div className="bg-white min-h-screen font-sans flex flex-col w-full max-w-full overflow-x-hidden">
            <Navbar />
        <main className="flex-1 pt-[85px]">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/collections/bestseller" element={<Bestseller />} />
            <Route path="/collections/farm-vila" element={<Farmvilla />} />
            <Route path="/collections/farmvilla" element={<Farmvilla />} />
            <Route path="/collections/properties" element={<Properties />} />
            <Route path="/collections/royal-house" element={<RoyalHouse />} />
            <Route path="/collections/royalhouse" element={<RoyalHouse />} />
            <Route path="/pages/about-us" element={<About />} />
            <Route path="/about-us" element={<About />} />
            <Route path="/pages/contact-with-us" element={<Contact />} />
            <Route path="/contact-with-us" element={<Contact />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/pages/blog" element={<Blog />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/create-account" element={<Register />} />
            <Route path="/wishlist" element={<Wishlist />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/account" element={<CustomerDetails />} />
            <Route path="/customer-details" element={<CustomerDetails />} />
            <Route path="/orders" element={<CustomerDetails initialTab="orders" />} />
            <Route path="/order-tracking" element={<CustomerDetails initialTab="tracking" />} />
            <Route path="/saved-addresses" element={<CustomerDetails initialTab="addresses" />} />
            <Route path="/product/:slug" element={<ProductDetail />} />
            <Route path="/products/:slug" element={<ProductDetail />} />
          </Routes>
        </main>
        <Footer />
      </div>
      <CartDrawer />
      <LiveChatWidget />
        </CartProvider>
      </WishlistProvider>
      </CustomerAuthProvider>
    </BrowserRouter>
  )
}

export default App
