from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException
from sqlmodel import Session, select
from typing import Annotated
from app.db import get_session
from app.models import Contact, ContactWithPhones, ContactCreate, Phone, PhoneCreate
import vobject

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


@router.post("/upload-vcf")
async def upload_vcf(
    file: UploadFile = File(...),
    user_id: str = Form(...),
    session: Session = Depends(get_session)
):
    """Upload a VCF file and create contacts with phone numbers."""
    if not file.filename.endswith(('.vcf', '.vcard')):
        raise HTTPException(status_code=400, detail="Only .vcf or .vcard files are supported")
    
    try:
        # Read file content
        content = await file.read()
        try:
            vcf_text = content.decode('utf-8')
        except UnicodeDecodeError:
            # Try with different encoding if UTF-8 fails
            vcf_text = content.decode('latin-1')
        
        # Parse VCF file with error handling
        contacts_created = 0
        contacts_skipped = 0
        errors = []
        
        # Split the VCF file into individual vCard entries
        vcard_blocks = []
        current_block = []
        for line in vcf_text.split('\n'):
            if line.strip().startswith('BEGIN:VCARD'):
                current_block = [line]
            elif line.strip().startswith('END:VCARD'):
                current_block.append(line)
                vcard_blocks.append('\n'.join(current_block))
                current_block = []
            elif current_block:
                current_block.append(line)
        
        # Process each vCard block individually
        for vcard_text in vcard_blocks:
            try:
                # Try to parse this vCard
                vcard = vobject.readOne(vcard_text)
                
                # Extract name
                name = ""
                if hasattr(vcard, 'fn'):
                    name = vcard.fn.value
                elif hasattr(vcard, 'n'):
                    name_parts = vcard.n.value
                    name = f"{name_parts.given} {name_parts.family}".strip()
                
                if not name:
                    contacts_skipped += 1
                    continue  # Skip entries without a name
                
                # Extract email
                email = None
                if hasattr(vcard, 'email'):
                    email = vcard.email.value if hasattr(vcard.email, 'value') else str(vcard.email)
                
                # Check if contact already exists (same name and email for this user)
                existing_query = select(Contact).where(
                    Contact.user_id == uuid.UUID(user_id),
                    Contact.name == name
                )
                if email:
                    existing_query = existing_query.where(Contact.email == email)
                
                result = await session.exec(existing_query)
                existing_contact = result.first()
                
                if existing_contact:
                    # Contact already exists, skip it
                    contacts_skipped += 1
                    continue
                
                # Create contact
                contact_data = ContactCreate(
                    name=name,
                    email=email,
                    user_id=uuid.UUID(user_id)
                )
                db_contact = Contact.model_validate(contact_data)
                session.add(db_contact)
                await session.flush()  # Get the contact ID before committing
                
                # Extract and add phone numbers
                if hasattr(vcard, 'tel_list'):
                    for tel in vcard.tel_list:
                        try:
                            phone_number = tel.value
                            # Try to get the phone type
                            phone_type = None
                            if hasattr(tel, 'type_param'):
                                phone_type = tel.type_param.lower() if tel.type_param else None
                            
                            phone_data = PhoneCreate(
                                number=phone_number,
                                number_type=phone_type,
                                contact_id=db_contact.id
                            )
                            db_phone = Phone.model_validate(phone_data)
                            session.add(db_phone)
                        except Exception as phone_error:
                            # Skip invalid phone numbers but continue with the contact
                            errors.append(f"Skipped invalid phone for {name}: {str(phone_error)}")
                            continue
                
                contacts_created += 1
            
            except Exception as contact_error:
                # Skip this contact but continue with others
                contacts_skipped += 1
                errors.append(f"Skipped contact: {str(contact_error)[:100]}")
                continue
        
        await session.commit()
        
        result = {
            "message": "VCF file processed successfully",
            "count": contacts_created,
            "skipped": contacts_skipped
        }
        
        if errors:
            result["warnings"] = errors[:10]  # Return first 10 errors to avoid huge response
        
        return result
    
    except Exception as e:
        await session.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to process VCF file: {str(e)}")
