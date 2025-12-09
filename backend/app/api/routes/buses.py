from typing import Any
from app.api.deps import SessionDep
from fastapi import APIRouter
from sqlmodel import select
from app.models import Bus

router = APIRouter(prefix="/buses", tags=["buses"])

@router.get("/", response_model=list[str])
def read_buses(session: SessionDep) -> Any:
    """
    Retrieve all bus names.
    """
    statement = select(Bus.name).order_by(Bus.name)
    buses = session.exec(statement).all()
    return buses