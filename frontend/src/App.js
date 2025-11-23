import React, { useState, useEffect } from "react";
import axios from "axios";
import TagView from "./components/TagView";
import "./App.css";

const API_BASE_URL = "http://localhost:8000/api";

function App() {
  const [trees, setTrees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchTrees();
  }, []);

  const fetchTrees = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/trees`);
      setTrees(response.data);
      setError(null);
    } catch (err) {
      setError("Failed to fetch trees. Make sure the backend server is running.");
      console.error("Error fetching trees:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (treeId, treeData) => {
    try {
      if (treeId) {
        await axios.put(`${API_BASE_URL}/trees/${treeId}`, {
          tree: treeData,
        });
      } else {
        await axios.post(`${API_BASE_URL}/trees`, {
          tree: treeData,
        });
      }
      await fetchTrees();
    } catch (err) {
      console.error("Error saving tree:", err);
    }
  };

  const handleDelete = async (treeId) => {
    try {
      await axios.delete(`${API_BASE_URL}/trees/${treeId}`);
      await fetchTrees();
    } catch (err) {
      console.error("Error deleting tree:", err);
    }
  };

  if (loading) {
    return (
      <div className="app-container">
        <div className="loading">Loading trees...</div>
      </div>
    );
  }

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>Nested Tags Tree Application</h1>
        <button onClick={fetchTrees} className="refresh-btn">
          Refresh
        </button>
      </header>

      {error && <div className="error-message">{error}</div>}

      {trees.length === 0 ? (
        <div className="empty-state">
          <p>No trees found. Create a new tree below.</p>
          <TagView tree={null} onExport={(treeData) => handleSave(null, treeData)} />
        </div>
      ) : (
        <div className="trees-container">
          {trees.map((tree) => (
            <div key={tree.id} className="tree-wrapper">
              <div className="tree-header">
                <h2>
                  Tree #{tree.id} - {tree.name}
                </h2>
                <button onClick={() => handleDelete(tree.id)} className="delete-btn">
                  Delete
                </button>
              </div>
              <TagView tree={tree.tree} treeId={tree.id} onExport={(treeData) => handleSave(tree.id, treeData)} />
            </div>
          ))}
          <div className="tree-wrapper">
            <div className="tree-header">
              <h2>New Tree</h2>
            </div>
            <TagView tree={null} onExport={(treeData) => handleSave(null, treeData)} />
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
