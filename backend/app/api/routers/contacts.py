from fastapi import APIRouter, Depends
from sqlmodel import Session
from typing import Annotated
from app.db import get_session


router = APIRouter(
    prefix="/contacts",
    tags=["contacts"],
    responses={404: {"description": "Not found"}},
)

SessionDep = Annotated[Session, Depends(get_session)]