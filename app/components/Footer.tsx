import Link from 'next/link'
import { Mail, Phone, MapPin, Instagram, Twitter } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-graky-charcoal dark:bg-dark-surface text-graky-cream dark:text-dark-text mt-20 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div>
            <h3 className="text-xl font-bold mb-4">GRAKY STORE</h3>
            <p className="text-sm text-graky-cream/70 dark:text-dark-text-muted">
              Jual beli vintage & thrifting terbaik untuk anak muda Indonesia.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/" className="hover:text-graky-tan dark:hover:text-graky-tan transition">
                  Home
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-graky-tan dark:hover:text-graky-tan transition">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-graky-tan dark:hover:text-graky-tan transition">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h4 className="font-semibold mb-4">Categories</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/kategori/topi" className="hover:text-graky-tan dark:hover:text-graky-tan transition">
                  Topi
                </Link>
              </li>
              <li>
                <Link href="/kategori/kaos" className="hover:text-graky-tan dark:hover:text-graky-tan transition">
                  Kaos
                </Link>
              </li>
              <li>
                <Link href="/kategori/jacket" className="hover:text-graky-tan dark:hover:text-graky-tan transition">
                  Jacket
                </Link>
              </li>
              <li>
                <Link href="/kategori/sepatu" className="hover:text-graky-tan dark:hover:text-graky-tan transition">
                  Sepatu
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold mb-4">Contact</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-2">
                <Phone size={16} />
                <span>+62 812-3456-7890</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail size={16} />
                <span>hello@grakystore.id</span>
              </li>
              <li className="flex items-center gap-2">
                <MapPin size={16} />
                <span>Jakarta, Indonesia</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Social Media & Copyright */}
        <div className="border-t border-graky-brown/20 dark:border-dark-border pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-graky-cream/60 dark:text-dark-text-muted">
            © 2024 Graky Store. All rights reserved.
          </p>
          <div className="flex gap-4 mt-4 md:mt-0">
            <a
              href="#"
              className="p-2 hover:bg-graky-brown/20 dark:hover:bg-dark-border rounded-full transition"
            >
              <Instagram size={18} />
            </a>
            <a
              href="#"
              className="p-2 hover:bg-graky-brown/20 dark:hover:bg-dark-border rounded-full transition"
            >
              <Twitter size={18} />
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
