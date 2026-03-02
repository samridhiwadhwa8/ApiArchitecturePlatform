const express = require('express');
const Endpoint = require('../models/Endpoint');
const Project = require('../models/Project');
const auth = require('../middleware/auth');
const router = express.Router();

// GET /endpoints/:projectId - Get all endpoints for a project
router.get('/:projectId', auth, async (req, res) => {
  try {
    // Verify user owns the project
    const project = await Project.findOne({ 
      _id: req.params.projectId, 
      owner: req.user._id 
    });

    if (!project) {
      return res.status(404).json({
        message: 'Project not found or you do not have permission to access it'
      });
    }

    const endpoints = await Endpoint.find({ project: req.params.projectId })
      .sort({ createdAt: -1 });

    res.json({
      message: 'Endpoints retrieved successfully',
      endpoints
    });
  } catch (error) {
    console.error('Get endpoints error:', error);
    res.status(500).json({
      message: 'Server error',
      error: error.message
    });
  }
});

// POST /endpoints - Create new endpoint
router.post('/', auth, async (req, res) => {
  try {
    const { method, url, description, projectId } = req.body;

    if (!method || !url || !projectId) {
      return res.status(400).json({
        message: 'Method, URL, and Project ID are required'
      });
    }

    // Verify user owns the project
    const project = await Project.findOne({ 
      _id: projectId, 
      owner: req.user._id 
    });

    if (!project) {
      return res.status(404).json({
        message: 'Project not found or you do not have permission to access it'
      });
    }

    const endpoint = new Endpoint({
      method: method.toUpperCase(),
      url: url.trim(),
      description: description ? description.trim() : '',
      project: projectId
    });

    await endpoint.save();

    res.status(201).json({
      message: 'Endpoint created successfully',
      endpoint
    });
  } catch (error) {
    console.error('Create endpoint error:', error);
    res.status(500).json({
      message: 'Server error',
      error: error.message
    });
  }
});

// DELETE /endpoints/:id - Delete endpoint
router.delete('/:id', auth, async (req, res) => {
  try {
    // Find endpoint and verify project ownership
    const endpoint = await Endpoint.findById(req.params.id).populate('project');

    if (!endpoint) {
      return res.status(404).json({
        message: 'Endpoint not found'
      });
    }

    // Verify user owns the project
    if (endpoint.project.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: 'You do not have permission to delete this endpoint'
      });
    }

    await Endpoint.deleteOne({ _id: req.params.id });

    res.json({
      message: 'Endpoint deleted successfully'
    });
  } catch (error) {
    console.error('Delete endpoint error:', error);
    res.status(500).json({
      message: 'Server error',
      error: error.message
    });
  }
});

// GET /endpoints/:id - Get single endpoint
router.get('/single/:id', auth, async (req, res) => {
  try {
    const endpoint = await Endpoint.findById(req.params.id).populate('project');

    if (!endpoint) {
      return res.status(404).json({
        message: 'Endpoint not found'
      });
    }

    // Verify user owns the project
    if (endpoint.project.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: 'You do not have permission to access this endpoint'
      });
    }

    res.json({
      message: 'Endpoint retrieved successfully',
      endpoint
    });
  } catch (error) {
    console.error('Get endpoint error:', error);
    res.status(500).json({
      message: 'Server error',
      error: error.message
    });
  }
});

module.exports = router;
