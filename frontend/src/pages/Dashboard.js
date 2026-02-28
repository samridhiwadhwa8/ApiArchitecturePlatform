import React from 'react';
import { useAuth } from '../components/AuthContext';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="dashboard">
      <div className="dashboard-sidebar">
        <div className="sidebar-header">
          <h2>API Visualizer</h2>
        </div>
        <nav className="sidebar-nav">
          <a href="#" className="nav-item active">Dashboard</a>
          <a href="#" className="nav-item">My APIs</a>
          <a href="#" className="nav-item">Settings</a>
        </nav>
        <div className="sidebar-footer">
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
          <div className="user-info">
            <span>{user?.email}</span>
          </div>
        </header>

        <main className="dashboard-content">
          <div className="stats-grid">
            <div className="stat-card">
              <h3>0</h3>
              <p>Total APIs</p>
            </div>
            <div className="stat-card">
              <h3>0</h3>
              <p>Endpoints</p>
            </div>
            <div className="stat-card">
              <h3>0</h3>
              <p>Requests</p>
            </div>
          </div>

          <div className="recent-apis">
            <h2>Recent APIs</h2>
            <div className="empty-state">
              <p>No APIs yet. Create your first API to get started.</p>
              <button className="primary-button">Create API</button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
