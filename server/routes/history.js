const express = require('express');
const AudioHistory = require('../models/AudioHistory');

const router = express.Router();

// Get conversion history
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, voice } = req.query;
    const ipAddress = req.ip || req.connection.remoteAddress;

    const query = { ipAddress };
    if (voice) {
      query.voice = voice;
    }

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sort: { createdAt: -1 }
    };

    const history = await AudioHistory.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await AudioHistory.countDocuments(query);

    res.json({
      history,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalItems: total,
        hasNext: parseInt(page) * parseInt(limit) < total,
        hasPrev: parseInt(page) > 1
      }
    });

  } catch (error) {
    console.error('History fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch history' });
  }
});

// Get conversion statistics
router.get('/stats', async (req, res) => {
  try {
    const ipAddress = req.ip || req.connection.remoteAddress;

    const stats = await AudioHistory.aggregate([
      { $match: { ipAddress } },
      {
        $group: {
          _id: null,
          totalConversions: { $sum: 1 },
          totalDuration: { $sum: '$duration' },
          averageDuration: { $avg: '$duration' },
          voiceCounts: {
            $push: '$voice'
          }
        }
      }
    ]);

    const voiceStats = await AudioHistory.aggregate([
      { $match: { ipAddress } },
      {
        $group: {
          _id: '$voice',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);

    const result = stats[0] || {
      totalConversions: 0,
      totalDuration: 0,
      averageDuration: 0
    };

    result.voiceStats = voiceStats;

    res.json(result);

  } catch (error) {
    console.error('Stats fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

// Delete a specific conversion
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const ipAddress = req.ip || req.connection.remoteAddress;

    const deleted = await AudioHistory.findOneAndDelete({
      _id: id,
      ipAddress
    });

    if (!deleted) {
      return res.status(404).json({ error: 'Conversion not found' });
    }

    res.json({ success: true, message: 'Conversion deleted successfully' });

  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({ error: 'Failed to delete conversion' });
  }
});

// Clear all history for current user
router.delete('/', async (req, res) => {
  try {
    const ipAddress = req.ip || req.connection.remoteAddress;

    const result = await AudioHistory.deleteMany({ ipAddress });

    res.json({ 
      success: true, 
      message: `Deleted ${result.deletedCount} conversions` 
    });

  } catch (error) {
    console.error('Clear history error:', error);
    res.status(500).json({ error: 'Failed to clear history' });
  }
});

module.exports = router; 