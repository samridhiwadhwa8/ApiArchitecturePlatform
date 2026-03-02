import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import './EndpointList.css';

const EndpointList = ({ projectId, onEndpointSelect, refresh }) => {
  const [endpoints, setEndpoints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchEndpoints = useCallback(async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/endpoints/${projectId}`);
      setEndpoints(response.data.endpoints);
    } catch (error) {
      setError('Failed to fetch endpoints');
      console.error('Error fetching endpoints:', error);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    if (projectId) {
      fetchEndpoints();
    }
  }, [projectId, fetchEndpoints]);

  useEffect(() => {
    if (refresh && projectId) {
      fetchEndpoints();
    }
  }, [refresh, projectId, fetchEndpoints]);

  const handleDelete = async (endpointId, endpointUrl) => {
    if (!window.confirm(`Are you sure you want to delete "${endpointUrl}"?`)) {
      return;
    }

    try {
      await axios.delete(`http://localhost:5000/api/endpoints/${endpointId}`);
      setEndpoints(endpoints.filter(endpoint => endpoint._id !== endpointId));
    } catch (error) {
      setError('Failed to delete endpoint');
      console.error('Error deleting endpoint:', error);
    }
  };

  const getMethodColor = (method) => {
    const colors = {
      GET: '#238636',
      POST: '#0969da',
      PUT: '#bf8700',
      DELETE: '#da3633',
      PATCH: '#8250df',
      HEAD: '#6f42c1',
      OPTIONS: '#6e7781'
    };
    return colors[method] || '#6e7781';
  };

  if (loading) {
    return <div className="endpoint-list-loading">Loading endpoints...</div>;
  }

  if (error) {
    return <div className="endpoint-list-error">{error}</div>;
  }

  return (
    <div className="endpoint-list">
      <h3>API Endpoints</h3>
      {endpoints.length === 0 ? (
        <div className="no-endpoints">
          <p>No endpoints yet. Add your first API endpoint!</p>
        </div>
      ) : (
        <div className="endpoints-grid">
          {endpoints.map((endpoint) => (
            <div key={endpoint._id} className="endpoint-card">
              <div className="endpoint-header">
                <span 
                  className="method-badge"
                  style={{ backgroundColor: getMethodColor(endpoint.method) }}
                >
                  {endpoint.method}
                </span>
                <div className="endpoint-actions">
                  <button 
                    className="view-btn"
                    onClick={() => onEndpointSelect(endpoint)}
                  >
                    View
                  </button>
                  <button 
                    className="delete-btn"
                    onClick={() => handleDelete(endpoint._id, endpoint.url)}
                  >
                    Delete
                  </button>
                </div>
              </div>
              <div className="endpoint-url">{endpoint.url}</div>
              {endpoint.description && (
                <p className="endpoint-description">{endpoint.description}</p>
              )}
              <div className="endpoint-meta">
                <span className="created-date">
                  {new Date(endpoint.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default EndpointList;
