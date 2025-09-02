# CCTV Streams Viewer

A web-based CCTV surveillance system built using WebRTC technology. This application allows you to view multiple camera streams simultaneously in a responsive grid layout.

## Features

- **Multi-Camera Grid View**: Support for 1x1, 2x2, 3x3, and 4x4 grid layouts
- **Real-time Streaming**: WebRTC-based video streaming with low latency
- **Responsive Design**: Adapts to different screen sizes and devices
- **Stream Controls**: Add, remove, and manage camera streams
- **Fullscreen View**: Click any camera to view in fullscreen mode
- **Status Monitoring**: Real-time connection status for each stream
- **Demo Mode**: Built-in demonstration with simulated camera feeds

## Getting Started

### Prerequisites

- Modern web browser with WebRTC support (Chrome, Firefox, Safari, Edge)
- Camera access permission for demo mode
- HTTPS connection (required for WebRTC)

### Usage

1. Open `index.html` in your web browser
2. The application will start in demo mode, using your camera to simulate CCTV feeds
3. Use the control panel to:
   - Change grid layout (1x1 to 4x4)
   - Add new stream URLs
   - Clear all streams
   - Toggle fullscreen mode

### Adding Real Streams

To connect to real CCTV streams:

1. Enter a stream URL or WebRTC room ID in the "Add Stream URL" field
2. Click "Add Stream" to connect
3. The stream will appear in the next available camera slot

### Supported Stream Types

- WebRTC peer-to-peer connections
- WebRTC room-based streams
- Demo mode with camera simulation

## Controls

### Grid Layouts
- **1x1**: Single camera view
- **2x2**: Four cameras in a 2x2 grid
- **3x3**: Nine cameras in a 3x3 grid  
- **4x4**: Sixteen cameras in a 4x4 grid

### Keyboard Shortcuts
- **Escape**: Exit fullscreen modal
- **Enter**: Add stream (when typing in URL field)

### Mouse Controls
- **Click Camera**: View camera in fullscreen
- **Hover Camera**: Show camera controls and info

## Technical Details

### Architecture
- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **WebRTC**: Real-time video streaming
- **Socket.io**: Signaling server communication
- **Canvas API**: Video processing and effects

### Browser Compatibility
- Chrome 60+
- Firefox 55+
- Safari 11+
- Edge 79+

### Performance
- Optimized for multiple concurrent streams
- Automatic quality adjustment based on bandwidth
- Efficient grid rendering with CSS Grid

## Demo Mode Features

When camera access is available, the demo mode provides:

1. **Primary Camera**: Direct feed from your webcam
2. **Processed Feeds**: Three additional cameras with different effects:
   - Grayscale filter
   - Blue tint overlay
   - Grid pattern overlay
3. **Simulated CCTV**: Animated overlays showing timestamps and camera info

## Customization

### Adding New Effects
Modify the `createAdditionalDemoStreams()` function in `cctv-viewer.js` to add custom video effects:

```javascript
// Example: Add sepia effect
case 4:
    ctx.filter = 'sepia(100%)';
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    break;
```

### Styling
Customize the appearance by modifying `style.css`:
- Color schemes
- Grid spacing
- Control panel layout
- Animation effects

### Stream Sources
Extend the `connectToStream()` function to support additional stream sources:
- RTSP streams (via WebRTC gateway)
- IP cameras
- Custom signaling protocols

## Troubleshooting

### Common Issues

1. **Camera Access Denied**
   - Grant camera permission in browser settings
   - Ensure HTTPS connection for security requirements

2. **Streams Not Connecting**
   - Check stream URL format
   - Verify network connectivity
   - Check browser console for errors

3. **Poor Performance**
   - Reduce number of simultaneous streams
   - Close other browser tabs
   - Check system resources

### Debug Mode
Enable debug logging by opening browser console. The application logs connection states, stream events, and errors.

## Integration

### With Existing Systems
This CCTV viewer can be integrated with:
- IP camera systems
- Video management software
- Security monitoring platforms
- IoT surveillance networks

### API Extensions
Extend functionality by adding:
- REST API for stream management
- WebSocket commands for remote control
- Recording capabilities
- Motion detection alerts

## Security Considerations

- Always use HTTPS in production
- Implement proper authentication for stream access
- Consider STUN/TURN servers for NAT traversal
- Validate all user inputs for security

## License

This project is part of the WebRTC-Experiment repository and follows the MIT License.

## Credits

Built using the WebRTC-Experiment framework by [Muaz Khan](https://github.com/muaz-khan).

## Support

For issues and questions:
- Check the [WebRTC-Experiment issues](https://github.com/muaz-khan/WebRTC-Experiment/issues)
- Review browser console for error messages
- Test with different browsers and devices

---

*Note: This is a demonstration implementation. For production use, implement proper security measures, stream authentication, and error handling.*