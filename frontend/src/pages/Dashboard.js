import React, { useState } from 'react';
import { useAuth } from '../components/AuthContext';
import { useNavigate } from 'react-router-dom';
import ProjectList from '../components/ProjectList';
import CreateProject from '../components/CreateProject';
import EndpointList from '../components/EndpointList';
import CreateEndpoint from '../components/CreateEndpoint';
import FlowVisualizer from '../components/FlowVisualizer';
import './Dashboard.css';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeView, setActiveView] = useState('dashboard');
  const [selectedProject, setSelectedProject] = useState(null);
  const [refreshEndpoints, setRefreshEndpoints] = useState(false);
  const [projectTab, setProjectTab] = useState('endpoints');

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleProjectSelect = (project) => {
    setSelectedProject(project);
    setActiveView('project');
    setRefreshEndpoints(false);
    setProjectTab('endpoints');
  };

  const handleProjectCreated = (project) => {
    setActiveView('dashboard');
  };

  const handleEndpointCreated = () => {
    setRefreshEndpoints(true);
  };

  const handleEndpointSelect = (endpoint) => {
    // Future: Show endpoint details or flow visualization
    console.log('Selected endpoint:', endpoint);
  };

  const renderMainContent = () => {
    if (activeView === 'project' && selectedProject) {
      return (
        <div className="project-view">
          <div className="project-header">
            <button 
              className="back-button"
              onClick={() => setActiveView('dashboard')}
            >
              ← Back to Projects
            </button>
            <h1>{selectedProject.name}</h1>
            {selectedProject.description && (
              <p className="project-description">{selectedProject.description}</p>
            )}
          </div>
          
          <div className="project-tabs">
            <button 
              className={`tab-button ${projectTab === 'endpoints' ? 'active' : ''}`}
              onClick={() => setProjectTab('endpoints')}
            >
              Endpoints
            </button>
            <button 
              className={`tab-button ${projectTab === 'flow' ? 'active' : ''}`}
              onClick={() => setProjectTab('flow')}
            >
              Flow Visualizer
            </button>
          </div>

          <div className="project-content">
            {projectTab === 'endpoints' && (
              <>
                <CreateEndpoint 
                  projectId={selectedProject._id} 
                  onEndpointCreated={handleEndpointCreated}
                />
                <EndpointList 
                  projectId={selectedProject._id}
                  onEndpointSelect={handleEndpointSelect}
                  refresh={refreshEndpoints}
                />
              </>
            )}
            
            {projectTab === 'flow' && (
              <FlowVisualizer projectId={selectedProject._id} />
            )}
          </div>
        </div>
      );
    }

    if (activeView === 'create') {
      return <CreateProject onProjectCreated={handleProjectCreated} />;
    }

    return (
      <>
        <div className="dashboard-actions">
          <button 
            className="primary-button"
            onClick={() => setActiveView('create')}
          >
            Create New Project
          </button>
        </div>
        
        <ProjectList onProjectSelect={handleProjectSelect} />
      </>
    );
  };

  return (
    <div className="dashboard">
      <div className="dashboard-sidebar">
        <div className="sidebar-header">
          <h2>API Visualizer</h2>
        </div>
        <nav className="sidebar-nav">
          <button 
            className={`nav-item ${activeView === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveView('dashboard')}
          >
            Dashboard
          </button>
          <button 
            className={`nav-item ${activeView === 'create' ? 'active' : ''}`}
            onClick={() => setActiveView('create')}
          >
            Create Project
          </button>
          <button className="nav-item" onClick={() => {}}>My APIs</button>
          <button className="nav-item" onClick={() => {}}>Settings</button>
        </nav>
        <div className="sidebar-footer">
          <div className="user-info">
            <span>{user?.email}</span>
          </div>
          <button onClick={handleLogout} className="logout-button">
            Logout
          </button>
        </div>
      </div>

      <div className="dashboard-main">
        <header className="dashboard-header">
          <div className="header-content">
            <h1>Welcome back, {user?.name}</h1>
            <p>Manage and visualize your APIs</p>
          </div>
        </header>

        <main className="dashboard-content">
          {renderMainContent()}
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
