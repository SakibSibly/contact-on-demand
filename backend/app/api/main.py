from fastapi import FastAPI

from app.api.routers import contacts, login, phones, security_qas, users, utils
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="Contact On Demand API",
    description="API for Contact On Demand application",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/greet")
async def greet():
    return {"message": "Hello World!"}


app.include_router(login.router)
app.include_router(contacts.router)
app.include_router(phones.router)
app.include_router(security_qas.router, deprecated=True)
app.include_router(users.router)
app.include_router(utils.router)