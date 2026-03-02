const express = require('express');
const Project = require('../models/Project');
const auth = require('../middleware/auth');
const router = express.Router();

// GET /projects - Get all projects for logged-in user
router.get('/', auth, async (req, res) => {
  try {
    const projects = await Project.find({ owner: req.user._id })
      .sort({ createdAt: -1 });
    
    res.json({
      message: 'Projects retrieved successfully',
      projects
    });
  } catch (error) {
    console.error('Get projects error:', error);
    res.status(500).json({
      message: 'Server error',
      error: error.message
    });
  }
});

// POST /projects - Create new project
router.post('/', auth, async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name || name.trim() === '') {
      return res.status(400).json({
        message: 'Project name is required'
      });
    }

    const project = new Project({
      name: name.trim(),
      description: description ? description.trim() : '',
      owner: req.user._id
    });

    await project.save();

    res.status(201).json({
      message: 'Project created successfully',
      project
    });
  } catch (error) {
    console.error('Create project error:', error);
    res.status(500).json({
      message: 'Server error',
      error: error.message
    });
  }
});

// DELETE /projects/:id - Delete project
router.delete('/:id', auth, async (req, res) => {
  try {
    const project = await Project.findOne({ 
      _id: req.params.id, 
      owner: req.user._id 
    });

    if (!project) {
      return res.status(404).json({
        message: 'Project not found or you do not have permission to delete it'
      });
    }

    await Project.deleteOne({ _id: req.params.id });

    res.json({
      message: 'Project deleted successfully'
    });
  } catch (error) {
    console.error('Delete project error:', error);
    res.status(500).json({
      message: 'Server error',
      error: error.message
    });
  }
});

// GET /projects/:id - Get single project
router.get('/:id', auth, async (req, res) => {
  try {
    const project = await Project.findOne({ 
      _id: req.params.id, 
      owner: req.user._id 
    });

    if (!project) {
      return res.status(404).json({
        message: 'Project not found or you do not have permission to access it'
      });
    }

    res.json({
      message: 'Project retrieved successfully',
      project
    });
  } catch (error) {
    console.error('Get project error:', error);
    res.status(500).json({
      message: 'Server error',
      error: error.message
    });
  }
});

module.exports = router;
