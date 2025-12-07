/**
 * Motivational messages to display after logging a workout
 */

const motivationalMessages = [
  "Beast mode activated! Keep crushing it! 💪",
  "You're unstoppable! Another workout in the books! 🔥",
  "Gains incoming! Great work today! 💯",
  "That's how champions train! Keep it up! 🏆",
  "You're getting stronger every day! 💪",
  "Consistency is key, and you're nailing it! ⭐",
  "Your future self will thank you! Keep grinding! 🚀",
  "One rep closer to your goals! Amazing work! 🎯",
  "The only bad workout is the one you didn't do. Nice job! ✨",
  "Progress over perfection! You showed up today! 🙌",
  "Sweat now, shine later! Great session! 💎",
  "You're writing your success story, one workout at a time! 📖",
  "Strong body, strong mind! Keep pushing! 🧠",
  "Your dedication is inspiring! Keep going! 🌟",
  "Every workout counts! You're doing amazing! 👏",
  "The grind never stops, and neither do you! ⚡",
  "You just leveled up! Keep the momentum going! 🆙",
  "Champions are built in the gym. You're on the right path! 🏅",
  "Your hard work is paying off! Stay consistent! 💪",
  "Another brick in your foundation of greatness! 🧱"
];

/**
 * Get a random motivational message
 */
export function getRandomMotivationalMessage(): string {
  const randomIndex = Math.floor(Math.random() * motivationalMessages.length);
  return motivationalMessages[randomIndex];
}
