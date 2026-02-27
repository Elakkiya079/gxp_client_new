import React from "react";
import ChatInput from "./ChatInput";

function ChatInputFixed({
	query,
	setQuery,
	isLoading,
	onKeyPress,
	onSendQuery,
	isDisabled = false,
}) {
	return (
		<div
			className="fixed bottom-0 left-0 right-0 flex justify-center z-50"
			style={{ background: "#f9fafb", padding: "30px 15px" }}>
			<div className="w-full max-w-4xl px-6">
				<div className="bg-white border-2 border-gray-200 rounded-2xl p-6 mb-8 shadow-sm hover:border-gray-300 transition">
					<textarea
						value={query}
						onChange={(e) => !isDisabled && setQuery(e.target.value)}
						onKeyPress={onKeyPress}
						disabled={isDisabled}
						placeholder="Ask a question about documents, releases, SOPs, CRs or defects…"
						className="w-full bg-transparent text-gray-700 placeholder-gray-400 focus:outline-none resize-none mb-4 text-base leading-relaxed disabled:cursor-not-allowed disabled:text-gray-400"
						rows="3"
					/>

					{/* Controls */}
					<div className="flex items-center justify-end gap-3">
						{/* <button className="text-gray-400 hover:text-gray-600 transition">
							<svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
								<path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
								<path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h12a1 1 0 001-1V5a1 1 0 00-1-1H3zM15 7a1 1 0 011 1v4a1 1 0 11-2 0V8a1 1 0 011-1z" />
							</svg>
						</button> */}

						<button
							onClick={onSendQuery}
							disabled={isLoading || !query.trim() || isDisabled}
							className="w-10 h-10 bg-red-600 text-white rounded-full flex items-center justify-center hover:bg-red-700 transition shadow-md disabled:bg-red-400 disabled:cursor-not-allowed">
							{isLoading ?
								<svg
									className="w-5 h-5 animate-spin"
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
									<path
										className="opacity-75"
										fill="currentColor"
										d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
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
			</div>
		</div>
	);
}

export default ChatInputFixed;
