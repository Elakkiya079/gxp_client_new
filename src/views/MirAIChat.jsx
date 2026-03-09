import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { RouteKeys } from "../routes/route-keys.jsx";
import AIQueryService from "../services/AIQueryService";
import Header from "../components/Header";
import LinkConfirmationModal from "../components/LinkConfirmationModal";
import SplitScreenLayout from "../components/SplitScreenLayout";
import NormalLayout from "../components/NormalLayout";

function MirAIChat() {
	const handleClearAll = () => {
		setChatHistory([]);
		setThreadId(null);
		setQuery("");
		setIsChatDisabled(false);
	};

	const navigate = useNavigate();
	const [query, setQuery] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const [chatHistory, setChatHistory] = useState([]);
	const [threadId, setThreadId] = useState(null);
	const [isChatDisabled, setIsChatDisabled] = useState(false);
	const STORAGE_KEY = "mirai_chat_history";

	useEffect(() => {
		try {
			const raw = sessionStorage.getItem(STORAGE_KEY);
			if (raw) {
				const parsed = JSON.parse(raw);
				if (Array.isArray(parsed)) setChatHistory(parsed);
			}
		} catch (e) {
			console.warn("Failed to load chat history from sessionStorage", e);
		}
	}, []);

	useEffect(() => {
		try {
			sessionStorage.setItem(STORAGE_KEY, JSON.stringify(chatHistory));
		} catch (e) {
			console.warn("Failed to save chat history to sessionStorage", e);
		}
	}, [chatHistory]);

	const [showLinkConfirmation, setShowLinkConfirmation] = useState(false);
	const [selectedLink, setSelectedLink] = useState(null);
	const isCancelledRef = useRef(false);
	const chatEndRef = useRef(null);

	const isSendProcessYes = (data) => {
		if (!data) return false;
		const candidates = [
			data?.send_process_query,
			data?.SendProcessQuery,
			data?.sendProcessQuery,
			data?.send_process,
			data?.action,
		];
		for (const c of candidates) {
			if (c === true) return true;
			if (typeof c === "string" && c.toLowerCase() === "yes") return true;
		}
		if (typeof data === "object") {
			if (data.data && typeof data.data === "object") {
				if (data.data.send_process_query === "Yes") return true;
			}
		}
		return false;
	};

	/**
	 * Parse ONE frame's data field:
	 *   textMessage : string | null   → LEFT side bubble
	 *   tableData   : object[] | null → RIGHT side table
	 */
	const parseFrameData = (frameData, frameMessage) => {
		if (typeof frameData === "string") {
			return { textMessage: frameData, tableData: null };
		}
		if (Array.isArray(frameData)) {
			return { textMessage: null, tableData: frameData };
		}
		if (Array.isArray(frameData?.data)) {
			return { textMessage: null, tableData: frameData.data };
		}
		if (frameData?.received_text) {
			return { textMessage: frameData.received_text, tableData: null };
		}
		if (frameData?.message) {
			const isGeneric =
				frameData.message.includes("Request processed") ||
				/Retrieved \d+ (change request|document|item)/.test(frameData.message);
			if (!isGeneric)
				return { textMessage: frameData.message, tableData: null };
		}
		if (frameData?.sources?.selected_sources) {
			return {
				textMessage: null,
				tableData: frameData.sources.selected_sources,
			};
		}
		if (frameMessage) {
			const isGeneric =
				frameMessage.includes("Request processed") ||
				/Retrieved \d+ (change request|document|item)/.test(frameMessage);
			if (!isGeneric) return { textMessage: frameMessage, tableData: null };
		}
		return { textMessage: null, tableData: null };
	};

	/**
	 * Walk ALL frames in the result and split into:
	 *   responseMessages : string[]  — text for LEFT bubbles
	 *   tableData        : object[]  — latest array data for RIGHT panel
	 */
	const processAllFrames = (result) => {
		const responseMessages = [];
		let tableData = [];

		const frames =
			Array.isArray(result.frames) && result.frames.length > 0 ?
				result.frames
			:	[
					{
						data: result.data,
						message: result.message,
						threadId: result.threadId,
					},
				];

		for (const frame of frames) {
			const { textMessage, tableData: frameTable } = parseFrameData(
				frame.data,
				frame.message,
			);
			if (textMessage) responseMessages.push(textMessage);
			if (frameTable && frameTable.length > 0) tableData = frameTable;
		}

		return { responseMessages, tableData };
	};

	const handleSendQuery = async (override) => {
		if (isChatDisabled) return;

		if (override && typeof override === "object" && override.preventDefault) {
			override.preventDefault();
			override = undefined;
		}

		const currentQuery = (override ?? query).trim();
		if (!currentQuery) return;

		setIsLoading(true);
		isCancelledRef.current = false;
		setQuery("");

		let previousChatbotResponse = null;
		if (chatHistory.length > 0) {
			const lastChat = chatHistory[chatHistory.length - 1];
			const firstRow = lastChat.tableData?.[0];
			if (firstRow?.document_id) {
				previousChatbotResponse =
					"Did you receive all the required artifacts linked to the requested CR number?";
			} else if (lastChat.responseMessages?.length > 0) {
				previousChatbotResponse =
					lastChat.responseMessages[lastChat.responseMessages.length - 1];
			} else if (lastChat.responseMessage) {
				previousChatbotResponse = lastChat.responseMessage;
			}
		}

		const messageId = Date.now();
		setChatHistory((prev) => [
			...prev,
			{
				id: messageId,
				userQuery: currentQuery,
				response: null,
				timestamp: formatTimestamp(),
				sources: [],
				responseMessage: "Processing your query...",
				responseMessages: [],
				tableData: [],
				isProcessing: true,
			},
		]);

		try {
			const result = await AIQueryService.sendProcessQuery(
				currentQuery,
				null,
				threadId,
				previousChatbotResponse,
			);

			console.log("result------->", result);

			if (isCancelledRef.current) return;
			if (result.threadId) setThreadId(result.threadId);

			if (result?.success && isSendProcessYes(result.data)) {
				navigate(RouteKeys.GenerateDocument, {
					state: { aiResponse: result.data, query: currentQuery },
				});
				setIsLoading(false);
				return;
			}

			const { responseMessages, tableData } = processAllFrames(result);
			const lastTextMessage =
				responseMessages.length > 0 ?
					responseMessages[responseMessages.length - 1]
				:	"";

			const finalConfirmationText =
				"Thank you for your confirmation, Reload page to Continue";
			if (responseMessages.includes(finalConfirmationText)) {
				setIsChatDisabled(true);
				AIQueryService.disconnectWebsocket();
			}

			setChatHistory((prev) =>
				prev.map((chat) =>
					chat.id !== messageId ?
						chat
					:	{
							...chat,
							response: result,
							responseMessages,
							responseMessage: lastTextMessage,
							tableData,
							sources: tableData,
							isProcessing: false,
						},
				),
			);

			console.log(
				"Frames received:",
				result.frames?.length ?? 1,
				"| Text messages:",
				responseMessages.length,
				"| Table rows:",
				tableData.length,
			);
		} catch (error) {
			console.error("Error sending query:", error);
			const errorMessage =
				error?.error ||
				error?.message ||
				"Something went wrong. Please try again.";
			setChatHistory((prev) =>
				prev.map((chat) =>
					chat.id === messageId ?
						{
							...chat,
							responseMessage: errorMessage,
							responseMessages: [errorMessage],
							isProcessing: false,
							tableData: [],
						}
					:	chat,
				),
			);
		} finally {
			if (!isCancelledRef.current) setIsLoading(false);
		}
	};

	const handleKeyPress = (e) => {
		if (isChatDisabled) return;
		if (e.key === "Enter" && !e.shiftKey) {
			e.preventDefault();
			handleSendQuery();
		}
	};

	const formatTimestamp = () => {
		const now = new Date();
		const hours = now.getHours();
		const minutes = String(now.getMinutes()).padStart(2, "0");
		const ampm = hours >= 12 ? "PM" : "AM";
		const displayHours = hours % 12 || 12;
		const date = now.getDate();
		const month = now.toLocaleString("en-US", { month: "short" });
		return `${displayHours}:${minutes} ${ampm}, ${date} ${month}`;
	};

	const handleSourceLinkClick = (source_link) => {
		setSelectedLink(source_link);
		setShowLinkConfirmation(true);
	};

	const handleProceedLink = () => {
		if (selectedLink) {
			window.open(selectedLink, "_blank");
			setShowLinkConfirmation(false);
			setSelectedLink(null);
		}
	};

	const handleCancelLink = () => {
		setShowLinkConfirmation(false);
		setSelectedLink(null);
	};

	const handleFileNameClick = (fileName) => {
		const changeRequestRegex = /^(CHG\d+|TKD-CR-.+)$/i;
		if (fileName && changeRequestRegex.test(fileName)) {
			handleChangeRequestClick(fileName);
		} else {
			setChatHistory((prev) => [
				...prev,
				{
					id: Date.now(),
					userQuery: `View details for: ${fileName}`,
					response: { success: true },
					timestamp: formatTimestamp(),
					sources: [],
					responseMessages: [],
					isFileSelection: true,
				},
			]);
		}
	};

	const handleChangeRequestClick = async (changeRequestId) => {
		setIsLoading(true);
		isCancelledRef.current = false;

		const messageId = Date.now();
		setChatHistory((prev) => [
			...prev,
			{
				id: messageId,
				userQuery: changeRequestId,
				response: null,
				timestamp: formatTimestamp(),
				sources: [],
				responseMessage: "Processing your query...",
				responseMessages: [],
				tableData: [],
				isProcessing: true,
			},
		]);

		try {
			const result = await AIQueryService.sendProcessQuery(
				changeRequestId,
				null,
				threadId,
				null,
			);

			console.log("Change request details:", result);

			if (isCancelledRef.current) return;
			if (result.threadId) setThreadId(result.threadId);

			if (result?.success && isSendProcessYes(result.data)) {
				navigate(RouteKeys.GenerateDocument, {
					state: { aiResponse: result.data, query: changeRequestId },
				});
				setIsLoading(false);
				return;
			}

			const { responseMessages, tableData } = processAllFrames(result);
			const lastTextMessage =
				responseMessages.length > 0 ?
					responseMessages[responseMessages.length - 1]
				:	"";

			setChatHistory((prev) =>
				prev.map((chat) =>
					chat.id !== messageId ?
						chat
					:	{
							...chat,
							response: result,
							responseMessages,
							responseMessage: lastTextMessage,
							tableData,
							sources: tableData,
							isProcessing: false,
						},
				),
			);
		} catch (error) {
			console.error("Error getting change request details:", error);
			setChatHistory((prev) =>
				prev.map((chat) =>
					chat.id === messageId ?
						{
							...chat,
							responseMessage: "Error loading details",
							responseMessages: ["Error loading details"],
							isProcessing: false,
						}
					:	chat,
				),
			);
		} finally {
			if (!isCancelledRef.current) setIsLoading(false);
		}
	};

	useEffect(() => {
		if (chatEndRef.current) {
			chatEndRef.current.scrollIntoView({ behavior: "smooth" });
		}
	}, [chatHistory]);

	const templateRequestRegex = /please choose an arp template/i;

	const hasTableData = chatHistory.some(
		(chat) =>
			chat.tableData?.length > 0 ||
			(Boolean(chat.responseMessage) &&
				templateRequestRegex.test(chat.responseMessage)),
	);

	const tableDataChat =
		chatHistory.length > 0 ?
			[...chatHistory]
				.reverse()
				.find(
					(chat) =>
						chat.tableData?.length > 0 ||
						(Boolean(chat.responseMessage) &&
							templateRequestRegex.test(chat.responseMessage)),
				)
		:	null;

	const handlePause = () => {
		if (!isLoading) return;
		isCancelledRef.current = true;
		AIQueryService.disconnectWebsocket();
		setIsLoading(false);
		setChatHistory((prev) =>
			prev.map((chat) =>
				chat.isProcessing ?
					{
						...chat,
						isProcessing: false,
						responseMessage: "You have paused this response.",
						responseMessages: ["You have paused this response."],
					}
				:	chat,
			),
		);
	};

	return (
		<div className="min-h-screen bg-gray-50">
			<Header onLogoClick={handleClearAll} />
			<LinkConfirmationModal
				show={showLinkConfirmation}
				selectedLink={selectedLink}
				onProceed={handleProceedLink}
				onCancel={handleCancelLink}
			/>

			{hasTableData && tableDataChat ?
				<SplitScreenLayout
					chatHistory={chatHistory}
					elluminateChat={tableDataChat}
					query={query}
					setQuery={setQuery}
					isLoading={isLoading}
					isChatDisabled={isChatDisabled}
					onKeyPress={handleKeyPress}
					onSendQuery={handleSendQuery}
					onPause={handlePause}
					onFileNameClick={handleFileNameClick}
					onSourceLinkClick={handleSourceLinkClick}
					onTemplateSelect={(template) => {
						navigate(RouteKeys.GenerateDocument, {
							state: {
								aiResponse: tableDataChat?.response || tableDataChat,
								template,
							},
						});
					}}
					chatEndRef={chatEndRef}
				/>
			:	<NormalLayout
					chatHistory={chatHistory}
					query={query}
					setQuery={setQuery}
					isLoading={isLoading}
					isChatDisabled={isChatDisabled}
					onKeyPress={handleKeyPress}
					onSendQuery={handleSendQuery}
					onPause={handlePause}
					onFileNameClick={handleFileNameClick}
					onSourceLinkClick={handleSourceLinkClick}
					chatEndRef={chatEndRef}
				/>
			}
		</div>
	);
}

export default MirAIChat;
