import asyncio
import sys
from http import HTTPStatus

from fastapi import FastAPI

from app.routers import auth, watchlist, users
from app.schemas.common import Message
from fastapi.staticfiles import StaticFiles

from fastapi.middleware.cors import CORSMiddleware

if sys.platform == 'win32':
    asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())

origins = [
    "http://localhost:5173",    
    "http://127.0.0.1:5173",    
]

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,      
    allow_credentials=True,
    allow_methods=["*"],        
    allow_headers=["*"],        
)

app.mount("/media", StaticFiles(directory="media"), name="media")

app.include_router(users.router)
app.include_router(watchlist.router)
app.include_router(auth.router)


@app.get("/", status_code=HTTPStatus.OK, response_model=Message)
def read_root():
    return {"message": "Olá Mundo!"}
