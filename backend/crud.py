from typing import List
from sqlalchemy.orm import Session
from sqlalchemy import func
from models import Task
from schemas import TaskCreate, TaskUpdate, ReorderItem


def get_incomplete_tasks(db: Session) -> List[Task]:
    return db.query(Task).filter(Task.completed == False).order_by(Task.position).all()


def get_completed_tasks(db: Session) -> List[Task]:
    return db.query(Task).filter(Task.completed == True).order_by(Task.created_at.desc()).all()


def create_task(db: Session, task_in: TaskCreate) -> Task:
    max_pos = db.query(func.max(Task.position)).scalar() or 0
    task = Task(
        title=task_in.title,
        due_date=task_in.due_date,
        priority=task_in.priority,
        notes=task_in.notes,
        position=max_pos + 1,
    )
    db.add(task)
    db.commit()
    db.refresh(task)
    return task


def update_task(db: Session, task_id: int, task_in: TaskUpdate) -> Task | None:
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        return None
    data = task_in.model_dump(exclude_unset=True)
    for field, value in data.items():
        setattr(task, field, value)
    db.commit()
    db.refresh(task)
    return task


def complete_task(db: Session, task_id: int) -> Task | None:
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        return None
    task.completed = True
    db.commit()
    db.refresh(task)
    return task


def defer_task(db: Session, task_id: int) -> Task | None:
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        return None
    max_pos = db.query(func.max(Task.position)).filter(Task.completed == False).scalar() or 0
    task.position = max_pos + 1
    db.commit()
    db.refresh(task)
    return task


def reorder_tasks(db: Session, items: List[ReorderItem]) -> List[Task]:
    for item in items:
        task = db.query(Task).filter(Task.id == item.id).first()
        if task:
            task.position = item.position
    db.commit()
    return get_incomplete_tasks(db)


def delete_task(db: Session, task_id: int) -> bool:
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        return False
    db.delete(task)
    db.commit()
    return True
