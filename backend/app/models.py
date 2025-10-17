from sqlmodel import SQLModel, Field, Relationship
from pydantic import EmailStr
import uuid


class UserBase(SQLModel):
    name: str = Field(default=None, index=True, max_length=50)
    email: EmailStr = Field(default=None, index=True, max_length=100)
    password: str = Field(default=None, max_length=256)


class User(UserBase, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True, index=True)
    hashed_password: str = Field(default=None, max_length=256)
    security_qas: list["SecurityQA"] = Relationship(back_populates="user", cascade_delete=True)
    contacts: list["Contact"] = Relationship(back_populates="user", cascade_delete=True)
    

class UserCreate(UserBase):
    pass


class SecurityQABase(SQLModel):
    question: str = Field(default=None, index=True, max_length=255)
    answer: str = Field(default=None, max_length=255)
    user_id: uuid.UUID | None = Field(default=None, foreign_key="user.id", ondelete="CASCADE")


class SecurityQA(SecurityQABase, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True, index=True)
    user: User | None = Relationship(back_populates="security_qas")


class SecrurityQACreate(SecurityQABase):
    pass


class ContactBase(SQLModel):
    name: str = Field(default=None, index=True, max_length=100)
    email: EmailStr | None = Field(default=None, index=True, max_length=100)
    address: str | None = Field(default=None, max_length=255)
    notes: str | None = Field(default=None, max_length=500)
    user_id: uuid.UUID | None = Field(foreign_key="user.id", ondelete="CASCADE")


class Contact(ContactBase, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True, index=True)
    phones: list["Phone"] = Relationship(back_populates="phone_contacts", cascade_delete=True)
    user: User | None = Relationship(back_populates="contacts")


class ContactCreate(ContactBase):
    pass


class PhoneBase(SQLModel):
    number: str = Field(default=None, max_length=20)
    number_type: str | None = Field(default=None, max_length=50)
    contacts_id: uuid.UUID | None = Field(foreign_key="contact.id", ondelete="CASCADE")


class Phone(PhoneBase, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True, index=True)
    phone_contacts: Contact | None = Relationship(back_populates="phones")


class PhoneCreate(PhoneBase):
    pass