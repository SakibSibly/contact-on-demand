from sqlmodel import SQLModel, Field, Relationship
from pydantic import EmailStr
import uuid


class UserBase(SQLModel):
    username: str = Field(default=None, index=True, max_length=50)
    email: EmailStr = Field(default=None, index=True, max_length=100)


class User(UserBase, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True, index=True)
    hashed_password: str = Field(default=None, max_length=256)
    security_qas: list["SecurityQA"] = Relationship(back_populates="user", sa_relationship_kwargs={"lazy": "selectin"}, cascade_delete=True)
    contacts: list["Contact"] = Relationship(back_populates="user", sa_relationship_kwargs={"lazy": "selectin"}, cascade_delete=True)


class UserPublic(UserBase):
    id: uuid.UUID


class UserBaseWithContactAndQuestion(UserBase):
    id: uuid.UUID
    contacts: list["Contact"] = []
    # security_qas deprecated - keeping for backward compatibility but not returned by default


class UserBaseWithContact(UserBase):
    """User model with contacts only - recommended for API responses"""
    id: uuid.UUID
    contacts: list["Contact"] = []


class UserLogin(SQLModel):
    username: str = Field(default=None, max_length=50)
    password: str = Field(default=None, max_length=256)


class UserCreate(UserBase):
    password: str = Field(default=None, max_length=256)


class SecurityQABase(SQLModel):
    question: str = Field(default=None, index=True, max_length=255)
    answer: str = Field(default=None, max_length=255)
    user_id: uuid.UUID | None = Field(default=None, foreign_key="user.id", ondelete="CASCADE")


class SecurityQA(SecurityQABase, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True, index=True)
    user: User | None = Relationship(back_populates="security_qas", sa_relationship_kwargs={"lazy": "joined"})


class SecurityQAWithUser(SecurityQABase):
    id: uuid.UUID
    user: UserPublic | None = None


class SecrurityQACreate(SecurityQABase):
    pass


class ContactBase(SQLModel):
    name: str = Field(default=None, max_length=100)
    email: EmailStr | None = Field(default=None, max_length=100)
    user_id: uuid.UUID | None = Field(default=None, foreign_key="user.id", ondelete="CASCADE")


class Contact(ContactBase, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True, index=True)
    user: User | None = Relationship(back_populates="contacts", sa_relationship_kwargs={"lazy": "joined"})
    phones: list["Phone"] = Relationship(back_populates="contact", sa_relationship_kwargs={"lazy": "selectin"}, cascade_delete=True)


class ContactWithPhones(ContactBase):
    id: uuid.UUID
    phones: list["Phone"] = []


class ContactCreate(ContactBase):
    pass


class PhoneBase(SQLModel):
    number: str = Field(default=None, max_length=20)
    number_type: str | None = Field(default=None, max_length=50)
    contact_id: uuid.UUID | None = Field(default=None, foreign_key="contact.id", ondelete="CASCADE")


class Phone(PhoneBase, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True, index=True)
    contact: Contact | None = Relationship(back_populates="phones", sa_relationship_kwargs={"lazy": "joined"})


class PhoneWithContact(PhoneBase):
    id: uuid.UUID
    contact: ContactBase | None = None


class PhoneCreate(PhoneBase):
    pass


class TokenResponse(SQLModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class TokenRefresh(SQLModel):
    refresh_token: str


class TokenBlacklist(SQLModel, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True, index=True)
    token: str = Field(index=True, unique=True)