import React, { useState } from 'react';
import axios from 'axios';
import './CreateEndpoint.css';

const CreateEndpoint = ({ projectId, onEndpointCreated }) => {
  const [formData, setFormData] = useState({
    method: 'GET',
    url: '',
    description: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const httpMethods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS'];

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.url.trim()) {
      setError('Endpoint URL is required');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await axios.post('http://localhost:5000/api/endpoints', {
        ...formData,
        projectId
      });
      onEndpointCreated(response.data.endpoint);
      setFormData({ method: 'GET', url: '', description: '' });
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to create endpoint');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-endpoint">
      <h3>Add New Endpoint</h3>
      <form onSubmit={handleSubmit} className="endpoint-form">
        {error && <div className="error-message">{error}</div>}
        
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="method">HTTP Method</label>
            <select
              id="method"
              name="method"
              value={formData.method}
              onChange={handleChange}
            >
              {httpMethods.map(method => (
                <option key={method} value={method}>{method}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="url">Endpoint URL *</label>
            <input
              type="text"
              id="url"
              name="url"
              value={formData.url}
              onChange={handleChange}
              placeholder="/users"
              maxLength="200"
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Brief description of what this endpoint does..."
            maxLength="500"
            rows="3"
          />
        </div>

        <button 
          type="submit" 
          className="submit-btn"
          disabled={loading}
        >
          {loading ? 'Adding...' : 'Add Endpoint'}
        </button>
      </form>
    </div>
  );
};

export default CreateEndpoint;
