/**
 * MONKEY GESTURE DETECTOR - Main JavaScript
 * Real-time gesture detection using MediaPipe Hands and FaceMesh
 * Author: Aditya Punjani
 * Production-ready, optimized for performance
 */

// ===================================
// CONFIGURATION & CONSTANTS
// ===================================

const CONFIG = {
    // Detection thresholds (matching Python version)
    FINGER_TO_MOUTH_DISTANCE: 0.15,
    RAISED_FINGER_THRESHOLD: 0.05,
    TONGUE_MOVEMENT_THRESHOLD: 0.015,
    BOTH_HANDS_Y_THRESHOLD: 0.65,
    YAWN_MOUTH_RATIO: 0.5,
    PEACE_FINGER_SPREAD: 0.05,
    OPEN_PALM_SPREAD: 0.15,
    HAND_WAVE_RANGE: 0.06,
    HANDS_CLOSE_DISTANCE: 0.15,
    VICTORY_HANDS_Y: 0.35,
    DANCING_HANDS_Y: 0.6,
    FACE_COVER_DISTANCE: 0.15,
    KISS_MIN_DISTANCE: 0.12,
    KISS_MAX_DISTANCE: 0.25,
    
    // Stability settings
    GESTURE_STABILITY_FRAMES: 3,
    GESTURE_COOLDOWN_FRAMES: 5,
    TONGUE_HISTORY_SIZE: 10,
    HAND_HISTORY_SIZE: 8,
    
    // MediaPipe settings
    MIN_DETECTION_CONFIDENCE: 0.7,
    MIN_TRACKING_CONFIDENCE: 0.7,
    MAX_NUM_HANDS: 2,
    MAX_NUM_FACES: 1,
    
    // Performance
    TARGET_FPS: 30,
    CANVAS_WIDTH: 640,
    CANVAS_HEIGHT: 480
};

// Gesture to image/GIF mapping
const GESTURE_REACTIONS = {
    MONKEY_FINGER_MOUTH: {
        image: 'images/monkey_finger_mouth.jpeg',
        label: 'Shh... Quiet!',
        icon: '🤫',
        isGif: false
    },
    MONKEY_FINGER_RAISE: {
        image: 'images/monkey_finger_raise.jpg',
        label: 'Pointing Up!',
        icon: '☝️',
        isGif: false
    },
    TONGUE_OUT: {
        image: 'images/monkey_mouth.gif',
        label: 'Tongue Out!',
        icon: '👅',
        isGif: true
    },
    THUMBS_UP: {
        image: 'images/thumbsup.png',
        label: 'Thumbs Up - Success!',
        icon: '👍',
        isGif: false
    },
    PEACE: {
        image: 'images/cheer.webp',
        label: 'Peace Sign - Cheering!',
        icon: '✌️',
        isGif: false
    },
    OPEN_PALM: {
        image: 'images/princess.gif',
        label: 'Open Palm - Waving!',
        icon: '👋',
        isGif: true
    },
    FIST: {
        image: 'images/hog.jpeg',
        label: 'Fist - Hog Rider!',
        icon: '✊',
        isGif: false
    },
    YAWN: {
        image: 'images/yawn.jpg',
        label: 'Yawning - Tired!',
        icon: '😮',
        isGif: false
    },
    CRYING: {
        image: 'images/goblin_crying.gif',
        label: 'Crying - Sad!',
        icon: '😢',
        isGif: true
    },
    KISSING: {
        image: 'images/princess_kissing.gif',
        label: 'Blowing Kiss!',
        icon: '💋',
        isGif: true
    },
    DANCING: {
        image: 'images/pig-dance-clash-royale.gif',
        label: 'Dancing - Party!',
        icon: '🕺',
        isGif: true
    },
    CLAPPING: {
        image: 'images/did-unc-snap-unc.gif',
        label: 'Clapping - Snap!',
        icon: '👏',
        isGif: true
    },
    VICTORY: {
        image: 'images/67.gif',
        label: 'Victory - Celebration!',
        icon: '🎉',
        isGif: true
    },
    SMILE: {
        image: 'images/smile.jpg',
        label: 'Smiling - Happy!',
        icon: '😊',
        isGif: false
    }
};

// ===================================
// STATE MANAGEMENT
// ===================================

const state = {
    // MediaPipe instances
    hands: null,
    faceMesh: null,
    camera: null,
    
    // Video elements
    videoElement: null,
    canvasElement: null,
    canvasCtx: null,
    
    // Current state
    currentGesture: 'MONKEY_FINGER_MOUTH',
    lastStableGesture: 'MONKEY_FINGER_MOUTH',
    gestureHistory: [],
    gestureCooldown: 0,
    
    // Tracking histories
    tongueXHistory: [],
    leftHandYHistory: [],
    rightHandYHistory: [],
    
    // Performance tracking
    fps: 0,
    lastFrameTime: 0,
    frameCount: 0,
    fpsUpdateTime: 0,
    
    // Camera settings
    currentCameraIndex: 0,
    availableCameras: [],
    
    // Sensitivity
    sensitivity: CONFIG.MIN_DETECTION_CONFIDENCE,
    
    // Animation
    isProcessing: false
};

// ===================================
// UTILITY FUNCTIONS
// ===================================

/**
 * Calculate Euclidean distance between two points
 * @param {Object} p1 - First point with x, y coordinates
 * @param {Object} p2 - Second point with x, y coordinates
 * @returns {number} Distance between points
 */
function calculateDistance(p1, p2) {
    return Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));
}

/**
 * Calculate angle between three points
 * @param {Object} p1 - First point
 * @param {Object} p2 - Middle point (vertex)
 * @param {Object} p3 - Third point
 * @returns {number} Angle in degrees
 */
function calculateAngle(p1, p2, p3) {
    const radians = Math.atan2(p3.y - p2.y, p3.x - p2.x) - Math.atan2(p1.y - p2.y, p1.x - p2.x);
    let angle = Math.abs(radians * 180.0 / Math.PI);
    if (angle > 180.0) {
        angle = 360 - angle;
    }
    return angle;
}

/**
 * Check if a finger is extended
 * @param {Object} tip - Fingertip landmark
 * @param {Object} pip - PIP joint landmark
 * @param {Object} mcp - MCP joint landmark
 * @param {Object} wrist - Wrist landmark
 * @returns {boolean} True if finger is extended
 */
function isFingerExtended(tip, pip, mcp, wrist) {
    // Finger is extended if tip is significantly higher than MCP
    const verticalExtension = tip.y < mcp.y - 0.05;
    
    // Check if finger is straight (angle between joints)
    const angle = calculateAngle(mcp, pip, tip);
    const isStraight = angle > 140; // More than 140 degrees = straight
    
    // Distance from tip to wrist should be greater than MCP to wrist
    const tipToWrist = calculateDistance(tip, wrist);
    const mcpToWrist = calculateDistance(mcp, wrist);
    const isExtendedDistance = tipToWrist > mcpToWrist * 1.1;
    
    return verticalExtension && (isStraight || isExtendedDistance);
}

/**
 * Check if a finger is curled
 * @param {Object} tip - Fingertip landmark
 * @param {Object} pip - PIP joint landmark
 * @param {Object} mcp - MCP joint landmark
 * @param {Object} wrist - Wrist landmark
 * @returns {boolean} True if finger is curled
 */
function isFingerCurled(tip, pip, mcp, wrist) {
    // Finger is curled if tip is close to or below MCP
    const tipBelowMcp = tip.y >= mcp.y - 0.02;
    
    // Check angle - curled finger has smaller angle
    const angle = calculateAngle(mcp, pip, tip);
    const isBent = angle < 120; // Less than 120 degrees = bent
    
    // Distance check
    const tipToWrist = calculateDistance(tip, wrist);
    const mcpToWrist = calculateDistance(mcp, wrist);
    const isClose = tipToWrist < mcpToWrist * 1.2;
    
    return tipBelowMcp || (isBent && isClose);
}

/**
 * Get the state of all fingers for a hand
 * @param {Object} handLandmarks - MediaPipe hand landmarks
 * @returns {Object} Object containing finger states
 */
function getFingerStates(handLandmarks) {
    // MediaPipe browser returns landmarks directly as array
    const landmarks = handLandmarks;
    
    // Get all landmarks
    const thumbTip = landmarks[4];
    const thumbIp = landmarks[3];
    const thumbMcp = landmarks[2];
    
    const indexTip = landmarks[8];
    const indexPip = landmarks[6];
    const indexMcp = landmarks[5];
    
    const middleTip = landmarks[12];
    const middlePip = landmarks[10];
    const middleMcp = landmarks[9];
    
    const ringTip = landmarks[16];
    const ringPip = landmarks[14];
    const ringMcp = landmarks[13];
    
    const pinkyTip = landmarks[20];
    const pinkyPip = landmarks[18];
    const pinkyMcp = landmarks[17];
    
    const wrist = landmarks[0];
    
    // Check each finger
    return {
        thumbExtended: thumbTip.y < thumbIp.y && thumbTip.y < wrist.y - 0.05,
        indexExtended: isFingerExtended(indexTip, indexPip, indexMcp, wrist),
        middleExtended: isFingerExtended(middleTip, middlePip, middleMcp, wrist),
        ringExtended: isFingerExtended(ringTip, ringPip, ringMcp, wrist),
        pinkyExtended: isFingerExtended(pinkyTip, pinkyPip, pinkyMcp, wrist),
        indexCurled: isFingerCurled(indexTip, indexPip, indexMcp, wrist),
        middleCurled: isFingerCurled(middleTip, middlePip, middleMcp, wrist),
        ringCurled: isFingerCurled(ringTip, ringPip, ringMcp, wrist),
        pinkyCurled: isFingerCurled(pinkyTip, pinkyPip, pinkyMcp, wrist)
    };
}

/**
 * Update FPS counter
 */
function updateFPS() {
    const now = performance.now();
    state.frameCount++;
    
    if (now - state.fpsUpdateTime >= 1000) {
        state.fps = Math.round(state.frameCount * 1000 / (now - state.fpsUpdateTime));
        state.frameCount = 0;
        state.fpsUpdateTime = now;
        
        const fpsElement = document.getElementById('fpsCounter');
        if (fpsElement) {
            fpsElement.textContent = `FPS: ${state.fps}`;
        }
    }
}

// ===================================
// GESTURE DETECTION FUNCTIONS
// ===================================

/**
 * Detect thumbs up gesture
 * @param {Array} handLandmarks - Array of hand landmarks
 * @returns {boolean} True if thumbs up detected
 */
function detectThumbsUp(handLandmarks) {
    for (const hand of handLandmarks) {
        const fingerStates = getFingerStates(hand);
        const thumbTip = hand[4];
        const wrist = hand[0];
        
        // Thumbs up: ONLY thumb extended, all other fingers curled
        const thumbUp = fingerStates.thumbExtended && thumbTip.y < wrist.y - 0.1;
        const allFingersCurled = fingerStates.indexCurled && 
                                 fingerStates.middleCurled && 
                                 fingerStates.ringCurled && 
                                 fingerStates.pinkyCurled;
        
        if (thumbUp && allFingersCurled) {
            return true;
        }
    }
    return false;
}

/**
 * Detect peace sign (V sign)
 * @param {Array} handLandmarks - Array of hand landmarks
 * @returns {boolean} True if peace sign detected
 */
function detectPeaceSign(handLandmarks) {
    for (const hand of handLandmarks) {
        const fingerStates = getFingerStates(hand);
        const indexTip = hand[8];
        const middleTip = hand[12];
        
        // Peace sign: ONLY index and middle extended, others curled, fingers spread apart
        const peaceFingers = fingerStates.indexExtended && fingerStates.middleExtended;
        const otherFingersDown = fingerStates.ringCurled && fingerStates.pinkyCurled;
        const fingersSpread = calculateDistance(indexTip, middleTip) > CONFIG.PEACE_FINGER_SPREAD;
        
        if (peaceFingers && otherFingersDown && fingersSpread) {
            return true;
        }
    }
    return false;
}

/**
 * Detect open palm (single hand)
 * @param {Array} handLandmarks - Array of hand landmarks
 * @returns {boolean} True if open palm detected
 */
function detectOpenPalm(handLandmarks) {
    // Only check for SINGLE hand open palm
    if (handLandmarks.length !== 1) {
        return false;
    }
    
    const hand = handLandmarks[0];
    const fingerStates = getFingerStates(hand);
    const indexTip = hand[8];
    const pinkyTip = hand[20];
    
    // Open palm: ALL fingers extended and spread
    const allExtended = fingerStates.indexExtended && 
                       fingerStates.middleExtended && 
                       fingerStates.ringExtended && 
                       fingerStates.pinkyExtended;
    const fingersSpread = calculateDistance(indexTip, pinkyTip) > CONFIG.OPEN_PALM_SPREAD;
    
    return allExtended && fingersSpread;
}

/**
 * Detect fist
 * @param {Array} handLandmarks - Array of hand landmarks
 * @returns {boolean} True if fist detected
 */
function detectFist(handLandmarks) {
    for (const hand of handLandmarks) {
        const fingerStates = getFingerStates(hand);
        
        // Fist: ALL fingers curled tightly
        const allCurled = fingerStates.indexCurled && 
                         fingerStates.middleCurled && 
                         fingerStates.ringCurled && 
                         fingerStates.pinkyCurled;
        const thumbNotExtended = !fingerStates.thumbExtended;
        
        if (allCurled && thumbNotExtended) {
            return true;
        }
    }
    return false;
}

/**
 * Detect finger to mouth gesture
 * @param {Array} handLandmarks - Array of hand landmarks
 * @param {Array} faceLandmarks - Array of face landmarks
 * @returns {boolean} True if finger to mouth detected
 */
function detectFingerToMouth(handLandmarks, faceLandmarks) {
    if (!handLandmarks || !faceLandmarks || faceLandmarks.length === 0) {
        return false;
    }
    
    const face = faceLandmarks[0];
    const mouthTop = face[13];
    const mouthBottom = face[14];
    const mouthCenterX = (mouthTop.x + mouthBottom.x) / 2;
    const mouthCenterY = (mouthTop.y + mouthBottom.y) / 2;
    
    for (const hand of handLandmarks) {
        const indexFingerTip = hand[8];
        const distance = Math.sqrt(
            Math.pow(indexFingerTip.x - mouthCenterX, 2) + 
            Math.pow(indexFingerTip.y - mouthCenterY, 2)
        );
        
        if (distance < CONFIG.FINGER_TO_MOUTH_DISTANCE) {
            return true;
        }
    }
    return false;
}

/**
 * Detect raised finger (pointing)
 * @param {Array} handLandmarks - Array of hand landmarks
 * @returns {boolean} True if raised finger detected
 */
function detectRaisedFinger(handLandmarks) {
    for (const hand of handLandmarks) {
        const fingerStates = getFingerStates(hand);
        
        // Pointing: ONLY index finger extended, all others curled
        const indexOnly = fingerStates.indexExtended && 
                         fingerStates.middleCurled && 
                         fingerStates.ringCurled && 
                         fingerStates.pinkyCurled;
        
        if (indexOnly) {
            return true;
        }
    }
    return false;
}

/**
 * Detect yawn (mouth wide open)
 * @param {Array} faceLandmarks - Array of face landmarks
 * @returns {boolean} True if yawn detected
 */
function detectYawn(faceLandmarks) {
    if (!faceLandmarks || faceLandmarks.length === 0) {
        return false;
    }
    
    const face = faceLandmarks[0];
    const upperLip = face[13];
    const lowerLip = face[14];
    const mouthLeft = face[61];
    const mouthRight = face[291];
    
    // Calculate mouth aspect ratio
    const mouthHeight = calculateDistance(upperLip, lowerLip);
    const mouthWidth = calculateDistance(mouthLeft, mouthRight);
    const mouthAspectRatio = mouthHeight / (mouthWidth + 0.001);
    
    // Yawn: mouth is very open (high aspect ratio)
    return mouthAspectRatio > CONFIG.YAWN_MOUTH_RATIO;
}

/**
 * Detect tongue out with side-to-side movement
 * @param {Array} faceLandmarks - Array of face landmarks
 * @returns {boolean} True if tongue out detected
 */
function detectTongueOut(faceLandmarks) {
    if (!faceLandmarks || faceLandmarks.length === 0) {
        return false;
    }
    
    const face = faceLandmarks[0];
    const upperLip = face[13];
    const lowerLip = face[14];
    const mouthLeft = face[61];
    const mouthRight = face[291];
    
    // Calculate mouth opening (vertical distance)
    const mouthHeight = Math.abs(upperLip.y - lowerLip.y);
    
    // Calculate mouth horizontal center
    const mouthCenterX = (mouthLeft.x + mouthRight.x) / 2;
    
    // Track tongue position (approximated by mouth opening position)
    if (mouthHeight > 0.02) { // Mouth is open
        state.tongueXHistory.push(mouthCenterX);
        if (state.tongueXHistory.length > CONFIG.TONGUE_HISTORY_SIZE) {
            state.tongueXHistory.shift();
        }
        
        // Check for side-to-side movement
        if (state.tongueXHistory.length >= CONFIG.TONGUE_HISTORY_SIZE) {
            const xMin = Math.min(...state.tongueXHistory);
            const xMax = Math.max(...state.tongueXHistory);
            const xRange = xMax - xMin;
            
            // If there's horizontal movement
            if (xRange > CONFIG.TONGUE_MOVEMENT_THRESHOLD) {
                return true;
            }
        }
    } else {
        // Clear history if mouth is closed
        state.tongueXHistory = [];
    }
    
    return false;
}

/**
 * Detect wave motion (both hands moving up and down)
 * @param {Array} handLandmarks - Array of hand landmarks
 * @returns {boolean} True if wave motion detected
 */
function detectWaveMotion(handLandmarks) {
    if (handLandmarks.length < 2) {
        return false;
    }
    
    // Get finger states for both hands
    const hand1States = getFingerStates(handLandmarks[0]);
    const hand2States = getFingerStates(handLandmarks[1]);
    
    // Check if both hands have open palms (all fingers extended)
    const hand1Open = hand1States.indexExtended && 
                     hand1States.middleExtended && 
                     hand1States.ringExtended && 
                     hand1States.pinkyExtended;
    const hand2Open = hand2States.indexExtended && 
                     hand2States.middleExtended && 
                     hand2States.ringExtended && 
                     hand2States.pinkyExtended;
    
    if (hand1Open && hand2Open) {
        // Track hand positions over time
        const wrist1 = handLandmarks[0][0];
        const wrist2 = handLandmarks[1][0];
        
        // Determine which is left and which is right based on x position
        const leftWrist = wrist1.x < wrist2.x ? wrist1 : wrist2;
        const rightWrist = wrist1.x < wrist2.x ? wrist2 : wrist1;
        
        // Add to history
        state.leftHandYHistory.push(leftWrist.y);
        state.rightHandYHistory.push(rightWrist.y);
        
        // Keep history size limited
        if (state.leftHandYHistory.length > CONFIG.HAND_HISTORY_SIZE) {
            state.leftHandYHistory.shift();
        }
        if (state.rightHandYHistory.length > CONFIG.HAND_HISTORY_SIZE) {
            state.rightHandYHistory.shift();
        }
        
        // Check for up-down movement (wave motion)
        if (state.leftHandYHistory.length >= CONFIG.HAND_HISTORY_SIZE) {
            // Calculate vertical movement range
            const leftYMin = Math.min(...state.leftHandYHistory);
            const leftYMax = Math.max(...state.leftHandYHistory);
            const leftYRange = leftYMax - leftYMin;
            
            const rightYMin = Math.min(...state.rightHandYHistory);
            const rightYMax = Math.max(...state.rightHandYHistory);
            const rightYRange = rightYMax - rightYMin;
            
            // Both hands moving up and down significantly
            const bothWaving = leftYRange > CONFIG.HAND_WAVE_RANGE && rightYRange > CONFIG.HAND_WAVE_RANGE;
            
            if (bothWaving) {
                return true;
            }
        }
    } else {
        // Clear history if hands are not open
        state.leftHandYHistory = [];
        state.rightHandYHistory = [];
    }
    
    return false;
}

/**
 * Detect covering face (crying gesture)
 * @param {Array} handLandmarks - Array of hand landmarks
 * @param {Array} faceLandmarks - Array of face landmarks
 * @returns {boolean} True if covering face detected
 */
function detectCoveringFace(handLandmarks, faceLandmarks) {
    if (!handLandmarks || !faceLandmarks || faceLandmarks.length === 0) {
        return false;
    }
    
    const face = faceLandmarks[0];
    const nose = face[1];
    
    for (const hand of handLandmarks) {
        const palmCenter = hand[9]; // Middle finger MCP
        const distanceToFace = Math.sqrt(
            Math.pow(palmCenter.x - nose.x, 2) + 
            Math.pow(palmCenter.y - nose.y, 2)
        );
        
        if (distanceToFace < CONFIG.FACE_COVER_DISTANCE) {
            return true;
        }
    }
    return false;
}

/**
 * Detect kissing gesture
 * @param {Array} handLandmarks - Array of hand landmarks
 * @param {Array} faceLandmarks - Array of face landmarks
 * @returns {boolean} True if kissing gesture detected
 */
function detectKissing(handLandmarks, faceLandmarks) {
    if (!handLandmarks || !faceLandmarks || faceLandmarks.length === 0) {
        return false;
    }
    
    const face = faceLandmarks[0];
    const mouthTop = face[13];
    const mouthBottom = face[14];
    const mouthCenterX = (mouthTop.x + mouthBottom.x) / 2;
    const mouthCenterY = (mouthTop.y + mouthBottom.y) / 2;
    
    for (const hand of handLandmarks) {
        const indexTip = hand[8];
        const distance = Math.sqrt(
            Math.pow(indexTip.x - mouthCenterX, 2) + 
            Math.pow(indexTip.y - mouthCenterY, 2)
        );
        
        // Hand near mouth (blow kiss - hand moves from mouth outward)
        if (distance < CONFIG.KISS_MAX_DISTANCE && distance > CONFIG.KISS_MIN_DISTANCE) {
            return true;
        }
    }
    return false;
}

/**
 * Detect both hands up (dancing)
 * @param {Array} handLandmarks - Array of hand landmarks
 * @returns {boolean} True if dancing detected
 */
function detectDancing(handLandmarks) {
    if (handLandmarks.length < 2) {
        return false;
    }
    
    // Get both hands' positions
    const handYPositions = handLandmarks.map(hand => hand[0].y);
    
    // Check if both hands are raised (easier)
    const bothHandsUp = handYPositions.every(y => y < CONFIG.DANCING_HANDS_Y);
    
    return bothHandsUp;
}

/**
 * Detect clapping motion (hands moving together)
 * @param {Array} handLandmarks - Array of hand landmarks
 * @returns {boolean} True if clapping detected
 */
function detectClapping(handLandmarks) {
    if (handLandmarks.length < 2) {
        return false;
    }
    
    const hand1Center = handLandmarks[0][9]; // Middle finger MCP
    const hand2Center = handLandmarks[1][9];
    const handsDistance = Math.abs(hand1Center.x - hand2Center.x);
    
    // Hands close together (clapping)
    return handsDistance < CONFIG.HANDS_CLOSE_DISTANCE;
}

/**
 * Detect static victory pose (both hands raised high)
 * @param {Array} handLandmarks - Array of hand landmarks
 * @returns {boolean} True if victory pose detected
 */
function detectVictory(handLandmarks) {
    if (handLandmarks.length < 2) {
        return false;
    }
    
    const handYPositions = handLandmarks.map(hand => hand[8].y); // Index finger tips
    
    // Both hands very high (static victory pose)
    return handYPositions.every(y => y < CONFIG.VICTORY_HANDS_Y);
}

// ===================================
// MAIN GESTURE PROCESSING
// ===================================

/**
 * Process all detections and determine current gesture
 * @param {Object} handsResults - MediaPipe Hands results
 * @param {Object} faceResults - MediaPipe FaceMesh results
 * @returns {string} Detected gesture name
 */
function processGestures(handsResults, faceResults) {
    const handLandmarks = handsResults.multiHandLandmarks || [];
    const faceLandmarks = faceResults.multiFaceLandmarks || [];
    
    let detectedGesture = 'SMILE'; // Default state
    
    // GESTURE DETECTION PRIORITY (highest to lowest)
    // Following the same order as Python version
    
    // 1. Thumbs up (highest priority for clear gesture)
    if (handLandmarks.length > 0 && detectThumbsUp(handLandmarks)) {
        detectedGesture = 'THUMBS_UP';
    }
    // 2. Wave motion (both hands moving up and down)
    else if (handLandmarks.length >= 2 && detectWaveMotion(handLandmarks)) {
        detectedGesture = 'VICTORY';
    }
    // 3. Peace sign
    else if (handLandmarks.length > 0 && detectPeaceSign(handLandmarks)) {
        detectedGesture = 'PEACE';
    }
    // 4. Open palm (single hand only)
    else if (handLandmarks.length === 1 && detectOpenPalm(handLandmarks)) {
        detectedGesture = 'OPEN_PALM';
    }
    // 5. Fist
    else if (handLandmarks.length > 0 && detectFist(handLandmarks)) {
        detectedGesture = 'FIST';
    }
    // 6. Finger to mouth
    else if (handLandmarks.length > 0 && faceLandmarks.length > 0 && detectFingerToMouth(handLandmarks, faceLandmarks)) {
        detectedGesture = 'MONKEY_FINGER_MOUTH';
    }
    // 7. Raised finger (pointing)
    else if (handLandmarks.length > 0 && detectRaisedFinger(handLandmarks)) {
        detectedGesture = 'MONKEY_FINGER_RAISE';
    }
    // 8. Yawn
    else if (faceLandmarks.length > 0 && detectYawn(faceLandmarks)) {
        detectedGesture = 'YAWN';
    }
    // 9. Covering face (crying)
    else if (handLandmarks.length > 0 && faceLandmarks.length > 0 && detectCoveringFace(handLandmarks, faceLandmarks)) {
        detectedGesture = 'CRYING';
    }
    // 10. Kissing
    else if (handLandmarks.length > 0 && faceLandmarks.length > 0 && detectKissing(handLandmarks, faceLandmarks)) {
        detectedGesture = 'KISSING';
    }
    // 11. Dancing (both hands up)
    else if (handLandmarks.length >= 2 && detectDancing(handLandmarks)) {
        detectedGesture = 'DANCING';
    }
    // 12. Clapping
    else if (handLandmarks.length >= 2 && detectClapping(handLandmarks)) {
        detectedGesture = 'CLAPPING';
    }
    // 13. Victory (static pose)
    else if (handLandmarks.length >= 2 && detectVictory(handLandmarks)) {
        detectedGesture = 'VICTORY';
    }
    // 14. Tongue out
    else if (faceLandmarks.length > 0 && detectTongueOut(faceLandmarks)) {
        detectedGesture = 'TONGUE_OUT';
    }
    
    return detectedGesture;
}

/**
 * Apply gesture stability - only change if gesture is stable
 * @param {string} detectedGesture - Currently detected gesture
 * @returns {string} Stable gesture to display
 */
function applyGestureStability(detectedGesture) {
    // Add to history
    state.gestureHistory.push(detectedGesture);
    if (state.gestureHistory.length > CONFIG.GESTURE_STABILITY_FRAMES) {
        state.gestureHistory.shift();
    }
    
    // Check if gesture is stable (same for multiple frames)
    if (state.gestureHistory.length >= CONFIG.GESTURE_STABILITY_FRAMES) {
        const allSame = state.gestureHistory.every(g => g === detectedGesture);
        
        if (allSame && detectedGesture !== state.lastStableGesture && state.gestureCooldown <= 0) {
            // Gesture changed - update
            state.lastStableGesture = detectedGesture;
            state.gestureCooldown = CONFIG.GESTURE_COOLDOWN_FRAMES;
            console.log(`✅ ${detectedGesture} detected!`);
        }
    }
    
    // Decrease cooldown
    if (state.gestureCooldown > 0) {
        state.gestureCooldown--;
    }
    
    return state.lastStableGesture;
}

/**
 * Update UI with current gesture
 * @param {string} gesture - Current gesture name
 */
function updateUI(gesture) {
    const reaction = GESTURE_REACTIONS[gesture] || GESTURE_REACTIONS.SMILE;
    
    // Update reaction image
    const reactionImg = document.getElementById('reactionImage');
    if (reactionImg && reactionImg.src !== reaction.image) {
        reactionImg.src = reaction.image;
    }
    
    // Update reaction label
    const reactionLabel = document.getElementById('reactionLabel');
    if (reactionLabel) {
        reactionLabel.textContent = reaction.label;
    }
    
    // Update status badge
    const statusIcon = document.querySelector('.status-icon');
    const statusText = document.getElementById('statusText');
    if (statusIcon) {
        statusIcon.textContent = reaction.icon;
    }
    if (statusText) {
        statusText.textContent = reaction.label;
    }
}

// ===================================
// MEDIAPIPE INITIALIZATION
// ===================================

/**
 * Initialize MediaPipe Hands
 */
function initializeHands() {
    return new Promise((resolve, reject) => {
        try {
            state.hands = new Hands({
                locateFile: (file) => {
                    return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
                }
            });
            
            state.hands.setOptions({
                maxNumHands: CONFIG.MAX_NUM_HANDS,
                modelComplexity: 1,
                minDetectionConfidence: state.sensitivity,
                minTrackingConfidence: state.sensitivity
            });
            
            console.log('✅ MediaPipe Hands initialized');
            resolve();
        } catch (error) {
            console.error('❌ Error initializing Hands:', error);
            reject(error);
        }
    });
}

/**
 * Initialize MediaPipe FaceMesh
 */
function initializeFaceMesh() {
    return new Promise((resolve, reject) => {
        try {
            state.faceMesh = new FaceMesh({
                locateFile: (file) => {
                    return `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`;
                }
            });
            
            state.faceMesh.setOptions({
                maxNumFaces: CONFIG.MAX_NUM_FACES,
                refineLandmarks: true,
                minDetectionConfidence: state.sensitivity,
                minTrackingConfidence: state.sensitivity
            });
            
            console.log('✅ MediaPipe FaceMesh initialized');
            resolve();
        } catch (error) {
            console.error('❌ Error initializing FaceMesh:', error);
            reject(error);
        }
    });
}

/**
 * Setup camera and start video stream
 */
async function setupCamera() {
    try {
        // Get available cameras
        const devices = await navigator.mediaDevices.enumerateDevices();
        state.availableCameras = devices.filter(device => device.kind === 'videoinput');
        
        console.log(`🎥 Found ${state.availableCameras.length} camera(s)`);
        
        // Request camera access
        const constraints = {
            video: {
                width: { ideal: CONFIG.CANVAS_WIDTH },
                height: { ideal: CONFIG.CANVAS_HEIGHT },
                facingMode: 'user'
            },
            audio: false
        };
        
        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        
        state.videoElement.srcObject = stream;
        
        return new Promise((resolve) => {
            state.videoElement.onloadedmetadata = () => {
                state.videoElement.play();
                console.log('✅ Camera started successfully');
                resolve();
            };
        });
    } catch (error) {
        console.error('❌ Camera access error:', error);
        showPermissionError();
        throw error;
    }
}

/**
 * Switch between available cameras
 */
async function switchCamera() {
    if (state.availableCameras.length <= 1) {
        console.log('⚠️ Only one camera available');
        return;
    }
    
    try {
        // Stop current stream
        if (state.videoElement.srcObject) {
            state.videoElement.srcObject.getTracks().forEach(track => track.stop());
        }
        
        // Switch to next camera
        state.currentCameraIndex = (state.currentCameraIndex + 1) % state.availableCameras.length;
        const deviceId = state.availableCameras[state.currentCameraIndex].deviceId;
        
        const constraints = {
            video: {
                deviceId: { exact: deviceId },
                width: { ideal: CONFIG.CANVAS_WIDTH },
                height: { ideal: CONFIG.CANVAS_HEIGHT }
            },
            audio: false
        };
        
        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        state.videoElement.srcObject = stream;
        state.videoElement.play();
        
        console.log(`🔄 Switched to camera ${state.currentCameraIndex + 1}`);
    } catch (error) {
        console.error('❌ Error switching camera:', error);
    }
}

// ===================================
// VIDEO PROCESSING LOOP
// ===================================

let handsResults = null;
let faceResults = null;

/**
 * Process video frame
 */
async function onVideoFrame() {
    if (!state.videoElement || !state.canvasElement || state.isProcessing) {
        requestAnimationFrame(onVideoFrame);
        return;
    }
    
    state.isProcessing = true;
    
    try {
        // Update canvas size to match video
        if (state.canvasElement.width !== state.videoElement.videoWidth) {
            state.canvasElement.width = state.videoElement.videoWidth;
            state.canvasElement.height = state.videoElement.videoHeight;
        }
        
        // Clear canvas
        state.canvasCtx.save();
        state.canvasCtx.clearRect(0, 0, state.canvasElement.width, state.canvasElement.height);
        
        // Process with MediaPipe (async)
        await Promise.all([
            state.hands.send({ image: state.videoElement }).then(results => {
                handsResults = results;
            }),
            state.faceMesh.send({ image: state.videoElement }).then(results => {
                faceResults = results;
            })
        ]);
        
        // Process gestures
        const detectedGesture = processGestures(handsResults, faceResults);
        const stableGesture = applyGestureStability(detectedGesture);
        
        // Update UI
        updateUI(stableGesture);
        
        // Update FPS
        updateFPS();
        
        state.canvasCtx.restore();
    } catch (error) {
        console.error('Error processing frame:', error);
    }
    
    state.isProcessing = false;
    requestAnimationFrame(onVideoFrame);
}

// ===================================
// UI EVENT HANDLERS
// ===================================

/**
 * Show permission error message
 */
function showPermissionError() {
    const errorElement = document.getElementById('permissionError');
    const mainContainer = document.getElementById('mainContainer');
    const loadingScreen = document.getElementById('loadingScreen');
    
    if (errorElement) {
        errorElement.classList.remove('hidden');
    }
    if (mainContainer) {
        mainContainer.classList.add('hidden');
    }
    if (loadingScreen) {
        loadingScreen.classList.add('hidden');
    }
}

/**
 * Hide permission error and retry
 */
function hidePermissionError() {
    const errorElement = document.getElementById('permissionError');
    if (errorElement) {
        errorElement.classList.add('hidden');
    }
}

/**
 * Take screenshot
 */
function takeScreenshot() {
    try {
        // Create a temporary canvas
        const tempCanvas = document.createElement('canvas');
        const tempCtx = tempCanvas.getContext('2d');
        
        // Set canvas size
        tempCanvas.width = state.videoElement.videoWidth;
        tempCanvas.height = state.videoElement.videoHeight;
        
        // Draw current video frame
        tempCtx.drawImage(state.videoElement, 0, 0);
        
        // Convert to blob and download
        tempCanvas.toBlob((blob) => {
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `monkey-gesture-${Date.now()}.png`;
            a.click();
            URL.revokeObjectURL(url);
            
            console.log('📸 Screenshot saved!');
        });
    } catch (error) {
        console.error('Error taking screenshot:', error);
    }
}

/**
 * Update sensitivity setting
 */
function updateSensitivity(value) {
    state.sensitivity = parseFloat(value);
    
    // Update MediaPipe settings
    if (state.hands) {
        state.hands.setOptions({
            minDetectionConfidence: state.sensitivity,
            minTrackingConfidence: state.sensitivity
        });
    }
    if (state.faceMesh) {
        state.faceMesh.setOptions({
            minDetectionConfidence: state.sensitivity,
            minTrackingConfidence: state.sensitivity
        });
    }
    
    // Update UI
    const sensitivityValue = document.getElementById('sensitivityValue');
    if (sensitivityValue) {
        sensitivityValue.textContent = value;
    }
    
    console.log(`🎚️ Sensitivity updated to ${value}`);
}

// ===================================
// MAIN INITIALIZATION
// ===================================

/**
 * Initialize the application
 */
async function initializeApp() {
    console.log('🚀 Starting Monkey Gesture Detector...');
    
    try {
        // Update loading status
        const loadingStatus = document.getElementById('loadingStatus');
        
        // Get DOM elements
        state.videoElement = document.getElementById('videoElement');
        state.canvasElement = document.getElementById('canvasElement');
        state.canvasCtx = state.canvasElement.getContext('2d');
        
        if (!state.videoElement || !state.canvasElement) {
            throw new Error('Required DOM elements not found');
        }
        
        // Initialize MediaPipe
        if (loadingStatus) loadingStatus.textContent = 'Initializing MediaPipe Hands...';
        await initializeHands();
        
        if (loadingStatus) loadingStatus.textContent = 'Initializing MediaPipe FaceMesh...';
        await initializeFaceMesh();
        
        // Setup camera
        if (loadingStatus) loadingStatus.textContent = 'Requesting camera access...';
        await setupCamera();
        
        // Initialize FPS tracking
        state.fpsUpdateTime = performance.now();
        
        // Hide loading screen
        const loadingScreen = document.getElementById('loadingScreen');
        const mainContainer = document.getElementById('mainContainer');
        
        if (loadingScreen) {
            loadingScreen.classList.add('hidden');
        }
        if (mainContainer) {
            mainContainer.classList.remove('hidden');
        }
        
        // Start video processing
        console.log('✅ All systems ready! Starting gesture detection...');
        requestAnimationFrame(onVideoFrame);
        
    } catch (error) {
        console.error('❌ Initialization error:', error);
        showPermissionError();
    }
}

/**
 * Setup event listeners
 */
function setupEventListeners() {
    // Help button
    const helpBtn = document.getElementById('helpBtn');
    const helpModal = document.getElementById('helpModal');
    const closeModal = document.getElementById('closeModal');
    
    if (helpBtn && helpModal) {
        helpBtn.addEventListener('click', () => {
            helpModal.classList.remove('hidden');
        });
    }
    
    if (closeModal && helpModal) {
        closeModal.addEventListener('click', () => {
            helpModal.classList.add('hidden');
        });
        
        // Close on background click
        helpModal.addEventListener('click', (e) => {
            if (e.target === helpModal) {
                helpModal.classList.add('hidden');
            }
        });
    }
    
    // Sensitivity slider
    const sensitivitySlider = document.getElementById('sensitivitySlider');
    if (sensitivitySlider) {
        sensitivitySlider.addEventListener('input', (e) => {
            updateSensitivity(e.target.value);
        });
    }
    
    // Camera switch button
    const toggleCamera = document.getElementById('toggleCamera');
    if (toggleCamera) {
        toggleCamera.addEventListener('click', switchCamera);
    }
    
    // Screenshot button
    const screenshotBtn = document.getElementById('screenshotBtn');
    if (screenshotBtn) {
        screenshotBtn.addEventListener('click', takeScreenshot);
    }
    
    // Retry button
    const retryBtn = document.getElementById('retryBtn');
    if (retryBtn) {
        retryBtn.addEventListener('click', () => {
            hidePermissionError();
            initializeApp();
        });
    }
    
    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        if (e.key === 'h' || e.key === 'H') {
            // Toggle help modal
            if (helpModal) {
                helpModal.classList.toggle('hidden');
            }
        } else if (e.key === 's' || e.key === 'S') {
            // Take screenshot
            takeScreenshot();
        } else if (e.key === 'c' || e.key === 'C') {
            // Switch camera
            switchCamera();
        }
    });
    
    console.log('✅ Event listeners setup complete');
}

// ===================================
// APPLICATION ENTRY POINT
// ===================================

// Wait for DOM to be ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        setupEventListeners();
        initializeApp();
    });
} else {
    setupEventListeners();
    initializeApp();
}

console.log('🐵 Monkey Gesture Detector loaded!');
