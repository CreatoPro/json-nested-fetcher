from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import sqlite3
import json
from datetime import datetime

app = FastAPI(title="Nested Tags Tree API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173","https://json-nested-fetcher.vercel.app"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

DATABASE = "tags_tree.db"

def init_db():
    conn = sqlite3.connect(DATABASE)
    cursor = conn.cursor()
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS trees (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            tree_data TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)
    conn.commit()
    conn.close()

init_db()

class TagNode(BaseModel):
    name: str
    children: Optional[List['TagNode']] = []
    data: Optional[str] = None

    class Config:
        json_schema_extra = {
            "example": {
                "name": "child1",
                "children": [
                    {"name": "child1-child1", "data": "c1-c1 Hello"}
                ]
            }
        }

TagNode.model_rebuild()

class TreeData(BaseModel):
    name: str
    children: Optional[List[TagNode]] = []

class TreeCreate(BaseModel):
    tree: TreeData

class TreeUpdate(BaseModel):
    tree: TreeData

class TreeResponse(BaseModel):
    id: int
    name: str
    tree: Dict[str, Any]
    created_at: str
    updated_at: str


@app.get("/")
def read_root():
    return {"message": "Nested Tags Tree API"}

@app.get("/api/trees", response_model=List[TreeResponse])
def get_all_trees():
    """Get all saved tree hierarchies"""
    conn = sqlite3.connect(DATABASE)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    
    cursor.execute("SELECT * FROM trees ORDER BY created_at DESC")
    rows = cursor.fetchall()
    conn.close()
    
    trees = []
    for row in rows:
        trees.append({
            "id": row["id"],
            "name": row["name"],
            "tree": json.loads(row["tree_data"]),
            "created_at": row["created_at"],
            "updated_at": row["updated_at"]
        })
    
    return trees

@app.get("/api/trees/{tree_id}", response_model=TreeResponse)
def get_tree(tree_id: int):
    """Get a specific tree by ID"""
    conn = sqlite3.connect(DATABASE)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    
    cursor.execute("SELECT * FROM trees WHERE id = ?", (tree_id,))
    row = cursor.fetchone()
    conn.close()
    
    if not row:
        raise HTTPException(status_code=404, detail="Tree not found")
    
    return {
        "id": row["id"],
        "name": row["name"],
        "tree": json.loads(row["tree_data"]),
        "created_at": row["created_at"],
        "updated_at": row["updated_at"]
    }

@app.post("/api/trees", response_model=TreeResponse)
def create_tree(tree_create: TreeCreate):
    """Create a new tree hierarchy"""
    conn = sqlite3.connect(DATABASE)
    cursor = conn.cursor()
    
    tree_json = json.dumps(tree_create.tree.dict(), default=str)
    tree_name = tree_create.tree.name or "Untitled Tree"
    
    cursor.execute(
        "INSERT INTO trees (name, tree_data) VALUES (?, ?)",
        (tree_name, tree_json)
    )
    tree_id = cursor.lastrowid
    conn.commit()
    
    cursor.execute("SELECT * FROM trees WHERE id = ?", (tree_id,))
    row = cursor.fetchone()
    conn.close()
    
    return {
        "id": row[0],
        "name": row[1],
        "tree": json.loads(row[2]),
        "created_at": row[3],
        "updated_at": row[4]
    }

@app.put("/api/trees/{tree_id}", response_model=TreeResponse)
def update_tree(tree_id: int, tree_update: TreeUpdate):
    """Update an existing tree hierarchy"""
    conn = sqlite3.connect(DATABASE)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    

    cursor.execute("SELECT * FROM trees WHERE id = ?", (tree_id,))
    row = cursor.fetchone()
    
    if not row:
        raise HTTPException(status_code=404, detail="Tree not found")
    
    tree_json = json.dumps(tree_update.tree.dict(), default=str)
    tree_name = tree_update.tree.name or "Untitled Tree"
    
    cursor.execute(
        "UPDATE trees SET name = ?, tree_data = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
        (tree_name, tree_json, tree_id)
    )
    conn.commit()
    
    cursor.execute("SELECT * FROM trees WHERE id = ?", (tree_id,))
    updated_row = cursor.fetchone()
    conn.close()
    
    return {
        "id": updated_row["id"],
        "name": updated_row["name"],
        "tree": json.loads(updated_row["tree_data"]),
        "created_at": updated_row["created_at"],
        "updated_at": updated_row["updated_at"]
    }

@app.delete("/api/trees/{tree_id}")
def delete_tree(tree_id: int):
    """Delete a tree"""
    conn = sqlite3.connect(DATABASE)
    cursor = conn.cursor()
    
    cursor.execute("DELETE FROM trees WHERE id = ?", (tree_id,))
    
    if cursor.rowcount == 0:
        conn.close()
        raise HTTPException(status_code=404, detail="Tree not found")
    
    conn.commit()
    conn.close()
    
    return {"message": "Tree deleted successfully"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

