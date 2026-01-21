/**
 * Chat Functionality for n8n Webhook Integration
 * Handles sending messages and displaying responses
 */

(function() {
    // ============================================
    // CONFIGURATION - Update this URL with your n8n webhook
    // ============================================
    const N8N_WEBHOOK_URL = 'YOUR_N8N_WEBHOOK_URL_HERE';
    // Example: 'https://your-n8n-instance.com/webhook/your-webhook-id'
    // ============================================

    // DOM Elements
    const chatMessages = document.getElementById('chat-messages');
    const chatInput = document.getElementById('chat-input');
    const connectionStatus = document.getElementById('connection-status');

    // State
    let isWaitingForResponse = false;

    /**
     * Create a message element
     */
    function createMessageElement(type, prefix, text) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${type}-message`;

        const prefixSpan = document.createElement('span');
        prefixSpan.className = 'message-prefix';
        prefixSpan.textContent = prefix;

        const textSpan = document.createElement('span');
        textSpan.className = 'message-text';
        textSpan.textContent = text;

        messageDiv.appendChild(prefixSpan);
        messageDiv.appendChild(textSpan);

        return messageDiv;
    }

    /**
     * Create typing indicator element
     */
    function createTypingIndicator() {
        const indicator = document.createElement('div');
        indicator.className = 'message bot-message';
        indicator.id = 'typing-indicator';

        const prefix = document.createElement('span');
        prefix.className = 'message-prefix';
        prefix.textContent = '[ORACLE]';

        const typingDiv = document.createElement('div');
        typingDiv.className = 'typing-indicator';
        typingDiv.innerHTML = '<span></span><span></span><span></span>';

        indicator.appendChild(prefix);
        indicator.appendChild(typingDiv);

        return indicator;
    }

    /**
     * Add message to chat
     */
    function addMessage(type, prefix, text) {
        const messageElement = createMessageElement(type, prefix, text);
        chatMessages.appendChild(messageElement);
        scrollToBottom();
    }

    /**
     * Show typing indicator
     */
    function showTypingIndicator() {
        const indicator = createTypingIndicator();
        chatMessages.appendChild(indicator);
        scrollToBottom();
    }

    /**
     * Hide typing indicator
     */
    function hideTypingIndicator() {
        const indicator = document.getElementById('typing-indicator');
        if (indicator) {
            indicator.remove();
        }
    }

    /**
     * Scroll chat to bottom
     */
    function scrollToBottom() {
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    /**
     * Update connection status display
     */
    function updateConnectionStatus(status, text) {
        connectionStatus.textContent = text;
        connectionStatus.style.color = status === 'connected' ? '#00bfff' :
                                       status === 'error' ? '#ff4444' :
                                       '#ffaa00';
    }

    /**
     * Send message to n8n webhook
     */
    async function sendMessage(message) {
        if (isWaitingForResponse) return;

        // Check if webhook URL is configured
        if (N8N_WEBHOOK_URL === 'YOUR_N8N_WEBHOOK_URL_HERE') {
            addMessage('error', '[ERROR]', 'Webhook URL not configured. Please update N8N_WEBHOOK_URL in chat.js');
            return;
        }

        isWaitingForResponse = true;
        updateConnectionStatus('pending', '● TRANSMITTING...');

        // Display user message
        addMessage('user', '[USER]', message);

        // Show typing indicator
        showTypingIndicator();

        try {
            const response = await fetch(N8N_WEBHOOK_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ message: message })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            // Hide typing indicator
            hideTypingIndicator();

            // Display bot response
            const botResponse = data.response || data.output || data.message || data.text || JSON.stringify(data);
            addMessage('bot', '[ORACLE]', botResponse);

            updateConnectionStatus('connected', '● CONNECTED');

        } catch (error) {
            console.error('Error sending message:', error);

            // Hide typing indicator
            hideTypingIndicator();

            // Display error message
            addMessage('error', '[ERROR]', `Transmission failed: ${error.message}`);

            updateConnectionStatus('error', '● CONNECTION ERROR');

            // Reset status after delay
            setTimeout(() => {
                updateConnectionStatus('connected', '● CONNECTED');
            }, 3000);
        }

        isWaitingForResponse = false;
    }

    /**
     * Handle input submission
     */
    function handleSubmit() {
        const message = chatInput.value.trim();

        if (message) {
            sendMessage(message);
            chatInput.value = '';
        }
    }

    /**
     * Initialize event listeners
     */
    function init() {
        // Handle Enter key
        chatInput.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit();
            }
        });

        // Focus input on page load
        chatInput.focus();

        // Keep focus on input when clicking anywhere in chat container
        document.querySelector('.chat-container').addEventListener('click', function() {
            chatInput.focus();
        });

        // Add glitch effect to messages occasionally
        setInterval(function() {
            if (Math.random() > 0.95) {
                const messages = chatMessages.querySelectorAll('.message-text');
                if (messages.length > 0) {
                    const randomMessage = messages[Math.floor(Math.random() * messages.length)];
                    randomMessage.style.textShadow = '2px 0 #ff0000, -2px 0 #00ffff';
                    setTimeout(() => {
                        randomMessage.style.textShadow = '';
                    }, 100);
                }
            }
        }, 2000);

        console.log('%c[MATRIX TERMINAL]', 'color: #00bfff; font-size: 16px;');
        console.log('%cNeural interface initialized.', 'color: #00bfff;');
        console.log('%cConfigure N8N_WEBHOOK_URL in chat.js to enable communications.', 'color: #0088cc;');
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
