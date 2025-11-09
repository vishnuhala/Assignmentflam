// WebSocket client for collaborative canvas
export class WebSocketClient {
    constructor(url) {
        // Detect if we're running on Vercel or localhost
        const isVercel = window.location.hostname.includes('vercel.app');
        
        // Configure Socket.IO connection options
        const options = {
            transports: ['websocket', 'polling'], // Try WebSocket first, then polling
            upgrade: true,
            rememberUpgrade: true, // Remember the transport upgrade
            rejectUnauthorized: false, // Allow self-signed certificates
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
            reconnectionDelayMax: 5000,
            randomizationFactor: 0.5,
            timeout: 20000, // Increase timeout for Vercel
            path: '/socket.io' // Explicitly set the path
        };
        
        // For Vercel deployment, we need to handle the connection differently
        if (isVercel) {
            // On Vercel, connect to the same origin without specifying a URL
            this.socket = io(options);
        } else {
            // On localhost, we can use the default connection
            this.socket = io(options);
        }
        
        this.listeners = {};
    }

    // Connect to the WebSocket server
    connect() {
        return new Promise((resolve, reject) => {
            this.socket.on('connect', () => {
                console.log('Connected to server with ID:', this.socket.id);
                resolve(this.socket.id);
            });

            this.socket.on('connect_error', (error) => {
                console.error('Connection error:', error);
                reject(new Error(`Failed to connect to server: ${error.message}`));
            });
            
            this.socket.on('disconnect', (reason) => {
                console.log('Disconnected from server:', reason);
            });
        });
    }

    // Register event listeners
    on(event, callback) {
        this.listeners[event] = callback;
        this.socket.on(event, callback);
    }

    // Emit an event to the server
    emit(event, data) {
        if (this.socket.connected) {
            this.socket.emit(event, data);
        } else {
            console.warn(`Cannot emit event ${event}: Not connected to server`);
        }
    }

    // Disconnect from the server
    disconnect() {
        this.socket.disconnect();
    }

    // Join a drawing room
    joinRoom(roomId) {
        this.socket.emit('join-room', roomId);
    }

    // Leave a drawing room
    leaveRoom(roomId) {
        this.socket.emit('leave-room', roomId);
    }
}