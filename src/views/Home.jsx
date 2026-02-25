import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import takedaLogo from '../assets/takeda_logo.svg'

function Home() {
  const [activeNav, setActiveNav] = useState('home')
  const navigate = useNavigate()
  const handleOnClick = () => {
    navigate('/miraichat')
  }

  const recentWork = [
    {
      id: 1,
      title: 'Q4 Sales Performance Analysis',
      date: 'Jan 12, 2024',
    },
    {
      id: 2,
      title: 'Q1 Sales Forecast',
      date: 'Apr 15, 2024',
    },
    {
      id: 3,
      title: 'Q2 Customer Feedback Summary',
      date: 'Jul 20, 2024',
    },
    {
      id: 4,
      title: 'Q3 Market Trends Overview',
      date: 'Oct 10, 2024',
    }
  ]

  const mostUsedAssets = [
    { label: 'Commercial', percentage: 43 },
    { label: 'Finance', percentage: 83 },
    { label: 'Operations', percentage: 26 },
  ]

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Top Header */}
      <div className="fixed top-0 left-0 right-0 bg-white shadow-sm z-40 h-16 flex items-center px-6">
        <div className="flex items-center gap-3 flex-1">
            <img src={takedaLogo} alt="Analytics Dashboard" className=" max-w-lg object-contain" />
        </div>
        <div className="flex items-center gap-3">
          <span className="text-gray-700 font-medium">John Doe</span>
          <div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
            PM
          </div>
          <button className="text-gray-500 hover:text-gray-700">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
            </svg>
          </button>
        </div>
      </div>

      {/* Sidebar */}
      <div className="fixed left-0 top-16 bottom-0 w-40 bg-white shadow-md">
        <nav className="p-6 space-y-4">
          {[
            { id: 'home', icon: '🏠', label: 'Home' },
            { id: 'chat', icon: '💬', label: 'mirAI Chat' },
            { id: 'analysis', icon: '📊', label: 'My Analysis' },
            { id: 'catalog', icon: '📚', label: 'Data Asset Catalog' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => {
                if (item.id === 'chat') {
                  navigate('/miraichat')
                } else {
                  setActiveNav(item.id)
                }
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                activeNav === item.id
                  ? 'bg-red-100 text-red-600 font-semibold'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              <span className="text-sm">{item.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Main Content */}
      <div className="ml-40 mt-16 flex-1 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Welcome Section */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Welcome Back 👋 <span className="text-gray-800">John Doe</span>
            </h1>
            <p className="text-gray-600">Here's what's happening today</p>
          </div>

          {/* Start New Analysis Card */}
          <div className="bg-white border-2 border-red-400 rounded-2xl p-8 mb-8 flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold text-red-600 mb-2">Start New Analysis AI-Powered 🤖</h3>
              <p className="text-gray-600">Define your goal and let Goalkeeper AI find the data you need</p>
            </div>
            <button className="px-6 py-2 text-red-600 font-semibold hover:text-red-700 flex items-center gap-2 whitespace-nowrap" onClick={handleOnClick}>
              Begin Analysis <span>→</span>
            </button>
          </div>

          {/* Main Grid */}
          <div className="grid grid-cols-3 gap-6">
            {/* My Recent Work Section */}
            <div className="col-span-2 bg-white rounded-lg p-6 border border-gray-200">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <span className="text-lg">📋</span>
                  <h2 className="text-lg font-bold text-gray-900">My Recent Work</h2>
                </div>
                <button className="text-red-600 font-semibold text-sm hover:text-red-700">
                  View all
                </button>
              </div>

              {/* Recent Work List */}
              <div className="space-y-3">
                {recentWork.map((work) => (
                  <div key={work.id} className="flex items-center justify-between py-4 border-b border-gray-100 last:border-0">
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">{work.title}</p>
                      <p className="text-xs text-gray-500 mt-1">{work.date} •</p>
                    </div>
                    <button className="px-4 py-1.5 border border-blue-500 text-blue-500 rounded text-xs font-medium hover:bg-blue-50 whitespace-nowrap">
                      Resume
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Side Cards */}
            <div className="space-y-6">
              {/* Most Used Asset */}
              <div className="bg-white rounded-lg p-6 border border-gray-200">
                <div className="flex items-center gap-2 mb-6">
                  <span className="text-lg">📊</span>
                  <h3 className="font-bold text-gray-900 text-sm">Most Used Asset</h3>
                  <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>

                <div className="space-y-4">
                  {mostUsedAssets.map((asset, idx) => (
                    <div key={idx}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-gray-600">{asset.label}</span>
                        <span className="text-sm font-bold text-gray-900">{asset.percentage}%</span>
                      </div>
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-red-500"
                          style={{ width: `${asset.percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Assets Summary */}
              <div className="bg-white rounded-lg p-6 border border-gray-200">
                <div className="flex items-center gap-2 mb-6">
                  <span className="text-lg">💎</span>
                  <h3 className="font-bold text-gray-900 text-sm">Assets</h3>
                  <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>

                <div className="space-y-4">
                  <div>
                    <p className="text-xs text-gray-600 mb-1">No of Tables</p>
                    <p className="text-2xl font-bold text-gray-900">47</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 mb-1">No of Dashboards</p>
                    <p className="text-2xl font-bold text-gray-900">12</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Saved Insights</p>
                    <p className="text-2xl font-bold text-gray-900">23</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Home