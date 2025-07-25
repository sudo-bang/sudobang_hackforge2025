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

        // Notify emergency contacts via Twilio WhatsApp
        const user = await User.findById(userId);
        if (user && user.emergencyContacts.length > 0) {
            await notifyEmergencyContacts(user.emergencyContacts, `🚨 ${user.name} is in danger!
Last Known Location: ${coordinates.join(', ')}`);
        }

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

        // Notify emergency contacts
        const user = await User.findById(request.userId);
        const ambulance = await Ambulance.findById(ambulanceId);
        if (user && user.emergencyContacts.length > 0 && ambulance) {
            await notifyEmergencyContacts(
                user.emergencyContacts,
                `🚑 Ambulance Assigned for ${user.name}\nAmbulance ID: ${ambulance._id}\nDriver: ${ambulance.name}\nContact: ${ambulance.phoneNumber}`
            );
        }

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
        // Notify emergency contacts
        const user = await User.findById(request.userId);
        const hospital = await Hospital.findById(hospitalId);
        if (user && user.emergencyContacts.length > 0 && hospital) {
            await notifyEmergencyContacts(
                user.emergencyContacts,
                `🏥 Hospital Assigned for ${user.name}\nHospital Name: ${hospital.name}\nContact: ${hospital.phoneNumber || 'N/A'}`
            );
        }

        res.status(200).json(request);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Assume you have imported Express, the EmergencyRequest model, and the Ambulance model
router.post('/check-assigned-ambulance', requireAuth({ signInUrl: '/sign-in' }), async (req, res) => {
    try {
        const { emergencyRequestId } = req.body;
        if (!emergencyRequestId) {
            return res.status(400).json({ message: 'Emergency request ID is required' });
        }

        // Find the emergency request by its ID
        const emergencyRequest = await EmergencyRequest.findById(emergencyRequestId);
        if (!emergencyRequest) {
            return res.status(404).json({ message: 'Emergency request not found' });
        }

        // Check if an ambulance has been assigned
        if (!emergencyRequest.ambulanceId) {
            return res.status(200).json({ assigned: false });
        }

        // Find the assigned ambulance to get its socketId
        const ambulance = await Ambulance.findById(emergencyRequest.ambulanceId);
        if (!ambulance) {
            return res.status(404).json({ message: 'Ambulance not found' });
        }

        // Return the socketId so the client can subscribe to its live updates
        return res.status(200).json({ assigned: true, socketId: ambulance.socketId });
    } catch (err) {
        console.error("Error checking assigned ambulance:", err.message);
        res.status(500).json({ message: err.message });
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
