import { useEffect } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import { ToastProvider } from './context/ToastContext.jsx'
import { AuthProvider } from './context/AuthContext.jsx'
import { ShopProvider } from './context/ShopContext.jsx'
import { CartProvider } from './context/CartContext.jsx'
import Layout from './components/layout/Layout.jsx'
import Home from './pages/Home.jsx'
import Shop from './pages/Shop.jsx'
import Product from './pages/Product.jsx'
import Checkout from './pages/Checkout.jsx'
import Orders from './pages/Orders.jsx'
import Policy from './pages/Policy.jsx'
import NotFound from './pages/NotFound.jsx'

/** New page, new scroll position — except when only the ?query changes (shop filters). */
function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo({ top: 0 })
  }, [pathname])
  return null
}

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <ShopProvider>
          <CartProvider>
            <ScrollToTop />
            <Routes>
              <Route element={<Layout />}>
                <Route path="/" element={<Home />} />
                <Route path="/shop" element={<Shop />} />
                <Route path="/p/:slug" element={<Product />} />
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/orders" element={<Orders />} />
                <Route path="/policies/:page" element={<Policy />} />
                <Route path="*" element={<NotFound />} />
              </Route>
            </Routes>
          </CartProvider>
        </ShopProvider>
      </AuthProvider>
    </ToastProvider>
  )
}
