# Use an official Python runtime as the base image
FROM ghcr.io/astral-sh/uv:debian-slim

# Set working directory in the container
WORKDIR /app

COPY pyproject.toml uv.lock ./
RUN uv sync

# Copy the rest of the application code
COPY . .

# Expose the port your application runs on
EXPOSE 8000

# Command to run the application
CMD ["python", "app.py"]
