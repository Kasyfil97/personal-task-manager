from datetime import date, datetime
from typing import Optional
from pydantic import BaseModel


class TaskCreate(BaseModel):
    title: str
    due_date: Optional[date] = None
    priority: str = "med"
    notes: Optional[str] = None


class TaskUpdate(BaseModel):
    title: Optional[str] = None
    due_date: Optional[date] = None
    priority: Optional[str] = None
    notes: Optional[str] = None


class ReorderItem(BaseModel):
    id: int
    position: int


class TaskOut(BaseModel):
    id: int
    title: str
    due_date: Optional[date]
    priority: str
    notes: Optional[str]
    position: int
    completed: bool
    created_at: datetime

    model_config = {"from_attributes": True}
