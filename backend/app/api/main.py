from fastapi import FastAPI

from app.routers import auth, contacts, phones, security_qas, users

app = FastAPI()


@app.get("/greet")
async def greet():
    return {"message": "Hello World!"}


app.include_router(auth.router)
app.include_router(contacts.router)
app.include_router(phones.router)
app.include_router(security_qas.router)
app.include_router(users.router)