import React from "react";
import ChatInputFixed from "./ChatInputFixed";
import ChatMessage from "./ChatMessage";
import EmptyState from "./EmptyState";

function NormalLayout({
	chatHistory,
	query,
	setQuery,
	isLoading,
	isChatDisabled,
	onKeyPress,
	onSendQuery,
	onPause,
	onFileNameClick,
	onSourceLinkClick,
	chatEndRef,
}) {
	const suggestions = [
		"Show the validation documents for Elluminate",
		"Retrieve the validation & SOP documents",
	];

	const handleSuggestionClick = (text) => {
		if (typeof onSendQuery === "function") {
			onSendQuery(text);
		}
	};

	const handleEditQuery = (text) => {
		if (typeof setQuery === "function") {
			setQuery(text || "");
		}
	};

	return (
		<div className="mt-16 flex flex-col items-center justify-start min-h-[calc(100vh-4rem)] overflow-y-auto py-12 px-6 pb-32">
			<div className="w-full max-w-4xl">
				{chatHistory.length > 0 ?
					<>
						{/* Chat Messages */}
						<div
							className="space-y-6 w-full pb-32"
							style={{ paddingBottom: "190px" }}>
							{chatHistory.map((chat) => (
								<ChatMessage
									key={chat.id}
									chat={chat}
									onFileNameClick={onFileNameClick}
									onSourceLinkClick={onSourceLinkClick}
									onEditQuery={handleEditQuery}
								/>
							))}
							<div ref={chatEndRef} />
						</div>

						{/* Follow-up Input - fixed to bottom */}
						<ChatInputFixed
							query={query}
							setQuery={setQuery}
							isLoading={isLoading}
							onKeyPress={onKeyPress}
							onSendQuery={onSendQuery}
							isDisabled={isChatDisabled}
						/>
					</>
				:	<>
						<EmptyState />

						{/* Chat Input Box - lifted slightly to leave more bottom space */}
						<div className="fixed bottom-20 left-0 right-0 flex justify-center z-50">
							<div className="w-full max-w-4xl px-6">
								<div className="bg-white border-2 border-gray-200 rounded-2xl p-4 shadow-sm hover:border-gray-300 transition">
									{/* Text Area */}
									<textarea
										value={query}
										onChange={(e) =>
											!isChatDisabled && !isLoading && setQuery(e.target.value)
										}
										onKeyPress={onKeyPress}
										disabled={isChatDisabled || isLoading}
										placeholder="Ask a question about documents, releases, SOPs, CRs or defects…"
										className="w-full bg-transparent text-gray-700 placeholder-gray-400 focus:outline-none resize-none mb-4 text-base leading-relaxed"
										rows="3"
									/>

									{/* Controls */}
									<div className="flex items-center justify-end gap-3">
										{/*<button
											type="button"
											onClick={onPause}
											disabled={!isLoading}
											className="px-3 py-1.5 text-xs rounded-full border border-gray-300 text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed">
											<svg
												width="14"
												height="14"
												viewBox="0 0 14 14"
												fill="none"
												xmlns="http://www.w3.org/2000/svg"
												aria-hidden="true"
												className="text-gray-600">
												<rect
													x="2"
													y="2"
													width="3"
													height="10"
													rx="0.8"
													fill="currentColor"
												/>
												<rect
													x="9"
													y="2"
													width="3"
													height="10"
													rx="0.8"
													fill="currentColor"
												/>
											</svg>
										</button>*/}
										<button
											onClick={onSendQuery}
											disabled={isLoading || !query.trim() || isChatDisabled}
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
											:	<svg
													width="48"
													height="48"
													viewBox="0 0 48 48"
													xmlns="http://www.w3.org/2000/svg">
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

								{/* Suggested questions - now outside, in two columns below the chat box */}
								<div className="mt-4 grid grid-cols-2 gap-3">
									{suggestions.map((text) => (
										<button
											key={text}
											type="button"
											onClick={() => handleSuggestionClick(text)}
											className="flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-800 shadow-sm hover:border-red-500 hover:text-red-600 hover:shadow-md transition">
											<span className="text-red-500">
												<svg
													xmlns="http://www.w3.org/2000/svg"
													viewBox="0 0 24 24"
													className="h-4 w-4"
													fill="none"
													stroke="currentColor"
													strokeWidth="2"
													strokeLinecap="round"
													strokeLinejoin="round">
													<path d="M3 17l6-6 4 4 8-8" />
													<path d="M14 3h7v7" />
												</svg>
											</span>
											<span className="text-left">{text}</span>
										</button>
									))}
								</div>
							</div>
						</div>
					</>
				}
			</div>
		</div>
	);
}

export default NormalLayout;
