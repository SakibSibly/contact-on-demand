from fastapi import FastAPI

from app.api.routers import contacts, login, phones, security_qas, users, utils

app = FastAPI(
    title="Contact On Demand API",
    description="API for Contact On Demand application",
    version="1.0.0",
)


@app.get("/greet")
async def greet():
    return {"message": "Hello World!"}


app.include_router(login.router)
app.include_router(contacts.router)
app.include_router(phones.router)
app.include_router(security_qas.router)
app.include_router(users.router)
app.include_router(utils.router)