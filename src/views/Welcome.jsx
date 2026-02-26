import React from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from './Navbar'
import chatGptImage from '../assets/chatgpt_image.png'
import takedaLogo from '../assets/takeda_logo.svg'
import { ShieldCheck, Users, FileCheck, Briefcase } from "lucide-react";
function Welcome() {
  const navigate = useNavigate()

  const handleAskMirAI = () => {
    navigate('/chat')
  }

 
  const domainGroups = [
		{
			id: 1,
			icon: "🛡️",
			title: "Validation & QA Teams",
		},
		{
			id: 2,
			icon: "🎯",
			title: "GxP Business Users & Application Owners",
		},
		{
			id: 3,
			icon: "📑",
			title: "Compliance & Audit Stakeholders",
		},
		{
			id: 4,
			icon: "📅",
			title: "Project & Release Managers",
		},
		//{
		//  id: 5,
		//  icon: '💎',
		//  title: 'Revenue Management',
		//},
	];

  const keyFeatures = [
		{
			id: 1,
			icon: "🔗",
			title: "CR-Driven Cross-System Retrieval Engine",
			description:
				"Uses CR number and project name as governance anchor to retrieve validation and release artifacts across: ServiceNow, Jira, Confluence, Veeva. Ensures traceable, system-linked artifact discovery aligned to regulated change control.",
			bgColor: "bg-purple-100",
			iconColor: "text-purple-600",
		},
		{
			id: 2,
			icon: "📋",
			title: "Structured Artifact Intelligence View",
			description:
				"Displays retrieved documents in a structured, auditable table format: CR ID, Document Source, Document ID, Document Type, Status (Open / Closed). Provides immediate release readiness visibility.",
			bgColor: "bg-purple-100",
			iconColor: "text-purple-600",
		},
		{
			id: 3,
			icon: "✅",
			title: "Document Completeness & Confirmation Workflow",
			description:
				"Built-in validation workflow that: Requires user confirmation before ARP generation. Prevents incomplete release documentation.",
			bgColor: "bg-orange-100",
			iconColor: "text-orange-600",
		},
		{
			id: 4,
			icon: "🌐",
			title: "Clickable Document Access with Escalation Path",
			description:
				"Direct links to source documents across systems with: Secure access validation. Maintains governance and access integrity.",
			bgColor: "bg-blue-100",
			iconColor: "text-blue-600",
		},
		{
			id: 5,
			icon: "📄",
			title: "Automated Agile Release Plan (ARP) Generation",
			description:
				"Auto-creates Agile Release Plan using approved enterprise templates: Select an ARP template, Edit structured sections, Download in approved format, Maintain CR traceability references.Standardizes release documentation while reducing manual effort.",
			bgColor: "bg-orange-100",
			iconColor: "text-orange-600",
		},
	];

  return (
		<div className="min-h-screen bg-white">
			<Navbar />

			{/* Hero Section */}
			<section className="max-w-7xl mx-auto px-6 py-20">
				<div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
					{/* Left Content */}
					<div>
						<h5 className="text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
							GxP AI Retrieval Assistant - Intelligent Compliance Artifact
							Engine
						</h5>
						<p className="text-lg text-gray-600 mb-8 leading-relaxed">
							Enterprise GenAI solution that turns Change Requests into
							traceable, audit-ready GxP documentation across enterprise
							systems.
						</p>

						{/* Buttons */}
						<div className="flex gap-4 flex-wrap">
							<button
								onClick={handleAskMirAI}
								className="px-8 py-3 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors shadow-md hover:shadow-lg cursor-pointer">
								Ask GxP AI →
							</button>
							{/*<button className="px-8 py-3 border-2 border-red-600 text-red-600 font-semibold rounded-lg hover:bg-red-50 transition-colors">
								▶ Watch Demo
							</button>*/}
						</div>
					</div>

					{/* Right Illustration */}
					<div className="relative h-96 lg:h-full flex items-center justify-center">
						<img
							src={chatGptImage}
							alt="Analytics Dashboard"
							className="w-full max-w-lg object-contain"
						/>
					</div>
				</div>
			</section>

			{/* Focused Domains Groups Section */}
			<section
				id="domains"
				className="bg-gradient-to-b from-gray-50 to-white py-20">
				<div className="max-w-7xl mx-auto px-6">
					{/* Section Header */}
					<div className="text-center mb-16">
						<p className="text-5xl text-gray-900 mb-4">
							Focused Domains Groups
						</p>
						<p className="text-xl text-gray-600">
							Discover across enterprise departments
						</p>
					</div>

					{/* Domain Cards Grid */}
					<div className="grid justify-center grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
						{domainGroups.map((domain) => (
							<div
								key={domain.id}
								className="bg-white border-2 border-gray-200 rounded-2xl p-4
                 hover:border-red-400 hover:shadow-lg 
                 transition-all duration-300 cursor-pointer group 
                 text-center">
								{/* Icon */}
								<div className="text-5xl mb-4 flex justify-center group-hover:scale-110 transition-transform">
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
			<section
				id="features"
				className="bg-gradient-to-b from-pink-50 to-white py-20">
				<div className="max-w-7xl mx-auto px-6">
					{/* Section Header */}
					<div className="text-center mb-16">
						{/* Key Features Badge */}
						<div className="inline-flex items-center justify-center gap-2 bg-red-200 text-red-700 px-4 py-2 rounded-full mb-6">
							<span className="text-sm">⭐ Key Features</span>
						</div>

						<p className="text-2xl lg:text-3xl font-semibold text-gray-900 mb-6">
							Comprehensive GxP AI{" "}
							Capabilities
						</p>
						<p className="text-lg text-gray-600 max-w-2xl mx-auto">
							Everything you need to discover, analyze, and derive insights from
							your data with AI-powered tool
						</p>
					</div>

					{/* Features Grid */}
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
						{keyFeatures.map((feature) => (
							<div
								key={feature.id}
								className="bg-white rounded-xl p-8 shadow-md hover:shadow-lg transition-all duration-300 group">
								{/* Icon Box */}
								<div
									className={`${feature.bgColor} ${feature.iconColor} w-16 h-16 rounded-lg flex items-center justify-center text-3xl mb-4 group-hover:scale-110 transition-transform`}>
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
				<p>&copy; 2026 GxP AI. All rights reserved.</p>
			</footer>
		</div>
	);
}

export default Welcome