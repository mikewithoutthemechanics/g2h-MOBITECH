import { useEffect } from 'react'
import { BrowserRouter, Route, Routes, useLocation } from 'react-router-dom'
import { CartProvider } from './lib/cart'
import { DeviceProvider } from './lib/device'
import { Nav } from './components/Nav'
import { Footer } from './components/Footer'
import { CartDrawer } from './components/CartDrawer'
import Home from './pages/Home'
import Shop from './pages/Shop'
import ProductPage from './pages/ProductPage'
import Fitment from './pages/Fitment'
import Checkout from './pages/Checkout'
import DesignSystem from './pages/DesignSystem'
import NotFound from './pages/NotFound'

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior })
  }, [pathname])
  return null
}

export default function App() {
  return (
    <BrowserRouter>
      <DeviceProvider>
        <CartProvider>
          <ScrollToTop />
          <a
            href="#main"
            className="label sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[80] focus:bg-amber focus:px-4 focus:py-3 focus:text-void"
          >
            Skip to content
          </a>
          <Nav />
          <main id="main">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/shop" element={<Shop />} />
              <Route path="/product/:id" element={<ProductPage />} />
              <Route path="/fitment" element={<Fitment />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/design-system" element={<DesignSystem />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
          <Footer />
          <CartDrawer />
        </CartProvider>
      </DeviceProvider>
    </BrowserRouter>
  )
}
