import React, { useState, useEffect, useCallback, useMemo } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
  Handle,
  Position,
} from 'reactflow';
import 'reactflow/dist/base.css';
import axios from 'axios';
import './FlowVisualizer.css';

const FlowVisualizer = ({ projectId }) => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [flowName, setFlowName] = useState('API Flow');
  const [loading, setLoading] = useState(true);
  endpoint: ({ data, selected, id }) => (
    <div className={`endpoint-node ${selected ? 'selected' : ''}`}>
      <Handle type="target" position={Position.Top} />
      <div className="node-content">
        <div className="node-method">{data.method || 'GET'}</div>
        <div className="node-label">{data.label}</div>
        {data.description && (
          <div className="node-description">{data.description}</div>
        )}
        <div className="node-actions">
          <button 
            className="node-edit-btn" 
            onClick={(e) => {
              e.stopPropagation();
              // Will be handled by parent component
            }}
          >
            ✏️
          </button>
          <button 
            className="node-delete-btn"
            onClick={(e) => {
              e.stopPropagation();
              // Will be handled by parent component
            }}
          >
            🗑️
          </button>
        </div>
      </div>
      <Handle type="source" position={Position.Bottom} />
    </div>
  ),
}),
  []
);
);

const FlowVisualizer = ({ projectId }) => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [flowName, setFlowName] = useState('API Flow');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [selectedNode, setSelectedNode] = useState(null);
  const [editingNodeId, setEditingNodeId] = useState(null);
  const [editingLabel, setEditingLabel] = useState('');

  const loadFlow = useCallback(async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/flows/${projectId}`);
      const flow = response.data.flow;
      
      if (flow && flow.nodes && flow.edges) {
        setNodes(flow.nodes);
        setEdges(flow.edges);
        setFlowName(flow.name || 'API Flow');
      }
    } catch (error) {
      setError('Failed to load flow');
      console.error('Error loading flow:', error);
    } finally {
      setLoading(false);
    }
  }, [projectId, setNodes, setEdges]);

  useEffect(() => {
    if (projectId) {
      loadFlow();
    }
  }, [projectId, loadFlow]);

  const saveFlow = async () => {
    setSaving(true);
    setError('');

    try {
      await axios.post('http://localhost:5000/api/flows', {
        name: flowName.trim() || 'API Flow',
        projectId,
        nodes,
        edges
      });
      console.log('Flow saved successfully');
    } catch (error) {
      setError('Failed to save flow');
      console.error('Error saving flow:', error);
    } finally {
      setSaving(false);
    }
  };

  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const addNewNode = () => {
    console.log('Add Node button clicked!');
    const endpointNames = ['GET /users', 'POST /orders', 'GET /payments', 'DELETE /cart', 'PUT /profile'];
    const randomEndpoint = endpointNames[Math.floor(Math.random() * endpointNames.length)];
    const newNode = {
      id: `node_${Date.now()}`,
      type: 'endpoint',
      position: { x: 100 + Math.random() * 200, y: 100 + Math.random() * 200 },
      data: {
        label: randomEndpoint,
        method: randomEndpoint.split(' ')[0],
        description: `API endpoint: ${randomEndpoint}`
      }
    };
    console.log('Creating new node:', newNode);
    setNodes((nds) => {
      console.log('Current nodes before:', nds);
      const newNodes = nds.concat(newNode);
      console.log('Current nodes after:', newNodes);
      return newNodes;
    });
  };

  const deleteNode = (nodeId) => {
    console.log('Delete function called for nodeId:', nodeId);
    setNodes((nds) => {
      const newNodes = nds.filter((n) => n.id !== nodeId);
      console.log('Nodes after deletion:', newNodes);
      return newNodes;
    });
    setEdges((eds) => {
      const newEdges = eds.filter((e) => e.source !== nodeId && e.target !== nodeId);
      console.log('Edges after deletion:', newEdges);
      return newEdges;
    });
  };

  const startEditingNode = (nodeId, currentLabel) => {
    setEditingNodeId(nodeId);
    setEditingLabel(currentLabel);
  };

  const saveNodeEdit = () => {
    if (editingNodeId && editingLabel) {
      setNodes((nds) =>
        nds.map((n) =>
          n.id === editingNodeId
            ? { ...n, data: { ...n.data, label: editingLabel } }
            : n
        )
      );
      setEditingNodeId(null);
      setEditingLabel('');
    }
  };

  const cancelEdit = () => {
    setEditingNodeId(null);
    setEditingLabel('');
  };

  const onNodeDoubleClick = (event, node) => {
    const newLabel = prompt('Edit node label:', node.data.label);
    if (newLabel && newLabel !== node.data.label) {
      setNodes((nds) =>
        nds.map((n) =>
          n.id === node.id
            ? { ...n, data: { ...n.data, label: newLabel } }
            : n
        )
      );
    }
  };

  if (loading) {
    return <div className="flow-loading">Loading flow...</div>;
  }

  return (
    <div className="flow-visualizer" style={{ height: '100vh', width: '100%', display: 'flex', flexDirection: 'column' }}>
      <div className="flow-header">
        <div className="flow-controls">
          <input
            type="text"
            value={flowName}
            onChange={(e) => setFlowName(e.target.value)}
            placeholder="Flow Name"
            className="flow-name-input"
            autoComplete="off"
          />
          <button onClick={addNewNode} className="add-node-btn">
            + Add Node
          </button>
          <button onClick={saveFlow} disabled={saving} className="save-flow-btn">
            {saving ? 'Saving...' : 'Save Flow'}
          </button>
        </div>
        {error && <div className="flow-error">{error}</div>}
      </div>

      {editingNodeId && (
        <div className="node-editor-overlay">
          <div className="node-editor">
            <h4>Edit Node</h4>
            <input
              type="text"
              value={editingLabel}
              onChange={(e) => setEditingLabel(e.target.value)}
              placeholder="Enter endpoint name"
              className="node-editor-input"
              autoFocus
            />
            <div className="node-editor-actions">
              <button onClick={saveNodeEdit} className="save-btn">
                Save
              </button>
              <button onClick={cancelEdit} className="cancel-btn">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flow-container" style={{ width: '100%', height: '600px', minHeight: '400px' }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeClick={(event, node) => {
            const target = event.target;
            const isDeleteBtn = target.closest('.node-delete-btn') || 
                               target.classList.contains('node-delete-btn') ||
                               target.parentElement?.classList.contains('node-delete-btn');
            
            if (isDeleteBtn) {
              event.stopPropagation();
              if (window.confirm(`Delete node "${node.data.label}"?`)) {
                deleteNode(node.id);
              }
            } else {
              const isEditBtn = target.closest('.node-edit-btn') || 
                               target.classList.contains('node-edit-btn') ||
                               target.parentElement?.classList.contains('node-edit-btn');
              if (isEditBtn) {
                event.stopPropagation();
                startEditingNode(node.id, node.data.label);
              }
            }
          }}
          onNodeDoubleClick={onNodeDoubleClick}
          nodeTypes={nodeTypes}
          fitView
        >
          <Background color="#0d1117" gap={16} />
          <Controls />
          <MiniMap
            nodeColor="#161b22"
            maskColor="rgb(240, 246, 252, 0.1)"
            position="top-right"
          />
        </ReactFlow>
      </div>

      <div className="flow-instructions">
        <h4>Instructions:</h4>
        <ul>
          <li>Double-click nodes to edit labels</li>
          <li>Drag handles to connect nodes</li>
          <li>Click "Add Node" to add new endpoints</li>
          <li>Save your flow to preserve changes</li>
        </ul>
      </div>
    </div>
  );
};

export default FlowVisualizer;
