'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { Menu, X } from 'lucide-react';

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 bg-gradient-to-b from-slate-950/95 to-slate-900/80 backdrop-blur border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 sm:gap-3 group focus:outline-none" aria-label="SmartChoice Homepage">
            <div className="relative w-8 h-8 sm:w-10 sm:h-10 rounded-xl overflow-hidden border border-white/15 shadow-md shadow-blue-500/10 group-hover:shadow-blue-500/30 group-hover:border-blue-400/40 transition-all shrink-0">
              <Image
                src="/brand/logo-full.png"
                alt="SmartChoice Logo"
                fill
                sizes="(max-width: 640px) 32px, 40px"
                className="object-cover group-hover:scale-105 transition-transform duration-300"
                priority
              />
            </div>
            <span className="text-lg sm:text-2xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-blue-100 to-blue-400 group-hover:to-blue-300 transition-colors">
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
              href="/guides"
              className="text-gray-300 hover:text-white transition-colors font-medium"
            >
              Guides
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
                href="/guides"
                className="px-4 py-2 text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                onClick={() => setIsOpen(false)}
              >
                Guides
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
