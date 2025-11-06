# 🚀 Quick Deployment Guide

## Files Created

✅ **index.html** - Main application with camera feed and UI  
✅ **style.css** - Modern responsive design with dark theme  
✅ **script.js** - Complete gesture detection logic (1312 lines)  
✅ **vercel.json** - Vercel deployment configuration  
✅ **WEB_DEPLOYMENT_README.md** - Comprehensive documentation  

## CDN Libraries Used

All libraries are loaded from CDN (no npm install needed):

```html
<!-- MediaPipe Hands -->
https://cdn.jsdelivr.net/npm/@mediapipe/hands/hands.js

<!-- MediaPipe FaceMesh -->
https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/face_mesh.js

<!-- MediaPipe Utilities -->
https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils/camera_utils.js
https://cdn.jsdelivr.net/npm/@mediapipe/control_utils/control_utils.js
https://cdn.jsdelivr.net/npm/@mediapipe/drawing_utils/drawing_utils.js
```

## Deploy to Vercel in 3 Steps

### Option 1: Vercel CLI (Fastest)

```bash
# 1. Install Vercel CLI
npm install -g vercel

# 2. Login
vercel login

# 3. Deploy
vercel --prod
```

Your app will be live at: `https://your-project.vercel.app`

### Option 2: GitHub + Vercel Dashboard

```bash
# 1. Push to GitHub
git add .
git commit -m "Add web version of monkey gesture detector"
git push origin main

# 2. Go to vercel.com → New Project
# 3. Import your GitHub repo
# 4. Click Deploy (no build settings needed!)
```

### Option 3: Deploy Button

Click this button to deploy instantly:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/AdityaYC/sixsevenhuzz)

## Test Locally First

```bash
# Using Python
python -m http.server 8000

# Using Node.js
npx serve

# Then open: http://localhost:8000
```

## Gesture Detection Thresholds

All thresholds match your Python version:

- **Finger to mouth**: distance < 0.15
- **Raised finger**: index_y < wrist_y, others curled
- **Tongue out**: mouth_movement > 0.015 OR both_hands_y < 0.65
- **Yawn**: mouth_ratio > 0.5
- **Wave motion**: y_range > 0.06
- **Victory**: both_hands_y < 0.35
- **Dancing**: both_hands_y < 0.6

## Features Implemented

✅ All 13+ gestures from Python version  
✅ Real-time processing at 30 FPS  
✅ Gesture stability (3 frames)  
✅ Cooldown system (5 frames)  
✅ Tongue tracking with history  
✅ Hand wave detection  
✅ Finger state analysis (extended/curled)  
✅ Angle and distance calculations  
✅ FPS counter  
✅ Sensitivity adjustment  
✅ Camera switching  
✅ Screenshot feature  
✅ Keyboard shortcuts (H, S, C)  
✅ Help modal with instructions  
✅ Error handling  
✅ Mobile responsive  
✅ Loading screen  
✅ Permission error handling  

## Browser Compatibility

✅ Chrome 90+  
✅ Edge 90+  
✅ Safari 14.3+  
✅ Firefox 88+  
✅ Mobile browsers (iOS 14.3+, Android Chrome)  

## Performance Tips

1. **Good lighting** - Ensures better detection
2. **Clear gestures** - Make distinct movements
3. **Adjust sensitivity** - Use the slider in UI
4. **Close other tabs** - Free up camera/GPU resources

## Troubleshooting

**Camera not working?**
- Allow camera permissions in browser
- Use HTTPS (Vercel provides this automatically)
- Check browser compatibility

**Low FPS?**
- Reduce video resolution in CONFIG
- Lower detection confidence
- Use a more powerful device

**Gestures not detected?**
- Increase sensitivity slider
- Ensure good lighting
- Make clearer gestures
- Check distance from camera

## Next Steps

1. **Test locally** to ensure everything works
2. **Deploy to Vercel** using one of the methods above
3. **Share your link** with others!
4. **Customize** gestures, thresholds, or UI as needed

## Support

- 📖 Full docs: `WEB_DEPLOYMENT_README.md`
- 🐛 Issues: [GitHub Issues](https://github.com/AdityaYC/sixsevenhuzz/issues)
- 💬 Questions: Open a discussion on GitHub

---

**Ready to deploy? Run: `vercel --prod`** 🚀
