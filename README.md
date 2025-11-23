# Nested Tags Tree Application

A full-stack web application for managing nested tags trees with React frontend and FastAPI backend.

## Features

- **Nested Tags Tree UI**: Visual representation of hierarchical tag structures
- **Editable Data Fields**: Modify data for each tag node
- **Editable Tag Names**: Click on tag names to edit them (Bonus feature)
- **Export Functionality**: Export tree structure as JSON string
- **Backend API**: RESTful API for CRUD operations on trees
- **Database Storage**: SQLite database to persist tree hierarchies
- **Multiple Trees**: Support for multiple tree instances

## Project Structure

```
.
├── backend/
│   ├── main.py              # FastAPI backend application
│   └── requirements.txt     # Python dependencies
├── frontend/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── components/
│   │   │   ├── TagView.js   # Main TagView component
│   │   │   └── TagView.css
│   │   ├── App.js
│   │   ├── App.css
│   │   ├── index.js
│   │   └── index.css
│   └── package.json         # Node.js dependencies
└── README.md
```

## Setup Instructions

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Create a virtual environment (recommended):
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Run the backend server:
   ```bash
   python main.py
   ```
   
   Or using uvicorn directly:
   ```bash
   uvicorn main:app --reload --host 0.0.0.0 --port 8000
   ```

   The API will be available at `http://localhost:8000`

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm start
   ```

   The frontend will be available at `http://localhost:3000`

## API Endpoints

- `GET /api/trees` - Get all saved tree hierarchies
- `GET /api/trees/{tree_id}` - Get a specific tree by ID
- `POST /api/trees` - Create a new tree hierarchy
- `PUT /api/trees/{tree_id}` - Update an existing tree hierarchy
- `DELETE /api/trees/{tree_id}` - Delete a tree

## Usage

1. Start both backend and frontend servers
2. Open the frontend in your browser
3. The app will automatically fetch all saved trees from the backend
4. You can:
   - View existing trees
   - Edit tag names by clicking on them
   - Edit data fields for each tag
   - Export trees (saves to backend and copies JSON to clipboard)
   - Create new trees
   - Delete existing trees

## Tree Data Structure

The tree follows this structure:
```json
{
  "name": "root",
  "children": [
    {
      "name": "child1",
      "children": [
        {
          "name": "child1-child1",
          "data": "c1-c1 Hello"
        }
      ]
    }
  ]
}
```

## Technologies Used

- **Frontend**: React 18
- **Backend**: FastAPI (Python)
- **Database**: SQLite
- **HTTP Client**: Axios

## Notes

- The database file (`tags_tree.db`) will be created automatically in the backend directory
- The export functionality saves the tree to the backend and also copies the JSON to clipboard
- Tag names can be edited by clicking on them (bonus feature)
- All data modifications are reflected in the exported JSON string

