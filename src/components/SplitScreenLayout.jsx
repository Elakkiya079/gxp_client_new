import React, { useEffect, useMemo, useState } from "react";
import ChatInput from "./ChatInput";
import ResultsTable from "./ResultsTable";
import ARPTemplateSelector from "./ARPTemplateSelector";
import DocumentConfirmModal from "./DocumentConfirmModal";
import takedaLogo from "../assets/takeda_logo.svg";

const PROCESSING_DELAY_MS = 3000;
const PROCESSING_TICK_MS = 500;

function SplitScreenLayout({
	chatHistory,
	elluminateChat,
	query,
	setQuery,
	isLoading,
	isChatDisabled,
	onKeyPress,
	onSendQuery,
	onPause,
	onFileNameClick,
	onSourceLinkClick,
	onTemplateSelect,
	chatEndRef,
}) {
	const hasProcessing = useMemo(
		() => chatHistory.some((c) => Boolean(c?.isProcessing)),
		[chatHistory],
	);
	const [now, setNow] = useState(() => Date.now());
	const [showDocConfirm, setShowDocConfirm] = useState(false);
	const [pendingTemplate, setPendingTemplate] = useState(null);

	useEffect(() => {
		if (!hasProcessing) return;
		const t = setInterval(() => setNow(Date.now()), PROCESSING_TICK_MS);
		return () => clearInterval(t);
	}, [hasProcessing]);

	/**
	 * Render all AI response bubbles for a single chat entry.
	 * - If processing: shows spinner bubble
	 * - If done: renders one bubble per message in responseMessages[]
	 *   (falls back to legacy responseMessage string if array is empty)
	 * - Table-only responses get a contextual summary message
	 */
	const renderAIBubbles = (chat) => {
		const wrapBubble = (content, key) => (
			<div key={key} className="max-w-xs">
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
				<div className="bg-gray-100 rounded-lg p-3">{content}</div>
			</div>
		);

		// ── Processing state ──
		if (chat.isProcessing) {
			const startedAt = typeof chat.id === "number" ? chat.id : Number(chat.id);
			const isGenerating =
				Number.isFinite(startedAt) && now - startedAt >= PROCESSING_DELAY_MS;

			const spinner = (
				<svg
					className="w-4 h-4 text-blue-600 animate-spin flex-shrink-0"
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
			);

			return [
				wrapBubble(
					<div className="flex items-center gap-2 text-sm text-gray-700">
						{isGenerating && spinner}
						<span>
							{isGenerating ?
								"Generating CR related to projects..."
							:	"Processing your query..."}
						</span>
					</div>,
					"processing",
				),
			];
		}

		// ── Error state ──
		if (chat.status === "error") {
			const errText =
				chat.message === "list index out of range" ?
					"No Data Found"
				:	"Invalid Input";
			return [
				wrapBubble(<p className="text-sm text-gray-700">{errText}</p>, "err"),
			];
		}

		// ── Normal state: collect all text messages ──
		const messages =
			Array.isArray(chat.responseMessages) && chat.responseMessages.length > 0 ?
				chat.responseMessages
			: chat.responseMessage ? [chat.responseMessage]
			: [];

		if (messages.length > 0) {
			return messages.map((msg, i) =>
				wrapBubble(<p className="text-sm text-gray-700">{msg}</p>, `msg-${i}`),
			);
		}

		// ── Table-only response: derive a contextual summary ──
		if (chat.tableData?.length > 0) {
			const firstRow = chat.tableData[0] || {};
			if (firstRow.changeRequestId) {
				return [
					wrapBubble(
						<p className="text-sm text-gray-700">
							The Change Requests (CRs) are available in the table on the right.
							Please review the list and select a CR number to proceed.
						</p>,
						"cr-hint",
					),
				];
			}
			if (firstRow.document_id) {
				return [
					wrapBubble(
						<p className="text-sm text-gray-700">
							The requested artifacts associated with the selected CR number
							have been successfully retrieved.
						</p>,
						"art-1",
					),
					wrapBubble(
						<p className="text-sm text-gray-700">
							Did you receive all the required artifacts linked to the requested
							CR number?
						</p>,
						"art-2",
					),
				];
			}
			return [
				wrapBubble(
					<p className="text-sm text-gray-700">
						Retrieved {chat.tableData.length} change requests
					</p>,
					"generic",
				),
			];
		}

		if (chat.sources?.length > 0) {
			return [
				wrapBubble(
					<p className="text-sm text-gray-700">
						Found {chat.sources.length} matching records
					</p>,
					"src",
				),
			];
		}

		return [
			wrapBubble(
				<p className="text-sm text-gray-700">Processing your query...</p>,
				"fallback",
			),
		];
	};

	return (
		<div className="mt-16 h-[calc(100vh-4rem)] flex gap-0">
			{/* ── LEFT: Chat History ── */}
			<div className="w-1/3 border-r border-gray-200 flex flex-col overflow-hidden bg-white">
				<div className="flex-1 overflow-y-auto p-6 space-y-4">
					{chatHistory.map((chat) => (
						<div key={chat.id} className="space-y-3">
							{/* User query bubble */}
							<div className="flex justify-end">
								<div className="bg-pink-50 rounded-lg border border-pink-200 p-3 max-w-xs">
									<div className="flex items-start justify-between gap-2">
										<div>
											<h3 className="text-sm font-semibold text-gray-900 mb-1">
												{chat.userQuery}
											</h3>
											<p className="text-xs text-gray-500">{chat.timestamp}</p>
										</div>
										<div className="flex items-center gap-1">
											<button
												type="button"
												onClick={() =>
													navigator?.clipboard?.writeText(chat.userQuery || "")
												}
												className="p-1 text-gray-400 hover:text-gray-600"
												title="Copy">
												<svg
													className="w-3.5 h-3.5"
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
												onClick={() => setQuery(chat.userQuery || "")}
												className="p-1 text-gray-400 hover:text-gray-600"
												title="Edit query">
												<svg
													className="w-3.5 h-3.5"
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

							{/* All AI response bubbles for this chat entry */}
							<div className="flex justify-start">
								<div className="space-y-3">{renderAIBubbles(chat)}</div>
							</div>
						</div>
					))}
					<div ref={chatEndRef} />
				</div>

				{/* Chat Input */}
				<div className="border-t border-gray-200 p-4 bg-gray-50">
					<ChatInput
						query={query}
						setQuery={setQuery}
						onKeyPress={onKeyPress}
						onSendQuery={onSendQuery}
						isLoading={isLoading}
						isDisabled={isChatDisabled}
						onPause={onPause}
					/>
				</div>
			</div>

			{/* ── RIGHT: Results Table ── */}
			<div className="w-2/3 overflow-y-auto p-8 bg-gray-50">
				{(
					elluminateChat?.responseMessage &&
					/please choose an arp template/i.test(elluminateChat.responseMessage)
				) ?
					<ARPTemplateSelector
						onSelect={(template) => {
							setPendingTemplate(template);
							setShowDocConfirm(true);
						}}
					/>
				: (
					elluminateChat?.tableData?.length > 0 ||
					elluminateChat?.sources?.length > 0
				) ?
					<div className="space-y-6">
						{elluminateChat.tableData?.length > 0 ?
							<ResultsTable
								sources={elluminateChat.tableData}
								onFileNameClick={onFileNameClick}
								onSourceLinkClick={onSourceLinkClick}
								isChangeRequest={true}
							/>
						:	<ResultsTable
								sources={elluminateChat.sources}
								onFileNameClick={onFileNameClick}
								onSourceLinkClick={onSourceLinkClick}
							/>
						}
					</div>
				:	<div className="flex items-center justify-center h-96 text-gray-400">
						<p>No results to display</p>
					</div>
				}
			</div>

			<DocumentConfirmModal
				show={showDocConfirm}
				docTypeLabel={pendingTemplate || "Document"}
				onConfirm={() => {
					if (pendingTemplate) onTemplateSelect?.(pendingTemplate);
					setShowDocConfirm(false);
					setPendingTemplate(null);
				}}
				onCancel={() => {
					setShowDocConfirm(false);
					setPendingTemplate(null);
				}}
			/>
		</div>
	);
}

export default SplitScreenLayout;
