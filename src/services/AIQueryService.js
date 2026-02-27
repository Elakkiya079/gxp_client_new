import { v4 as uuidv4 } from 'uuid';

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

    // Generate session threadId once per session
    if (!this.sessionThreadId) {
      this.sessionThreadId = threadId || uuidv4();
    }
//wscat -c ws://127.0.0.1:8000/gxp/servicenow_chat   35.91.160.54:8000
    let wsUrl = 'ws://127.0.0.1:8000/gxp/servicenow_chat';
    wsUrl += `?thread_id=${encodeURIComponent(this.sessionThreadId)}`;

    console.log('Connecting to WebSocket:', wsUrl);

    this.socket = new WebSocket(wsUrl);

    this.socket.onopen = () => {
      console.log('WebSocket Connected');
      this.isConnected = true;

      // Send queued messages
      this.messageQueue.forEach((msg) => {
        this.socket?.send(JSON.stringify(msg));
      });
      this.messageQueue = [];
    };

    this.socket.onclose = () => {
      console.log('WebSocket Disconnected');
      this.isConnected = false;
      this.sessionThreadId = null;
      this.socket = null;
    };

    this.socket.onerror = (error) => {
      console.error('WebSocket Error:', error);
      this.isConnected = false;
    };
  }

  connectWebsocket(threadId = null) {
    this.connect(threadId);
  }

  // Gracefully close the WebSocket connection and reset session state
  disconnectWebsocket() {
    try {
      if (this.socket) {
        this.socket.close();
      }
    } catch (e) {
      console.error('Error while closing WebSocket:', e);
    } finally {
      this.socket = null;
      this.isConnected = false;
      this.sessionThreadId = null;
      this.messageQueue = [];
    }
  }

  /**
   * Send query via WebSocket
   * @param {string} userQuery - Current user question / input
   * @param {Array} selectedSources - Optional list of selected sources
   * @param {string|null} threadId - Optional external thread id
   * @param {string|null} chatbotResponse - Optional previous chatbot response text
   */
  sendProcessQuery(userQuery, selectedSources = [], threadId = null, chatbotResponse = null) {
    return new Promise((resolve, reject) => {
      try {
        this.connect(threadId);

        if (!this.socket) {
          reject({
            success: false,
            error: 'WebSocket not initialized',
          });
          return;
        }

        const payload = {
          user_query: userQuery,
          id: uuidv4(),
          thread_id: this.sessionThreadId,
        };

        if (chatbotResponse) {
          payload.chatbot_response = chatbotResponse;
        }

        if (selectedSources?.length > 0) {
          payload.selected_sources = selectedSources;
        }

        const messageHandler = (event) => {
          try {
            const data = JSON.parse(event.data);

            if (data.type === 'connection') {
              console.log('WebSocket connected:', data.message);
              return;
            }

            if (data.type === 'processing') {
              console.log('Processing:', data.message);
              return;
            }

            if (data.type === 'response') {
              this.socket?.removeEventListener('message', messageHandler);

              resolve({
                success: true,
                data: data.data,
                threadId: data.thread_id,
                message: data.message,
              });
            }

            if (data.type === 'error') {
              this.socket?.removeEventListener('message', messageHandler);

              reject({
                success: false,
                error: data.message || 'Unknown error',
                threadId: data.thread_id,
              });
            }
          } catch (err) {
            reject({
              success: false,
              error: 'Invalid WebSocket response',
            });
          }
        };

        this.socket.addEventListener('message', messageHandler);

        if (this.isConnected) {
          this.socket.send(JSON.stringify(payload));
        } else {
          this.messageQueue.push(payload);
        }
      } catch (error) {
        reject({
          success: false,
          error: error?.message || 'WebSocket failed',
        });
      }
    });
  }

  /**
   * Retrieve story and defect artifacts
   */
async  getStoryArtifacts(template) {
  try {
    const response = await fetch("http://localhost:9004/generate-json", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        template: template,
      }),
    });

    if (!response.ok) {
      throw new Error(
        `Failed to fetch artifacts: ${response.status} ${response.statusText}`
      );
    }

    const data = await response.json();

    return {
      success: true,
      data: data,
    };
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

