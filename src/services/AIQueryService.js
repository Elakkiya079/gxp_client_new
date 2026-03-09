import { v4 as uuidv4 } from "uuid";

// How long to wait after the last response frame before treating the reply as complete.
// Your two frames arrive ~3 ms apart; 300 ms is comfortably safe and still feels instant.
const RESPONSE_SETTLE_MS = 300;

class AIQueryServiceClass {
	constructor() {
		this.socket = null;
		this.isConnected = false;
		this.messageQueue = [];
		this.sessionThreadId = null;
	}

	// Initialize WebSocket connection
	connect(threadId = null) {
		if (this.socket && this.isConnected) return;

		if (!this.sessionThreadId) {
			this.sessionThreadId = threadId || uuidv4();
		}

		let wsUrl = "ws://127.0.0.1:8000/gxp/servicenow_chat";
		wsUrl += `?thread_id=${encodeURIComponent(this.sessionThreadId)}`;

		console.log("Connecting to WebSocket:", wsUrl);

		this.socket = new WebSocket(wsUrl);

		this.socket.onopen = () => {
			console.log("WebSocket Connected");
			this.isConnected = true;
			this.messageQueue.forEach((msg) => {
				this.socket?.send(JSON.stringify(msg));
			});
			this.messageQueue = [];
		};

		this.socket.onclose = () => {
			console.log("WebSocket Disconnected");
			this.isConnected = false;
			this.sessionThreadId = null;
			this.socket = null;
		};

		this.socket.onerror = (error) => {
			console.error("WebSocket Error:", error);
			this.isConnected = false;
		};
	}

	connectWebsocket(threadId = null) {
		this.connect(threadId);
	}

	disconnectWebsocket() {
		try {
			if (this.socket) {
				this.socket.close();
			}
		} catch (e) {
			console.error("Error while closing WebSocket:", e);
		} finally {
			this.socket = null;
			this.isConnected = false;
			this.sessionThreadId = null;
			this.messageQueue = [];
		}
	}

	/**
	 * Send a query via WebSocket and collect ALL response frames.
	 *
	 * The backend can send multiple `type:"response"` frames for one query
	 * (e.g. a plain-text frame followed by an array-of-objects frame).
	 * We accumulate every frame and resolve once no new frame arrives within
	 * RESPONSE_SETTLE_MS milliseconds.
	 *
	 * Resolved value shape:
	 * {
	 *   success: true,
	 *   frames: [           ← every response frame, in arrival order
	 *     { data, message, threadId },
	 *     ...
	 *   ],
	 *   // Legacy convenience fields derived from the LAST frame:
	 *   data: <last frame's data>,
	 *   message: <last frame's message>,
	 *   threadId: <thread_id>,
	 * }
	 */
	sendProcessQuery(
		userQuery,
		selectedSources = [],
		threadId = null,
		chatbotResponse = null,
	) {
		return new Promise((resolve, reject) => {
			try {
				this.connect(threadId);

				if (!this.socket) {
					reject({ success: false, error: "WebSocket not initialized" });
					return;
				}

				const payload = {
					user_query: userQuery,
					id: uuidv4(),
					thread_id: this.sessionThreadId,
				};

				if (chatbotResponse) payload.chatbot_response = chatbotResponse;
				if (selectedSources?.length > 0)
					payload.selected_sources = selectedSources;

				// Accumulated frames for this query
				const collectedFrames = [];
				let settleTimer = null;

				const finish = () => {
					this.socket?.removeEventListener("message", messageHandler);

					if (collectedFrames.length === 0) {
						reject({ success: false, error: "No response received" });
						return;
					}

					// Last frame drives the legacy top-level fields so existing
					// consumers that only read result.data / result.message still work.
					const last = collectedFrames[collectedFrames.length - 1];

					resolve({
						success: true,
						// ── NEW: every frame, each shaped like the old single resolve ──
						frames: collectedFrames,
						// ── LEGACY: last frame's fields (backward compat) ──
						data: last.data,
						message: last.message,
						threadId: last.threadId,
					});
				};

				const messageHandler = (event) => {
					try {
						const data = JSON.parse(event.data);

						if (data.type === "connection") {
							console.log("WebSocket connected:", data.message);
							return;
						}

						if (data.type === "processing") {
							console.log("Processing:", data.message);
							return;
						}

						if (data.type === "response") {
							// Collect this frame
							collectedFrames.push({
								data: data.data,
								message: data.message,
								threadId: data.thread_id,
							});

							console.log(
								`[AIQueryService] Received response frame #${collectedFrames.length}:`,
								data.data,
							);

							// Reset the settle timer — we wait for more frames
							if (settleTimer) clearTimeout(settleTimer);
							settleTimer = setTimeout(finish, RESPONSE_SETTLE_MS);
						}

						if (data.type === "error") {
							if (settleTimer) clearTimeout(settleTimer);
							this.socket?.removeEventListener("message", messageHandler);
							reject({
								success: false,
								error: data.message || "Unknown error",
								threadId: data.thread_id,
							});
						}
					} catch (err) {
						if (settleTimer) clearTimeout(settleTimer);
						reject({ success: false, error: "Invalid WebSocket response" });
					}
				};

				this.socket.addEventListener("message", messageHandler);

				if (this.isConnected) {
					this.socket.send(JSON.stringify(payload));
				} else {
					this.messageQueue.push(payload);
				}
			} catch (error) {
				reject({ success: false, error: error?.message || "WebSocket failed" });
			}
		});
	}

	async getStoryArtifacts(template) {
		try {
			const response = await fetch("http://127.0.0.1:9004/arp/generate-json", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ template }),
			});

			if (!response.ok) {
				throw new Error(
					`Failed to fetch artifacts: ${response.status} ${response.statusText}`,
				);
			}

			const data = await response.json();
			return { success: true, data };
		} catch (error) {
			console.error("Error fetching story artifacts:", error?.message);
			return {
				success: false,
				error: error?.message || "Failed to retrieve artifacts",
			};
		}
	}
}

const AIQueryService = new AIQueryServiceClass();
export default AIQueryService;
