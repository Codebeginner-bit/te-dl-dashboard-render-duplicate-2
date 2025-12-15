from pydantic import BaseModel
from typing import Optional
from datetime import date

# Schema for creating an overtime entry
class OvertimeCreate(BaseModel):
    employee_id: int
    day: date
    ot_hours: float

# Schema for outputting overtime details
class OvertimeOutput(BaseModel):
    id: int
    employee_id: int
    day: date
    ot_hours: float

    class Config:
        from_attributes = True  # Use 'orm_mode' in Pydantic v1.x
