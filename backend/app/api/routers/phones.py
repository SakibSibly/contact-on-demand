from fastapi import APIRouter, Depends
from sqlmodel import Session, select
from typing import Annotated
from app.db import get_session
from app.models import Phone, PhoneBase, PhoneWithContact, PhoneCreate

import uuid


router = APIRouter(
    prefix="/phones",
    tags=["phones"],
    responses={404: {"description": "Not found"}},
)


@router.get("/")
async def read_phones(session: Annotated[Session, Depends(get_session)]):
    """Endpoint to read phones (example)."""
    result = await session.exec(select(Phone))
    phones = result.all()

    return phones


@router.get("/{phone_id}", response_model=PhoneWithContact)
async def read_phone(phone_id: uuid.UUID, session: Annotated[Session, Depends(get_session)]):
    """Get phone by ID, including associated user information."""
    phone = await session.get(Phone, phone_id)
    if not phone:
        return {"detail": "Phone not found"}

    return phone


@router.post("/", response_model=Phone)
async def create_phone(phone: PhoneCreate, session: Annotated[Session, Depends(get_session)]):
    """Create a new phone entry."""
    db_phone = Phone.model_validate(phone)
    session.add(db_phone)
    await session.commit()
    await session.refresh(db_phone)

    return db_phone


@router.put("/{phone_id}", response_model=Phone)
async def update_phone(phone_id: uuid.UUID, phone: PhoneCreate, session: Annotated[Session, Depends(get_session)]):
    """Update a phone by ID."""
    db_phone = await session.get(Phone, phone_id)
    if not db_phone:
        return {"detail": "Phone not found"}

    db_phone.number = phone.number
    db_phone.number_type = phone.number_type
    await session.commit()
    await session.refresh(db_phone)

    return db_phone


@router.delete("/{phone_id}")
async def delete_phone(phone_id: uuid.UUID, session: Annotated[Session, Depends(get_session)]):
    """Delete a phone by ID."""
    phone = await session.get(Phone, phone_id)
    if not phone:
        return {"detail": "Phone not found"}

    await session.delete(phone)
    await session.commit()

    return {"detail": "Phone deleted successfully"}