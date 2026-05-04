const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Patient = require('../models/Patient');

const generateTicket = () => {
  const num = Math.floor(1000 + Math.random() * 9000);
  return `TK-${num}`;
};

router.post('/orientation', async (req, res) => {
  try {
    const ticket = generateTicket();
    const patient = new Patient({ ticketNumber: ticket });
    await patient.save();
    res.json({ success: true, ticket: ticket, patientId: patient._id });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.get('/waiting', auth, async (req, res) => {
  try {
    const patients = await Patient.find({ status: 'waiting' })
      .sort({ createdAt: 1 });
    res.json({ success: true, patients });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.get('/triaged', auth, async (req, res) => {
  try {
    const patients = await Patient.find({ status: 'triaged' })
      .sort({ score: -1 });
    res.json({ success: true, patients });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.put('/:id/triage', auth, async (req, res) => {
  try {
    const {
      triageLevel, esiLevel, category,
      complaint, signs, vitals, redFlags
    } = req.body;

    const patient = await Patient.findByIdAndUpdate(
      req.params.id,
      {
        status: 'triaged',
        triageLevel,
        esiLevel,
        originalLevel: triageLevel,
        category,
        complaint,
        signs,
        vitals,
        redFlags: redFlags || [],
        triagedAt: new Date(),
      },
      { new: true }
    );

    if (!patient) {
      return res.status(404).json({ success: false, message: 'Patient not found' });
    }

    res.json({ success: true, patient });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.post('/rescore', auth, async (req, res) => {
  try {
    const patients = await Patient.find({ status: 'triaged' });

    const triageBaseScores = {
      '1': 100, '2': 80, '3A': 60,
      '3B': 50, '4': 30, '5': 10
    };

    const updated = [];

    for (const patient of patients) {
      let score = triageBaseScores[patient.triageLevel] || 30;
      const wait = (patient.waitMinutes || 0) + 0.5;
      score += wait * 1.5;

      const v = patient.vitals || {};
      if (v.fc && (v.fc > 120 || v.fc < 50)) score += 25;
      if (v.pas && (v.pas > 180 || v.pas < 80)) score += 25;
      if (v.spo2 && v.spo2 < 92) score += 35;
      if (v.temp && (v.temp > 39.5 || v.temp < 35)) score += 20;
      if (patient.redFlags) score += patient.redFlags.length * 15;

      score = Math.round(score);

      const baseScore = triageBaseScores[patient.triageLevel] || 30;
      const degraded = score > baseScore + 40;

      await Patient.findByIdAndUpdate(patient._id, {
        score,
        degraded,
        waitMinutes: wait,
      });

      updated.push({
        _id: patient._id,
        score,
        degraded,
        waitMinutes: wait,
        triageLevel: patient.triageLevel,
        originalLevel: patient.originalLevel,
      });
    }

    res.json({ success: true, patients: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.put('/:id/upgrade', auth, async (req, res) => {
  try {
    const { newLevel } = req.body;
    const patient = await Patient.findByIdAndUpdate(
      req.params.id,
      { triageLevel: newLevel, degraded: false },
      { new: true }
    );
    res.json({ success: true, patient });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
