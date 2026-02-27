from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List

import crud
import models
import schemas
from database import engine, get_db

models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Personal Task Manager")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:80", "http://localhost"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/tasks", response_model=List[schemas.TaskOut])
def list_tasks(db: Session = Depends(get_db)):
    return crud.get_incomplete_tasks(db)


@app.get("/tasks/completed", response_model=List[schemas.TaskOut])
def list_completed(db: Session = Depends(get_db)):
    return crud.get_completed_tasks(db)


@app.post("/tasks", response_model=schemas.TaskOut, status_code=201)
def create_task(task_in: schemas.TaskCreate, db: Session = Depends(get_db)):
    return crud.create_task(db, task_in)


@app.patch("/tasks/reorder", response_model=List[schemas.TaskOut])
def reorder_tasks(items: List[schemas.ReorderItem], db: Session = Depends(get_db)):
    return crud.reorder_tasks(db, items)


@app.patch("/tasks/{task_id}", response_model=schemas.TaskOut)
def update_task(task_id: int, task_in: schemas.TaskUpdate, db: Session = Depends(get_db)):
    task = crud.update_task(db, task_id, task_in)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    return task


@app.patch("/tasks/{task_id}/complete", response_model=schemas.TaskOut)
def complete_task(task_id: int, db: Session = Depends(get_db)):
    task = crud.complete_task(db, task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    return task


@app.patch("/tasks/{task_id}/defer", response_model=schemas.TaskOut)
def defer_task(task_id: int, db: Session = Depends(get_db)):
    task = crud.defer_task(db, task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    return task


@app.delete("/tasks/{task_id}", status_code=204)
def delete_task(task_id: int, db: Session = Depends(get_db)):
    if not crud.delete_task(db, task_id):
        raise HTTPException(status_code=404, detail="Task not found")
