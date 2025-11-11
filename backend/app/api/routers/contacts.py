from fastapi import APIRouter, Depends
from sqlmodel import Session, select
from typing import Annotated
from app.db import get_session
from app.models import Contact, ContactWithPhones, ContactCreate

import uuid


router = APIRouter(
    prefix="/contacts",
    tags=["contacts of users"],
    responses={404: {"description": "Not found"}},
)


@router.get("/", response_model=list[ContactWithPhones])
async def read_contacts(session: Annotated[Session, Depends(get_session)]):
    """Endpoint to read contacts (example)."""
    result = await session.exec(select(Contact))
    contacts = result.all()

    return contacts

@router.get("/{contact_id}", response_model=ContactWithPhones)
async def read_contact(contact_id: uuid.UUID, session: Annotated[Session, Depends(get_session)]):
    """Get contact by ID, including associated phones."""
    contact = await session.get(Contact, contact_id)
    if not contact:
        return {"detail": "Contact not found"}

    return contact


@router.post("/", response_model=ContactWithPhones)
async def create_contact(contact: ContactCreate, session: Annotated[Session, Depends(get_session)]):
    """Create a new contact entry."""
    db_contact = Contact.model_validate(contact)
    session.add(db_contact)
    await session.commit()
    await session.refresh(db_contact)

    return db_contact


@router.put("/{contact_id}", response_model=Contact)
async def update_contact(contact_id: uuid.UUID, contact: Contact, session: Annotated[Session, Depends(get_session)]):
    """Update a contact by ID."""
    db_contact = await session.get(Contact, contact_id)
    if not db_contact:
        return {"detail": "Contact not found"}

    db_contact.name = contact.name
    db_contact.email = contact.email

    await session.commit()
    await session.refresh(db_contact)

    return db_contact


@router.delete("/{contact_id}")
async def delete_contact(contact_id: uuid.UUID, session: Annotated[Session, Depends(get_session)]):
    """Delete a contact by ID."""
    db_contact = await session.get(Contact, contact_id)
    if not db_contact:
        return {"detail": "Contact not found"}

    await session.delete(db_contact)
    await session.commit()

    return {"detail": "Contact deleted successfully"}
