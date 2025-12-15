from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from schemas.overtime import OvertimeCreate, OvertimeOutput
from models import Overtime
from database import get_db
from typing import List
from datetime import timedelta

# Initialize the APIRouter
router = APIRouter()

# Endpoint to get all overtime records
@router.get("/overtime", response_model=List[OvertimeOutput])
async def get_overtime_records(db: Session = Depends(get_db)):
    """Fetch all overtime records from the database."""
    try:
        overtime_records = db.query(Overtime).all()
        return overtime_records
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Endpoint to add a new overtime record
@router.post("/overtime", response_model=OvertimeOutput)
async def add_overtime(overtime: OvertimeCreate, db: Session = Depends(get_db)):
    """Add a new overtime record to the database."""
    # Check for consecutive OT in the past 6 days
    existing_records = db.query(Overtime).filter(
        Overtime.employee_id == overtime.employee_id,
        Overtime.day >= overtime.day - timedelta(days=6)
    ).count()

    if existing_records >= 6:
        raise HTTPException(status_code=400, detail="Cannot log OT for more than 6 consecutive days.")

    # Save new overtime record into database
    new_overtime = Overtime(
        employee_id=overtime.employee_id,
        day=overtime.day,
        ot_hours=overtime.ot_hours
    )
    db.add(new_overtime)
    db.commit()
    db.refresh(new_overtime)
    return new_overtime
