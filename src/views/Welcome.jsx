import React from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from './Navbar'
import chatGptImage from '../assets/chatgpt_image.png'
import takedaLogo from '../assets/takeda_logo.svg'

function Welcome() {
  const navigate = useNavigate()

  const handleAskMirAI = () => {
    navigate('/home')
  }

  const domainGroups = [
    {
      id: 1,
      icon: '💰',
      title: 'Pricing and Contracting',
    },
    {
      id: 2,
      icon: '🎯',
      title: 'Market Access',
    },
    {
      id: 3,
      icon: '📊',
      title: 'Commercial Operations',
    },
    {
      id: 4,
      icon: '🏭',
      title: 'Manufacturing and Supply Chain',
    },
    {
      id: 5,
      icon: '💎',
      title: 'Revenue Management',
    },
  ]

  const keyFeatures = [
    {
      id: 1,
      icon: '💬',
      title: 'Analyst Agent',
      description: 'An AI-driven chat that translates business inquiries into governed analyses across data, documents, and dashboards',
      bgColor: 'bg-purple-100',
      iconColor: 'text-purple-600',
    },
    {
      id: 2,
      icon: '👥',
      title: 'Data Explorer',
      description: 'A centralized catalog to discover datasets, dashboards, and KPIs based on your access. It offers all information on your access and data governance',
      bgColor: 'bg-purple-100',
      iconColor: 'text-purple-600',
    },
    {
      id: 3,
      icon: '⚠️',
      title: 'Metrics Hub',
      description: 'A unified view of key business metrics and users can explore KPI summaries, tables and charts.',
      bgColor: 'bg-orange-100',
      iconColor: 'text-orange-600',
    },
    {
      id: 4,
      icon: '📊',
      title: 'Structured Analytics',
      description: 'Governed, policy-enforced analysis over certified datasets using standardised metrics and safe query patterns',
      bgColor: 'bg-blue-100',
      iconColor: 'text-blue-600',
    },
    {
      id: 5,
      icon: '📄',
      title: 'Document Analytics',
      description: 'AI-driven analysis of unstructured content such as documents and reports with citation-based evidence and summarisation',
      bgColor: 'bg-orange-100',
      iconColor: 'text-orange-600',
    },
  ]

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div>
            <h5 className="text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              mir<span className="text-red-600">AI</span>- Data to Decisioning accelerated
            </h5>
            <p className="text-lg text-gray-600 mb-8 leading-relaxed">
              Transform complex data into clear, actionable insights using advanced AI models to support smarter decision-making.
            </p>
            
            {/* Buttons */}
            <div className="flex gap-4 flex-wrap">
              <button 
                onClick={handleAskMirAI}
                className="px-8 py-3 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors shadow-md hover:shadow-lg cursor-pointer"
              >
                Ask mirAI →
              </button>
              <button className="px-8 py-3 border-2 border-red-600 text-red-600 font-semibold rounded-lg hover:bg-red-50 transition-colors">
                ▶ Watch Demo
              </button>
            </div>
          </div>

          {/* Right Illustration */}
          <div className="relative h-96 lg:h-full flex items-center justify-center">
            <img src={chatGptImage} alt="Analytics Dashboard" className="w-full max-w-lg object-contain" />
          </div>
        </div>
      </section>

      {/* Focused Domains Groups Section */}
      <section id="domains" className="bg-gradient-to-b from-gray-50 to-white py-20">
        <div className="max-w-7xl mx-auto px-6">
          {/* Section Header */}
          <div className="text-center mb-16">
            <p className="text-5xl text-gray-900 mb-4">Focused Domains Groups</p>
            <p className="text-xl text-gray-600">Discover across enterprise departments</p>
          </div>

          {/* Domain Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            {domainGroups.map((domain) => (
              <div
                key={domain.id}
                className="bg-white border-2 border-gray-200 rounded-2xl p-8 hover:border-red-400 hover:shadow-lg transition-all duration-300 cursor-pointer group"
              >
                {/* Icon */}
                <div className="text-5xl mb-4 group-hover:scale-110 transition-transform">
                  {domain.icon}
                </div>

                {/* Title */}
                <p className="text-lg text-gray-900 group-hover:text-red-600 transition-colors">
                  {domain.title}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Key Features Section */}
      <section id="features" className="bg-gradient-to-b from-pink-50 to-white py-20">
        <div className="max-w-7xl mx-auto px-6">
          {/* Section Header */}
          <div className="text-center mb-16">
            {/* Key Features Badge */}
            <div className="inline-flex items-center justify-center gap-2 bg-red-200 text-red-700 px-4 py-2 rounded-full mb-6">
              <span className="text-sm">⭐ Key Features</span>
            </div>

            <p className="text-2xl lg:text-3xl font-semibold text-gray-900 mb-6">
              Comprehensive mir<span className="text-red-600">AI</span> Capabilities
            </p>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Everything you need to discover, analyze, and derive insights from your data with AI-powered tool
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {keyFeatures.map((feature) => (
              <div
                key={feature.id}
                className="bg-white rounded-xl p-8 shadow-md hover:shadow-lg transition-all duration-300 group"
              >
                {/* Icon Box */}
                <div className={`${feature.bgColor} ${feature.iconColor} w-16 h-16 rounded-lg flex items-center justify-center text-3xl mb-4 group-hover:scale-110 transition-transform`}>
                  {feature.icon}
                </div>

                {/* Title */}
                <h3 className="text-lg font-bold text-gray-900 mb-3">
                  {feature.title}
                </h3>

                {/* Description */}
                <p className="text-gray-600 text-sm leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white text-center py-8 mt-16">
        <p>&copy; 2024 mirAI. All rights reserved.</p>
      </footer>
    </div>
  )
}

export default Welcome