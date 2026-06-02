# ciap-mvp-a

The CIAP-MVP Git repository for Team A.

This repository contains the backend services for the CIAP MVP.

## Project Structure

- `ciap-backend/`: The main FastAPI backend application.
  - Contains all the runtime code (`app/`), data contracts and schemas (`DATA/`), database migrations (`alembic/`), and seed scripts (`seeds/`).

## Quick Start

To get started with the backend, navigate to the `ciap-backend` directory and use `uv`:

```bash
cd ciap-backend
uv sync
uv run uvicorn app.main:app --reload
```

For more detailed setup, running instructions, and architecture documentation, see the [Backend README](README.md) and [File Structure Documentation](FILE-STRUCTURE.md).
