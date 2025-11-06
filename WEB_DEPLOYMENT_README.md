# 🐵 Monkey Gesture Detector - Web Version

A real-time browser-based gesture detection application that displays monkey reactions based on your hand and face gestures. Built with MediaPipe, vanilla JavaScript, and optimized for Vercel deployment.

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)

## ✨ Features

- **13+ Gesture Detection**: Finger to mouth, raised finger, tongue out, thumbs up, peace sign, and more
- **Real-time Processing**: Smooth 30 FPS gesture detection using MediaPipe
- **Animated Reactions**: GIF and static image responses for each gesture
- **Modern UI**: Responsive design with dark mode aesthetics
- **Performance Optimized**: Efficient rendering with requestAnimationFrame
- **Mobile Responsive**: Works on desktop, tablet, and mobile devices
- **Camera Controls**: Switch between cameras, adjust sensitivity
- **Screenshot Feature**: Capture and download your gestures
- **Keyboard Shortcuts**: Quick access to features (H for help, S for screenshot, C for camera switch)

## 🎯 Supported Gestures

| Gesture | Description | Reaction |
|---------|-------------|----------|
| 🤫 **Finger to Mouth** | Index finger near mouth | Shh Monkey |
| ☝️ **Raised Finger** | Index finger pointing up | Pointing Monkey |
| 👅 **Tongue Out** | Mouth open with side-to-side movement OR both hands raised | Monkey Tongue GIF |
| 👍 **Thumbs Up** | Thumb extended, other fingers closed | Success Image |
| ✌️ **Peace Sign** | Index and middle fingers in V shape | Cheering Image |
| 👋 **Open Palm** | All fingers extended and spread | Princess Waving GIF |
| ✊ **Fist** | All fingers closed | Hog Rider Image |
| 😮 **Yawn** | Mouth wide open | Yawning Monkey |
| 😢 **Covering Face** | Hand covering face | Crying Goblin GIF |
| 💋 **Blow Kiss** | Hand near mouth moving outward | Princess Kissing GIF |
| 🕺 **Dancing** | Both hands raised to middle | Dancing Pig GIF |
| 👏 **Clapping** | Hands close together | Snap GIF |
| 🎉 **Victory** | Both hands raised very high OR waving | 67.gif Celebration |

## 🚀 Quick Start

### Prerequisites

- Modern web browser (Chrome, Edge, Safari 14.3+, Firefox)
- Camera access
- Internet connection (for MediaPipe CDN)

### Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/AdityaYC/sixsevenhuzz.git
   cd sixsevenhuzz
   ```

2. **Serve the files**
   
   Using Python:
   ```bash
   python -m http.server 8000
   ```
   
   Using Node.js:
   ```bash
   npx serve
   ```
   
   Using VS Code Live Server:
   - Install "Live Server" extension
   - Right-click `index.html` → "Open with Live Server"

3. **Open in browser**
   ```
   http://localhost:8000
   ```

4. **Allow camera permissions** when prompted

## 📦 Deployment to Vercel

### Method 1: Vercel CLI (Recommended)

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Deploy**
   ```bash
   vercel
   ```
   
   Follow the prompts:
   - Set up and deploy? **Y**
   - Which scope? Select your account
   - Link to existing project? **N**
   - Project name? `monkey-gesture-detector` (or your choice)
   - In which directory is your code located? `./`
   - Override settings? **N**

4. **Production deployment**
   ```bash
   vercel --prod
   ```

### Method 2: Vercel Dashboard

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Add web version"
   git push origin main
   ```

2. **Import to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository
   - Configure:
     - Framework Preset: **Other**
     - Root Directory: `./`
     - Build Command: (leave empty)
     - Output Directory: (leave empty)
   - Click "Deploy"

3. **Access your app**
   - Your app will be live at: `https://your-project-name.vercel.app`

### Method 3: Deploy Button

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/AdityaYC/sixsevenhuzz)

## 🛠️ Technical Stack

### Frontend
- **HTML5**: Semantic markup with accessibility features
- **CSS3**: Modern styling with CSS Grid, Flexbox, animations
- **Vanilla JavaScript**: No frameworks, pure ES6+

### Libraries (CDN)
- **MediaPipe Hands** (v0.4): Hand landmark detection
- **MediaPipe FaceMesh** (v0.4): Facial landmark detection
- **MediaPipe Camera Utils**: Camera handling utilities

### APIs Used
- **getUserMedia API**: Camera access
- **Canvas API**: Video rendering
- **requestAnimationFrame**: Smooth animations

## 📁 Project Structure

```
instagram-emoji-reaction-main/
├── index.html              # Main HTML file
├── style.css               # Styles and responsive design
├── script.js               # Gesture detection logic
├── vercel.json             # Vercel configuration
├── WEB_DEPLOYMENT_README.md # This file
├── .gitignore              # Git ignore rules
└── images/                 # Monkey reaction images
    ├── monkey_finger_mouth.jpeg
    ├── monkey_finger_raise.jpg
    ├── monkey_mouth.gif
    ├── thumbsup.png
    ├── cheer.webp
    ├── princess.gif
    ├── hog.jpeg
    ├── yawn.jpg
    ├── goblin_crying.gif
    ├── princess_kissing.gif
    ├── pig-dance-clash-royale.gif
    ├── did-unc-snap-unc.gif
    ├── 67.gif
    └── smile.jpg
```

## ⚙️ Configuration

### Detection Thresholds

Edit `script.js` CONFIG object to adjust sensitivity:

```javascript
const CONFIG = {
    FINGER_TO_MOUTH_DISTANCE: 0.15,
    RAISED_FINGER_THRESHOLD: 0.05,
    TONGUE_MOVEMENT_THRESHOLD: 0.015,
    YAWN_MOUTH_RATIO: 0.5,
    // ... more settings
};
```

### MediaPipe Settings

```javascript
MIN_DETECTION_CONFIDENCE: 0.7,  // Detection threshold
MIN_TRACKING_CONFIDENCE: 0.7,   // Tracking threshold
MAX_NUM_HANDS: 2,               // Maximum hands to detect
MAX_NUM_FACES: 1,               // Maximum faces to detect
```

## 🎨 Customization

### Adding New Gestures

1. **Add detection function** in `script.js`:
   ```javascript
   function detectMyGesture(handLandmarks, faceLandmarks) {
       // Your detection logic
       return true/false;
   }
   ```

2. **Add to gesture reactions**:
   ```javascript
   const GESTURE_REACTIONS = {
       MY_GESTURE: {
           image: 'images/my-reaction.gif',
           label: 'My Custom Gesture!',
           icon: '🎯',
           isGif: true
       }
   };
   ```

3. **Add to processing pipeline**:
   ```javascript
   function processGestures(handsResults, faceResults) {
       // ... existing gestures
       else if (detectMyGesture(handLandmarks, faceLandmarks)) {
           detectedGesture = 'MY_GESTURE';
       }
   }
   ```

### Changing Theme

Edit CSS variables in `style.css`:

```css
:root {
    --primary-color: #6366f1;
    --bg-primary: #0f172a;
    --text-primary: #f1f5f9;
    /* ... more variables */
}
```

## 🔧 Troubleshooting

### Camera Not Working

1. **Check browser permissions**
   - Chrome: Settings → Privacy → Camera
   - Safari: Preferences → Websites → Camera
   - Firefox: Preferences → Privacy → Permissions

2. **HTTPS Required**
   - Camera access requires HTTPS (except localhost)
   - Vercel provides HTTPS by default

3. **Browser Compatibility**
   - Use latest Chrome, Edge, Safari, or Firefox
   - Some features may not work in older browsers

### Low FPS / Performance Issues

1. **Reduce video resolution** in `script.js`:
   ```javascript
   CANVAS_WIDTH: 320,  // Lower from 640
   CANVAS_HEIGHT: 240, // Lower from 480
   ```

2. **Adjust detection confidence**:
   ```javascript
   MIN_DETECTION_CONFIDENCE: 0.5,  // Lower for faster processing
   ```

3. **Close other tabs** using camera/GPU

### Gestures Not Detected

1. **Improve lighting** - Ensure good lighting conditions
2. **Adjust sensitivity** - Use the slider in the UI
3. **Make clear gestures** - Exaggerate movements
4. **Check distance** - Stay within camera frame

## 📊 Performance Optimization

### Best Practices

1. **Image Optimization**
   - Compress images before deployment
   - Use WebP format where possible
   - Lazy load non-critical images

2. **Code Optimization**
   - Minify JavaScript and CSS for production
   - Use CDN for MediaPipe libraries
   - Implement service workers for offline support

3. **Caching**
   - Set appropriate cache headers
   - Use Vercel's edge caching

## 🌐 Browser Support

| Browser | Version | Support |
|---------|---------|---------|
| Chrome | 90+ | ✅ Full |
| Edge | 90+ | ✅ Full |
| Safari | 14.3+ | ✅ Full |
| Firefox | 88+ | ✅ Full |
| Opera | 76+ | ✅ Full |
| Mobile Safari | iOS 14.3+ | ✅ Full |
| Chrome Mobile | Latest | ✅ Full |

## 🔐 Privacy & Security

- **No data collection**: All processing happens in the browser
- **No server uploads**: Video never leaves your device
- **Camera access**: Only used for gesture detection
- **HTTPS**: Secure connection required for camera access

## 📝 License

MIT License - see LICENSE file for details

## 👨‍💻 Author

**Aditya Punjani**
- GitHub: [@AdityaYC](https://github.com/AdityaYC)
- Repository: [sixsevenhuzz](https://github.com/AdityaYC/sixsevenhuzz)

## 🙏 Acknowledgments

- **MediaPipe**: Google's ML framework for gesture detection
- **Vercel**: Hosting and deployment platform
- **Community**: All contributors and users

## 📞 Support

For issues, questions, or contributions:
- Open an issue on [GitHub](https://github.com/AdityaYC/sixsevenhuzz/issues)
- Submit a pull request
- Contact via GitHub profile

## 🚧 Roadmap

- [ ] Add more gesture types
- [ ] Implement gesture recording
- [ ] Add sound effects
- [ ] Multi-language support
- [ ] PWA support for offline use
- [ ] Gesture customization UI
- [ ] Social sharing features

---

**Made with ❤️ by Aditya Punjani**

*Happy Gesturing! 🐵*
