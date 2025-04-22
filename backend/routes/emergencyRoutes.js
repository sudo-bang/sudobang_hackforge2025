// emergencyRoutes.js
import express from 'express';
import EmergencyRequest from '../models/EmergencyRequest.js';
import Ambulance from '../models/Ambulance.js';
import Hospital from '../models/Hospital.js';
import User from '../models/User.js';
import { requireAuth } from '@clerk/express';
import { sendWhatsApp } from '../config/twilio.js'; 

const MAX_DISTANCE_METERS = 5000;

const router = express.Router();

// User creates emergency request
router.post('/request', requireAuth({ signInUrl: '/sign-in' }), async (req, res) => {
    try {
        const userId = req.auth.userId;
        const { coordinates } = req.body;
        const newRequest = await EmergencyRequest.create({
            userId,
            location: { type: 'Point', coordinates },
            status: 'pending',
            updates: [],
        });

        console.log('new request', newRequest);
        try {
            // Notify nearby ambulances
            const nearbyAmbulances = await Ambulance.find({
                location: {
                    $near: {
                        $geometry: { type: 'Point', coordinates },
                        $maxDistance: MAX_DISTANCE_METERS,
                    },
                },
                isAvailable: true,
                socketId: { $ne: null },
            });
            console.log('nearby ambulances', nearbyAmbulances);
    
            nearbyAmbulances.forEach((ambulance) => {
                req.io.to(ambulance.socketId).emit('new-emergency', newRequest);
            });
        }
        catch (err) {
            console.error('Error notifying ambulances:', err);
        }

        res.status(201).json(newRequest);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// 🚑 Ambulance accepts request
router.patch('/accept/ambulance/:requestId', async (req, res) => {
    try {
        const { requestId } = req.params;
        const { ambulanceId } = req.body;

        const request = await EmergencyRequest.findByIdAndUpdate(
            requestId,
            {
                ambulanceId,
                status: 'ambulance_accepted',
                $push: {
                    updates: {
                        type: 'ambulance_accepted',
                        data: { ambulanceId },
                        timestamp: new Date(),
                    },
                },
            },
            { new: true }
        );

        if (!request) return res.status(404).json({ error: 'Emergency request not found' });

        res.status(200).json(request);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// 🏥 Hospital accepts request
router.patch('/accept/hospital/:requestId', async (req, res) => {
    try {
        const { requestId } = req.params;
        const { hospitalId } = req.body;

        const request = await EmergencyRequest.findByIdAndUpdate(
            requestId,
            {
                hospitalId,
                status: 'hospital_accepted',
                $push: {
                    updates: {
                        type: 'hospital_accepted',
                        data: { hospitalId },
                        timestamp: new Date(),
                    },
                },
            },
            { new: true }
        );

        if (!request) return res.status(404).json({ error: 'Emergency request not found' });

        res.status(200).json(request);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// User creates emergency request
router.post('/x-accident', async (req, res) => {
    try {
        await sendWhatsApp('+918436287919', 'Emergency Alert: Pritam Das has been in an accident. Please reach out to him as soon as possible.\n\nYou recieved this message because he has added you as his emergency contact.');
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});
// User creates emergency request
router.post('/x-ambulance', async (req, res) => {
    try {
        await sendWhatsApp('+918436287919', 'Update: Pritam Das has been assigned an ambulance.\n\nAmbulance Details:\nName: Suparno Saha\nParamedic: Soham Nandi\nPhone: 6378859470\nCurrent Location: https://maps.google.com/?q=22.578138277208723,88.40194515272319');
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});
// User creates emergency request
router.post('/x-hospital', async (req, res) => {
    console.log('jello');
    try {
        await sendWhatsApp('+918436287919', 'Update: Pritam Das will be admitted to the hospital.\n\nHospital Details:\nName: ResClinic\nPhone: 9786543213\nLocation: https://maps.google.com/?q=22.51631678762742,88.40211157518479');
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

export default router;
