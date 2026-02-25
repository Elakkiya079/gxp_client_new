import React from 'react'
import takedaLogo from '../assets/takeda_logo.svg'

function Navbar() {
  return (
    <div>
      <nav className="bg-white shadow-sm sticky top-0 z-50 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          {/* <div className="text-2xl font-bold text-gray-900">mir<span className="text-red-600">AI</span></div> */}
          <img src={takedaLogo} alt="Analytics Dashboard" className=" max-w-lg object-contain" />
          {/* <ul className="hidden md:flex gap-8 text-gray-700">
            <li><a href="#home" className="hover:text-red-600 transition font-medium">Home</a></li>
            <li><a href="#features" className="hover:text-red-600 transition font-medium">Features</a></li>
            <li><a href="#domains" className="hover:text-red-600 transition font-medium">Domains</a></li>
            <li><a href="#contact" className="hover:text-red-600 transition font-medium">Contact</a></li>
          </ul> */}
        </div>
      </nav>
    </div>
  )
}

export default Navbar