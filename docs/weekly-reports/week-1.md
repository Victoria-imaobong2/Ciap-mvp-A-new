# Week 1 Report — System Architecture & Database Schema

**Week:** 1 of 6  
**Status:** ✅ Complete

## Objectives

- Define the overall system architecture and team domain boundaries
- Design the full PostgreSQL database schema (14 tables)
- Establish the `DATA/` package as the single source of truth for all data shapes
- Set up Alembic for schema migrations
- Create Mermaid diagrams: ERD, system architecture, use cases, user flows

## Completed

- System architecture diagram produced (`docs/diagrams/system_arch.mmd`)
- Full 14-table ERD designed and documented (`docs/diagrams/schema_erd.mmd`)
- Use case diagram covering Creator, SME, and System actor responsibilities
- Creator and SME user flow journey diagrams
- `DATA/models/` SQLAlchemy ORM models created for all 14 tables
- `DATA/schemas/entities/` Pydantic v2 models mirroring all ORM models
- `DATA/data_connections/repositories/` abstract repository interfaces defined
- `DATA/core/database.py` engine and session factory
- Alembic migration environment configured (`DATA/migrations/`, `alembic.ini`)
- `requirements.txt` finalized with all shared dependencies
- Team data contract document published (`docs/DATA_ENGINEER_STRUCTURE.md`)

## Key Decisions

- Chose synchronous SQLAlchemy + psycopg2 over async (Alembic autogenerate does not support asyncpg)
- OAuth tokens encrypted at rest using Fernet — decrypted only in memory
- Influence scores stored as append-only records — never overwritten, enabling trend history
- Repository interface (ABC) pattern adopted to decouple backend services from SQLAlchemy

## Blockers / Notes

- None. Frontend and backend can begin parallel development immediately using the schema contracts.
