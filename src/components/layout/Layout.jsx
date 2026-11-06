import { Outlet, useLocation } from 'react-router-dom'
import ErrorBoundary from '../ErrorBoundary.jsx'
import Header from './Header.jsx'
import Footer from './Footer.jsx'
import CartDrawer from '../cart/CartDrawer.jsx'
import AuthModal from '../auth/AuthModal.jsx'

export default function Layout() {
  const location = useLocation()
  return (
    <div className="flex min-h-screen flex-col">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[90] focus:rounded-full focus:bg-soot focus:px-4 focus:py-2 focus:text-wax"
      >
        Skip to content
      </a>
      <Header />
      <main id="main" className="flex-1">
        <ErrorBoundary resetKey={location.pathname}>
          <Outlet />
        </ErrorBoundary>
      </main>
      <Footer />
      <CartDrawer />
      <AuthModal />
    </div>
  )
}
