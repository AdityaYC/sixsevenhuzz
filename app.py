#!/usr/bin/env python3
"""
Flask Web Application for Instagram Emoji Reaction
Real-time gesture detection with webcam streaming

Author: Aditya Punjani
"""

from flask import Flask, render_template, Response, jsonify, request
from collections import deque
import threading
import cv2
import mediapipe as mp
import numpy as np
from PIL import Image
import pygame
import os
import time
import base64
from io import BytesIO

app = Flask(__name__)

# --- CONFIGURATION ---
CAMERA_WIDTH = 640
CAMERA_HEIGHT = 480
# Slightly relaxed to improve recall, while smoothing handles stability later
MIN_DETECTION_CONFIDENCE = 0.6
MIN_TRACKING_CONFIDENCE = 0.6
GESTURE_STABILITY_FRAMES = 3
GESTURE_COOLDOWN_FRAMES = 5
HAND_HISTORY_SIZE = 8
# Smoothing for analyze_frame
ANALYZE_HISTORY_SIZE = 5

# Initialize MediaPipe
mp_pose = mp.solutions.pose
mp_face_mesh = mp.solutions.face_mesh
mp_hands = mp.solutions.hands
mp_drawing = mp.solutions.drawing_utils

# Global variables
current_gesture = "SMILE"
gesture_history = []
gesture_change_cooldown = 0
left_hand_y_history = []
right_hand_y_history = []
tongue_x_history = []
analyze_gesture_history = deque(maxlen=ANALYZE_HISTORY_SIZE)

# Persistent MediaPipe models for /analyze_frame (thread-safe via lock)
_mp_models_lock = threading.Lock()
_mp_hands_model = mp.solutions.hands.Hands(
    min_detection_confidence=MIN_DETECTION_CONFIDENCE,
    min_tracking_confidence=MIN_TRACKING_CONFIDENCE,
    max_num_hands=2
)
_mp_face_model = mp.solutions.face_mesh.FaceMesh(
    max_num_faces=1,
    min_detection_confidence=MIN_DETECTION_CONFIDENCE,
    min_tracking_confidence=MIN_TRACKING_CONFIDENCE
)

# Load images
emotion_images = {}

def load_images():
    """Load all emotion images and GIFs"""
    global emotion_images
    
    images_dir = "images"
    
    # Static images
    static_images = {
        "THUMBS_UP": "thumbsup.png",
        "SMILE": "smile.jpg",
        "YAWN": "yawn.jpg",
        "FIST": "hog.jpeg",
        "MONKEY_FINGER_MOUTH": "monkey_finger_mouth.jpeg",
        "MONKEY_FINGER_RAISE": "monkey_finger_raise.jpg",
        "PEACE": "cheer.webp",
    }
    
    for key, filename in static_images.items():
        path = os.path.join(images_dir, filename)
        if os.path.exists(path):
            img = cv2.imread(path)
            if img is not None:
                emotion_images[key] = cv2.resize(img, (400, 400))
    
    # GIF frames (load first frame for now)
    gif_images = {
        "OPEN_PALM": "princess.gif",
        "CRYING": "goblin_crying.gif",
        "KISSING": "princess_kissing.gif",
        "DANCING": "pig-dance-clash-royale.gif",
        "TONGUE_OUT": "monkey_mouth.gif",
        "CLAPPING": "did-unc-snap-unc.gif",
        "VICTORY": "67.gif",
    }
    
    for key, filename in gif_images.items():
        path = os.path.join(images_dir, filename)
        if os.path.exists(path):
            try:
                gif = Image.open(path)
                frame = gif.convert('RGB')
                frame_cv = cv2.cvtColor(np.array(frame), cv2.COLOR_RGB2BGR)
                emotion_images[key] = cv2.resize(frame_cv, (400, 400))
            except:
                pass

# Helper functions
def calculate_angle(p1, p2, p3):
    """Calculate angle between three points"""
    import math
    radians = math.atan2(p3.y - p2.y, p3.x - p2.x) - math.atan2(p1.y - p2.y, p1.x - p2.x)
    angle = abs(radians * 180.0 / math.pi)
    if angle > 180.0:
        angle = 360 - angle
    return angle

def calculate_distance(p1, p2):
    """Calculate Euclidean distance between two points"""
    return ((p1.x - p2.x)**2 + (p1.y - p2.y)**2)**0.5

def is_finger_extended(tip, pip, mcp, wrist):
    """Check if a finger is extended"""
    vertical_extension = tip.y < mcp.y - 0.05
    angle = calculate_angle(mcp, pip, tip)
    is_straight = angle > 140
    tip_to_wrist = calculate_distance(tip, wrist)
    mcp_to_wrist = calculate_distance(mcp, wrist)
    is_extended_distance = tip_to_wrist > mcp_to_wrist * 1.1
    return vertical_extension and (is_straight or is_extended_distance)

def is_finger_curled(tip, pip, mcp, wrist):
    """Check if a finger is curled"""
    tip_below_mcp = tip.y >= mcp.y - 0.02
    angle = calculate_angle(mcp, pip, tip)
    is_bent = angle < 120
    tip_to_wrist = calculate_distance(tip, wrist)
    mcp_to_wrist = calculate_distance(mcp, wrist)
    is_close = tip_to_wrist < mcp_to_wrist * 1.2
    return tip_below_mcp or (is_bent and is_close)

def get_finger_states(hand_landmarks):
    """Get the state of all fingers"""
    thumb_tip = hand_landmarks.landmark[mp_hands.HandLandmark.THUMB_TIP]
    thumb_ip = hand_landmarks.landmark[mp_hands.HandLandmark.THUMB_IP]
    thumb_mcp = hand_landmarks.landmark[mp_hands.HandLandmark.THUMB_MCP]
    
    index_tip = hand_landmarks.landmark[mp_hands.HandLandmark.INDEX_FINGER_TIP]
    index_pip = hand_landmarks.landmark[mp_hands.HandLandmark.INDEX_FINGER_PIP]
    index_mcp = hand_landmarks.landmark[mp_hands.HandLandmark.INDEX_FINGER_MCP]
    
    middle_tip = hand_landmarks.landmark[mp_hands.HandLandmark.MIDDLE_FINGER_TIP]
    middle_pip = hand_landmarks.landmark[mp_hands.HandLandmark.MIDDLE_FINGER_PIP]
    middle_mcp = hand_landmarks.landmark[mp_hands.HandLandmark.MIDDLE_FINGER_MCP]
    
    ring_tip = hand_landmarks.landmark[mp_hands.HandLandmark.RING_FINGER_TIP]
    ring_pip = hand_landmarks.landmark[mp_hands.HandLandmark.RING_FINGER_PIP]
    ring_mcp = hand_landmarks.landmark[mp_hands.HandLandmark.RING_FINGER_MCP]
    
    pinky_tip = hand_landmarks.landmark[mp_hands.HandLandmark.PINKY_TIP]
    pinky_pip = hand_landmarks.landmark[mp_hands.HandLandmark.PINKY_PIP]
    pinky_mcp = hand_landmarks.landmark[mp_hands.HandLandmark.PINKY_MCP]
    
    wrist = hand_landmarks.landmark[mp_hands.HandLandmark.WRIST]
    
    states = {
        'thumb_extended': thumb_tip.y < thumb_ip.y and thumb_tip.y < wrist.y - 0.05,
        'index_extended': is_finger_extended(index_tip, index_pip, index_mcp, wrist),
        'middle_extended': is_finger_extended(middle_tip, middle_pip, middle_mcp, wrist),
        'ring_extended': is_finger_extended(ring_tip, ring_pip, ring_mcp, wrist),
        'pinky_extended': is_finger_extended(pinky_tip, pinky_pip, pinky_mcp, wrist),
        'index_curled': is_finger_curled(index_tip, index_pip, index_mcp, wrist),
        'middle_curled': is_finger_curled(middle_tip, middle_pip, middle_mcp, wrist),
        'ring_curled': is_finger_curled(ring_tip, ring_pip, ring_mcp, wrist),
        'pinky_curled': is_finger_curled(pinky_tip, pinky_pip, pinky_mcp, wrist),
    }
    
    return states

def detect_gesture(results_hands, results_face):
    """Detect gesture from MediaPipe results"""
    global left_hand_y_history, right_hand_y_history
    
    detected_state = "SMILE"
    
    # 1. Thumbs up
    if results_hands.multi_hand_landmarks:
        for hand_landmarks in results_hands.multi_hand_landmarks:
            finger_states = get_finger_states(hand_landmarks)
            thumb_tip = hand_landmarks.landmark[mp_hands.HandLandmark.THUMB_TIP]
            wrist = hand_landmarks.landmark[mp_hands.HandLandmark.WRIST]
            
            thumb_up = finger_states['thumb_extended'] and thumb_tip.y < wrist.y - 0.1
            all_fingers_curled = (finger_states['index_curled'] and 
                                 finger_states['middle_curled'] and 
                                 finger_states['ring_curled'] and 
                                 finger_states['pinky_curled'])
            
            if thumb_up and all_fingers_curled:
                detected_state = "THUMBS_UP"
                break
    
    # 2. Wave motion (two hands)
    if detected_state == "SMILE" and results_hands.multi_hand_landmarks:
        if len(results_hands.multi_hand_landmarks) >= 2:
            hand1_states = get_finger_states(results_hands.multi_hand_landmarks[0])
            hand2_states = get_finger_states(results_hands.multi_hand_landmarks[1])
            
            hand1_open = (hand1_states['index_extended'] and hand1_states['middle_extended'] and 
                         hand1_states['ring_extended'] and hand1_states['pinky_extended'])
            hand2_open = (hand2_states['index_extended'] and hand2_states['middle_extended'] and 
                         hand2_states['ring_extended'] and hand2_states['pinky_extended'])
            
            if hand1_open and hand2_open:
                wrist1 = results_hands.multi_hand_landmarks[0].landmark[mp_hands.HandLandmark.WRIST]
                wrist2 = results_hands.multi_hand_landmarks[1].landmark[mp_hands.HandLandmark.WRIST]
                
                if wrist1.x < wrist2.x:
                    left_wrist, right_wrist = wrist1, wrist2
                else:
                    left_wrist, right_wrist = wrist2, wrist1
                
                left_hand_y_history.append(left_wrist.y)
                right_hand_y_history.append(right_wrist.y)
                
                if len(left_hand_y_history) > HAND_HISTORY_SIZE:
                    left_hand_y_history.pop(0)
                if len(right_hand_y_history) > HAND_HISTORY_SIZE:
                    right_hand_y_history.pop(0)
                
                if len(left_hand_y_history) >= HAND_HISTORY_SIZE:
                    left_y_range = max(left_hand_y_history) - min(left_hand_y_history)
                    right_y_range = max(right_hand_y_history) - min(right_hand_y_history)
                    
                    if left_y_range > 0.06 and right_y_range > 0.06:
                        detected_state = "VICTORY"
            else:
                left_hand_y_history.clear()
                right_hand_y_history.clear()
    
    # 3. Peace sign
    if detected_state == "SMILE" and results_hands.multi_hand_landmarks:
        for hand_landmarks in results_hands.multi_hand_landmarks:
            finger_states = get_finger_states(hand_landmarks)
            index_tip = hand_landmarks.landmark[mp_hands.HandLandmark.INDEX_FINGER_TIP]
            middle_tip = hand_landmarks.landmark[mp_hands.HandLandmark.MIDDLE_FINGER_TIP]
            
            peace_fingers = (finger_states['index_extended'] and finger_states['middle_extended'])
            other_fingers_down = (finger_states['ring_curled'] and finger_states['pinky_curled'])
            fingers_spread = calculate_distance(index_tip, middle_tip) > 0.05
            
            if peace_fingers and other_fingers_down and fingers_spread:
                detected_state = "PEACE"
                break
    
    # 4. Open palm (single hand)
    if detected_state == "SMILE" and results_hands.multi_hand_landmarks:
        if len(results_hands.multi_hand_landmarks) == 1:
            hand_landmarks = results_hands.multi_hand_landmarks[0]
            finger_states = get_finger_states(hand_landmarks)
            index_tip = hand_landmarks.landmark[mp_hands.HandLandmark.INDEX_FINGER_TIP]
            pinky_tip = hand_landmarks.landmark[mp_hands.HandLandmark.PINKY_TIP]
            
            all_extended = (finger_states['index_extended'] and finger_states['middle_extended'] and 
                          finger_states['ring_extended'] and finger_states['pinky_extended'])
            fingers_spread = calculate_distance(index_tip, pinky_tip) > 0.15
            
            if all_extended and fingers_spread:
                detected_state = "OPEN_PALM"
    
    # 5. Fist
    if detected_state == "SMILE" and results_hands.multi_hand_landmarks:
        for hand_landmarks in results_hands.multi_hand_landmarks:
            finger_states = get_finger_states(hand_landmarks)
            
            all_curled = (finger_states['index_curled'] and finger_states['middle_curled'] and 
                        finger_states['ring_curled'] and finger_states['pinky_curled'])
            thumb_not_extended = not finger_states['thumb_extended']
            
            if all_curled and thumb_not_extended:
                detected_state = "FIST"
                break
    
    # 6. Pointing
    if detected_state == "SMILE" and results_hands.multi_hand_landmarks:
        for hand_landmarks in results_hands.multi_hand_landmarks:
            finger_states = get_finger_states(hand_landmarks)
            
            index_only = (finger_states['index_extended'] and finger_states['middle_curled'] and 
                        finger_states['ring_curled'] and finger_states['pinky_curled'])
            
            if index_only:
                detected_state = "MONKEY_FINGER_RAISE"
                break
    
    # 7. Yawning
    if detected_state == "SMILE" and results_face.multi_face_landmarks:
        face_landmarks = results_face.multi_face_landmarks[0]
        upper_lip = face_landmarks.landmark[13]
        lower_lip = face_landmarks.landmark[14]
        mouth_left = face_landmarks.landmark[61]
        mouth_right = face_landmarks.landmark[291]
        
        mouth_height = calculate_distance(upper_lip, lower_lip)
        mouth_width = calculate_distance(mouth_left, mouth_right)
        mouth_aspect_ratio = mouth_height / (mouth_width + 0.001)
        
        if mouth_aspect_ratio > 0.5:
            detected_state = "YAWN"
    
    return detected_state

def analyze_image_bgr(image_bgr):
    """Run MediaPipe on a single BGR image and return detected gesture string"""
    image_rgb = cv2.cvtColor(image_bgr, cv2.COLOR_BGR2RGB)
    try:
        with _mp_models_lock:
            results_hands = _mp_hands_model.process(image_rgb)
            results_face = _mp_face_model.process(image_rgb)
    except Exception:
        # On any internal error, fallback to default gesture
        return "SMILE"
    return detect_gesture(results_hands, results_face)

def generate_frames():
    """Generate video frames with gesture detection"""
    global current_gesture, gesture_history, gesture_change_cooldown
    
    cap = cv2.VideoCapture(0)
    cap.set(cv2.CAP_PROP_FRAME_WIDTH, CAMERA_WIDTH)
    cap.set(cv2.CAP_PROP_FRAME_HEIGHT, CAMERA_HEIGHT)
    
    with mp_hands.Hands(min_detection_confidence=MIN_DETECTION_CONFIDENCE, 
                        min_tracking_confidence=MIN_TRACKING_CONFIDENCE, 
                        max_num_hands=2) as hands, \
         mp_face_mesh.FaceMesh(max_num_faces=1, 
                              min_detection_confidence=MIN_DETECTION_CONFIDENCE,
                              min_tracking_confidence=MIN_TRACKING_CONFIDENCE) as face_mesh:
        
        while True:
            success, frame = cap.read()
            if not success:
                break
            
            frame = cv2.flip(frame, 1)
            image_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            
            results_hands = hands.process(image_rgb)
            results_face = face_mesh.process(image_rgb)
            
            # Detect gesture
            detected_state = detect_gesture(results_hands, results_face)
            
            # Gesture stability
            gesture_history.append(detected_state)
            if len(gesture_history) > GESTURE_STABILITY_FRAMES:
                gesture_history.pop(0)
            
            if gesture_change_cooldown > 0:
                gesture_change_cooldown -= 1
            else:
                if len(gesture_history) == GESTURE_STABILITY_FRAMES:
                    if all(g == detected_state for g in gesture_history):
                        if detected_state != current_gesture:
                            current_gesture = detected_state
                            gesture_change_cooldown = GESTURE_COOLDOWN_FRAMES
            
            # Draw hand landmarks
            if results_hands.multi_hand_landmarks:
                for hand_landmarks in results_hands.multi_hand_landmarks:
                    mp_drawing.draw_landmarks(frame, hand_landmarks, mp_hands.HAND_CONNECTIONS)
            
            # Add gesture text
            gesture_names = {
                "THUMBS_UP": "👍 Thumbs Up",
                "PEACE": "✌️ Peace Sign",
                "OPEN_PALM": "👋 Open Palm",
                "FIST": "✊ Fist",
                "MONKEY_FINGER_MOUTH": "🤫 Shh",
                "MONKEY_FINGER_RAISE": "☝️ Pointing",
                "YAWN": "😮 Yawning",
                "VICTORY": "🎉 Victory!",
                "SMILE": "😊 Smiling"
            }
            
            text = gesture_names.get(current_gesture, current_gesture)
            cv2.putText(frame, text, (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0), 2)
            
            # Encode frame
            ret, buffer = cv2.imencode('.jpg', frame)
            frame = buffer.tobytes()
            
            yield (b'--frame\r\n'
                   b'Content-Type: image/jpeg\r\n\r\n' + frame + b'\r\n')
    
    cap.release()

@app.route('/')
def index():
    """Render main page"""
    return render_template('index.html')

@app.route('/video_feed')
def video_feed():
    """Video streaming route"""
    return Response(generate_frames(), mimetype='multipart/x-mixed-replace; boundary=frame')

@app.route('/current_gesture')
def get_current_gesture():
    """Get current gesture as JSON"""
    gesture_info = {
        "THUMBS_UP": {"name": "👍 Thumbs Up", "description": "Success!", "image": "thumbsup.png"},
        "PEACE": {"name": "✌️ Peace Sign", "description": "Cheering!", "image": "cheer.webp"},
        "OPEN_PALM": {"name": "👋 Open Palm", "description": "Waving!", "image": "princess.gif"},
        "FIST": {"name": "✊ Fist", "description": "Power!", "image": "hog.jpeg"},
        "MONKEY_FINGER_MOUTH": {"name": "🤫 Shh Monkey", "description": "Finger to lips — shhh.", "image": "monkey_finger_mouth.jpeg"},
        "MONKEY_FINGER_RAISE": {"name": "☝️ Pointing", "description": "Look up!", "image": "monkey_finger_raise.jpg"},
        "YAWN": {"name": "😮 Yawning", "description": "Tired!", "image": "yawn.jpg"},
        "CRYING": {"name": "😢 Goblin Tears", "description": "Covering face — crying emote.", "image": "goblin_crying.gif"},
        "KISSING": {"name": "💋 Kissing", "description": "Love!", "image": "princess_kissing.gif"},
        "DANCING": {"name": "🕺 Dancing", "description": "Party!", "image": "pig-dance-clash-royale.gif"},
        "TONGUE_OUT": {"name": "👅 Tongue Out Chaos", "description": "Mouth open + tongue movement.", "image": "monkey_mouth.gif"},
        "CLAPPING": {"name": "👏 Clapping", "description": "Applause!", "image": "did-unc-snap-unc.gif"},
        "VICTORY": {"name": "🎉 Victory", "description": "Celebration!", "image": "67.gif"},
        "SMILE": {"name": "😊 Smiling", "description": "Happy!", "image": "smile.jpg"}
    }
    
    info = gesture_info.get(current_gesture, {"name": current_gesture, "description": "", "image": "smile.jpg"})
    
    return jsonify({
        "gesture": current_gesture,
        "name": info["name"],
        "description": info["description"],
        "image": info["image"]
    })

@app.route('/analyze_frame', methods=['POST'])
def analyze_frame():
    """Analyze a single frame posted from the browser and return gesture JSON"""
    global current_gesture
    try:
        payload = request.get_json(silent=True) or {}
        data_url = payload.get('image')
        if not data_url:
            return jsonify({"error": "Missing image"}), 400
        # data URL format: data:image/png;base64,XXXX
        if ',' in data_url:
            base64_data = data_url.split(',', 1)[1]
        else:
            base64_data = data_url
        img_bytes = base64.b64decode(base64_data)
        nparr = np.frombuffer(img_bytes, np.uint8)
        img_bgr = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        if img_bgr is None:
            return jsonify({"error": "Invalid image"}), 400
        detected = analyze_image_bgr(img_bgr)
        # Smoothing: majority vote over last N detections
        analyze_gesture_history.append(detected)
        if len(analyze_gesture_history) >= 2:
            # Select most frequent
            counts = {}
            for g in analyze_gesture_history:
                counts[g] = counts.get(g, 0) + 1
            smoothed = max(counts.items(), key=lambda kv: kv[1])[0]
        else:
            smoothed = detected
        if smoothed:
            current_gesture = smoothed
        # reuse the same mapping as current_gesture
        return get_current_gesture()
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/images/<path:filename>')
def serve_image(filename):
    """Serve images from the images folder"""
    from flask import send_from_directory
    return send_from_directory('images', filename)

if __name__ == '__main__':
    print("🚀 Starting Instagram Emoji Reaction Web App...")
    print("📂 Loading images...")
    load_images()
    print("✅ Ready!")
    print("🌐 Open http://localhost:8080 in your browser")
    app.run(debug=True, host='0.0.0.0', port=8080, threaded=True)
