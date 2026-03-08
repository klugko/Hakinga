"""
Drill generation service for personalized practice exercises.
Creates targeted exercises based on user weaknesses.
"""
from dataclasses import dataclass, field
from typing import List, Dict, Optional
from enum import Enum
import random


class DrillType(Enum):
    """Types of drill exercises."""
    CHARACTER_FOCUS = "character_focus"
    BIGRAM_FOCUS = "bigram_focus"
    SPEED_BURST = "speed_burst"
    ACCURACY_FOCUS = "accuracy_focus"
    FINGER_STRENGTH = "finger_strength"
    ALTERNATING_HANDS = "alternating_hands"
    NUMBER_ROW = "number_row"
    PUNCTUATION = "punctuation"


@dataclass
class DrillExercise:
    """A single drill exercise."""
    drill_type: DrillType
    text: str
    target_wpm: int
    target_accuracy: float
    focus_chars: List[str]
    duration_seconds: int
    difficulty: str
    description: str


@dataclass
class TrainingPlan:
    """A complete training plan for a user."""
    plan_id: str
    user_id: str
    duration_days: int
    daily_target_minutes: int
    focus_areas: List[str]
    drills: List[DrillExercise]
    milestones: List[Dict]
    description: str


# Word lists for drill generation
COMMON_WORDS = [
    "the", "be", "to", "of", "and", "a", "in", "that", "have", "I",
    "it", "for", "not", "on", "with", "he", "as", "you", "do", "at",
    "this", "but", "his", "by", "from", "they", "we", "say", "her", "she",
    "or", "an", "will", "my", "one", "all", "would", "there", "their", "what",
    "so", "up", "out", "if", "about", "who", "get", "which", "go", "me",
]

BIGRAM_WORDS = {
    "th": ["the", "that", "this", "them", "their", "then", "there", "through", "think", "both"],
    "he": ["he", "her", "here", "help", "head", "heart", "heavy", "hello", "held", "health"],
    "in": ["in", "into", "inside", "indeed", "include", "income", "industry", "infant", "inform", "ink"],
    "er": ["her", "over", "after", "under", "ever", "every", "never", "other", "power", "water"],
    "an": ["an", "and", "another", "any", "can", "man", "plan", "ran", "than", "want"],
    "re": ["are", "were", "here", "there", "where", "more", "before", "great", "real", "read"],
    "on": ["on", "one", "only", "done", "gone", "long", "strong", "wrong", "upon", "person"],
    "at": ["at", "that", "what", "eat", "great", "late", "rate", "state", "water", "matter"],
    "en": ["en", "end", "enter", "even", "when", "then", "open", "often", "ten", "men"],
    "nd": ["and", "end", "find", "hand", "kind", "mind", "send", "sound", "stand", "around"],
}

PUNCTUATION_PHRASES = [
    "Hello, how are you?",
    "Wait! Stop right there.",
    "She said, 'Hello!'",
    'He asked, "Why not?"',
    "Items: apples, oranges, and bananas.",
    "Ready? Set? Go!",
    "Yes... I suppose so.",
    "Well (as you know), it's complicated.",
    "Price: $19.99 - special offer!",
    "Email: user@example.com",
]

NUMBER_PHRASES = [
    "The year 2024 has 365 days.",
    "Call 555-1234 for help.",
    "Room 101 is on floor 3.",
    "Score: 98.5 out of 100.",
    "Price reduced by 25% to $49.99",
    "Temperature: 72°F (22°C)",
    "Meeting at 3:30 PM sharp.",
    "Chapter 12, page 345-367.",
    "Born on 07/04/1990.",
    "Order #12345 confirmed.",
]


class DrillGenerationService:
    """
    Service for generating personalized drill exercises.

    Creates targeted exercises based on:
    - User's weak characters
    - Problematic bigrams/trigrams
    - Speed and accuracy goals
    - Finger strength needs
    """

    def generate_character_drill(
        self,
        target_chars: List[str],
        difficulty: str = "medium",
        word_count: int = 20,
    ) -> DrillExercise:
        """
        Generate a drill focusing on specific characters.

        Args:
            target_chars: Characters to focus on
            difficulty: Difficulty level
            word_count: Number of words in drill

        Returns:
            DrillExercise targeting specified characters
        """
        # Find words containing target characters
        words = []
        target_set = set(c.lower() for c in target_chars)

        for word in COMMON_WORDS:
            if any(c in word.lower() for c in target_set):
                words.append(word)

        # If not enough words, generate synthetic ones
        while len(words) < word_count:
            # Create words using target chars
            word = ''.join(random.choices(list(target_set), k=random.randint(3, 6)))
            words.append(word)

        random.shuffle(words)
        text = ' '.join(words[:word_count])

        target_wpm = 40 if difficulty == "easy" else 60 if difficulty == "medium" else 80

        return DrillExercise(
            drill_type=DrillType.CHARACTER_FOCUS,
            text=text,
            target_wpm=target_wpm,
            target_accuracy=95.0,
            focus_chars=target_chars,
            duration_seconds=60,
            difficulty=difficulty,
            description=f"Focus on characters: {', '.join(target_chars)}",
        )

    def generate_bigram_drill(
        self,
        target_bigrams: List[str],
        difficulty: str = "medium",
    ) -> DrillExercise:
        """
        Generate a drill focusing on specific bigrams.

        Args:
            target_bigrams: Bigrams to focus on
            difficulty: Difficulty level

        Returns:
            DrillExercise targeting specified bigrams
        """
        words = []

        for bigram in target_bigrams:
            if bigram in BIGRAM_WORDS:
                words.extend(BIGRAM_WORDS[bigram])

        if not words:
            # Generate words containing the bigrams
            for bigram in target_bigrams:
                words.extend([
                    f"a{bigram}e",
                    f"{bigram}ing",
                    f"re{bigram}",
                ])

        random.shuffle(words)
        text = ' '.join(words[:25])

        target_wpm = 45 if difficulty == "easy" else 65 if difficulty == "medium" else 85

        return DrillExercise(
            drill_type=DrillType.BIGRAM_FOCUS,
            text=text,
            target_wpm=target_wpm,
            target_accuracy=93.0,
            focus_chars=target_bigrams,
            duration_seconds=90,
            difficulty=difficulty,
            description=f"Focus on sequences: {', '.join(target_bigrams)}",
        )

    def generate_speed_burst_drill(
        self,
        current_wpm: float,
        difficulty: str = "medium",
    ) -> DrillExercise:
        """
        Generate a short, intense speed drill.

        Args:
            current_wpm: User's current average WPM
            difficulty: Difficulty level

        Returns:
            DrillExercise for speed bursts
        """
        # Short common phrases for speed
        phrases = [
            "the quick brown fox",
            "jumps over the lazy dog",
            "pack my box with five dozen",
            "how vexingly quick daft zebras jump",
            "the five boxing wizards jump quickly",
        ]

        text = ' '.join(random.sample(phrases, min(3, len(phrases))))

        # Target 10-20% above current speed
        boost = 1.1 if difficulty == "easy" else 1.15 if difficulty == "medium" else 1.2
        target_wpm = int(current_wpm * boost)

        return DrillExercise(
            drill_type=DrillType.SPEED_BURST,
            text=text,
            target_wpm=target_wpm,
            target_accuracy=90.0,
            focus_chars=[],
            duration_seconds=30,
            difficulty=difficulty,
            description=f"Speed burst: aim for {target_wpm} WPM!",
        )

    def generate_accuracy_drill(
        self,
        difficulty: str = "medium",
    ) -> DrillExercise:
        """
        Generate a drill focused on accuracy over speed.

        Args:
            difficulty: Difficulty level

        Returns:
            DrillExercise for accuracy practice
        """
        # Use complex text with varied characters
        if difficulty == "easy":
            text = "Take your time and focus on hitting each key correctly. Accuracy is more important than speed."
        elif difficulty == "medium":
            text = "The quick, brown fox jumps over the lazy dog. Pack my box with five dozen liquor jugs!"
        else:
            text = "\"Programming requires precise keystrokes,\" she said. \"Every character matters: {}, [], (), <>, and more!\""

        target_wpm = 30 if difficulty == "easy" else 45 if difficulty == "medium" else 60

        return DrillExercise(
            drill_type=DrillType.ACCURACY_FOCUS,
            text=text,
            target_wpm=target_wpm,
            target_accuracy=99.0,
            focus_chars=[],
            duration_seconds=120,
            difficulty=difficulty,
            description="Focus on 99%+ accuracy - speed doesn't matter",
        )

    def generate_punctuation_drill(
        self,
        difficulty: str = "medium",
    ) -> DrillExercise:
        """
        Generate a drill for punctuation practice.

        Args:
            difficulty: Difficulty level

        Returns:
            DrillExercise for punctuation
        """
        count = 3 if difficulty == "easy" else 5 if difficulty == "medium" else 8
        phrases = random.sample(PUNCTUATION_PHRASES, min(count, len(PUNCTUATION_PHRASES)))
        text = ' '.join(phrases)

        target_wpm = 35 if difficulty == "easy" else 50 if difficulty == "medium" else 70

        return DrillExercise(
            drill_type=DrillType.PUNCTUATION,
            text=text,
            target_wpm=target_wpm,
            target_accuracy=95.0,
            focus_chars=[".", ",", "!", "?", "'", '"', ";", ":"],
            duration_seconds=90,
            difficulty=difficulty,
            description="Practice punctuation marks",
        )

    def generate_number_drill(
        self,
        difficulty: str = "medium",
    ) -> DrillExercise:
        """
        Generate a drill for number row practice.

        Args:
            difficulty: Difficulty level

        Returns:
            DrillExercise for numbers
        """
        count = 3 if difficulty == "easy" else 5 if difficulty == "medium" else 8
        phrases = random.sample(NUMBER_PHRASES, min(count, len(NUMBER_PHRASES)))
        text = ' '.join(phrases)

        target_wpm = 30 if difficulty == "easy" else 45 if difficulty == "medium" else 60

        return DrillExercise(
            drill_type=DrillType.NUMBER_ROW,
            text=text,
            target_wpm=target_wpm,
            target_accuracy=95.0,
            focus_chars=["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"],
            duration_seconds=90,
            difficulty=difficulty,
            description="Practice number row typing",
        )

    def generate_personalized_drills(
        self,
        user_profile: dict,
        count: int = 5,
    ) -> List[DrillExercise]:
        """
        Generate a set of personalized drills based on user profile.

        Args:
            user_profile: User's typing profile
            count: Number of drills to generate

        Returns:
            List of personalized drill exercises
        """
        drills = []
        skill_level = user_profile.get('skill_level', 'intermediate')

        # Determine difficulty based on skill
        difficulty = "easy" if skill_level == "beginner" else "medium" if skill_level == "intermediate" else "hard"

        # Get weak areas
        weak_chars = user_profile.get('problematic_chars', [])
        weak_bigrams = user_profile.get('problematic_bigrams', [])
        current_wpm = user_profile.get('avg_wpm', 40)

        # Generate drills targeting weaknesses
        if weak_chars:
            chars = [c.get('char', c) if isinstance(c, dict) else c for c in weak_chars[:3]]
            drills.append(self.generate_character_drill(chars, difficulty))

        if weak_bigrams:
            bigrams = [b.get('bigram', b) if isinstance(b, dict) else b for b in weak_bigrams[:3]]
            drills.append(self.generate_bigram_drill(bigrams, difficulty))

        # Add speed burst
        drills.append(self.generate_speed_burst_drill(current_wpm, difficulty))

        # Add accuracy drill
        drills.append(self.generate_accuracy_drill(difficulty))

        # Add punctuation or numbers
        if random.random() > 0.5:
            drills.append(self.generate_punctuation_drill(difficulty))
        else:
            drills.append(self.generate_number_drill(difficulty))

        return drills[:count]

    def create_training_plan(
        self,
        user_id: str,
        user_profile: dict,
        duration_days: int = 7,
        daily_minutes: int = 30,
    ) -> TrainingPlan:
        """
        Create a complete training plan for a user.

        Args:
            user_id: User identifier
            user_profile: User's typing profile
            duration_days: Plan duration in days
            daily_minutes: Target daily practice time

        Returns:
            Complete training plan
        """
        import uuid

        skill_level = user_profile.get('skill_level', 'intermediate')
        current_wpm = user_profile.get('avg_wpm', 40)
        current_accuracy = user_profile.get('avg_accuracy', 90)

        # Determine focus areas
        focus_areas = []
        if user_profile.get('problematic_chars'):
            focus_areas.append("Character accuracy")
        if user_profile.get('problematic_bigrams'):
            focus_areas.append("Sequence fluency")
        if current_accuracy < 95:
            focus_areas.append("Overall accuracy")
        if current_wpm < 60:
            focus_areas.append("Speed development")

        if not focus_areas:
            focus_areas = ["Maintenance and improvement"]

        # Generate drills for the plan
        drills = self.generate_personalized_drills(user_profile, count=duration_days * 3)

        # Create milestones
        milestones = []
        wpm_goal = current_wpm + (5 * (duration_days / 7))
        accuracy_goal = min(98, current_accuracy + 2)

        milestones.append({
            "day": duration_days // 2,
            "type": "checkpoint",
            "description": f"Mid-plan check: Target {current_wpm + 2:.0f} WPM",
        })

        milestones.append({
            "day": duration_days,
            "type": "goal",
            "description": f"Final goal: {wpm_goal:.0f} WPM with {accuracy_goal:.0f}% accuracy",
        })

        # Create plan description
        description = f"""
{duration_days}-day personalized training plan for {skill_level} level.

Goals:
- Increase WPM from {current_wpm:.0f} to {wpm_goal:.0f}
- Improve accuracy to {accuracy_goal:.0f}%

Focus areas: {', '.join(focus_areas)}

Daily routine ({daily_minutes} minutes):
- 5 min warm-up
- 15-20 min focused practice
- 5-10 min free typing
""".strip()

        return TrainingPlan(
            plan_id=str(uuid.uuid4())[:8],
            user_id=user_id,
            duration_days=duration_days,
            daily_target_minutes=daily_minutes,
            focus_areas=focus_areas,
            drills=drills,
            milestones=milestones,
            description=description,
        )


# Global instance
drill_generation_service = DrillGenerationService()
