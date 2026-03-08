"""
Text targeting service for selecting texts based on user weaknesses.
Implements intelligent text selection to accelerate learning.
"""
from dataclasses import dataclass
from typing import List, Dict, Optional, Set
import random


@dataclass
class TextCandidate:
    """A candidate text for practice."""
    text_id: str
    content: str
    difficulty: str
    relevance_score: float  # 0-100, how relevant to user's weaknesses
    focus_chars: List[str]
    estimated_challenge: str  # "easy", "optimal", "challenging"


@dataclass
class TextSelection:
    """Result of text selection."""
    selected_text: TextCandidate
    alternatives: List[TextCandidate]
    selection_reason: str


class TextTargetingService:
    """
    Service for intelligent text selection based on user weaknesses.

    Selects texts that:
    - Contain problematic characters
    - Include difficult bigrams/trigrams
    - Match appropriate difficulty level
    - Provide optimal challenge
    """

    # Sample texts for different focus areas
    CHAR_FOCUSED_TEXTS = {
        'q': [
            "The queen quickly acquired quite a unique antique.",
            "Quarantine requires quiet quarters and quality quilts.",
            "Questions about quantum mechanics require quick thinking.",
        ],
        'z': [
            "The zebra zigzagged through the zoo with zeal.",
            "Zero zombies zoomed past the zen garden zone.",
            "Zesty pizzas sizzle in the freezer zone.",
        ],
        'x': [
            "The expert examined the exact hexagonal box.",
            "Maximum exposure to complex textures excites explorers.",
            "Excellence requires extra effort and fixed expectations.",
        ],
        'j': [
            "The joyful juggler joined the major project.",
            "Just imagine enjoying jam and jelly for breakfast.",
            "Journalists adjust their objectives during major events.",
        ],
        'k': [
            "The kind king kept a keen lookout.",
            "Kicking and hiking make knees work harder.",
            "Knowledge sparks remarkable thinking skills.",
        ],
    }

    BIGRAM_FOCUSED_TEXTS = {
        'th': [
            "The three brothers gathered together with their father.",
            "Throughout the month, they thought about other things.",
            "This thick leather withstands weather better than cloth.",
        ],
        'qu': [
            "The queen requested quiet quarters for quality rest.",
            "Questions require quick answers and unique techniques.",
            "Squirrels frequently acquire quantities of acorns.",
        ],
        'ck': [
            "The quick duck picked up the black rock.",
            "Luck struck when the clock struck twelve.",
            "The thick brick stack blocked the truck.",
        ],
        'ng': [
            "The young king sang a song during spring.",
            "Singing along brings strong feelings.",
            "Running and jumping strengthen aging muscles.",
        ],
    }

    DIFFICULTY_TEXTS = {
        'easy': [
            "The cat sat on the mat.",
            "I like to read books at home.",
            "The sun is hot in summer.",
            "Dogs run fast in the park.",
            "She has a red car.",
        ],
        'medium': [
            "The quick brown fox jumps over the lazy dog.",
            "Practice makes perfect when learning new skills.",
            "Technology changes how we communicate daily.",
            "Creative writing requires imagination and patience.",
            "Scientists discover new facts about the universe.",
        ],
        'hard': [
            "Extraordinary circumstances require exceptional measures immediately.",
            "The philosopher's quintessential argument proved remarkably persuasive.",
            "Asymmetric cryptography guarantees authentication and confidentiality.",
            "Sophisticated algorithms optimize computational efficiency significantly.",
            "Neuroplasticity demonstrates the brain's remarkable adaptability.",
        ],
    }

    def calculate_relevance_score(
        self,
        text: str,
        weak_chars: Set[str],
        weak_bigrams: Set[str],
    ) -> float:
        """
        Calculate how relevant a text is to user's weaknesses.

        Args:
            text: Text to evaluate
            weak_chars: Set of problematic characters
            weak_bigrams: Set of problematic bigrams

        Returns:
            Relevance score 0-100
        """
        text_lower = text.lower()
        score = 0
        max_score = 0

        # Score based on weak characters
        for char in weak_chars:
            max_score += 20
            char_count = text_lower.count(char)
            if char_count > 0:
                score += min(20, char_count * 5)

        # Score based on weak bigrams
        for bigram in weak_bigrams:
            max_score += 30
            bigram_count = text_lower.count(bigram)
            if bigram_count > 0:
                score += min(30, bigram_count * 10)

        if max_score == 0:
            return 50  # Neutral if no weaknesses specified

        return min(100, (score / max_score) * 100)

    def find_focus_chars_in_text(
        self,
        text: str,
        weak_chars: Set[str],
    ) -> List[str]:
        """
        Find which weak characters appear in a text.

        Args:
            text: Text to analyze
            weak_chars: Set of problematic characters

        Returns:
            List of weak characters found
        """
        text_chars = set(text.lower())
        return [c for c in weak_chars if c in text_chars]

    def estimate_challenge_level(
        self,
        text: str,
        user_avg_wpm: float,
        text_difficulty: str,
    ) -> str:
        """
        Estimate challenge level for a user.

        Args:
            text: Text to evaluate
            user_avg_wpm: User's average WPM
            text_difficulty: Text's difficulty level

        Returns:
            Challenge level: "easy", "optimal", "challenging"
        """
        difficulty_scores = {"easy": 1, "medium": 2, "hard": 3}
        diff_score = difficulty_scores.get(text_difficulty, 2)

        # Estimate user skill level
        if user_avg_wpm >= 80:
            user_level = 3
        elif user_avg_wpm >= 50:
            user_level = 2
        else:
            user_level = 1

        difference = diff_score - user_level

        if difference < 0:
            return "easy"
        elif difference == 0:
            return "optimal"
        else:
            return "challenging"

    def select_text_for_weakness(
        self,
        available_texts: List[Dict],
        weak_chars: List[str],
        weak_bigrams: List[str],
        user_avg_wpm: float,
        preferred_difficulty: str = "medium",
    ) -> TextSelection:
        """
        Select the best text for a user based on their weaknesses.

        Args:
            available_texts: List of available texts (with id, content, difficulty)
            weak_chars: User's problematic characters
            weak_bigrams: User's problematic bigrams
            user_avg_wpm: User's average WPM
            preferred_difficulty: Preferred difficulty level

        Returns:
            TextSelection with best text and alternatives
        """
        weak_char_set = set(c.lower() for c in weak_chars)
        weak_bigram_set = set(b.lower() for b in weak_bigrams)

        candidates = []

        for text_data in available_texts:
            text_id = text_data.get('id', str(random.randint(1000, 9999)))
            content = text_data.get('content', '')
            difficulty = text_data.get('difficulty', 'medium')

            relevance = self.calculate_relevance_score(content, weak_char_set, weak_bigram_set)
            focus_chars = self.find_focus_chars_in_text(content, weak_char_set)
            challenge = self.estimate_challenge_level(content, user_avg_wpm, difficulty)

            # Boost score for optimal difficulty
            if difficulty == preferred_difficulty:
                relevance *= 1.2
            elif challenge == "optimal":
                relevance *= 1.1

            candidates.append(TextCandidate(
                text_id=text_id,
                content=content,
                difficulty=difficulty,
                relevance_score=min(100, relevance),
                focus_chars=focus_chars,
                estimated_challenge=challenge,
            ))

        # Sort by relevance
        candidates.sort(key=lambda x: x.relevance_score, reverse=True)

        if not candidates:
            # Fallback to default text
            default_text = random.choice(self.DIFFICULTY_TEXTS.get(preferred_difficulty, self.DIFFICULTY_TEXTS['medium']))
            fallback = TextCandidate(
                text_id="fallback",
                content=default_text,
                difficulty=preferred_difficulty,
                relevance_score=50,
                focus_chars=[],
                estimated_challenge="optimal",
            )
            return TextSelection(
                selected_text=fallback,
                alternatives=[],
                selection_reason="Default text selected (no matching texts found)",
            )

        selected = candidates[0]
        alternatives = candidates[1:4]

        # Generate selection reason
        if selected.focus_chars:
            reason = f"Selected to practice: {', '.join(selected.focus_chars)}"
        elif selected.relevance_score > 70:
            reason = "Highly relevant to your improvement areas"
        else:
            reason = f"Best match for {preferred_difficulty} difficulty"

        return TextSelection(
            selected_text=selected,
            alternatives=alternatives,
            selection_reason=reason,
        )

    def get_texts_for_char(
        self,
        char: str,
        count: int = 3,
    ) -> List[str]:
        """
        Get texts focusing on a specific character.

        Args:
            char: Character to focus on
            count: Number of texts to return

        Returns:
            List of texts containing the character
        """
        char_lower = char.lower()

        # Check if we have specific texts
        if char_lower in self.CHAR_FOCUSED_TEXTS:
            texts = self.CHAR_FOCUSED_TEXTS[char_lower]
            return random.sample(texts, min(count, len(texts)))

        # Generate texts with common words containing the character
        common_words_with_char = [
            w for w in ['the', 'and', 'for', 'are', 'but', 'not', 'you', 'all',
                        'can', 'had', 'her', 'was', 'one', 'our', 'out', 'day',
                        'get', 'has', 'him', 'his', 'how', 'its', 'may', 'new',
                        'now', 'old', 'see', 'way', 'who', 'boy', 'did', 'own']
            if char_lower in w
        ]

        if common_words_with_char:
            # Create simple sentences
            texts = []
            for _ in range(count):
                words = random.sample(common_words_with_char, min(5, len(common_words_with_char)))
                texts.append(' '.join(words).capitalize() + '.')
            return texts

        return [f"Practice typing the letter '{char}' repeatedly."]

    def get_texts_for_bigram(
        self,
        bigram: str,
        count: int = 3,
    ) -> List[str]:
        """
        Get texts focusing on a specific bigram.

        Args:
            bigram: Bigram to focus on
            count: Number of texts to return

        Returns:
            List of texts containing the bigram
        """
        bigram_lower = bigram.lower()

        if bigram_lower in self.BIGRAM_FOCUSED_TEXTS:
            texts = self.BIGRAM_FOCUSED_TEXTS[bigram_lower]
            return random.sample(texts, min(count, len(texts)))

        # Generate placeholder
        return [f"Practice the '{bigram}' combination in words."]

    def build_weakness_text(
        self,
        weak_chars: List[str],
        weak_bigrams: List[str],
        length: int = 100,
    ) -> str:
        """
        Build a custom text targeting specific weaknesses.

        Args:
            weak_chars: Characters to include
            weak_bigrams: Bigrams to include
            length: Approximate character length

        Returns:
            Custom text for practice
        """
        text_parts = []

        # Get texts for weak chars
        for char in weak_chars[:2]:
            char_texts = self.get_texts_for_char(char, 1)
            text_parts.extend(char_texts)

        # Get texts for weak bigrams
        for bigram in weak_bigrams[:2]:
            bigram_texts = self.get_texts_for_bigram(bigram, 1)
            text_parts.extend(bigram_texts)

        # Combine and trim to length
        full_text = ' '.join(text_parts)

        if len(full_text) > length:
            # Trim to nearest word
            trimmed = full_text[:length]
            last_space = trimmed.rfind(' ')
            if last_space > length * 0.8:
                trimmed = trimmed[:last_space]
            full_text = trimmed + '.'

        return full_text


# Global instance
text_targeting_service = TextTargetingService()
