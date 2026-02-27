from datetime import datetime
from sqlalchemy import Boolean, Column, Date, DateTime, Integer, String
from database import Base


class Task(Base):
    __tablename__ = "tasks"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    due_date = Column(Date, nullable=True)
    priority = Column(String, default="med")
    notes = Column(String, nullable=True)
    position = Column(Integer, nullable=False)
    completed = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
