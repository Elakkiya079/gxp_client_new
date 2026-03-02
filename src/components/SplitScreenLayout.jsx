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

	// Force a re-render while a message is processing so we can swap the label
	useEffect(() => {
		if (!hasProcessing) return;
		const t = setInterval(() => setNow(Date.now()), PROCESSING_TICK_MS);
		return () => clearInterval(t);
	}, [hasProcessing]);

	return (
		<div className="mt-16 h-[calc(100vh-4rem)] flex gap-0">
			{/* Left Side - Chat History */}
			<div className="w-1/3 border-r border-gray-200 flex flex-col overflow-hidden bg-white">
				{/* Chat Messages Area */}
				<div className="flex-1 overflow-y-auto p-6 space-y-4">
					{chatHistory.map((chat) => (
						<div key={chat.id} className="space-y-3">
							{/* User Query */}
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

							{/* AI Response - simplified for chat view */}
							{/*<div className="flex justify-start">
        <div className="bg-gray-100 rounded-lg p-3 max-w-xs">
         <p className="text-sm text-gray-700">
          {chat.responseMessage ?
           chat.responseMessage
          : chat.tableData?.length > 0 ?
           `Retrieved ${chat.tableData.length} change requests`
          : chat.sources.length > 0 ?
           `Found ${chat.sources.length} matching records`
          : "Processing your query..."}
         </p>
        </div>
       </div>*/}
							<div className="flex justify-start">
								<div className="space-y-3">
									{(() => {
										const makeP = (text) => (
											<p className="text-sm text-gray-700">{text}</p>
										);

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

										// Build an array of bubble contents (so we can show multiple responses)
										if (chat.isProcessing) {
											const startedAt =
												typeof chat.id === "number" ? chat.id : Number(chat.id);
											const isGenerating =
												Number.isFinite(startedAt) &&
												now - startedAt >= PROCESSING_DELAY_MS;
											return [
												<div
													key="processing"
													className="flex items-center gap-2 text-sm text-gray-700">
													{isGenerating && spinner}
													<span>
														{isGenerating ?
															"Generating CR related to projects..."
														:	"Processing your query..."}
													</span>
												</div>,
											];
										}

										if (chat.status === "error") {
											if (chat.message === "list index out of range") {
												return [makeP("No Data Found")];
											}
											return [makeP("Invalid Input")];
										}

										if (chat.responseMessage) {
											return [makeP(chat.responseMessage)];
										}

										if (
											chat.tableData?.length > 0 &&
											chat.tableData[0]?.documentType === "No Data Found"
										) {
											return [makeP(chat.tableData[0].message)];
										}

										if (chat.tableData?.length > 0) {
											const firstRow = chat.tableData[0] || {};

											if (firstRow.changeRequestId) {
												return [
													makeP(
														"The Change Requests (CRs) are available in the table on the right. Please review the list and select a CR number to proceed.",
													),
												];
											}

											if (firstRow.document_id) {
												return [
													makeP(
														"The requested artifacts associated with the selected CR number have been successfully retrieved.",
													),
													makeP(
														"Did you receive all the required artifacts linked to the requested CR number?",
													),
												];
											}

											return [
												makeP(
													`Retrieved ${chat.tableData.length} change requests`,
												),
											];
										}

										if (chat.sources?.length > 0) {
											return [makeP(`Found ${chat.sources.length} matching records`)];
										}

										return [makeP("Processing your query...")];
									})().map((bubbleContent, idx) => (
										<div key={idx} className="max-w-xs">
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
											<div className="bg-gray-100 rounded-lg p-3">
												{bubbleContent}
											</div>
										</div>
									))}
								</div>
							</div>
						</div>
					))}
					<div ref={chatEndRef} />
				</div>

				{/* Chat Input Area */}
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
			{console.log("------------------>ellu", elluminateChat?.responseMessage)}
			{/* Right Side - Results Table */}
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
					elluminateChat?.sources?.length > 0 ||
					elluminateChat?.tableData?.length > 0
				) ?
					<div className="space-y-6">
						<div>
							{/*<h2 className="text-lg font-semibold text-gray-900 mb-2">
							User Query: {elluminateChat.userQuery}
							</h2>*/}
							{/* <h2 className="text-lg font-semibold text-gray-900 mb-2">
  <span className="text-gray-600 font-medium">User Query:</span>{" "}
  {elluminateChat.userQuery}
</h2> */}
							{/*{elluminateChat.responseMessage && (
								<p className="text-sm text-gray-600 mb-6">
									{elluminateChat.responseMessage}
								</p>
							)}
							{!elluminateChat.responseMessage && (
								<p className="text-sm text-gray-600 mb-6">
									The following matching records were found across the connected systems:
								</p>
							)}*/}
						</div>

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
					if (pendingTemplate) {
						onTemplateSelect?.(pendingTemplate);
					}
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
