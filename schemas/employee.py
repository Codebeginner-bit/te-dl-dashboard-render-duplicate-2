from pydantic import BaseModel
from typing import Optional

class EmployeeCreate(BaseModel):
    site: str
    department: str
    id_number: str
    chinese_name: Optional[str] = None
    dormitory: Optional[str] = None
    english_name: str
    shift: str
    plan_actual: Optional[str] = None
    ot_total: Optional[float] = None
     
    class Config:
        orm_mode = True 

class EmployeeUpdate(BaseModel):
    site: Optional[str] = None
    department: Optional[str] = None
    id_number: Optional[str] = None
    chinese_name: Optional[str] = None
    dormitory: Optional[str] = None
    english_name: Optional[str] = None
    shift: Optional[str] = None
    plan_actual: Optional[str] = None
    ot_total: Optional[float] = None

     class Config:
        orm_mode = True  
