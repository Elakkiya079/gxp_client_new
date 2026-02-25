import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import  AIQueryService  from '../services/AIQueryService'
import takedaLogo from '../assets/takeda_logo.svg'
// import { log } from 'console'

function AnalystAgent() {
    const navigate = useNavigate()
    const location = useLocation()
    const [query, setQuery] = useState('')
    const [region, setRegion] = useState('Region')
    const [domain, setDomain] = useState('Domain')
    const [isLoading, setIsLoading] = useState(false)
    const [checkedItems, setCheckedItems] = useState({})
    const [selectedSources, setSelectedSources] = useState([])
    const [userQuery, setUserQuery] = useState('')
    const [queryTimestamp, setQueryTimestamp] = useState('')
    const [checkedData, setCheckedData] = useState([])
    const [aiAnswer, setAiAnswer] = useState('')
    const [tables, setTables] = useState(null)
    const [showTables, setShowTables] = useState(false)
    const [selectedTableName, setSelectedTableName] = useState(null)

    const handleSendQuery = async () => {
        if (query.trim()) {
            setIsLoading(true)
            const currentQuery = query
            const currentTimestamp = formatTimestamp()
            setQuery('')
            setUserQuery(currentQuery)
            setQueryTimestamp(currentTimestamp)
            try {
                // Construct payload with user query and selected sources
                const payload = {
                    user_query: currentQuery,
                    selected_sources: checkedData
                }

                console.log('Sending payload to /ai/analyze:', payload)

                // Send the query with selected sources to the analyze endpoint
                const result = await AIQueryService.analyzeQuery(currentQuery, checkedData)
                if (result.success) {
                    setAiAnswer(result.data.answer || result.data)
                    if (result.data.tables) {
                        setTables(result.data.tables)
                        setSelectedTableName(Object.keys(result.data.tables)[0])
                    }
                    console.log('AI Answer:', result.data.answer || result.data)
                    console.log('Tables:', result.data.tables)
                }
                else {
                    console.error('Query analysis failed:', result.error)
                }
            } catch (error) {
                console.error('Error sending query:', error)
            } finally {
                setIsLoading(false)
            }
        }
    }

    const handleSuggestedQuery = (text) => {
        setQuery(text)
    }

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            handleSendQuery()
        }
    }

    const formatTimestamp = () => {
        const now = new Date()
        const hours = now.getHours()
        const minutes = String(now.getMinutes()).padStart(2, '0')
        const ampm = hours >= 12 ? 'PM' : 'AM'
        const displayHours = hours % 12 || 12
        const date = now.getDate()
        const month = now.toLocaleString('en-US', { month: 'short' })
        return `${displayHours}:${minutes} ${ampm}, ${date} ${month}`
    }

    const handleCheckboxChange = (idx) => {
        setCheckedItems((prev) => ({
            ...prev,
            [idx]: !prev[idx],
        }))
    }

    const [isDatasetOpen, setIsDatasetOpen] = useState(true)
    const [isBringDataOpen, setIsBringDataOpen] = useState(false)

    useEffect(() => {
        console.log('Checked items updated:', checkedItems)
    }, [checkedItems])

    useEffect(() => {
        if (location.state) {
            const { checkedItems: passedCheckedItems, checkedData: passedCheckedData, selectedSources: passedSelectedSources, userQuery: passedUserQuery, queryTimestamp: passedQueryTimestamp } = location.state
            setCheckedItems(passedCheckedItems || {})
            setCheckedData(passedCheckedData || [])
            setSelectedSources(passedSelectedSources || [])
            setUserQuery(passedUserQuery || '')
            setQueryTimestamp(passedQueryTimestamp || '')
            console.log('Received checked items from mirAIChat:', passedCheckedData)
        }
    }, [location.state])
    useEffect(() => {
        if (aiAnswer) {
            console.log('AI Answer:', aiAnswer)
        }
    }, [aiAnswer])

    return (
        <div className="bg-gray-50">
            {/* Top Header */}
            <div className="fixed top-0 left-0 right-0 bg-white shadow-sm z-40 h-16 flex items-center px-8">
                {/* Left: Logo + Back Link */}
                <div className="flex items-center gap-4 flex-1">
                    <img src={takedaLogo} alt="Takeda Logo" className="max-w-lg object-contain" />
                    <button
                        onClick={() => navigate('/home')}
                        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        <span className="text-sm font-medium">Back to Home</span>
                    </button>
                </div>

                {/* Right: Notification & User */}
                <div className="flex items-center gap-6">
                    <button className="relative text-gray-500 hover:text-gray-700">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                        </svg>
                        <div className="absolute top-0 right-0 w-2 h-2 bg-red-600 rounded-full"></div>
                    </button>

                    <div className="flex items-center gap-3">
                        <span className="text-gray-700 font-medium text-sm">User</span>
                        <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                            TU
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Layout with Sidebar */}
            <div className="mt-16 flex h-[calc(100vh-4rem)]">
                {/* Left Sidebar */}
                <div className="w-72 bg-white border-r border-gray-200 overflow-y-auto">
                    <div className="p-6 space-y-4">
                        {/* Dataset Section */}
                        <div>
                            <button
                                onClick={() => setIsDatasetOpen(!isDatasetOpen)}
                                className="w-full bg-red-600 text-white px-4 py-3 rounded-lg font-semibold flex items-center justify-between hover:bg-red-700 transition"
                            >
                                <span>Dataset</span>
                                <svg
                                    className={`w-5 h-5 transition-transform ${isDatasetOpen ? 'rotate-180' : ''}`}
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                >
                                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                </svg>
                            </button>

                            {isDatasetOpen && (
                                <div className="mt-3 space-y-2 pl-2">
                                    {checkedData.length > 0 ? (
                                        checkedData.map((item, idx) => (
                                            <div
                                                key={idx}
                                                className="flex items-center gap-2 p-2 rounded hover:bg-gray-50 text-sm text-gray-700"
                                            >
                                                <span className="text-lg">📊</span>
                                                <span>{item.asset_name || item.name || 'Dataset'}</span>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="p-2 text-sm text-gray-500">No datasets selected</div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Bring your own data Section */}
                        <div>
                            <button
                                onClick={() => setIsBringDataOpen(!isBringDataOpen)}
                                className="w-full bg-red-600 text-white px-4 py-3 rounded-lg font-semibold flex items-center justify-between hover:bg-red-700 transition"
                            >
                                <span>Bring your own data</span>
                                <svg
                                    className={`w-5 h-5 transition-transform ${isBringDataOpen ? 'rotate-180' : ''}`}
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                >
                                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                </svg>
                            </button>

                            {isBringDataOpen && (
                                <div className="mt-3 p-4 bg-gray-50 rounded-lg text-sm text-gray-600">
                                    <p>Upload your custom data files here</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="flex-1 flex flex-col overflow-hidden">
                    {checkedData.length > 0 ? (
                        // After data selection - show chat interface
                        <>
                            {/* Messages Scroll Area */}
                            <div className="flex-1 overflow-y-auto px-6 py-8">
                                <div className="w-full max-w-4xl mx-auto space-y-6">
                                    {/* Avatar & Message - Only show if no message has been sent */}
                                    {!userQuery && (
                                        <div className="flex flex-col items-center text-center mb-12">
                                            <div className="w-32 h-32 bg-gradient-to-br from-pink-300 to-pink-400 rounded-full shadow-lg mb-6 opacity-80"></div>
                                            <h2 className="text-lg font-semibold text-red-600 mb-2">
                                                Data ingestion completed.
                                            </h2>
                                            <p className="text-red-600 font-medium">
                                                Ask questions to explore insights from your data.
                                            </p>
                                        </div>
                                    )}

                                    {/* User Message - Show after sending */}
                                    {userQuery && (
                                        <div className="bg-pink-50 rounded-lg border border-pink-200 p-4 mb-6">
                                            <div className="flex items-start justify-between">
                                                <div>
                                                    <h3 className="text-base font-semibold text-gray-900 mb-1">{userQuery}</h3>
                                                    <p className="text-xs text-gray-500">{queryTimestamp}</p>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <button className="p-1 text-gray-400 hover:text-gray-600">
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                                        </svg>
                                                    </button>
                                                    <button className="p-1 text-gray-400 hover:text-gray-600">
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                        </svg>
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* AI Response - Show after receiving answer */}
                                    {aiAnswer && (
                                        <div className="bg-white rounded-lg border border-gray-200 p-6 flex flex-col max-h-100 relative">
                                            <div className="flex justify-between items-start mb-4 flex-shrink-0">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                                                        <svg className="w-3 h-3 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16z" />
                                                        </svg>
                                                    </div>
                                                    <p className="text-xs text-gray-500">{queryTimestamp}</p>
                                                </div>

                                                <div className="flex gap-2 text-gray-400 ml-4 flex-shrink-0">
                                                    <button 
                                                        onClick={() => {
                                                            navigator.clipboard.writeText(aiAnswer)
                                                        }}
                                                        className="p-1 hover:text-gray-600 transition" 
                                                        title="Copy"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                                        </svg>
                                                    </button>
                                                    <button 
                                                        className="p-1 hover:text-gray-600 transition"
                                                        title="Edit"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                        </svg>
                                                    </button>
                                                </div>
                                            </div>
                                            <div className="text-gray-700 leading-relaxed text-sm whitespace-pre-wrap overflow-y-auto flex-1 pr-2">
                                                {aiAnswer}
                                            </div>
                                            {/* Table Icon - Bottom Right Corner */}
                                            {tables && (
                                                <button 
                                                    onClick={() => setShowTables(!showTables)}
                                                    className="absolute bottom-4 right-4 p-2 text-gray-400 hover:text-gray-600 transition bg-white rounded-lg border border-gray-200 hover:border-gray-300"
                                                    title={showTables ? "Hide tables" : "Show tables"}
                                                >
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                                    </svg>
                                                </button>
                                            )}
                                        </div>
                                    )}

                                    {/* Tables - Display below answer */}
                                    {tables && showTables && (
                                        <div className="bg-white rounded-xl border border-gray-100 p-6 overflow-x-auto">
                                            {/* Table Tabs */}
                                            <div className="flex gap-2 border-b border-gray-200 mb-6 pb-4">
                                                {Object.keys(tables).map((tableName) => (
                                                    <button
                                                        key={tableName}
                                                        onClick={() => setSelectedTableName(tableName)}
                                                        className={`px-4 py-2 font-medium text-sm transition rounded-t-lg ${
                                                            selectedTableName === tableName
                                                                ? 'text-red-600 border-b-2 border-red-600 bg-red-50'
                                                                : 'text-gray-600 hover:text-gray-900'
                                                        }`}
                                                    >
                                                        {tableName}
                                                    </button>
                                                ))}
                                            </div>

                                            {/* Selected Table */}
                                            {selectedTableName && tables[selectedTableName] && (
                                                <div>
                                                    <div className="rounded-lg overflow-hidden border border-gray-100">
                                                        <table className="w-full border-collapse min-w-max">
                                                            <thead>
                                                                <tr className="bg-pink-50">
                                                                    {Object.keys(tables[selectedTableName][0] || {}).map((column) => (
                                                                        <th
                                                                            key={column}
                                                                            className="px-6 py-4 text-left text-sm font-semibold text-gray-900 border-b border-gray-100"
                                                                        >
                                                                            {column}
                                                                        </th>
                                                                    ))}
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                {tables[selectedTableName].map((row, rowIndex) => (
                                                                    <tr key={rowIndex} className="hover:bg-gray-50 transition border-b border-gray-100 last:border-b-0">
                                                                        {Object.values(row).map((cell, cellIndex) => (
                                                                            <td
                                                                                key={cellIndex}
                                                                                className="px-6 py-4 text-sm text-gray-700"
                                                                            >
                                                                                {typeof cell === 'number'
                                                                                    ? cell.toLocaleString('en-US', {
                                                                                        minimumFractionDigits: 0,
                                                                                        maximumFractionDigits: 2,
                                                                                    })
                                                                                    : cell}
                                                                            </td>
                                                                        ))}
                                                                    </tr>
                                                                ))}
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Follow-up Input - Sticky Bottom */}
                            <div className="border-t border-gray-200 bg-white px-6 py-6">
                                <div className="flex justify-center">
                                    <div className="w-full max-w-4xl">
                                        <div className="bg-white border border-gray-200 rounded-2xl p-4 hover:border-gray-300 transition">
                                            <textarea
                                                value={query}
                                                onChange={(e) => setQuery(e.target.value)}
                                                onKeyPress={handleKeyPress}
                                                placeholder="Type your query here..."
                                                className="w-full bg-transparent text-gray-700 placeholder-gray-400 focus:outline-none resize-none mb-3 text-sm leading-relaxed"
                                                rows="3"
                                            />

                                            {/* Controls */}
                                            <div className="flex items-center justify-end gap-3">
                                                <button className="text-gray-400 hover:text-gray-600 transition">
                                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                                        <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
                                                        <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h12a1 1 0 001-1V5a1 1 0 00-1-1H3zM15 7a1 1 0 011 1v4a1 1 0 11-2 0V8a1 1 0 011-1z" />
                                                    </svg>
                                                </button>

                                                <button
                                                    onClick={handleSendQuery}
                                                    disabled={isLoading || !query.trim()}
                                                    className="w-10 h-10 bg-red-600 text-white rounded-full flex items-center justify-center hover:bg-red-700 transition shadow-md disabled:bg-red-400 disabled:cursor-not-allowed"
                                                >
                                                    {isLoading ? (
                                                        <svg className="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                        </svg>
                                                    ) : (
                                                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                                            <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5.951-2.965a1 1 0 00.82 0l5.951 2.965a1 1 0 001.169-1.409l-7-14z" />
                                                        </svg>
                                                    )}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </>
                    ) : (
                        // Before data selection - show message
                        <div className="flex items-center justify-center flex-1">
                            <p className="text-gray-500 text-lg">No data selected. Please select datasets to proceed.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default AnalystAgent