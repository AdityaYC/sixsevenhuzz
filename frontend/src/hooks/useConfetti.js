import confetti from 'canvas-confetti'

export const useConfetti = () => {
  const fireConfetti = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#8B5CF6', '#EC4899', '#06B6D4', '#10B981']
    })
  }
  return { fireConfetti }
}
