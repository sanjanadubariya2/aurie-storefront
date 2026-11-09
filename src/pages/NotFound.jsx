import { Link } from 'react-router-dom'
import Button from '../components/ui/Button.jsx'
import { useDocumentMeta } from '../hooks/useDocumentMeta.js'

export default function NotFound() {
  useDocumentMeta({ title: 'Page Not Found', description: 'This page does not exist on Aurie.', noindex: true })
  return (
    <div className="mx-auto max-w-md px-5 py-32 text-center">
      <h1 className="font-display text-[42px] leading-none text-soot">Nothing here</h1>
      <p className="mt-3 text-[15px] text-smoke">
        This page does not exist. The candles are all one level up.
      </p>
      <Button as={Link} to="/shop" className="mt-7">
        Go to the catalogue
      </Button>
    </div>
  )
}
