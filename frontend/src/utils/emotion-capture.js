class EmotionCapture {
  constructor(options = {}) {
    this.options = {
      apiEndpoint: '/api/detect/frame',
      everyNFrames: parseInt(options.everyNFrames || 6),
      meetingId: options.meetingId || 'default',
      videoElement: options.videoElement || null,
      onCaptureStart: options.onCaptureStart || (() => {}),
      onCapture: options.onCapture || (() => {}),
      onError: options.onError || console.error
    };
    
    this.frameCount = 0;
    this.isCapturing = false;
    this.canvas = document.createElement('canvas');
    this.ctx = this.canvas.getContext('2d');
  }
  
  async initialize() {
    if (!this.options.videoElement) {
      throw new Error('Video element is required');
    }
    
    try {
      // Use existing video stream if already available
      if (!this.options.videoElement.srcObject) {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: true 
        });
        this.options.videoElement.srcObject = stream;
        
        await new Promise(resolve => {
          this.options.videoElement.onloadedmetadata = () => {
            this.options.videoElement.play();
            resolve();
          };
        });
      }
      
      // Set canvas dimensions to match video
      this.canvas.width = this.options.videoElement.videoWidth;
      this.canvas.height = this.options.videoElement.videoHeight;
      
      return true;
    } catch (error) {
      this.options.onError('Failed to access webcam', error);
      return false;
    }
  }
  
  start() {
    if (this.isCapturing) return;
    this.isCapturing = true;
    this.options.onCaptureStart();
    this.captureLoop();
  }
  
  stop() {
    this.isCapturing = false;
    this.frameCount = 0;
  }
  
  captureLoop() {
    if (!this.isCapturing) return;
    
    // Only capture every N frames
    this.frameCount++;
    
    if (this.frameCount >= this.options.everyNFrames) {
      this.frameCount = 0;
      this.captureFrame();
    }
    
    requestAnimationFrame(() => this.captureLoop());
  }
  
  captureFrame() {
    const video = this.options.videoElement;
    const canvas = this.canvas;
    const ctx = this.ctx;
    
    // Ensure video is ready
    if (!video || video.readyState < 2) {
      return;
    }

    // Ensure canvas has valid dimensions
    if (!canvas.width || !canvas.height) {
      canvas.width = video.videoWidth || canvas.width;
      canvas.height = video.videoHeight || canvas.height;
      if (!canvas.width || !canvas.height) {
        this.options.onError('Capture skipped: canvas has zero size');
        return;
      }
    }

    // Draw video frame to canvas
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    // Convert to blob and send
    canvas.toBlob(async (blob) => {
      if (!blob) {
        this.options.onError('Canvas did not produce a valid image blob');
        return;
      }

      try {
        const form = new FormData();
        form.append('frame', blob, 'frame.jpg');
        form.append('meetingId', this.options.meetingId);
        form.append('frameId', Date.now());
        
        const response = await fetch(this.options.apiEndpoint, {
          method: 'POST',
          body: form
        });
        
        if (response.ok) {
          const result = await response.json();
          this.options.onCapture(result);
        } else if (response.status !== 429) {
          // Don't report 429 (too many requests) errors
          this.options.onError(`API error: ${response.status}`);
        }
      } catch (error) {
        // Just log, don't stop capturing
        this.options.onError('Failed to send frame', error);
      }
    }, 'image/jpeg', 0.8);
  }
}

export default EmotionCapture;
