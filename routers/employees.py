from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List
from pydantic import BaseModel
from typing import Optional
from models import Employee
from database import get_db

router = APIRouter() 

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
    site: str
    department: str
    id_number: str
    chinese_name: str | None = None
    dormitory: str | None = None
    english_name: str
    shift: str
    plan_actual: str | None = None
    ot_total: float | None = 0


class Config:
        orm_mode = True

class MessageResponse(BaseModel):
    message: str


# Route: Add Employee to Database
@router.post("/", response_model=MessageResponse)
async def add_employee(employee_data: EmployeeCreate, db: AsyncSession = Depends(get_db)):
    try:
        # Check for duplicate ID number
        query = select(Employee).where(Employee.id_number == employee_data.id_number)
        result = await db.execute(query)
        existing_user = result.scalar_one_or_none()

        if existing_user:
            raise HTTPException(status_code=400, detail="Employee with this ID number already exists.")

        # Add new employee record
        new_employee = Employee(**employee_data.dict())
        db.add(new_employee)
        await db.commit()
        return {"message": "Employee added successfully!"}

    except Exception as e:
        await db.rollback()  # Rollback in case of an error
        raise HTTPException(status_code=500, detail=f"Error adding employee: {str(e)}")


# Route: Get All Employees
@router.get("/", response_model=List[EmployeeCreate])  # Use EmployeeCreate for output
async def get_employees(db: AsyncSession = Depends(get_db)):
    try:
        query = select(Employee)
        result = await db.execute(query)
        employees = result.scalars().all()  # Fetch all rows as ORM objects
        return employees
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving employees: {str(e)}")


# Route: Update an employee
@router.put("/{id_number}", response_model=EmployeeUpdate)
async def update_employee(id_number: str, employee_data: EmployeeUpdate, db: AsyncSession = Depends(get_db)):
    query = select(Employee).where(Employee.id_number == id_number)
    result = await db.execute(query)
    db_employee = result.scalar_one_or_none()

    if not db_employee:
        raise HTTPException(status_code=404, detail="Employee not found")

    update_data = employee_data.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_employee, key, value)

    await db.commit()
    await db.refresh(db_employee)
    return db_employee

# Route: Delete an employee
@router.delete("/{id_number}")
async def delete_employee(id_number: str, db: AsyncSession = Depends(get_db)):
    """
    Delete an employee by their id_number.
    """
    print(f"DELETE request for id_number: {id_number}")


    if not id_number:
        raise HTTPException(status_code=400, detail="ID Number cannot be empty")


    query = select(Employee).where(Employee.id_number == id_number)
    result = await db.execute(query)
    employee = result.scalar_one_or_none()


    if not employee:
        raise HTTPException(status_code=404, detail="Employee not found")

    # Delete the employee
    try:
        await db.delete(employee)
        await db.commit()
        print(f"Employee with ID {id_number} deleted successfully.")
        return {"message": f"Employee with ID {id_number} deleted successfully."}
    except Exception as e:
        await db.rollback()
        print(f"Error deleting employee with ID {id_number}: {e}")
        raise HTTPException(status_code=500, detail="Failed to delete employee")
