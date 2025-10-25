from fastapi import APIRouter, Depends
from sqlmodel import Session
from typing import Annotated
from app.db import get_session


router = APIRouter(
    prefix="/users",
    tags=["users"],
    responses={404: {"description": "Not found"}},
)

SessionDep = Annotated[Session, Depends(get_session)]