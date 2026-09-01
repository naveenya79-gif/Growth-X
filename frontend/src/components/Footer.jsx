import React from 'react';
import { Link } from 'react-router-dom';
import {
  FaStore,
  FaPhoneAlt,
  FaEnvelope,
  FaMapMarkerAlt,
  FaFacebookF,
  FaTwitter,
  FaInstagram,
  FaLinkedinIn,
  FaShieldAlt,
  FaTruck,
  FaUndo,
  FaHeadset,
  FaCreditCard
} from 'react-icons/fa';

const Footer = () => {
  return (
    <footer className="bg-[#F4F9FF] border-t border-[#E5EAF0] text-[#172033] mt-auto">
      {/* Top Value Proposition Badges */}
      <div className="border-b border-[#E5EAF0] py-8 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="flex items-center space-x-4 p-4 rounded-2xl bg-[#F4F9FF] border border-[#E5EAF0]">
              <div className="w-12 h-12 rounded-xl bg-[#E8F3FF] text-[#2878D8] flex items-center justify-center text-xl flex-shrink-0">
                <FaTruck />
              </div>
              <div>
                <h4 className="text-sm font-bold text-[#172033]">Free Shipping</h4>
                <p className="text-xs text-[#667085]">On orders over $50</p>
              </div>
            </div>

            <div className="flex items-center space-x-4 p-4 rounded-2xl bg-[#F4F9FF] border border-[#E5EAF0]">
              <div className="w-12 h-12 rounded-xl bg-[#E8F3FF] text-[#2878D8] flex items-center justify-center text-xl flex-shrink-0">
                <FaShieldAlt />
              </div>
              <div>
                <h4 className="text-sm font-bold text-[#172033]">100% Authentic</h4>
                <p className="text-xs text-[#667085]">Directly from certified brands</p>
              </div>
            </div>

            <div className="flex items-center space-x-4 p-4 rounded-2xl bg-[#F4F9FF] border border-[#E5EAF0]">
              <div className="w-12 h-12 rounded-xl bg-[#E8F3FF] text-[#2878D8] flex items-center justify-center text-xl flex-shrink-0">
                <FaUndo />
              </div>
              <div>
                <h4 className="text-sm font-bold text-[#172033]">Easy 30-Day Returns</h4>
                <p className="text-xs text-[#667085]">No questions asked</p>
              </div>
            </div>

            <div className="flex items-center space-x-4 p-4 rounded-2xl bg-[#F4F9FF] border border-[#E5EAF0]">
              <div className="w-12 h-12 rounded-xl bg-[#E8F3FF] text-[#2878D8] flex items-center justify-center text-xl flex-shrink-0">
                <FaHeadset />
              </div>
              <div>
                <h4 className="text-sm font-bold text-[#172033]">24/7 Dedicated Support</h4>
                <p className="text-xs text-[#667085]">Always here for assistance</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Multi-Column Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 sm:gap-10">
          
          {/* Column 1: Branding & Intro */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="flex items-center space-x-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#2878D8] flex items-center justify-center text-white shadow-sm">
                <FaStore className="text-lg" />
              </div>
              <span className="font-extrabold text-2xl tracking-tight text-[#172033]">
                e<span className="text-[#2878D8]">Kart</span>
              </span>
            </Link>
            <p className="text-xs sm:text-sm text-[#667085] leading-relaxed max-w-sm">
              eKart is your ultimate modern shopping destination for shirts, watches, fashion accessories, chocolates, perfumes, and electronics. Delivering premium products with unmatched speed and trust.
            </p>

            {/* Social Icons */}
            <div className="flex items-center space-x-3 pt-2">
              <a href="#" className="w-9 h-9 rounded-xl bg-white border border-[#E5EAF0] text-[#667085] hover:text-[#2878D8] hover:border-[#2878D8] flex items-center justify-center transition-colors">
                <FaFacebookF size={14} />
              </a>
              <a href="#" className="w-9 h-9 rounded-xl bg-white border border-[#E5EAF0] text-[#667085] hover:text-[#2878D8] hover:border-[#2878D8] flex items-center justify-center transition-colors">
                <FaTwitter size={14} />
              </a>
              <a href="#" className="w-9 h-9 rounded-xl bg-white border border-[#E5EAF0] text-[#667085] hover:text-[#2878D8] hover:border-[#2878D8] flex items-center justify-center transition-colors">
                <FaInstagram size={14} />
              </a>
              <a href="#" className="w-9 h-9 rounded-xl bg-white border border-[#E5EAF0] text-[#667085] hover:text-[#2878D8] hover:border-[#2878D8] flex items-center justify-center transition-colors">
                <FaLinkedinIn size={14} />
              </a>
            </div>
          </div>

          {/* Column 2: Popular Categories */}
          <div>
            <h3 className="text-sm font-bold text-[#172033] uppercase tracking-wider mb-4">
              Top Categories
            </h3>
            <ul className="space-y-2.5 text-xs text-[#667085] font-semibold">
              <li><Link to="/?category=Shirt" className="hover:text-[#2878D8] transition-colors">Shirt & Apparel</Link></li>
              <li><Link to="/?category=Watch" className="hover:text-[#2878D8] transition-colors">Watches & Timepieces</Link></li>
              <li><Link to="/?category=Accessories" className="hover:text-[#2878D8] transition-colors">Fashion Accessories</Link></li>
              <li><Link to="/?category=Chocolates" className="hover:text-[#2878D8] transition-colors">Gourmet Chocolates</Link></li>
              <li><Link to="/?category=Perfumes" className="hover:text-[#2878D8] transition-colors">Luxury Perfumes</Link></li>
              <li><Link to="/?category=Shoes" className="hover:text-[#2878D8] transition-colors">Shoes & Footwear</Link></li>
            </ul>
          </div>

          {/* Column 3: Customer Care */}
          <div>
            <h3 className="text-sm font-bold text-[#172033] uppercase tracking-wider mb-4">
              Customer Service
            </h3>
            <ul className="space-y-2.5 text-xs text-[#667085] font-semibold">
              <li><a href="#" className="hover:text-[#2878D8] transition-colors">Track Your Order</a></li>
              <li><a href="#" className="hover:text-[#2878D8] transition-colors">Returns & Refunds</a></li>
              <li><a href="#" className="hover:text-[#2878D8] transition-colors">Shipping Policies</a></li>
              <li><a href="#" className="hover:text-[#2878D8] transition-colors">Help Center & FAQ</a></li>
              <li><a href="#" className="hover:text-[#2878D8] transition-colors">Terms of Service</a></li>
              <li><a href="#" className="hover:text-[#2878D8] transition-colors">Privacy Policy</a></li>
            </ul>
          </div>

          {/* Column 4: Contact Us */}
          <div>
            <h3 className="text-sm font-bold text-[#172033] uppercase tracking-wider mb-4">
              Contact Us
            </h3>
            <ul className="space-y-3 text-xs text-[#667085]">
              <li className="flex items-start space-x-2.5">
                <FaMapMarkerAlt className="text-[#2878D8] mt-0.5 flex-shrink-0" />
                <span>124 Tech Boulevard, Suite 500, Innovation City</span>
              </li>
              <li className="flex items-center space-x-2.5">
                <FaPhoneAlt className="text-[#2878D8] flex-shrink-0" />
                <span>+1 (800) 555-EKART</span>
              </li>
              <li className="flex items-center space-x-2.5">
                <FaEnvelope className="text-[#2878D8] flex-shrink-0" />
                <span>support@ekart-store.com</span>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar with Copyright & Payment Badges */}
        <div className="border-t border-[#E5EAF0] mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-[#667085] text-center sm:text-left font-medium">
            &copy; {new Date().getFullYear()} eKart Commerce Inc. All rights reserved. Designed for 2026.
          </p>

          <div className="flex items-center space-x-3 text-[#667085] text-xs font-semibold">
            <span className="text-[11px] text-[#667085]">Secure Payments:</span>
            <div className="flex items-center space-x-2 bg-white px-3 py-1.5 rounded-lg border border-[#E5EAF0]">
              <FaCreditCard className="text-[#2878D8]" />
              <span className="text-[11px] font-bold text-[#172033]">Visa / MasterCard / UPI</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
