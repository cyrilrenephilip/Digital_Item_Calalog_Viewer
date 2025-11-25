from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr
from typing import Optional

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:5174", "http://127.0.0.1:5173", "http://127.0.0.1:5174"],
    allow_credentials=True,
    allow_methods=["*"]
    ,
    allow_headers=["*"]
)

class Item(BaseModel):
    id: int
    title: str
    short_description: str
    full_description: str
    price: float
    image_url: str
    category: str
    video_url: Optional[str] = None

class Submission(BaseModel):
    name: str
    email: EmailStr
    message: str

items = [
    Item(id=1, title="Alpha", short_description="First item", full_description="Alpha item detailed description", price=9.99, image_url="https://placehold.co/400x300?text=Alpha", category="Snacks", video_url="https://www.w3schools.com/html/mov_bbb.mp4"),
    Item(id=2, title="Beta", short_description="Second item", full_description="Beta item detailed description", price=14.5, image_url="https://placehold.co/400x300?text=Beta", category="Beverages"),
    Item(id=3, title="Gamma", short_description="Third item", full_description="Gamma item detailed description", price=5.25, image_url="https://placehold.co/400x300?text=Gamma", category="Snacks")
]

submissions: dict[int, list[Submission]] = {}

class ItemsResponse(BaseModel):
    items: list[Item]
    total: int
    page: int
    per_page: int

@app.get("/items")
def get_items(
    page: int = Query(default=1, ge=1),
    per_page: int = Query(default=10, ge=1, le=50),
    q: Optional[str] = None,
    category: Optional[str] = None,
) -> ItemsResponse:
    filtered = items
    if category:
        filtered = [i for i in filtered if i.category == category]
    if q:
        qq = q.lower()
        filtered = [i for i in filtered if qq in i.title.lower() or qq in i.short_description.lower() or qq in i.category.lower()]
    total = len(filtered)
    start = (page - 1) * per_page
    end = start + per_page
    paged = filtered[start:end]
    return ItemsResponse(items=paged, total=total, page=page, per_page=per_page)

@app.get("/items/{id}")
def get_item(id: int) -> Item:
    for it in items:
        if it.id == id:
            return it
    raise HTTPException(status_code=404, detail="Item not found")

@app.post("/items/{id}/submit")
def submit_item(id: int, data: Submission):
    exists = any(it.id == id for it in items)
    if not exists:
        raise HTTPException(status_code=404, detail="Item not found")
    bucket = submissions.setdefault(id, [])
    bucket.append(data)
    return {"status": "ok", "count": len(bucket)}

@app.get("/categories")
def get_categories() -> list[str]:
    return sorted(list({i.category for i in items}))

class CheckoutItem(BaseModel):
    id: int
    quantity: int = 1
    option: Optional[str] = None

class CheckoutCustomer(BaseModel):
    name: str
    email: EmailStr
    message: Optional[str] = None

class CheckoutRequest(BaseModel):
    items: list[CheckoutItem]
    customer: CheckoutCustomer

class CheckoutResponse(BaseModel):
    status: str
    total: float
    count: int

@app.post("/checkout")
def checkout(payload: CheckoutRequest) -> CheckoutResponse:
    total = 0.0
    count = 0
    for ci in payload.items:
        it = next((x for x in items if x.id == ci.id), None)
        if not it:
            raise HTTPException(status_code=404, detail=f"Item {ci.id} not found")
        total += it.price * max(1, ci.quantity)
        count += max(1, ci.quantity)
    return CheckoutResponse(status="ok", total=round(total, 2), count=count)

@app.get("/")
def root():
    return {"service": "items", "status": "ok"}

@app.get("/health")
def health():
    return {"status": "ok"}
