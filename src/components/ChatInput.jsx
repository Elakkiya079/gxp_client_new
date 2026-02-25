import React from "react";

function ChatInput({ query, setQuery, onKeyPress, onSendQuery, isLoading }) {
	return (
		<div className="bg-white border border-gray-200 rounded-xl p-3 shadow-sm">
			<textarea
				value={query}
				onChange={(e) => setQuery(e.target.value)}
				onKeyPress={onKeyPress}
				placeholder="Ask a question about documents, releases, SOPs, CRs or defects…"
				className="w-full bg-transparent text-sm text-gray-700 placeholder-gray-400 focus:outline-none resize-none mb-3"
				rows="2"
			/>
			<div className="flex justify-end">
				<button
					onClick={onSendQuery}
					disabled={isLoading || !query.trim()}
					className="w-8 h-8 bg-red-600 text-white rounded-full flex items-center justify-center hover:bg-red-700 transition disabled:bg-red-400">
					{isLoading ?
						<svg
							className="w-4 h-4 animate-spin"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24">
							<circle
								className="opacity-25"
								cx="12"
								cy="12"
								r="10"
								stroke="currentColor"
								strokeWidth="4"></circle>
						</svg>
					:	 <svg width="48" height="48" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
					<circle cx="24" cy="24" r="24" fill="#ED1C24" />
					<path 
					  d="M20 16 L28 24 L20 32" 
					  stroke="white" 
					  stroke-width="3" 
					  stroke-linecap="round" 
					  stroke-linejoin="round" 
					  fill="none"
					/>
				  </svg>
					}
				</button>
			</div>
		</div>
	);
}

export default ChatInput;
