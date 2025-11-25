from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI()

class NotifyPayload(BaseModel):
    task_id: int
    data: dict

@app.post('/notify')
def notify(p: NotifyPayload):
    return {"received": True, "task_id": p.task_id}

@app.get('/')
def root():
    return {"service": "notify", "status": "ok"}

@app.get('/health')
def health():
    return {"status": "ok"}
