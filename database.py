from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy.ext.declarative import declarative_base
import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Fetch the DATABASE_URL from environment variables
DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    raise ValueError("DATABASE_URL environment variable is missing!")

# Create the SQLAlchemy async engine using asyncpg driver
engine = create_async_engine(DATABASE_URL, echo=True)

# Create a base class for models
Base = declarative_base()

# Create a factory for Async Sessions
async_session_maker = sessionmaker(
    bind=engine,
    class_=AsyncSession,
    autocommit=False,
    autoflush=False,
)

# Dependency for FastAPI routes
async def get_db():
    async with async_session_maker() as session:
        try:
            yield session
        finally:
            await session.close()
