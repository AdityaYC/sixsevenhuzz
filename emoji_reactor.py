#!/usr/bin/env python3
"""
Instagram Emoji Reaction - A real-time camera-based gesture detection application
Uses MediaPipe for hand detection and face mesh detection
Detects 13+ different gestures and displays corresponding emoji animations

Author: Aditya Punjani
"""

import cv2
import mediapipe as mp
import numpy as np
from PIL import Image
import pygame
import os

# --- SETUP AND INITIALIZATION ---

# Initialize MediaPipe modules
mp_pose = mp.solutions.pose
mp_face_mesh = mp.solutions.face_mesh
mp_hands = mp.solutions.hands
mp_drawing = mp.solutions.drawing_utils

# --- CONFIGURATION CONSTANTS ---
# MacBook Pro screen is typically 1440x900 or 1680x1050, so half would be around 720x450 or 840x525
WINDOW_WIDTH = 720
WINDOW_HEIGHT = 450
EMOJI_WINDOW_SIZE = (WINDOW_WIDTH, WINDOW_HEIGHT)

# Performance settings
CAMERA_WIDTH = 640
CAMERA_HEIGHT = 480
GIF_FPS = 20  # Target FPS for GIF animation (frames per second) - increased for smoother animations

# Gesture stability settings
GESTURE_STABILITY_FRAMES = 3  # Require gesture to be stable for this many frames
GESTURE_COOLDOWN_FRAMES = 5  # Cooldown after gesture change

# Detection confidence thresholds
MIN_DETECTION_CONFIDENCE = 0.7  # Increased for better accuracy
MIN_TRACKING_CONFIDENCE = 0.7

# Animation settings
TRANSITION_FRAMES = 10  # Smooth fade transition between images
ANIMATION_SCALE = 1.1  # Scale factor for zoom animation
BOUNCE_AMPLITUDE = 20  # Pixels for bounce effect

# Initialize pygame mixer for sound with proper settings
try:
    pygame.mixer.quit()  # Quit any existing mixer
    pygame.mixer.init(frequency=44100, size=-16, channels=2, buffer=1024)
    SOUND_ENABLED = True
    print("✅ Pygame mixer initialized successfully")
except Exception as e:
    print(f"⚠️  Sound initialization failed: {e}")
    SOUND_ENABLED = False

# Background music
BACKGROUND_MUSIC_ENABLED = False

def create_background_music():
    """Create a simple background music loop"""
    try:
        # Create a simple melody using multiple tones
        sample_rate = 44100
        duration = 2.0  # 2 seconds
        notes = [262, 294, 330, 349, 392]  # C, D, E, F, G
        
        music_buffer = np.array([], dtype=np.int16)
        for note in notes:
            t = np.linspace(0, duration/len(notes), int(sample_rate * duration / len(notes)))
            wave = np.sin(2 * np.pi * note * t) * 0.3  # Lower volume
            wave = (wave * 32767).astype(np.int16)
            music_buffer = np.concatenate([music_buffer, wave])
        
        stereo_buffer = np.column_stack((music_buffer, music_buffer))
        music_sound = pygame.sndarray.make_sound(stereo_buffer)
        return music_sound
    except:
        return None

# Helper function to load GIF frames
def load_gif_frames(gif_path):
    gif = Image.open(gif_path)
    frames = []
    try:
        while True:
            frame = gif.convert('RGB')
            frame_cv = cv2.cvtColor(np.array(frame), cv2.COLOR_RGB2BGR)
            frame_resized = cv2.resize(frame_cv, EMOJI_WINDOW_SIZE)
            frames.append(frame_resized)
            gif.seek(gif.tell() + 1)
    except EOFError:
        pass
    return frames

# Helper function to load static images
def load_static_image(image_path):
    img = cv2.imread(image_path)
    if img is None:
        raise FileNotFoundError(f"{image_path} could not be loaded")
    img_resized = cv2.resize(img, EMOJI_WINDOW_SIZE)
    return img_resized

# --- LOAD AND PREPARE IMAGES AND ANIMATIONS ---
try:
    # Load all images with emotion mappings
    print("📂 Loading all emotion images...")
    
    # Static images
    thumbsup_image = load_static_image("images/thumbsup.png")  # Thumbs up gesture
    smile_image = load_static_image("images/smile.jpg")  # Happy/smiling
    yawn_image = load_static_image("images/yawn.jpg")  # Tired/yawning
    plain_image = load_static_image("images/plain.png")  # Neutral/default
    job_image = load_static_image("images/job.jpg")  # Success/got job
    nojob_image = load_static_image("images/nojob.webp")  # Sad/no job
    cheer_image = load_static_image("images/cheer.webp")  # Cheering
    air_image = load_static_image("images/air.jpg")  # Air/flying
    hog_image = load_static_image("images/hog.jpeg")  # Hog rider
    monkey_finger_mouth_image = load_static_image("images/monkey_finger_mouth.jpeg")  # Shh
    monkey_finger_raise_image = load_static_image("images/monkey_finger_raise.jpg")  # Pointing
    
    # Animated GIFs - ALL GIFS NOW USED!
    monkey_mouth_frames = load_gif_frames("images/monkey_mouth.gif")  # Tongue out
    goblin_crying_frames = load_gif_frames("images/goblin_crying.gif")  # Crying
    princess_frames = load_gif_frames("images/princess.gif")  # Princess waving
    princess_kissing_frames = load_gif_frames("images/princess_kissing.gif")  # Kissing
    pig_dance_frames = load_gif_frames("images/pig-dance-clash-royale.gif")  # Dancing
    snap_frames = load_gif_frames("images/did-unc-snap-unc.gif")  # Snapping
    frames_67 = load_gif_frames("images/67.gif")  # Special celebration animation
    
    print(f"✅ All emotion images loaded successfully!")
    print(f"   - 11 static images loaded")
    print(f"   - 7 animated GIFs loaded")
    print(f"   - Total: 18 different emotions/reactions")
    
    # Start background music
    if SOUND_ENABLED:
        try:
            bg_music = create_background_music()
            if bg_music:
                bg_music.play(loops=-1)  # Loop forever
                BACKGROUND_MUSIC_ENABLED = True
                print("♫ Background music started!")
        except:
            print("⚠️  Background music disabled")

except Exception as e:
    print("❌ Error loading images!")
    print(f"Error details: {e}")
    print("\nSome images may be missing from 'images/' folder.")
    exit()

# Create a blank image for cases where an emoji is missing
blank_emoji = np.zeros((EMOJI_WINDOW_SIZE[0], EMOJI_WINDOW_SIZE[1], 3), dtype=np.uint8)

# --- MAIN LOGIC ---

# Start webcam capture - try multiple camera indices for MacBook
print("🎥 Starting webcam capture...")
cap = None
for camera_index in [0, 1, 2]:
    print(f"   Trying camera index {camera_index}...")
    test_cap = cv2.VideoCapture(camera_index)
    if test_cap.isOpened():
        ret, frame = test_cap.read()
        if ret and frame is not None:
            cap = test_cap
            print(f"✅ Successfully opened camera at index {camera_index}")
            break
        else:
            test_cap.release()
    else:
        test_cap.release()

if cap is None:
    print("❌ Error: Could not open any webcam. Make sure your camera is connected and not being used by another application.")
    print("💡 Tip: Check System Settings → Privacy & Security → Camera")
    exit()

# Set camera resolution for better performance
cap.set(cv2.CAP_PROP_FRAME_WIDTH, CAMERA_WIDTH)
cap.set(cv2.CAP_PROP_FRAME_HEIGHT, CAMERA_HEIGHT)
cap.set(cv2.CAP_PROP_FPS, 30)

# Initialize named windows with specific sizes
cv2.namedWindow('Camera Feed', cv2.WINDOW_NORMAL)
cv2.namedWindow('Animation Output', cv2.WINDOW_NORMAL)

# Set window sizes and positions
cv2.resizeWindow('Camera Feed', WINDOW_WIDTH, WINDOW_HEIGHT)
cv2.resizeWindow('Animation Output', WINDOW_WIDTH, WINDOW_HEIGHT)

# Position windows side by side
cv2.moveWindow('Camera Feed', 100, 100)
cv2.moveWindow('Animation Output', WINDOW_WIDTH + 150, 100)

print("🚀 Starting emotion gesture detection...")
print("📋 Available Gestures & Movements:")
print("   - Press 'q' to quit")
print("   👍 Thumbs Up = Success/Job")
print("   ✌️  Peace Sign = Cheering")
print("   👋 Open Palm = Waving Princess (GIF)")
print("   ✊ Fist = Hog Rider")
print("   🤫 Finger to Mouth = Shh Monkey")
print("   ☝️  Raised Finger = Pointing Monkey")
print("   😮 Mouth Open Wide = Yawning")
print("   😢 Covering Face = Crying Goblin (GIF)")
print("   💋 Blow Kiss = Princess Kiss (GIF)")
print("   🕺 Both Hands Up (middle) = Dancing Pig (GIF)")
print("   👅 Tongue Out = Monkey Tongue (GIF)")
print("   👏 Clapping (hands together) = Snap Animation (GIF)")
print("   🎉 VICTORY (both hands HIGH!) = 67.gif Celebration! ⭐")
print("   😊 Default = Smiling")
print("\n🎵 Background music playing...")
print("💡 TIP #1: Wave BOTH open palms UP and DOWN to see 67.gif! 🌊")
print("💡 TIP #2: Or raise BOTH hands very high for 67.gif celebration! 🎉")

# Animation tracking variables
import time
current_animation = "SMILE"  # Default state
animation_frame_index = 0
last_gif_update = time.time()
gif_frame_delay = 1.0 / GIF_FPS  # Delay between GIF frames

# Tongue tracking for side-to-side detection
tongue_x_history = []
TONGUE_HISTORY_SIZE = 10  # Track last 10 frames

# Hand wave tracking for up-down motion detection
left_hand_y_history = []
right_hand_y_history = []
HAND_HISTORY_SIZE = 8  # Track last 8 frames for wave detection

# Gesture history for stability
gesture_history = []
GESTURE_HISTORY_SIZE = GESTURE_STABILITY_FRAMES
last_stable_gesture = "SMILE"
gesture_change_cooldown = 0

# Animation state
transition_alpha = 0
transition_active = False
previous_frame = None
animation_bounce = 0
animation_direction = 1
frame_count = 0

# Sound effects dictionary
sound_effects = {}

def play_sound(gesture_name):
    """Play sound effect for a gesture if available"""
    if not SOUND_ENABLED:
        return
    try:
        if gesture_name in sound_effects and sound_effects[gesture_name]:
            # Lower volume so it doesn't overpower background music
            sound_effects[gesture_name].set_volume(0.5)
            sound_effects[gesture_name].play()
            print(f"🔊 {gesture_name}")
    except Exception as e:
        pass

def apply_animation_effect(frame, effect_type="bounce", intensity=1.0):
    """Apply visual animation effects to frame"""
    global animation_bounce, animation_direction, frame_count
    
    frame_count += 1
    
    if effect_type == "bounce":
        # Bounce effect
        animation_bounce += animation_direction * 2
        if abs(animation_bounce) > BOUNCE_AMPLITUDE:
            animation_direction *= -1
        
        # Create transform matrix for bounce
        h, w = frame.shape[:2]
        M = np.float32([[1, 0, 0], [0, 1, animation_bounce]])
        frame = cv2.warpAffine(frame, M, (w, h))
    
    elif effect_type == "zoom":
        # Zoom pulse effect
        scale = 1.0 + 0.05 * np.sin(frame_count * 0.1)
        h, w = frame.shape[:2]
        center = (w // 2, h // 2)
        M = cv2.getRotationMatrix2D(center, 0, scale)
        frame = cv2.warpAffine(frame, M, (w, h))
    
    elif effect_type == "rotate":
        # Gentle rotation
        angle = 5 * np.sin(frame_count * 0.05)
        h, w = frame.shape[:2]
        center = (w // 2, h // 2)
        M = cv2.getRotationMatrix2D(center, angle, 1.0)
        frame = cv2.warpAffine(frame, M, (w, h))
    
    return frame

def blend_frames(frame1, frame2, alpha):
    """Smooth blend between two frames"""
    return cv2.addWeighted(frame1, 1 - alpha, frame2, alpha, 0)

def generate_beep_sound(frequency, duration_ms):
    """Generate a simple beep sound"""
    try:
        sample_rate = 22050
        n_samples = int(sample_rate * duration_ms / 1000)
        buf = np.sin(2 * np.pi * frequency * np.linspace(0, duration_ms/1000, n_samples))
        buf = (buf * 32767).astype(np.int16)
        stereo_buf = np.column_stack((buf, buf))
        sound = pygame.sndarray.make_sound(stereo_buf)
        return sound
    except:
        return None

# Generate simple sound effects for each gesture
print("🔊 Generating sound effects...")
if SOUND_ENABLED:
    try:
        sound_effects = {
            "THUMBS_UP": generate_beep_sound(800, 200),
            "PEACE": generate_beep_sound(600, 150),
            "OPEN_PALM": generate_beep_sound(500, 180),
            "FIST": generate_beep_sound(300, 250),
            "MONKEY_FINGER_MOUTH": generate_beep_sound(400, 150),
            "MONKEY_FINGER_RAISE": generate_beep_sound(700, 180),
            "YAWN": generate_beep_sound(350, 300),
            "CRYING": generate_beep_sound(250, 400),
            "KISSING": generate_beep_sound(900, 150),
            "DANCING": generate_beep_sound(650, 200),
            "TONGUE_OUT": generate_beep_sound(550, 220),
            "CLAPPING": generate_beep_sound(750, 180),
            "VICTORY": generate_beep_sound(1000, 300),  # Highest pitch, longest duration for celebration!
        }
        # Test sound
        if sound_effects["THUMBS_UP"]:
            print("✅ Sound effects ready! Testing...")
            sound_effects["THUMBS_UP"].play()
            pygame.time.wait(300)
        else:
            print("⚠️  Sound generation returned None")
            SOUND_ENABLED = False
    except Exception as e:
        print(f"⚠️  Sound effects disabled: {e}")
        SOUND_ENABLED = False
else:
    sound_effects = {}

# Helper functions for accurate hand detection
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
    """Check if a finger is extended using angles and distances"""
    # Finger is extended if tip is significantly higher than MCP
    vertical_extension = tip.y < mcp.y - 0.05
    
    # Check if finger is straight (angle between joints)
    angle = calculate_angle(mcp, pip, tip)
    is_straight = angle > 140  # More than 140 degrees = straight
    
    # Distance from tip to wrist should be greater than MCP to wrist
    tip_to_wrist = calculate_distance(tip, wrist)
    mcp_to_wrist = calculate_distance(mcp, wrist)
    is_extended_distance = tip_to_wrist > mcp_to_wrist * 1.1
    
    return vertical_extension and (is_straight or is_extended_distance)

def is_finger_curled(tip, pip, mcp, wrist):
    """Check if a finger is curled"""
    # Finger is curled if tip is close to or below MCP
    tip_below_mcp = tip.y >= mcp.y - 0.02
    
    # Check angle - curled finger has smaller angle
    angle = calculate_angle(mcp, pip, tip)
    is_bent = angle < 120  # Less than 120 degrees = bent
    
    # Distance check
    tip_to_wrist = calculate_distance(tip, wrist)
    mcp_to_wrist = calculate_distance(mcp, wrist)
    is_close = tip_to_wrist < mcp_to_wrist * 1.2
    
    return tip_below_mcp or (is_bent and is_close)

def get_finger_states(hand_landmarks):
    """Get the state of all fingers (extended or curled)"""
    # Get all landmarks
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
    
    # Check each finger
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

# Instantiate MediaPipe models with higher confidence
with mp_pose.Pose(min_detection_confidence=MIN_DETECTION_CONFIDENCE, min_tracking_confidence=MIN_TRACKING_CONFIDENCE) as pose, \
     mp_face_mesh.FaceMesh(max_num_faces=1, min_detection_confidence=MIN_DETECTION_CONFIDENCE, min_tracking_confidence=MIN_TRACKING_CONFIDENCE) as face_mesh, \
     mp_hands.Hands(min_detection_confidence=MIN_DETECTION_CONFIDENCE, min_tracking_confidence=MIN_TRACKING_CONFIDENCE, max_num_hands=2) as hands:

    while cap.isOpened():
        success, frame = cap.read()
        if not success:
            print("⚠️  Ignoring empty camera frame.")
            continue

        # Flip the frame horizontally for a mirror-like display
        frame = cv2.flip(frame, 1)

        # Resize frame for faster processing
        small_frame = cv2.resize(frame, (320, 240))

        # Convert the BGR image to RGB for MediaPipe
        image_rgb = cv2.cvtColor(small_frame, cv2.COLOR_BGR2RGB)

        # To improve performance, mark the image as not writeable
        image_rgb.flags.writeable = False

        # --- DETECTION LOGIC ---

        # Process all detections first (on smaller frame for speed)
        results_pose = pose.process(image_rgb)
        results_hands = hands.process(image_rgb)
        results_face = face_mesh.process(image_rgb)

        # Default state
        detected_state = "SMILE"  # Default to smiling

        # GESTURE DETECTION PRIORITY (highest to lowest)
        # Enhanced detection with better hand tracking
        
        # Track hand movement for additional gestures
        hand_movement_x = 0
        hand_movement_y = 0
        if results_hands.multi_hand_landmarks and len(results_hands.multi_hand_landmarks) > 0:
            wrist = results_hands.multi_hand_landmarks[0].landmark[mp_hands.HandLandmark.WRIST]
            hand_movement_x = wrist.x
            hand_movement_y = wrist.y
        
        # 1. Check for thumbs up gesture (HIGHLY ACCURATE)
        if results_hands.multi_hand_landmarks:
            for hand_landmarks in results_hands.multi_hand_landmarks:
                finger_states = get_finger_states(hand_landmarks)
                thumb_tip = hand_landmarks.landmark[mp_hands.HandLandmark.THUMB_TIP]
                wrist = hand_landmarks.landmark[mp_hands.HandLandmark.WRIST]
                
                # Thumbs up: ONLY thumb extended, all other fingers curled
                thumb_up = finger_states['thumb_extended'] and thumb_tip.y < wrist.y - 0.1
                all_fingers_curled = (finger_states['index_curled'] and 
                                     finger_states['middle_curled'] and 
                                     finger_states['ring_curled'] and 
                                     finger_states['pinky_curled'])
                
                if thumb_up and all_fingers_curled:
                    detected_state = "THUMBS_UP"
                    break
        
        # 2. Check for WAVE MOTION FIRST - Both hands open palms moving up and down (67.gif)
        # This must be checked BEFORE single open palm to avoid false detection
        if detected_state == "SMILE" and results_hands.multi_hand_landmarks:
            if len(results_hands.multi_hand_landmarks) >= 2:
                # Get finger states for both hands
                hand1_states = get_finger_states(results_hands.multi_hand_landmarks[0])
                hand2_states = get_finger_states(results_hands.multi_hand_landmarks[1])
                
                # Check if both hands have open palms (all fingers extended)
                hand1_open = (hand1_states['index_extended'] and 
                            hand1_states['middle_extended'] and 
                            hand1_states['ring_extended'] and 
                            hand1_states['pinky_extended'])
                hand2_open = (hand2_states['index_extended'] and 
                            hand2_states['middle_extended'] and 
                            hand2_states['ring_extended'] and 
                            hand2_states['pinky_extended'])
                
                if hand1_open and hand2_open:
                    # Track hand positions over time
                    wrist1 = results_hands.multi_hand_landmarks[0].landmark[mp_hands.HandLandmark.WRIST]
                    wrist2 = results_hands.multi_hand_landmarks[1].landmark[mp_hands.HandLandmark.WRIST]
                    
                    # Determine which is left and which is right based on x position
                    if wrist1.x < wrist2.x:
                        left_wrist = wrist1
                        right_wrist = wrist2
                    else:
                        left_wrist = wrist2
                        right_wrist = wrist1
                    
                    # Add to history
                    left_hand_y_history.append(left_wrist.y)
                    right_hand_y_history.append(right_wrist.y)
                    
                    # Keep history size limited
                    if len(left_hand_y_history) > HAND_HISTORY_SIZE:
                        left_hand_y_history.pop(0)
                    if len(right_hand_y_history) > HAND_HISTORY_SIZE:
                        right_hand_y_history.pop(0)
                    
                    # Check for up-down movement (wave motion) - EASIER THRESHOLD
                    if len(left_hand_y_history) >= HAND_HISTORY_SIZE:
                        # Calculate vertical movement range
                        left_y_min = min(left_hand_y_history)
                        left_y_max = max(left_hand_y_history)
                        left_y_range = left_y_max - left_y_min
                        
                        right_y_min = min(right_hand_y_history)
                        right_y_max = max(right_hand_y_history)
                        right_y_range = right_y_max - right_y_min
                        
                        # Both hands moving up and down significantly (made easier)
                        both_waving = (left_y_range > 0.06 and right_y_range > 0.06)
                        
                        if both_waving:
                            detected_state = "VICTORY"  # Triggers 67.gif
                            print(f"🌊 Wave detected! L:{left_y_range:.3f} R:{right_y_range:.3f}")
                else:
                    # Clear history if hands are not open
                    left_hand_y_history.clear()
                    right_hand_y_history.clear()
        
        # 3. Check for peace sign (V sign) - HIGHLY ACCURATE
        if detected_state == "SMILE" and results_hands.multi_hand_landmarks:
            for hand_landmarks in results_hands.multi_hand_landmarks:
                finger_states = get_finger_states(hand_landmarks)
                index_tip = hand_landmarks.landmark[mp_hands.HandLandmark.INDEX_FINGER_TIP]
                middle_tip = hand_landmarks.landmark[mp_hands.HandLandmark.MIDDLE_FINGER_TIP]
                
                # Peace sign: ONLY index and middle extended, others curled, fingers spread apart
                peace_fingers = (finger_states['index_extended'] and 
                               finger_states['middle_extended'])
                other_fingers_down = (finger_states['ring_curled'] and 
                                    finger_states['pinky_curled'])
                fingers_spread = calculate_distance(index_tip, middle_tip) > 0.05
                
                if peace_fingers and other_fingers_down and fingers_spread:
                    detected_state = "PEACE"
                    break
        
        # 4. Check for open palm (all fingers extended) - HIGHLY ACCURATE
        # Only check for SINGLE hand open palm (if two hands, wave motion checked above)
        if detected_state == "SMILE" and results_hands.multi_hand_landmarks:
            if len(results_hands.multi_hand_landmarks) == 1:  # ONLY single hand
                hand_landmarks = results_hands.multi_hand_landmarks[0]
                finger_states = get_finger_states(hand_landmarks)
                index_tip = hand_landmarks.landmark[mp_hands.HandLandmark.INDEX_FINGER_TIP]
                pinky_tip = hand_landmarks.landmark[mp_hands.HandLandmark.PINKY_TIP]
                
                # Open palm: ALL fingers extended and spread
                all_extended = (finger_states['index_extended'] and 
                              finger_states['middle_extended'] and 
                              finger_states['ring_extended'] and 
                              finger_states['pinky_extended'])
                fingers_spread = calculate_distance(index_tip, pinky_tip) > 0.15
                
                if all_extended and fingers_spread:
                    detected_state = "OPEN_PALM"
        
        # 5. Check for fist (all fingers curled) - HIGHLY ACCURATE
        if detected_state == "SMILE" and results_hands.multi_hand_landmarks:
            for hand_landmarks in results_hands.multi_hand_landmarks:
                finger_states = get_finger_states(hand_landmarks)
                
                # Fist: ALL fingers curled tightly
                all_curled = (finger_states['index_curled'] and 
                            finger_states['middle_curled'] and 
                            finger_states['ring_curled'] and 
                            finger_states['pinky_curled'])
                thumb_not_extended = not finger_states['thumb_extended']
                
                if all_curled and thumb_not_extended:
                    detected_state = "FIST"
                    break
        
        # 6. Check for finger to mouth gesture (shh)
        if detected_state == "SMILE" and results_hands.multi_hand_landmarks and results_face.multi_face_landmarks:
            for hand_landmarks in results_hands.multi_hand_landmarks:
                index_finger_tip = hand_landmarks.landmark[mp_hands.HandLandmark.INDEX_FINGER_TIP]
                face_landmarks = results_face.multi_face_landmarks[0]
                mouth_top = face_landmarks.landmark[13]
                mouth_bottom = face_landmarks.landmark[14]
                mouth_center_x = (mouth_top.x + mouth_bottom.x) / 2
                mouth_center_y = (mouth_top.y + mouth_bottom.y) / 2
                distance = ((index_finger_tip.x - mouth_center_x)**2 + (index_finger_tip.y - mouth_center_y)**2)**0.5
                
                if distance < 0.15:
                    detected_state = "MONKEY_FINGER_MOUTH"
                    break

        # 7. Check for raised finger gesture (pointing) - HIGHLY ACCURATE
        if detected_state == "SMILE" and results_hands.multi_hand_landmarks:
            for hand_landmarks in results_hands.multi_hand_landmarks:
                finger_states = get_finger_states(hand_landmarks)
                
                # Pointing: ONLY index finger extended, all others curled
                index_only = (finger_states['index_extended'] and 
                            finger_states['middle_curled'] and 
                            finger_states['ring_curled'] and 
                            finger_states['pinky_curled'])
                
                if index_only:
                    detected_state = "MONKEY_FINGER_RAISE"
                    break

        # 8. Check for mouth wide open (yawning) - HIGHLY ACCURATE
        if detected_state == "SMILE" and results_face.multi_face_landmarks:
            face_landmarks = results_face.multi_face_landmarks[0]
            upper_lip = face_landmarks.landmark[13]
            lower_lip = face_landmarks.landmark[14]
            mouth_left = face_landmarks.landmark[61]
            mouth_right = face_landmarks.landmark[291]
            
            # Calculate mouth aspect ratio
            mouth_height = calculate_distance(upper_lip, lower_lip)
            mouth_width = calculate_distance(mouth_left, mouth_right)
            mouth_aspect_ratio = mouth_height / (mouth_width + 0.001)
            
            # Yawn: mouth is very open (high aspect ratio)
            if mouth_aspect_ratio > 0.5:
                detected_state = "YAWN"
        
        # 9. Check for covering face (crying gesture)
        if detected_state == "SMILE" and results_hands.multi_hand_landmarks and results_face.multi_face_landmarks:
            face_landmarks = results_face.multi_face_landmarks[0]
            nose = face_landmarks.landmark[1]
            
            for hand_landmarks in results_hands.multi_hand_landmarks:
                palm_center = hand_landmarks.landmark[mp_hands.HandLandmark.MIDDLE_FINGER_MCP]
                distance_to_face = ((palm_center.x - nose.x)**2 + (palm_center.y - nose.y)**2)**0.5
                
                if distance_to_face < 0.15:
                    detected_state = "CRYING"
                    break
        
        # 10. Check for kissing gesture (puckered lips near hand)
        if detected_state == "SMILE" and results_hands.multi_hand_landmarks and results_face.multi_face_landmarks:
            face_landmarks = results_face.multi_face_landmarks[0]
            mouth_top = face_landmarks.landmark[13]
            mouth_bottom = face_landmarks.landmark[14]
            mouth_center_x = (mouth_top.x + mouth_bottom.x) / 2
            mouth_center_y = (mouth_top.y + mouth_bottom.y) / 2
            mouth_height = abs(mouth_top.y - mouth_bottom.y)
            
            for hand_landmarks in results_hands.multi_hand_landmarks:
                index_tip = hand_landmarks.landmark[mp_hands.HandLandmark.INDEX_FINGER_TIP]
                distance = ((index_tip.x - mouth_center_x)**2 + (index_tip.y - mouth_center_y)**2)**0.5
                
                # Hand near mouth
                # Blow kiss - hand moves from mouth outward
                if distance < 0.25 and distance > 0.12:
                    detected_state = "KISSING"
                    break
        
        # 11. Check for both hands up (dancing)
        if detected_state == "SMILE":
            # Option 1: Both hands raised to middle of screen or higher
            if results_hands.multi_hand_landmarks:
                num_hands = len(results_hands.multi_hand_landmarks)

                if num_hands >= 2:
                    # Get both hands' positions
                    hand_y_positions = []
                    for hand_landmarks in results_hands.multi_hand_landmarks:
                        wrist = hand_landmarks.landmark[mp_hands.HandLandmark.WRIST]
                        hand_y_positions.append(wrist.y)

                    # Check if both hands are raised (easier)
                    both_hands_up = all(y < 0.6 for y in hand_y_positions)

                    if both_hands_up:
                        detected_state = "DANCING"
        
        # 12. Check for clapping motion (hands moving together)
        if detected_state == "SMILE" and results_hands.multi_hand_landmarks:
            if len(results_hands.multi_hand_landmarks) >= 2:
                hand1_center = results_hands.multi_hand_landmarks[0].landmark[mp_hands.HandLandmark.MIDDLE_FINGER_MCP]
                hand2_center = results_hands.multi_hand_landmarks[1].landmark[mp_hands.HandLandmark.MIDDLE_FINGER_MCP]
                hands_distance = abs(hand1_center.x - hand2_center.x)
                
                # Hands close together (clapping)
                if hands_distance < 0.15:
                    detected_state = "CLAPPING"
        
        # 13. Check for static victory pose (both hands raised high in V shape)
        if detected_state == "SMILE" and results_hands.multi_hand_landmarks:
            if len(results_hands.multi_hand_landmarks) >= 2:
                hand_y_positions = []
                for hand_landmarks in results_hands.multi_hand_landmarks:
                    index_tip = hand_landmarks.landmark[mp_hands.HandLandmark.INDEX_FINGER_TIP]
                    hand_y_positions.append(index_tip.y)
                
                # Both hands very high (static victory pose)
                if all(y < 0.35 for y in hand_y_positions):
                    detected_state = "VICTORY"

            # 14. Tongue out with side-to-side movement
            if detected_state == "SMILE" and results_face.multi_face_landmarks:
                face_landmarks = results_face.multi_face_landmarks[0]

                # Get mouth landmarks - check if mouth is open and detect horizontal movement
                # Using lips landmarks to detect mouth opening
                upper_lip = face_landmarks.landmark[13]
                lower_lip = face_landmarks.landmark[14]
                mouth_left = face_landmarks.landmark[61]
                mouth_right = face_landmarks.landmark[291]

                # Calculate mouth opening (vertical distance)
                mouth_height = abs(upper_lip.y - lower_lip.y)

                # Calculate mouth horizontal center
                mouth_center_x = (mouth_left.x + mouth_right.x) / 2

                # Track tongue position (approximated by mouth opening position)
                if mouth_height > 0.02:  # Mouth is open
                    tongue_x_history.append(mouth_center_x)
                    if len(tongue_x_history) > TONGUE_HISTORY_SIZE:
                        tongue_x_history.pop(0)

                    # Check for side-to-side movement
                    if len(tongue_x_history) >= TONGUE_HISTORY_SIZE:
                        x_min = min(tongue_x_history)
                        x_max = max(tongue_x_history)
                        x_range = x_max - x_min

                        # If there's horizontal movement
                        if x_range > 0.01:
                            detected_state = "TONGUE_OUT"
                else:
                    # Clear history if mouth is closed
                    tongue_x_history.clear()

        # Apply gesture stability - only change if gesture is stable
        gesture_history.append(detected_state)
        if len(gesture_history) > GESTURE_HISTORY_SIZE:
            gesture_history.pop(0)
        
        # Check if gesture is stable (same for multiple frames)
        if len(gesture_history) >= GESTURE_HISTORY_SIZE:
            if all(g == detected_state for g in gesture_history):
                if detected_state != last_stable_gesture and gesture_change_cooldown <= 0:
                    # Gesture changed - play sound
                    play_sound(detected_state)
                    last_stable_gesture = detected_state
                    gesture_change_cooldown = GESTURE_COOLDOWN_FRAMES
                    print(f"✅ {detected_state} detected!")
        
        # Decrease cooldown
        if gesture_change_cooldown > 0:
            gesture_change_cooldown -= 1
        
        current_animation = last_stable_gesture
        
        # --- DISPLAY LOGIC ---

        # Control GIF frame rate
        current_time = time.time()
        if current_time - last_gif_update >= gif_frame_delay:
            animation_frame_index += 1
            last_gif_update = current_time

        # Select the animation to display based on the detected state with effects
        effect_type = "none"
        
        if current_animation == "THUMBS_UP":
            display_frame = thumbsup_image.copy()
            state_name = "👍 Thumbs Up - Success!"
            effect_type = "zoom"
        elif current_animation == "PEACE":
            display_frame = cheer_image.copy()
            state_name = "✌️ Peace Sign - Cheering!"
            effect_type = "bounce"
        elif current_animation == "OPEN_PALM":
            display_frame = princess_frames[animation_frame_index % len(princess_frames)].copy()
            state_name = "👋 Open Palm - Waving!"
            effect_type = "none"  # GIF already animated
        elif current_animation == "FIST":
            display_frame = hog_image.copy()
            state_name = "✊ Fist - Hog Rider!"
            effect_type = "rotate"
        elif current_animation == "MONKEY_FINGER_MOUTH":
            display_frame = monkey_finger_mouth_image.copy()
            state_name = "🤫 Shh... Quiet!"
            effect_type = "none"
        elif current_animation == "MONKEY_FINGER_RAISE":
            display_frame = monkey_finger_raise_image.copy()
            state_name = "☝️ Pointing Up!"
            effect_type = "bounce"
        elif current_animation == "YAWN":
            display_frame = yawn_image.copy()
            state_name = "😮 Yawning - Tired!"
            effect_type = "none"
        elif current_animation == "CRYING":
            display_frame = goblin_crying_frames[animation_frame_index % len(goblin_crying_frames)].copy()
            state_name = "😢 Crying - Sad!"
            effect_type = "none"  # GIF already animated
        elif current_animation == "KISSING":
            display_frame = princess_kissing_frames[animation_frame_index % len(princess_kissing_frames)].copy()
            state_name = "💋 Blowing Kiss!"
            effect_type = "none"  # GIF already animated
        elif current_animation == "DANCING":
            display_frame = pig_dance_frames[animation_frame_index % len(pig_dance_frames)].copy()
            state_name = "🕺 Dancing - Party!"
            effect_type = "none"  # GIF already animated
        elif current_animation == "CLAPPING":
            display_frame = snap_frames[animation_frame_index % len(snap_frames)].copy()
            state_name = "👏 Clapping - Snap!"
            effect_type = "none"  # GIF already animated
        elif current_animation == "VICTORY":
            display_frame = frames_67[animation_frame_index % len(frames_67)].copy()
            state_name = "🎉 Victory - Celebration!"
            effect_type = "none"  # GIF already animated
        elif current_animation == "TONGUE_OUT":
            display_frame = monkey_mouth_frames[animation_frame_index % len(monkey_mouth_frames)].copy()
            state_name = "👅 Tongue Out!"
            effect_type = "none"  # GIF already animated
        elif current_animation == "SMILE":
            display_frame = smile_image.copy()
            state_name = "😊 Smiling - Happy!"
            effect_type = "zoom"
        else:
            # Default fallback
            display_frame = plain_image.copy()
            state_name = "😐 Neutral"
            effect_type = "none"
        
        # Apply animation effects to static images
        if effect_type != "none":
            display_frame = apply_animation_effect(display_frame, effect_type)
        
        # Smooth transition between frames
        if previous_frame is not None and transition_active:
            transition_alpha = min(1.0, transition_alpha + 0.1)
            display_frame = blend_frames(previous_frame, display_frame, transition_alpha)
            if transition_alpha >= 1.0:
                transition_active = False
        else:
            previous_frame = display_frame.copy()

        # Resize camera frame to match window size
        camera_frame_resized = cv2.resize(frame, (WINDOW_WIDTH, WINDOW_HEIGHT))

        # Add enhanced status text with background
        text = f'STATE: {state_name}'
        text_size = cv2.getTextSize(text, cv2.FONT_HERSHEY_SIMPLEX, 0.7, 2)[0]
        # Draw background rectangle
        cv2.rectangle(camera_frame_resized, (5, 5), (text_size[0] + 15, 40), (0, 0, 0), -1)
        cv2.rectangle(camera_frame_resized, (5, 5), (text_size[0] + 15, 40), (0, 255, 0), 2)
        # Draw text
        cv2.putText(camera_frame_resized, text, (10, 30),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 0), 2, cv2.LINE_AA)

        # Add instructions text with background
        instructions = ['Press "q" to quit', 'Try different gestures!']
        y_offset = WINDOW_HEIGHT - 50
        for instruction in instructions:
            text_size = cv2.getTextSize(instruction, cv2.FONT_HERSHEY_SIMPLEX, 0.5, 1)[0]
            cv2.rectangle(camera_frame_resized, (5, y_offset - 20), (text_size[0] + 15, y_offset + 5), (0, 0, 0), -1)
            cv2.putText(camera_frame_resized, instruction, (10, y_offset),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 255, 255), 1, cv2.LINE_AA)
            y_offset += 25

        # Display the camera feed and animation
        cv2.imshow('Camera Feed', camera_frame_resized)
        cv2.imshow('Animation Output', display_frame)

        # Exit loop if 'q' is pressed (increased wait time for smoother video)
        if cv2.waitKey(1) & 0xFF == ord('q'):
            break

# --- CLEANUP ---
print("👋 Shutting down...")
if BACKGROUND_MUSIC_ENABLED:
    pygame.mixer.stop()
cap.release()
cv2.destroyAllWindows()
print("✅ Application closed successfully!")
print("Thanks for using the Emotion Gesture Detector! 🎉")
print("✅ Application closed successfully!")