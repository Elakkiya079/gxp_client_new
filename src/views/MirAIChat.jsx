import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { RouteKeys } from "../routes/route-keys.jsx";
import  AIQueryService  from "../services/AIQueryService";
import Header from "../components/Header";
import LinkConfirmationModal from "../components/LinkConfirmationModal";
import SplitScreenLayout from "../components/SplitScreenLayout";
import NormalLayout from "../components/NormalLayout";

function MirAIChat() {
	// Handler to clear all chat and state, and return to NormalLayout
	const handleClearAll = () => {
		setChatHistory([]);
		setThreadId(null);
		setQuery("");
	};
	const navigate = useNavigate();
	const [query, setQuery] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const [chatHistory, setChatHistory] = useState([]);
	const [threadId, setThreadId] = useState(null);
	// Session storage key for persisting chat history within the browser tab
	const STORAGE_KEY = "mirai_chat_history";

	// Load persisted chat history from sessionStorage on mount
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

	// Persist chat history to sessionStorage whenever it changes
	useEffect(() => {
		try {
			sessionStorage.setItem(STORAGE_KEY, JSON.stringify(chatHistory));
		} catch (e) {
			console.warn("Failed to save chat history to sessionStorage", e);
		}
	}, [chatHistory]);
	const [showLinkConfirmation, setShowLinkConfirmation] = useState(false);
	const [selectedLink, setSelectedLink] = useState(null);

	// Helper to detect when backend asks to open the document generator
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
	const chatEndRef = useRef(null);
	const handleSendQuery = async (override) => {
		// Allow being called as an event handler or with a custom query string
		if (override && typeof override === "object" && override.preventDefault) {
			override.preventDefault();
			override = undefined;
		}

		const currentQuery = (override ?? query).trim();
		if (currentQuery) {
			setIsLoading(true);
			setQuery("");

			// Add processing message with user query
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
					tableData: [],
					isProcessing: true,
				},
			]);

			try {
				const result = await AIQueryService.sendProcessQuery(
					currentQuery,
					null,
					threadId,
				);
				
				console.log("result------->", result);

				// Update thread ID for session memory
				if (result.threadId) {
					setThreadId(result.threadId);
				}

				// If backend instructs to open the document generator, navigate there
				if (result?.success && isSendProcessYes(result.data)) {
					navigate(RouteKeys.GenerateDocument, {
						state: { aiResponse: result.data, query: currentQuery },
					});
					setIsLoading(false);
					return;
				}

				// Parse the response based on its structure
				let chatData = {
					id: messageId,
					userQuery: currentQuery,
					response: result,
					timestamp: formatTimestamp(),
					sources: [],
					responseMessage: "",
					tableData: [],
				};

				if (result.success && result.data) {
					const data = result.data;

					// If backend sends a plain string (e.g. "Query information is not sufficient...")
					if (typeof data === "string") {
						chatData.responseMessage = data;
					}
					// Check if response data IS an array directly (ServiceNow format)
					else if (Array.isArray(data)) {
						// Only show table, no message for array data
						chatData.tableData = data;
						chatData.sources = data;
					}
					// Check if response has 'data' array (elluminate format)
					else if (Array.isArray(data.data)) {
						// Only show table, no message for array data
						chatData.tableData = data.data;
						chatData.sources = data.data;
					}
					// Check if response has 'received_text' (random query format)
					else if (data.received_text) {
						chatData.responseMessage = data.received_text;
					}
					// For meaningful messages (skip generic ones)
					else if (data.message) {
						// Skip "Request processed successfully" and "Retrieved X" messages
						if (
							!data.message.includes("Request processed") &&
							!data.message.match(
								/Retrieved \d+ (change request|document|item)/,
							)
						) {
							chatData.responseMessage = data.message;
						}
					}
					// Original format with sources
					else if (data?.sources?.selected_sources) {
						chatData.sources = data.sources.selected_sources;
					}
				}

				// Also filter top-level result.message if it's generic
				if (
					result.message &&
					!result.message.includes("Request processed") &&
					!result.message.match(
						/Retrieved \d+ (change request|document|item)/,
					) &&
					!chatData.tableData.length // Only use if we don't have table data
				) {
					chatData.responseMessage = result.message;
				}

				// Replace the processing message with the actual response
				setChatHistory((prev) =>
					prev.map((chat) => (chat.id === messageId ? chatData : chat)),
				);

				// Log for debugging
				if (result.success) {
					console.log("Query sent successfully:", result.data);
				} else {
					console.error("Query failed:", result.error);
				}
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
								isProcessing: false,
								tableData: [],
							}
						:	chat,
					),
				);
			} finally {
				setIsLoading(false);
			}
		}
	};

	const handleKeyPress = (e) => {
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
		// Check if it's a change request ID (format: CHG0040007 or TKD-CR-XXX)
		const changeRequestRegex = /^(CHG\d+|TKD-CR-.+)$/i;
		if (fileName && changeRequestRegex.test(fileName)) {
			handleChangeRequestClick(fileName);
		} else {
			// Original behavior for other file names
			setChatHistory((prev) => [
				...prev,
				{
					id: Date.now(),
					userQuery: `View details for: ${fileName}`,
					response: { success: true },
					timestamp: formatTimestamp(),
					sources: [],
					isFileSelection: true,
				},
			]);
		}
	};

	const handleChangeRequestClick = async (changeRequestId) => {
		setIsLoading(true);

		// Add processing message with change request ID
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
				tableData: [],
				isProcessing: true,
			},
		]);

		try {
			// Use sendProcessQuery with the change request ID
			const result = await AIQueryService.sendProcessQuery(
				changeRequestId,
				null,
				threadId,
			);
			
			
			console.log("Change request details:", result);

			// Update thread ID for session memory
			if (result.threadId) {
				setThreadId(result.threadId);
			}

			// If backend indicates to open document generator, navigate there
			if (result?.success && isSendProcessYes(result.data)) {
				navigate(RouteKeys.GenerateDocument, {
					state: { aiResponse: result.data, query: changeRequestId },
				});
				setIsLoading(false);
				return;
			}

			// Parse the response
			let chatData = {
				id: messageId,
				userQuery: changeRequestId,
				response: result,
				timestamp: formatTimestamp(),
				sources: [],
				responseMessage: "",
				tableData: [],
			};

			if (result.success && result.data) {
				const data = result.data;

				// If backend sends a plain string, show it as the message
				if (typeof data === "string") {
					chatData.responseMessage = data;
				}
				// Check if response data IS an array directly (ServiceNow format)
				else if (Array.isArray(data)) {
					// Only show table, no message for array data
					chatData.tableData = data;
					chatData.sources = data;
				}
				// Check if response has 'data' array (documents format)
				else if (Array.isArray(data.data)) {
					// Only show table, no message for array data
					chatData.tableData = data.data;
					chatData.sources = data.data;
				}
			}

			// Replace the processing message with the actual response
			setChatHistory((prev) =>
				prev.map((chat) => (chat.id === messageId ? chatData : chat)),
			);
		} catch (error) {
			console.error("Error getting change request details:", error);
			// Replace processing message with error
			setChatHistory((prev) =>
				prev.map((chat) =>
					chat.id === messageId ?
						{
							...chat,
							responseMessage: "Error loading details",
							isProcessing: false,
						}
					:	chat,
				),
			);
		} finally {
			setIsLoading(false);
		}
	};

	// Auto-scroll to bottom when new messages arrive
	useEffect(() => {
		if (chatEndRef.current) {
			chatEndRef.current.scrollIntoView({ behavior: "smooth" });
		}
	}, [chatHistory]);

	// Check if any chat has table data (split screen only when data array is present)
	const templateRequestRegex = /please choose an arp template/i;

	// Show split screen when a chat has table data OR when AI asks to choose an ARP template
	const hasTableData = chatHistory.some(
		(chat) =>
			chat.tableData?.length > 0 ||
			(Boolean(chat.responseMessage) &&
				templateRequestRegex.test(chat.responseMessage)),
	);

	// Get the LATEST chat for split-screen display (prefers chats with table data or template request)
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

	return (
		<div className="min-h-screen bg-gray-50">
			<Header onLogoClick={handleClearAll} />
			<LinkConfirmationModal
				show={showLinkConfirmation}
				selectedLink={selectedLink}
				onProceed={handleProceedLink}
				onCancel={handleCancelLink}
			/>

			{/* Main Chat Interface */}
			{hasTableData && tableDataChat ?
				<SplitScreenLayout
					chatHistory={chatHistory}
					elluminateChat={tableDataChat}
					query={query}
					setQuery={setQuery}
					isLoading={isLoading}
					onKeyPress={handleKeyPress}
					onSendQuery={handleSendQuery}
					onFileNameClick={handleFileNameClick}
					onSourceLinkClick={handleSourceLinkClick}
					onTemplateSelect={(template) => {
						// navigate to document generator with preselected template
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
					onKeyPress={handleKeyPress}
					onSendQuery={handleSendQuery}
					onFileNameClick={handleFileNameClick}
					onSourceLinkClick={handleSourceLinkClick}
					chatEndRef={chatEndRef}
				/>
			}
		</div>
	);
}

export default MirAIChat;
