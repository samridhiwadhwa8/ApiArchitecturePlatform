import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './ProjectList.css';

const ProjectList = ({ onProjectSelect }) => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/projects');
      setProjects(response.data.projects);
    } catch (error) {
      setError('Failed to fetch projects');
      console.error('Error fetching projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (projectId, projectName) => {
    if (!window.confirm(`Are you sure you want to delete "${projectName}"?`)) {
      return;
    }

    try {
      await axios.delete(`http://localhost:5000/api/projects/${projectId}`);
      setProjects(projects.filter(project => project._id !== projectId));
    } catch (error) {
      setError('Failed to delete project');
      console.error('Error deleting project:', error);
    }
  };

  if (loading) {
    return <div className="project-list-loading">Loading projects...</div>;
  }

  if (error) {
    return <div className="project-list-error">{error}</div>;
  }

  return (
    <div className="project-list">
      <h2>My Projects</h2>
      {projects.length === 0 ? (
        <div className="no-projects">
          <p>No projects yet. Create your first project!</p>
        </div>
      ) : (
        <div className="projects-grid">
          {projects.map((project) => (
            <div key={project._id} className="project-card">
              <div className="project-header">
                <h3>{project.name}</h3>
                <div className="project-actions">
                  <button 
                    className="view-btn"
                    onClick={() => onProjectSelect(project)}
                  >
                    Open
                  </button>
                  <button 
                    className="delete-btn"
                    onClick={() => handleDelete(project._id, project.name)}
                  >
                    Delete
                  </button>
                </div>
              </div>
              {project.description && (
                <p className="project-description">{project.description}</p>
              )}
              <div className="project-meta">
                <span className="created-date">
                  Created: {new Date(project.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProjectList;
