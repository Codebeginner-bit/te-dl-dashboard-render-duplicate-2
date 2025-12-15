from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Numeric
from sqlalchemy.orm import relationship
from sqlalchemy.ext.declarative import declarative_base
import datetime

Base = declarative_base()


class Employee(Base):
    __tablename__ = "employees"

    id = Column(Integer, primary_key=True, autoincrement=True)
    site = Column(String, nullable=False)
    department = Column(String, nullable=False)
    id_number = Column(String, unique=True, nullable=False)
    chinese_name = Column(String, nullable=True)
    dormitory = Column(String, nullable=True)
    english_name = Column(String, nullable=False)
    shift = Column(String, nullable=False)
    plan_actual = Column(String, nullable=True)
    ot_total = Column(Float, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    overtimes = relationship("Overtime", back_populates="employee")


class Overtime(Base):
    __tablename__ = "overtimes"

    id = Column(Integer, primary_key=True, autoincrement=True)
    employee_id = Column(Integer, ForeignKey("employees.id", ondelete="CASCADE"), nullable=False)
    day = Column(DateTime, nullable=False)
    ot_hours = Column(Numeric(10, 2), nullable=False)

    employee = relationship("Employee", back_populates="overtimes")
