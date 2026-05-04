const express = require('express');
const router = express.Router();
const { calculateTriage } = require('../utils/triageLogic');
const { CATEGORIES, calculateScore, detectDegradation } = require('../utils/categoriesLogic');

// POST /api/triage/calculate
// Receives vitals + signs + motif, returns { tri, esi }
router.post('/calculate', (req, res) => {
    try {
        const { vitals, signs, currentMotif, age } = req.body;
        const result = calculateTriage(vitals || {}, signs || [], currentMotif, age);
        res.json({ success: true, result });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Calculation failed' });
    }
});

// GET /api/triage/categories
// Returns all clinical categories with motifs and signs
router.get('/categories', (req, res) => {
    try {
        res.json({ success: true, categories: CATEGORIES });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Failed to load categories' });
    }
});

// POST /api/triage/rescore
// Receives a patient object, returns { score, degraded }
router.post('/rescore', (req, res) => {
    try {
        const { patient } = req.body;
        if (!patient) return res.status(400).json({ success: false, message: 'Patient data required' });
        const score = calculateScore(patient);
        const degraded = detectDegradation(patient);
        res.json({ success: true, score, degraded });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Rescore failed' });
    }
});

module.exports = router;