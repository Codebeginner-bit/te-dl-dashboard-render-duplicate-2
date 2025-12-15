# Use the official lightweight Python Docker image
FROM python:3.10-slim

# Set the working directory
WORKDIR /app

# Copy the requirements.txt file
COPY requirements.txt requirements.txt

# Install dependencies using no-cache-dir to avoid old cached resources
RUN pip install --no-cache-dir -r requirements.txt

# Add the rest of the application code
COPY . .

# Expose the default port
EXPOSE 8000

# Command to run the FastAPI application with Uvicorn server
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
