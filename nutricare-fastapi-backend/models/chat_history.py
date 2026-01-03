from beanie import Document, Link
from pydantic import Field
from typing import List, Dict
from datetime import datetime
from models.user import User


class ChatMessage(Document):
    """Individual chat message"""
    role: str  # "user" or "assistant"
    content: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)


class ChatHistory(Document):
    """Chat conversation history"""
    user: Link[User]
    session_id: str = Field(index=True)

    # Messages
    messages: List[Dict] = Field(default_factory=list)  # [{"role": "user", "content": "..."}]

    # Context for AI
    user_context: Dict = Field(default_factory=dict)  # User profile info for context

    # Timestamps
    started_at: datetime = Field(default_factory=datetime.utcnow)
    last_message_at: datetime = Field(default_factory=datetime.utcnow)

    # Status
    is_active: bool = True

    class Settings:
        name = "chat_history"
        indexes = ["user", "session_id", "started_at"]

    def add_message(self, role: str, content: str):
        """Add a message to the conversation"""
        self.messages.append({
            "role": role,
            "content": content,
            "timestamp": datetime.utcnow().isoformat()
        })
        self.last_message_at = datetime.utcnow()

    def get_recent_messages(self, limit: int = 10) -> List[Dict]:
        """Get recent messages for context"""
        return self.messages[-limit:] if len(self.messages) > limit else self.messages
