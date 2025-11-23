import React, { useState, useEffect } from 'react';
import './TagView.css';

const TagView = ({ tree, treeId, onExport }) => {
  const [tagTree, setTagTree] = useState(tree || getDefaultTree());
  const [exportedJson, setExportedJson] = useState('');

  useEffect(() => {
    if (tree) {
      setTagTree(tree);
    }
  }, [tree]);

  function getDefaultTree() {
    return {
      name: 'root',
      children: [
        {
          name: 'child1',
          children: [
            { name: 'child1-child1', data: 'c1-c1 Hello' },
            { name: 'child1-child2', data: 'c1-c2 JS' }
          ]
        },
        {
          name: 'child2',
          data: 'c2 World'
        }
      ]
    };
  }

  const updateNodeData = (node, path, newData) => {
    if (path.length === 0) {
      // If setting data, remove children (they are mutually exclusive)
      const updated = { ...node, data: newData || null };
      if (newData !== null && newData !== undefined && newData !== '') {
        delete updated.children;
      }
      return updated;
    }

    const [index, ...rest] = path;
    const newChildren = [...node.children];
    newChildren[index] = updateNodeData(newChildren[index], rest, newData);

    return { ...node, children: newChildren };
  };

  const updateNodeName = (node, path, newName) => {
    if (path.length === 0) {
      return { ...node, name: newName };
    }

    const [index, ...rest] = path;
    const newChildren = [...node.children];
    newChildren[index] = updateNodeName(newChildren[index], rest, newName);

    return { ...node, children: newChildren };
  };

  const addChildNode = (node, path) => {
    if (path.length === 0) {
      // If node has data, replace it with children containing one new child
      if (node.data !== undefined && node.data !== null) {
        return {
          ...node,
          data: undefined,
          children: [{ name: 'New Child', data: 'Data' }]
        };
      }
      // If node already has children, add a new child to the array
      const newChild = { name: 'New Child', data: 'Data' };
      return {
        ...node,
        children: [...(node.children || []), newChild]
      };
    }

    const [index, ...rest] = path;
    const newChildren = [...node.children];
    newChildren[index] = addChildNode(newChildren[index], rest);

    return { ...node, children: newChildren };
  };

  const handleDataChange = (path, newData) => {
    const updatedTree = updateNodeData(tagTree, path, newData);
    setTagTree(updatedTree);
  };

  const handleNameChange = (path, newName) => {
    const updatedTree = updateNodeName(tagTree, path, newName);
    setTagTree(updatedTree);
  };

  const handleAddChild = (path) => {
    const updatedTree = addChildNode(tagTree, path);
    setTagTree(updatedTree);
  };

  const exportTree = () => {
    const exportData = extractTreeData(tagTree);
    const jsonString = JSON.stringify(exportData);
    setExportedJson(jsonString);
  };

  const saveTree = () => {
    const exportData = extractTreeData(tagTree);
    if (onExport) {
      onExport(exportData);
    }
  };

  const extractTreeData = (node) => {
    const result = {
      name: node.name
    };

    if (node.children && node.children.length > 0) {
      result.children = node.children.map(child => extractTreeData(child));
    }

    if (node.data !== undefined && node.data !== null && node.data !== '') {
      result.data = node.data;
    }

    return result;
  };

  return (
    <div className="tag-view-container">
      <div className="tag-view-content">
        <TagNode
          node={tagTree}
          path={[]}
          onDataChange={handleDataChange}
          onNameChange={handleNameChange}
          onAddChild={handleAddChild}
        />
      </div>
      <div className="export-section">
        <div className="button-group">
          <button onClick={exportTree} className="export-btn">
            Export
          </button>
          <button onClick={saveTree} className="save-btn">
            Save Tree
          </button>
        </div>
        {exportedJson && (
          <textarea
            className="export-json-textarea"
            value={exportedJson}
            readOnly
            rows={10}
          />
        )}
      </div>
    </div>
  );
};

const TagNode = ({ node, path, onDataChange, onNameChange, onAddChild }) => {
  const [isEditingName, setIsEditingName] = useState(false);
  const [editName, setEditName] = useState(node.name);
  const [isExpanded, setIsExpanded] = useState(true);
  const hasChildren = node.children && node.children.length > 0;
  const hasData = node.data !== undefined && node.data !== null && node.data !== '';

  const handleNameKeyPress = (e) => {
    if (e.key === 'Enter') {
      if (editName.trim()) {
        onNameChange(path, editName.trim());
        setIsEditingName(false);
      }
    } else if (e.key === 'Escape') {
      setEditName(node.name);
      setIsEditingName(false);
    }
  };

  const handleNameBlur = () => {
    if (editName.trim()) {
      onNameChange(path, editName.trim());
    } else {
      setEditName(node.name);
    }
    setIsEditingName(false);
  };

  useEffect(() => {
    setEditName(node.name);
  }, [node.name]);

  return (
    <div className="tag-node">
      <div className="tag-header">
        <div className="tag-header-left">
          <button
            className="expand-btn"
            onClick={() => setIsExpanded(!isExpanded)}
            aria-label={isExpanded ? 'Collapse' : 'Expand'}
          >
            <span className="expand-icon">{isExpanded ? 'v' : '>'}</span>
          </button>
          {isEditingName ? (
            <input
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              onKeyDown={handleNameKeyPress}
              onBlur={handleNameBlur}
              className="tag-name-input"
              autoFocus
            />
          ) : (
            <span
              className="tag-name"
              onClick={() => setIsEditingName(true)}
              title="Click to edit name"
            >
              {node.name}
            </span>
          )}
        </div>
        <button
          className="add-child-btn"
          onClick={() => onAddChild(path)}
          title="Add child node"
        >
          Add Child
        </button>
      </div>
      {isExpanded && (
        <>
          {hasData && (
            <div className="tag-data-section">
              <label className="data-label">Data</label>
              <input
                type="text"
                value={node.data || ''}
                onChange={(e) => onDataChange(path, e.target.value)}
                className="data-input"
                placeholder="Enter data..."
              />
            </div>
          )}
          {hasChildren && isExpanded && (
            <div className="tag-children">
              {node.children.map((child, index) => (
                <TagNode
                  key={index}
                  node={child}
                  path={[...path, index]}
                  onDataChange={onDataChange}
                  onNameChange={onNameChange}
                  onAddChild={onAddChild}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default TagView;

