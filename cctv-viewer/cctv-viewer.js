// CCTV Viewer - WebRTC Implementation
// Author: WebRTC Experiment
// License: MIT

class CCTVViewer {
    constructor() {
        this.streams = new Map();
        this.connections = new Map();
        this.currentLayout = '2x2';
        this.maxStreams = 4;
        this.socket = null;
        this.isFullscreen = false;
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupWebRTC();
        this.updateStreamStatus('Ready to add streams', 'online');
    }

    setupEventListeners() {
        // Grid layout change
        document.getElementById('grid-layout').addEventListener('change', (e) => {
            this.changeGridLayout(e.target.value);
        });

        // Add stream button
        document.getElementById('add-stream').addEventListener('click', () => {
            this.addStream();
        });

        // Clear all streams
        document.getElementById('clear-all').addEventListener('click', () => {
            this.clearAllStreams();
        });

        // Fullscreen toggle
        document.getElementById('fullscreen-toggle').addEventListener('click', () => {
            this.toggleFullscreen();
        });

        // Enter key in stream URL input
        document.getElementById('stream-url').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.addStream();
            }
        });

        // Video slot clicks for fullscreen
        document.addEventListener('click', (e) => {
            if (e.target.closest('.video-slot')) {
                const slot = e.target.closest('.video-slot');
                this.showVideoFullscreen(slot);
            }
        });

        // Modal close
        document.querySelector('.close').addEventListener('click', () => {
            this.closeFullscreenModal();
        });

        // Close modal on background click
        document.getElementById('fullscreen-modal').addEventListener('click', (e) => {
            if (e.target.id === 'fullscreen-modal') {
                this.closeFullscreenModal();
            }
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isFullscreen) {
                this.closeFullscreenModal();
            }
        });
    }

    setupWebRTC() {
        // Initialize socket connection for signaling
        this.initializeSocket();
    }

    initializeSocket() {
        // For demo purposes, skip socket connection and go directly to demo mode
        console.log('Using demo mode - no external dependencies');
        this.updateStreamStatus('Demo mode enabled', 'online');
        this.enableDemoMode();
    }

    enableDemoMode() {
        // For demonstration purposes, create mock video streams
        this.createDemoStreams();
    }

    async createDemoStreams() {
        try {
            // Create a demo stream using user's camera (if available)
            const stream = await navigator.mediaDevices.getUserMedia({ 
                video: { width: 640, height: 480 }, 
                audio: false 
            });
            
            // Add the demo stream to multiple slots to simulate CCTV cameras
            this.addStreamToSlot(stream, 0, 'Demo Camera 1 (Your Camera)');
            
            // Create additional demo streams with different effects
            this.createAdditionalDemoStreams(stream);
            
        } catch (error) {
            console.error('Failed to access camera for demo:', error);
            this.updateStreamStatus('Camera access denied - showing placeholder', 'offline');
            this.showPlaceholderStreams();
        }
    }

    createAdditionalDemoStreams(originalStream) {
        // Create additional demo streams with canvas manipulation
        for (let i = 1; i < 4; i++) {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            const video = document.createElement('video');
            
            canvas.width = 640;
            canvas.height = 480;
            
            video.srcObject = originalStream;
            video.play();
            
            video.addEventListener('loadedmetadata', () => {
                const processFrame = () => {
                    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
                    
                    // Add different effects for each demo camera
                    switch(i) {
                        case 1:
                            // Grayscale effect
                            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                            const data = imageData.data;
                            for (let j = 0; j < data.length; j += 4) {
                                const gray = data[j] * 0.299 + data[j + 1] * 0.587 + data[j + 2] * 0.114;
                                data[j] = gray;
                                data[j + 1] = gray;
                                data[j + 2] = gray;
                            }
                            ctx.putImageData(imageData, 0, 0);
                            break;
                        case 2:
                            // Blue tint effect
                            ctx.fillStyle = 'rgba(0, 100, 255, 0.1)';
                            ctx.fillRect(0, 0, canvas.width, canvas.height);
                            break;
                        case 3:
                            // Grid overlay effect
                            ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
                            ctx.lineWidth = 1;
                            for (let x = 0; x < canvas.width; x += 50) {
                                ctx.beginPath();
                                ctx.moveTo(x, 0);
                                ctx.lineTo(x, canvas.height);
                                ctx.stroke();
                            }
                            for (let y = 0; y < canvas.height; y += 50) {
                                ctx.beginPath();
                                ctx.moveTo(0, y);
                                ctx.lineTo(canvas.width, y);
                                ctx.stroke();
                            }
                            break;
                    }
                    
                    requestAnimationFrame(processFrame);
                };
                processFrame();
            });
            
            const demoStream = canvas.captureStream(30);
            this.addStreamToSlot(demoStream, i, `Demo Camera ${i + 1}`);
        }
    }

    showPlaceholderStreams() {
        // Show animated placeholders
        for (let i = 0; i < 4; i++) {
            const slot = document.querySelector(`[data-slot="${i}"]`);
            const placeholder = slot.querySelector('.placeholder-content');
            placeholder.innerHTML = `
                <div class="loading"></div>
                <p>Camera ${i + 1}</p>
                <p class="placeholder-text">Simulated CCTV feed</p>
            `;
        }
    }

    addStream() {
        const urlInput = document.getElementById('stream-url');
        const streamUrl = urlInput.value.trim();
        
        if (!streamUrl) {
            alert('Please enter a stream URL or room ID');
            return;
        }

        const availableSlot = this.findAvailableSlot();
        if (availableSlot === -1) {
            alert('All camera slots are occupied. Clear some streams first.');
            return;
        }

        this.connectToStream(streamUrl, availableSlot);
        urlInput.value = '';
    }

    findAvailableSlot() {
        const totalSlots = this.getTotalSlots();
        for (let i = 0; i < totalSlots; i++) {
            if (!this.streams.has(i)) {
                return i;
            }
        }
        return -1;
    }

    getTotalSlots() {
        switch (this.currentLayout) {
            case '1x1': return 1;
            case '2x2': return 4;
            case '3x3': return 9;
            case '4x4': return 16;
            default: return 4;
        }
    }

    async connectToStream(streamUrl, slotIndex) {
        try {
            this.updateStreamStatus(`Connecting to ${streamUrl}...`, 'connecting');
            
            // Create RTCPeerConnection
            const peerConnection = new RTCPeerConnection({
                iceServers: [
                    { urls: 'stun:stun.l.google.com:19302' },
                    { urls: 'stun:stun1.l.google.com:19302' }
                ]
            });

            // Handle incoming stream
            peerConnection.ontrack = (event) => {
                const [stream] = event.streams;
                this.addStreamToSlot(stream, slotIndex, `Stream: ${streamUrl}`);
                this.updateStreamStatus(`Connected to ${streamUrl}`, 'online');
            };

            // Handle connection state changes
            peerConnection.onconnectionstatechange = () => {
                const state = peerConnection.connectionState;
                console.log(`Connection state: ${state}`);
                
                if (state === 'failed' || state === 'disconnected') {
                    this.updateStreamStatus(`Connection failed: ${streamUrl}`, 'offline');
                    this.removeStreamFromSlot(slotIndex);
                }
            };

            this.connections.set(slotIndex, peerConnection);

            // For demo purposes, if no real WebRTC connection is available,
            // simulate a connection after a short delay
            setTimeout(() => {
                if (peerConnection.connectionState !== 'connected') {
                    this.simulateStreamConnection(streamUrl, slotIndex);
                }
            }, 3000);

        } catch (error) {
            console.error('Failed to connect to stream:', error);
            this.updateStreamStatus(`Failed to connect: ${streamUrl}`, 'offline');
        }
    }

    simulateStreamConnection(streamUrl, slotIndex) {
        // Create a simulated stream with a canvas showing stream info
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = 640;
        canvas.height = 480;

        let frame = 0;
        const animate = () => {
            // Clear canvas
            ctx.fillStyle = '#2c3e50';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Draw simulated video feed
            ctx.fillStyle = '#34495e';
            ctx.fillRect(20, 20, canvas.width - 40, canvas.height - 40);

            // Draw stream info
            ctx.fillStyle = '#3498db';
            ctx.font = 'bold 24px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('SIMULATED CCTV FEED', canvas.width / 2, 60);

            ctx.fillStyle = '#ecf0f1';
            ctx.font = '18px Arial';
            ctx.fillText(`Stream: ${streamUrl}`, canvas.width / 2, 100);
            ctx.fillText(`Camera ${slotIndex + 1}`, canvas.width / 2, 130);

            // Draw timestamp
            const now = new Date();
            ctx.font = '16px Arial';
            ctx.fillText(now.toLocaleString(), canvas.width / 2, canvas.height - 60);

            // Draw animated elements
            ctx.fillStyle = '#e74c3c';
            ctx.beginPath();
            ctx.arc(50 + (frame % 100), 200 + Math.sin(frame * 0.1) * 20, 5, 0, 2 * Math.PI);
            ctx.fill();

            frame++;
            requestAnimationFrame(animate);
        };
        animate();

        const stream = canvas.captureStream(30);
        this.addStreamToSlot(stream, slotIndex, `Simulated: ${streamUrl}`);
        this.updateStreamStatus(`Simulated connection: ${streamUrl}`, 'online');
    }

    addStreamToSlot(stream, slotIndex, label) {
        const slot = document.querySelector(`[data-slot="${slotIndex}"]`);
        if (!slot) return;

        // Remove placeholder
        const placeholder = slot.querySelector('.placeholder');
        if (placeholder) {
            placeholder.remove();
        }

        // Create video element
        const video = document.createElement('video');
        video.srcObject = stream;
        video.autoplay = true;
        video.muted = true;
        video.playsInline = true;

        // Create controls overlay
        const controls = document.createElement('div');
        controls.className = 'video-controls';
        controls.innerHTML = `
            <div class="camera-label">${label}</div>
            <div class="stream-info">Live • ${new Date().toLocaleTimeString()}</div>
        `;

        slot.appendChild(video);
        slot.appendChild(controls);

        this.streams.set(slotIndex, { stream, video, label });
    }

    removeStreamFromSlot(slotIndex) {
        const slot = document.querySelector(`[data-slot="${slotIndex}"]`);
        if (!slot) return;

        // Remove video and controls
        const video = slot.querySelector('video');
        const controls = slot.querySelector('.video-controls');
        
        if (video) video.remove();
        if (controls) controls.remove();

        // Add back placeholder
        const placeholder = document.createElement('div');
        placeholder.className = 'placeholder';
        placeholder.innerHTML = `
            <div class="placeholder-content">
                <i class="camera-icon">📹</i>
                <p>Camera ${slotIndex + 1}</p>
                <p class="placeholder-text">No stream connected</p>
            </div>
        `;
        slot.appendChild(placeholder);

        // Clean up
        this.streams.delete(slotIndex);
        
        const connection = this.connections.get(slotIndex);
        if (connection) {
            connection.close();
            this.connections.delete(slotIndex);
        }
    }

    clearAllStreams() {
        if (confirm('Are you sure you want to clear all streams?')) {
            const totalSlots = this.getTotalSlots();
            for (let i = 0; i < totalSlots; i++) {
                this.removeStreamFromSlot(i);
            }
            this.updateStreamStatus('All streams cleared', 'online');
        }
    }

    changeGridLayout(layout) {
        this.currentLayout = layout;
        const grid = document.getElementById('video-grid');
        
        // Remove old grid class
        grid.className = grid.className.replace(/grid-\d+x\d+/, '');
        grid.classList.add(`grid-${layout}`);

        // Update max streams
        this.maxStreams = this.getTotalSlots();

        // Add/remove slots as needed
        this.updateGridSlots();
        
        this.updateStreamStatus(`Changed to ${layout} layout`, 'online');
    }

    updateGridSlots() {
        const grid = document.getElementById('video-grid');
        const currentSlots = grid.querySelectorAll('.video-slot').length;
        const requiredSlots = this.getTotalSlots();

        if (currentSlots < requiredSlots) {
            // Add more slots
            for (let i = currentSlots; i < requiredSlots; i++) {
                const slot = document.createElement('div');
                slot.className = 'video-slot';
                slot.setAttribute('data-slot', i);
                slot.innerHTML = `
                    <div class="placeholder">
                        <div class="placeholder-content">
                            <i class="camera-icon">📹</i>
                            <p>Camera ${i + 1}</p>
                            <p class="placeholder-text">No stream connected</p>
                        </div>
                    </div>
                `;
                grid.appendChild(slot);
            }
        } else if (currentSlots > requiredSlots) {
            // Remove excess slots
            for (let i = currentSlots - 1; i >= requiredSlots; i--) {
                this.removeStreamFromSlot(i);
                const slot = document.querySelector(`[data-slot="${i}"]`);
                if (slot) slot.remove();
            }
        }
    }

    showVideoFullscreen(slot) {
        const video = slot.querySelector('video');
        if (!video) return;

        const modal = document.getElementById('fullscreen-modal');
        const container = document.getElementById('fullscreen-video-container');
        
        // Clone the video element
        const fullscreenVideo = video.cloneNode(true);
        fullscreenVideo.srcObject = video.srcObject;
        
        container.innerHTML = '';
        container.appendChild(fullscreenVideo);
        
        modal.style.display = 'block';
        this.isFullscreen = true;
    }

    closeFullscreenModal() {
        const modal = document.getElementById('fullscreen-modal');
        modal.style.display = 'none';
        this.isFullscreen = false;
    }

    toggleFullscreen() {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen();
        } else {
            document.exitFullscreen();
        }
    }

    updateStreamStatus(message, status) {
        const statusList = document.getElementById('stream-status');
        const statusItem = document.createElement('div');
        statusItem.className = 'status-item';
        statusItem.innerHTML = `
            <span class="status-indicator ${status}">●</span>
            <span>${message}</span>
        `;
        
        statusList.appendChild(statusItem);
        
        // Keep only last 5 status messages
        const items = statusList.querySelectorAll('.status-item');
        if (items.length > 5) {
            items[0].remove();
        }
        
        // Auto scroll to bottom
        statusList.scrollTop = statusList.scrollHeight;
    }

    handleNewStreamAvailable(data) {
        // Handle incoming stream notifications from signaling server
        console.log('New stream available:', data);
        this.updateStreamStatus(`New stream available: ${data.streamId}`, 'online');
    }
}

// Initialize the CCTV Viewer when the page loads
document.addEventListener('DOMContentLoaded', () => {
    window.cctvViewer = new CCTVViewer();
});

// Utility function to generate unique IDs
function generateUniqueId() {
    return Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
}

// Handle page visibility changes to pause/resume streams
document.addEventListener('visibilitychange', () => {
    const videos = document.querySelectorAll('video');
    videos.forEach(video => {
        if (document.hidden) {
            video.pause();
        } else {
            video.play();
        }
    });
});