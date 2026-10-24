'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Menu, X } from 'lucide-react';

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 bg-gradient-to-b from-slate-950/95 to-slate-900/80 backdrop-blur border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center group-hover:shadow-lg group-hover:shadow-blue-500/50 transition-all">
              <span className="text-white font-bold text-lg">✓</span>
            </div>
            <span className="text-white font-bold text-xl hidden sm:inline bg-clip-text text-transparent bg-gradient-to-r from-white to-blue-200">
              SmartChoice
            </span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-8">
            <Link
              href="/#products-grid"
              className="text-gray-300 hover:text-white transition-colors font-medium"
            >
              Products
            </Link>
            <Link
              href="/collections"
              className="text-gray-300 hover:text-white transition-colors font-medium"
            >
              Collections
            </Link>
            <Link
              href="/compare"
              className="text-gray-300 hover:text-white transition-colors font-medium"
            >
              Compare
            </Link>
            <Link
              href="/#trust"
              className="text-gray-300 hover:text-white transition-colors font-medium"
            >
              Why Us
            </Link>
          </div>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-4">
            <Link
              href="/collections"
              className="px-6 py-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold rounded-lg transition-all transform hover:scale-105"
            >
              Shop Now
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            aria-label={isOpen ? "Close menu" : "Open menu"}
            className="md:hidden text-white p-2 hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden pb-4 border-t border-white/10">
            <div className="flex flex-col gap-3 pt-4">
              <Link
                href="/#products-grid"
                className="px-4 py-2 text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                onClick={() => setIsOpen(false)}
              >
                Products
              </Link>
              <Link
                href="/collections"
                className="px-4 py-2 text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                onClick={() => setIsOpen(false)}
              >
                Collections
              </Link>
              <Link
                href="/compare"
                className="px-4 py-2 text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                onClick={() => setIsOpen(false)}
              >
                Compare
              </Link>
              <Link
                href="/#trust"
                className="px-4 py-2 text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                onClick={() => setIsOpen(false)}
              >
                Why Us
              </Link>
              <Link
                href="/collections"
                className="mx-4 mt-2 px-6 py-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold rounded-lg transition-all text-center"
                onClick={() => setIsOpen(false)}
              >
                Shop Now
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
