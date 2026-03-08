"""
Seed script to add programming code texts to the database.
Run with: python -m scripts.seed_code_texts
"""
import asyncio
from uuid import uuid4

from app.infrastructure.database.session import AsyncSessionLocal
from app.infrastructure.database.models import TypingTextModel
from app.domain.entities.typing_text import Difficulty, TextLength

# Python code snippets
PYTHON_TEXTS = [
    {
        "content": "def hello_world():\n    print('Hello, World!')\n    return True",
        "category": "code-python",
        "author": "Python Basics",
    },
    {
        "content": "class User:\n    def __init__(self, name, email):\n        self.name = name\n        self.email = email\n\n    def greet(self):\n        return f'Hello, {self.name}!'",
        "category": "code-python",
        "author": "Python OOP",
    },
    {
        "content": "def fibonacci(n):\n    if n <= 1:\n        return n\n    return fibonacci(n-1) + fibonacci(n-2)\n\nresult = [fibonacci(i) for i in range(10)]",
        "category": "code-python",
        "author": "Python Algorithms",
    },
    {
        "content": "import asyncio\n\nasync def fetch_data(url):\n    async with aiohttp.ClientSession() as session:\n        async with session.get(url) as response:\n            return await response.json()",
        "category": "code-python",
        "author": "Python Async",
    },
    {
        "content": "users = [{'name': 'Alice', 'age': 30}, {'name': 'Bob', 'age': 25}]\nfiltered = list(filter(lambda x: x['age'] > 26, users))\nsorted_users = sorted(filtered, key=lambda x: x['name'])",
        "category": "code-python",
        "author": "Python Functional",
    },
]

# JavaScript code snippets
JAVASCRIPT_TEXTS = [
    {
        "content": "const greeting = (name) => {\n  return `Hello, ${name}!`;\n};\n\nconsole.log(greeting('World'));",
        "category": "code-javascript",
        "author": "JavaScript Basics",
    },
    {
        "content": "class Component extends React.Component {\n  constructor(props) {\n    super(props);\n    this.state = { count: 0 };\n  }\n\n  render() {\n    return <div>{this.state.count}</div>;\n  }\n}",
        "category": "code-javascript",
        "author": "React Component",
    },
    {
        "content": "async function fetchUsers() {\n  try {\n    const response = await fetch('/api/users');\n    const data = await response.json();\n    return data;\n  } catch (error) {\n    console.error('Error:', error);\n  }\n}",
        "category": "code-javascript",
        "author": "JavaScript Async",
    },
    {
        "content": "const numbers = [1, 2, 3, 4, 5];\nconst doubled = numbers.map(n => n * 2);\nconst evens = doubled.filter(n => n % 2 === 0);\nconst sum = evens.reduce((acc, n) => acc + n, 0);",
        "category": "code-javascript",
        "author": "JavaScript Arrays",
    },
    {
        "content": "interface User {\n  id: string;\n  name: string;\n  email: string;\n  createdAt: Date;\n}\n\ntype PartialUser = Partial<User>;\ntype ReadonlyUser = Readonly<User>;",
        "category": "code-javascript",
        "author": "TypeScript Types",
    },
]

# Java code snippets
JAVA_TEXTS = [
    {
        "content": "public class HelloWorld {\n    public static void main(String[] args) {\n        System.out.println(\"Hello, World!\");\n    }\n}",
        "category": "code-java",
        "author": "Java Basics",
    },
    {
        "content": "public class User {\n    private String name;\n    private String email;\n\n    public User(String name, String email) {\n        this.name = name;\n        this.email = email;\n    }\n\n    public String getName() {\n        return name;\n    }\n}",
        "category": "code-java",
        "author": "Java OOP",
    },
    {
        "content": "List<Integer> numbers = Arrays.asList(1, 2, 3, 4, 5);\nList<Integer> squared = numbers.stream()\n    .map(n -> n * n)\n    .filter(n -> n > 10)\n    .collect(Collectors.toList());",
        "category": "code-java",
        "author": "Java Streams",
    },
]

# Code symbols drills
SYMBOLS_TEXTS = [
    {
        "content": "{ } [ ] ( ) < > ; : ' \" ` ~ ! @ # $ % ^ & * - + = | \\ / ? , .",
        "category": "code-symbols",
        "author": "Symbol Drill",
    },
    {
        "content": "function() { return [1, 2, 3]; }\narray[0] = 'value';\nobject.property = (a, b) => a + b;",
        "category": "code-symbols",
        "author": "Symbol Practice",
    },
    {
        "content": "if (x > 0 && y < 10) { }\nfor (let i = 0; i < arr.length; i++) { }\nwhile (condition !== true) { }",
        "category": "code-symbols",
        "author": "Control Flow Symbols",
    },
    {
        "content": "const obj = { key: 'value', nested: { a: 1, b: 2 } };\nconst arr = [[1, 2], [3, 4], [5, 6]];\nconst fn = (x, y) => ({ x, y });",
        "category": "code-symbols",
        "author": "Data Structure Symbols",
    },
]


def calculate_word_count(text: str) -> int:
    """Calculate word count for code (split by whitespace and special chars)."""
    import re
    tokens = re.findall(r'\w+', text)
    return len(tokens)


def calculate_difficulty(text: str) -> Difficulty:
    """Calculate difficulty for code texts."""
    special_chars = sum(1 for c in text if not c.isalnum() and not c.isspace())
    special_density = special_chars / len(text) if text else 0

    if special_density > 0.15:
        return Difficulty.HARD
    elif special_density > 0.08:
        return Difficulty.MEDIUM
    return Difficulty.EASY


def calculate_length(word_count: int) -> TextLength:
    """Calculate length category."""
    if word_count < 25:
        return TextLength.SHORT
    elif word_count < 60:
        return TextLength.MEDIUM
    return TextLength.LONG


async def seed_texts():
    """Seed code texts into the database."""
    all_texts = PYTHON_TEXTS + JAVASCRIPT_TEXTS + JAVA_TEXTS + SYMBOLS_TEXTS

    async with AsyncSessionLocal() as db:
        for text_data in all_texts:
            content = text_data["content"]
            word_count = calculate_word_count(content)

            text_model = TypingTextModel(
                id=uuid4(),
                content=content,
                difficulty=calculate_difficulty(content),
                length=calculate_length(word_count),
                word_count=word_count,
                category=text_data["category"],
                author=text_data.get("author"),
                is_active=True,
            )
            db.add(text_model)

        await db.commit()
        print(f"Seeded {len(all_texts)} code texts successfully!")


if __name__ == "__main__":
    asyncio.run(seed_texts())
