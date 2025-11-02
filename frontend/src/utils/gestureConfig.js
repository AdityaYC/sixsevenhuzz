/**
 * SIXSEVENHUZZ.TECH - Gesture Configuration
 * The ultimate mapping of gestures to epic reactions
 * Author: Aditya Punjani
 */

export const gestureConfig = {
  THUMBS_UP: {
    id: 1,
    name: "Thumbs Up",
    emoji: "👍",
    image: "/api/images/thumbsup.png",
    caption: "APPROVED! ✅",
    description: "Classic approval vibes",
    difficulty: "Easy 😎",
    rating: 5,
    timesUsed: 1247,
    isGif: false,
    funnyComments: [
      "You're doing great sweetie!",
      "Certified dude approved!",
      "Two thumbs up? Nah, one is enough",
      "*chef's kiss*"
    ],
    soundEffect: "cha-ching.mp3",
    confettiIntensity: "medium",
    step1: "Curl all fingers into a fist",
    step2: "Extend thumb upward",
    step3: "Hold steady for 1 second",
    funFact: "Most used gesture on the internet (probably)"
  },

  YAWN: {
    id: 2,
    name: "Big Yawn Energy",
    emoji: "😮",
    image: "/api/images/yawn.jpg",
    caption: "BIG YAWN ENERGY 😴",
    description: "Mood: Perpetually sleepy",
    difficulty: "Easy 😎",
    rating: 4,
    timesUsed: 892,
    isGif: false,
    funnyComments: [
      "Mondays, amirite?",
      "Need coffee stat!",
      "Yawning is contagious... see?",
      "Same, bestie. Same."
    ],
    soundEffect: "snore.mp3",
    confettiIntensity: "low",
    step1: "Open mouth wide",
    step2: "Look tired (shouldn't be hard)",
    step3: "Embrace the sleepiness",
    funFact: "Yawning increases oxygen to your brain... allegedly"
  },

  SMILE: {
    id: 3,
    name: "Big Smile",
    emoji: "😁",
    image: "/api/images/smile.jpg",
    caption: "VIBES = IMMACULATE 🔥",
    description: "Pure happiness detected",
    difficulty: "Easy 😎",
    rating: 5,
    timesUsed: 2103,
    isGif: false,
    funnyComments: [
      "That smile! That damned smile!",
      "Happiness is contagious!",
      "Keep smiling, you beautiful human",
      "Vibes: IMMACULATE ✨"
    ],
    soundEffect: "happy.mp3",
    confettiIntensity: "medium",
    step1: "Show those pearly whites",
    step2: "Think happy thoughts",
    step3: "Spread the joy",
    funFact: "Smiling releases endorphins. Science!"
  },

  MONKEY_FINGER_MOUTH: {
    id: 4,
    name: "Shh Monkey",
    emoji: "🤫",
    image: "/api/images/monkey_finger_mouth.jpeg",
    caption: "SHHHHH! 🤐 Secrets Only",
    description: "The sacred silence gesture",
    difficulty: "Medium 🤔",
    rating: 5,
    timesUsed: 667,
    isGif: false,
    funnyComments: [
      "Your secret is safe with me... maybe",
      "Shhh... the AI is listening",
      "Quiet mode: ACTIVATED",
      "What happens in the webcam stays in the webcam"
    ],
    soundEffect: "shh.mp3",
    confettiIntensity: "none",
    specialEffect: "blur-background",
    step1: "Put index finger to lips",
    step2: "Look mysterious",
    step3: "Hold for 5 seconds to unlock secret mode",
    funFact: "Holding this for 5 seconds unlocks a secret easter egg!"
  },

  MONKEY_FINGER_RAISE: {
    id: 5,
    name: "Pointing Monkey",
    emoji: "☝️",
    image: "/api/images/monkey_finger_raise.jpg",
    caption: "☝️ THIS GUY GETS IT",
    description: "The iconic point",
    difficulty: "Easy 😎",
    rating: 5,
    timesUsed: 1456,
    isGif: false,
    funnyComments: [
      "Exactly! You get it!",
      "This is the way",
      "Point taken!",
      "Wise words from a wise finger"
    ],
    soundEffect: "ding.mp3",
    confettiIntensity: "medium",
    specialEffect: "spotlight",
    step1: "Raise index finger up",
    step2: "Look wise and knowing",
    step3: "Channel your inner philosopher",
    funFact: "Shooting star particles follow your finger!"
  },

  TONGUE_OUT: {
    id: 6,
    name: "Tongue Out Chaos",
    emoji: "😛",
    image: "/api/images/monkey_mouth.gif",
    caption: "CHAOS MODE ACTIVATED 🔥",
    description: "Unleash absolute madness",
    difficulty: "Master 🧙",
    rating: 5,
    timesUsed: 666,
    isGif: true,
    funnyComments: [
      "YOU MADLAD!",
      "Absolute chaos! I love it!",
      "The monkey approves this message",
      "This is fine. Everything is fine."
    ],
    soundEffect: "air-horn.mp3",
    confettiIntensity: "extreme",
    specialEffect: "screen-shake",
    step1: "Stick tongue out",
    step2: "Move side to side",
    step3: "Embrace the chaos",
    funFact: "Triggers screen shake effect for maximum impact!"
  },

  VICTORY: {
    id: 7,
    name: "Victory Celebration",
    emoji: "🎉",
    image: "/api/images/67.gif",
    caption: "PEACE OUT ✌️ PARTY MODE",
    description: "Ultimate celebration mode",
    difficulty: "Medium 🤔",
    rating: 5,
    timesUsed: 1891,
    isGif: true,
    funnyComments: [
      "PARTY TIME! 🎉",
      "You did it! Whatever 'it' was!",
      "Victory royale!",
      "Crowd goes wild!"
    ],
    soundEffect: "crowd-cheer.mp3",
    confettiIntensity: "maximum",
    specialEffect: "fireworks",
    step1: "Raise both hands high",
    step2: "Or wave both palms up and down",
    step3: "Celebrate like you mean it!",
    funFact: "Air horns and confetti included!"
  },

  PEACE: {
    id: 8,
    name: "Peace Sign",
    emoji: "✌️",
    image: "/api/images/cheer.webp",
    caption: "LET'S GOOOOO! 🎉",
    description: "Cheerleader energy",
    difficulty: "Easy 😎",
    rating: 5,
    timesUsed: 1234,
    isGif: false,
    funnyComments: [
      "Peace and love, baby!",
      "Vibes: Immaculate",
      "Cheerleader mode: ON",
      "Let's goooo!"
    ],
    soundEffect: "cheer.mp3",
    confettiIntensity: "high",
    step1: "Extend index and middle fingers",
    step2: "Keep other fingers down",
    step3: "Spread those fingers apart",
    funFact: "Bounce animation with fireworks!"
  },

  CLAPPING: {
    id: 9,
    name: "Did Unc Snap?",
    emoji: "🤔",
    image: "/api/images/did-unc-snap-unc.gif",
    caption: "UNC IS PONDERING... 🤔",
    description: "Deep thoughts mode",
    difficulty: "Medium 🤔",
    rating: 4,
    timesUsed: 543,
    isGif: true,
    funnyComments: [
      "Unc is thinking...",
      "Big brain time",
      "Contemplating life's mysteries",
      "Did he snap tho?"
    ],
    soundEffect: "thinking.mp3",
    confettiIntensity: "low",
    specialEffect: "slow-zoom",
    step1: "Bring hands together",
    step2: "Look thoughtful",
    step3: "Ponder the universe",
    funFact: "The legendary 40+ year old rapper meme!"
  },

  CRYING: {
    id: 10,
    name: "Goblin Tears",
    emoji: "😭",
    image: "/api/images/goblin_crying.gif",
    caption: "IT'S OKAY TO CRY 😭",
    description: "Let it all out",
    difficulty: "Medium 🤔",
    rating: 5,
    timesUsed: 789,
    isGif: true,
    funnyComments: [
      "There there... *pat pat*",
      "Who hurt you?!",
      "Crying is just eye sweating",
      "Same bestie, same..."
    ],
    soundEffect: "sad-violin.mp3",
    confettiIntensity: "none",
    specialEffect: "rain",
    step1: "Cover face with hands",
    step2: "Or just look sad",
    step3: "Let those tears flow",
    funFact: "Triggers rain effect overlay with dramatic music!"
  },

  FIST: {
    id: 11,
    name: "Hog Rider Rage",
    emoji: "😤",
    image: "/api/images/hog.jpeg",
    caption: "HOG RIDERRRRR!!! 🐗",
    description: "Maximum aggression unlocked",
    difficulty: "Easy 😎",
    rating: 5,
    timesUsed: 1567,
    isGif: false,
    funnyComments: [
      "HOOOOOG RIDAAAAAAA!",
      "Someone's fired up!",
      "Big angry energy",
      "Chill bro, it's just a webcam"
    ],
    soundEffect: "battle-cry.mp3",
    confettiIntensity: "high",
    specialEffect: "screen-shake",
    step1: "Make a fist",
    step2: "Channel your inner warrior",
    step3: "HOOOOOG RIDAAAA!",
    funFact: "Charges in from the side with speed lines!"
  },

  DANCING: {
    id: 12,
    name: "Pig Dance Party",
    emoji: "🐷",
    image: "/api/images/pig-dance-clash-royale.gif",
    caption: "ABSOLUTE CHAOS 🐷💃",
    description: "Pure, unfiltered chaos energy",
    difficulty: "CHAOS 🔥",
    rating: 5,
    timesUsed: 999,
    isGif: true,
    funnyComments: [
      "HEEEEE-HAW!",
      "This is what peak performance looks like",
      "Clash Royale called, they want their pig back",
      "Oink oink, party time!"
    ],
    soundEffect: "party-horn.mp3",
    confettiIntensity: "maximum",
    specialEffect: "screen-shake + fireworks",
    step1: "Wave both hands frantically",
    step2: "Look unhinged",
    step3: "Keep going!",
    funFact: "Full screen, infinite loop, party lights!"
  },

  KISSING: {
    id: 13,
    name: "Princess Kiss",
    emoji: "💋",
    image: "/api/images/princess_kissing.gif",
    caption: "SMOOCH! 💋 LOVE YA",
    description: "Spreading the love",
    difficulty: "Medium 🤔",
    rating: 5,
    timesUsed: 876,
    isGif: true,
    funnyComments: [
      "Awww! *blushes*",
      "You're too sweet!",
      "Mwah! Right back at ya!",
      "Feeling the love 💕"
    ],
    soundEffect: "kiss.mp3",
    confettiIntensity: "medium",
    specialEffect: "hearts",
    step1: "Make a kiss gesture",
    step2: "Blow towards camera",
    step3: "Spread the love!",
    funFact: "Hearts float across the screen!"
  },

  OPEN_PALM: {
    id: 14,
    name: "Princess Victory",
    emoji: "👸",
    image: "/api/images/princess.gif",
    caption: "ROYALTY DETECTED 👑",
    description: "Royal vibes only",
    difficulty: "Easy 😎",
    rating: 5,
    timesUsed: 1345,
    isGif: true,
    funnyComments: [
      "All hail the queen/king!",
      "Royalty has entered the chat",
      "Crown fits perfectly!",
      "Bow down, peasants!"
    ],
    soundEffect: "royal.mp3",
    confettiIntensity: "high",
    specialEffect: "crown + sparkles",
    step1: "Open palm, fingers spread",
    step2: "Wave gracefully",
    step3: "Own your royalty",
    funFact: "Crown appears above your head with sparkles!"
  }
};

// Helper functions
export const getGestureByName = (name) => {
  return Object.values(gestureConfig).find(g => 
    g.name.toLowerCase().includes(name.toLowerCase())
  );
};

export const getRandomComment = (gestureName) => {
  const gesture = getGestureByName(gestureName);
  const comments = gesture?.funnyComments || ["Nice!"];
  return comments[Math.floor(Math.random() * comments.length)];
};

export const getAllGestures = () => {
  return Object.values(gestureConfig);
};

export const getGesturesByDifficulty = (difficulty) => {
  return Object.values(gestureConfig).filter(g => 
    g.difficulty.includes(difficulty)
  );
};
