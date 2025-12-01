from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from typing import Annotated
from app.db import get_session
from app.models import Phone, PhoneBase, PhoneWithContact, PhoneCreate, User, Contact
from app.api.deps import get_current_user

import uuid


router = APIRouter(
    prefix="/phones",
    tags=["phones"],
    responses={404: {"description": "Not found"}},
)


@router.get("/")
async def read_phones(
    session: Annotated[Session, Depends(get_session)],
    current_user: Annotated[User, Depends(get_current_user)]
):
    """Endpoint to read phones for the authenticated user's contacts."""
    # Get all contacts for the current user
    result = await session.exec(select(Contact).where(Contact.user_id == current_user.id))
    user_contacts = result.all()
    contact_ids = [contact.id for contact in user_contacts]
    
    # Get all phones for those contacts
    if contact_ids:
        result = await session.exec(select(Phone).where(Phone.contact_id.in_(contact_ids)))
        phones = result.all()
    else:
        phones = []

    return phones


@router.get("/{phone_id}", response_model=PhoneWithContact)
async def read_phone(
    phone_id: uuid.UUID,
    session: Annotated[Session, Depends(get_session)],
    current_user: Annotated[User, Depends(get_current_user)]
):
    """Get phone by ID, including associated contact information."""
    phone = await session.get(Phone, phone_id)
    if not phone:
        raise HTTPException(status_code=404, detail="Phone not found")
    
    # Get the contact to verify ownership
    contact = await session.get(Contact, phone.contact_id)
    if not contact or contact.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to access this phone")

    return phone


@router.post("/", response_model=Phone)
async def create_phone(
    phone: PhoneCreate,
    session: Annotated[Session, Depends(get_session)],
    current_user: Annotated[User, Depends(get_current_user)]
):
    """Create a new phone entry."""
    # Verify the contact belongs to the current user
    contact = await session.get(Contact, phone.contact_id)
    if not contact:
        raise HTTPException(status_code=404, detail="Contact not found")
    
    if contact.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to add phones to this contact")
    
    db_phone = Phone.model_validate(phone)
    session.add(db_phone)
    await session.commit()
    await session.refresh(db_phone)

    return db_phone


@router.put("/{phone_id}", response_model=Phone)
async def update_phone(
    phone_id: uuid.UUID,
    phone: PhoneCreate,
    session: Annotated[Session, Depends(get_session)],
    current_user: Annotated[User, Depends(get_current_user)]
):
    """Update a phone by ID."""
    db_phone = await session.get(Phone, phone_id)
    if not db_phone:
        raise HTTPException(status_code=404, detail="Phone not found")
    
    # Verify the phone's contact belongs to the current user
    contact = await session.get(Contact, db_phone.contact_id)
    if not contact or contact.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to update this phone")
    
    db_phone.number = phone.number
    db_phone.number_type = phone.number_type
    await session.commit()
    await session.refresh(db_phone)

    return db_phone


@router.delete("/{phone_id}")
async def delete_phone(
    phone_id: uuid.UUID,
    session: Annotated[Session, Depends(get_session)],
    current_user: Annotated[User, Depends(get_current_user)]
):
    """Delete a phone by ID."""
    phone = await session.get(Phone, phone_id)
    if not phone:
        raise HTTPException(status_code=404, detail="Phone not found")
    
    # Verify the phone's contact belongs to the current user
    contact = await session.get(Contact, phone.contact_id)
    if not contact or contact.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to delete this phone")

    await session.delete(phone)
    await session.commit()

    return {"detail": "Phone deleted successfully"}