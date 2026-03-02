const express = require('express');
const Flow = require('../models/Flow');
const Project = require('../models/Project');
const auth = require('../middleware/auth');
const router = express.Router();

// GET /flows/:projectId - Get flow for a project
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

    const flow = await Flow.findOne({ project: req.params.projectId });

    res.json({
      message: 'Flow retrieved successfully',
      flow: flow || { nodes: [], edges: [] }
    });
  } catch (error) {
    console.error('Get flow error:', error);
    res.status(500).json({
      message: 'Server error',
      error: error.message
    });
  }
});

// POST /flows - Create or update flow
router.post('/', auth, async (req, res) => {
  try {
    const { name, projectId, nodes, edges } = req.body;

    if (!name || !projectId) {
      return res.status(400).json({
        message: 'Flow name and project ID are required'
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

    // Check if flow already exists for this project
    let flow = await Flow.findOne({ project: projectId });

    if (flow) {
      // Update existing flow
      flow.name = name;
      flow.nodes = nodes || [];
      flow.edges = edges || [];
      flow.updatedAt = Date.now();
      await flow.save();
    } else {
      // Create new flow
      flow = new Flow({
        name: name.trim(),
        project: projectId,
        nodes: nodes || [],
        edges: edges || []
      });
      await flow.save();
    }

    res.status(201).json({
      message: flow.updatedAt ? 'Flow updated successfully' : 'Flow created successfully',
      flow
    });
  } catch (error) {
    console.error('Save flow error:', error);
    res.status(500).json({
      message: 'Server error',
      error: error.message
    });
  }
});

// DELETE /flows/:projectId - Delete flow
router.delete('/:projectId', auth, async (req, res) => {
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

    await Flow.deleteOne({ project: req.params.projectId });

    res.json({
      message: 'Flow deleted successfully'
    });
  } catch (error) {
    console.error('Delete flow error:', error);
    res.status(500).json({
      message: 'Server error',
      error: error.message
    });
  }
});

module.exports = router;
