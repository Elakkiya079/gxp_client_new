import React, { useState, useEffect } from "react";
import ResultsTable from "./ResultsTable";
import takedaLogo from "../assets/takeda_logo.svg";

const PROCESSING_DELAY_MS = 3000;

function ChatMessage({
	chat,
	onFileNameClick,
	onSourceLinkClick,
	onEditQuery,
}) {
	const [showGenerating, setShowGenerating] = useState(false);
	const [copiedId, setCopiedId] = useState(null);

	const handleCopy = (text, id) => {
		if (!text) return;
		if (navigator?.clipboard?.writeText) {
			navigator.clipboard.writeText(text).catch(() => {});
		}
		setCopiedId(id || chat.id);
		setTimeout(() => setCopiedId(null), 1500);
	};

	const handleEdit = () => {
		if (typeof onEditQuery === "function") {
			onEditQuery(chat.userQuery || "");
		}
	};

	useEffect(() => {
		if (!chat.isProcessing) {
			setShowGenerating(false);
			return;
		}
		const timer = setTimeout(
			() => setShowGenerating(true),
			PROCESSING_DELAY_MS,
		);
		return () => clearTimeout(timer);
	}, [chat.isProcessing]);

	// ── Shared user query bubble ──
	const userQueryBubble = (
		<div className="flex justify-end">
			<div className="bg-pink-50 rounded-lg border border-pink-200 p-4 max-w-2xl">
				<div className="flex items-start justify-between">
					<div>
						<h3 className="text-base font-semibold text-gray-900 mb-1">
							{chat.userQuery}
						</h3>
						<p className="text-xs text-gray-500">{chat.timestamp}</p>
					</div>
					<div className="flex items-center gap-2">
						<button
							type="button"
							onClick={() => handleCopy(chat.userQuery, chat.id)}
							className="p-1 text-gray-400 hover:text-gray-600"
							title={copiedId === chat.id ? "Copied" : "Copy"}>
							<svg
								className="w-4 h-4"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24">
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
								/>
							</svg>
						</button>
						<button
							type="button"
							onClick={handleEdit}
							className="p-1 text-gray-400 hover:text-gray-600"
							title="Edit query">
							<svg
								className="w-4 h-4"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24">
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
								/>
							</svg>
						</button>
					</div>
				</div>
			</div>
		</div>
	);

	// ── Helper: single AI bubble ──
	const aiBubble = (content, key) => (
		<div key={key} className="flex justify-start">
			<div className="max-w-2xl">
				<div className="flex items-center gap-2 mb-1">
					<div className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center overflow-hidden">
						<img
							src={takedaLogo}
							alt="Assistant"
							className="w-6 h-6 object-contain"
						/>
					</div>
					<p className="text-xs text-gray-500">{chat.timestamp}</p>
				</div>
				<div className="bg-gray-100 rounded-lg border border-gray-200 p-4">
					{content}
				</div>
			</div>
		</div>
	);

	// ── Processing state ──
	if (chat.isProcessing && !chat.tableData?.length) {
		const message =
			showGenerating ?
				"Generating CR details related to projects..."
			:	"Processing your query...";
		return (
			<div className="space-y-6">
				{userQueryBubble}
				<div className="flex justify-start">
					<div className="max-w-2xl">
						<div className="flex items-center gap-2 mb-1">
							<div className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center overflow-hidden">
								<img
									src={takedaLogo}
									alt="Assistant"
									className="w-6 h-6 object-contain"
								/>
							</div>
							<p className="text-xs text-gray-500">{chat.timestamp}</p>
						</div>
						<div className="bg-blue-50 rounded-lg border border-blue-200 p-4">
							<div className="flex items-center gap-3">
								{showGenerating && (
									<svg
										className="w-5 h-5 text-blue-600 animate-spin flex-shrink-0"
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24">
										<circle
											className="opacity-25"
											cx="12"
											cy="12"
											r="10"
											stroke="currentColor"
											strokeWidth="4"
										/>
										<path
											className="opacity-75"
											fill="currentColor"
											d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
										/>
									</svg>
								)}
								<p className="text-sm text-gray font-medium">{message}</p>
							</div>
						</div>
					</div>
				</div>
			</div>
		);
	}

	// ── All text messages — prefer responseMessages[], fall back to responseMessage ──
	const textMessages =
		Array.isArray(chat.responseMessages) && chat.responseMessages.length > 0 ?
			chat.responseMessages
		: chat.responseMessage ? [chat.responseMessage]
		: [];

	return (
		<div className="space-y-6">
			{userQueryBubble}

			{/* One bubble per text message received */}
			{textMessages.map((msg, idx) =>
				aiBubble(
					<p className="text-sm text-gray-700 whitespace-pre-line">{msg}</p>,
					`msg-${idx}`,
				),
			)}

			{/* Results table (shown below text messages) */}
			{(chat.sources?.length > 0 || chat.tableData?.length > 0) && (
				<div>
					{textMessages.length === 0 && (
						<p className="text-sm text-gray-600 mb-4">
							The following matching records were found across the connected
							systems:
						</p>
					)}
					{chat.tableData?.length > 0 ?
						<ResultsTable
							sources={chat.tableData}
							onFileNameClick={onFileNameClick}
							onSourceLinkClick={onSourceLinkClick}
							isChangeRequest={true}
							userQuery={chat.userQuery}
						/>
					:	<ResultsTable
							sources={chat.sources}
							onFileNameClick={onFileNameClick}
							onSourceLinkClick={onSourceLinkClick}
							userQuery={chat.userQuery}
						/>
					}
				</div>
			)}
		</div>
	);
}

export default ChatMessage;
