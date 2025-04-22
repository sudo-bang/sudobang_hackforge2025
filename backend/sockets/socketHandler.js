import Ambulance from '../models/Ambulance.js';
import Hospital from '../models/Hospital.js';
import Emergency from '../models/EmergencyRequest.js';
import User from '../models/User.js';
import { notifyEmergencyContacts } from '../config/twilio.js';

export const initSocketServer = (io) => {
    io.on('connection', (socket) => {
        console.log('Socket connected:', socket.id);

        // // Register ambulance or hospital socket ID
        // socket.on('register', async ({ id, role }) => {
        //   try {
        //     if (role === 'ambulance') {
        //       await Ambulance.findByIdAndUpdate(id, { socketId: socket.id });
        //     } else if (role === 'hospital') {
        //       await Hospital.findByIdAndUpdate(id, { socketId: socket.id });
        //     }
        //   } catch (err) {
        //     console.error('Socket register error:', err.message);
        //   }
        // });



        // // Status update event (assigned, arrived, picked, hospital)
        // socket.on('status-update', async ({ requestId, status, data }) => {
        //   io.emit(`status-update-${requestId}`, { status, data });

        //   try {
        //     const emergency = await Emergency.findById(requestId);
        //     if (!emergency) {
        //       console.warn('Emergency not found for status update');
        //       return;
        //     }

        //     // Update DB with new status
        //     emergency.status = status;
        //     emergency.updates.push({
        //       status,
        //       data,
        //       timestamp: new Date(),
        //     });
        //     await emergency.save();

        //     // Notify emergency contacts via WhatsApp
        //     if (emergency.userId) {
        //       const user = await User.findById(emergency.userId);
        //       if (user && user.emergencyContacts && user.emergencyContacts.length > 0) {
        //         await notifyEmergencyContacts(user.emergencyContacts, status);
        //       }
        //     }
        //   } catch (err) {
        //     console.error('Failed to update status or notify contacts:', err.message);
        //   }
        // });

        // Store socketId for ambulances/hospitals
        // when ambulance, hospital accepts
        socket.on('register', async ({ id, role }) => {
            try {
                if (role === 'ambulance') {
                    await Ambulance.findByIdAndUpdate(id, { socketId: socket.id });
                } else if (role === 'hospital') {
                    await Hospital.findByIdAndUpdate(id, { socketId: socket.id });
                }
            } catch (err) {
                console.error('Socket register error:', err.message);
            }
        });


        // Live location update from ambulance
        socket.on('location-update', async ({ requestId, coordinates }) => {
            io.emit(`ambulance-location-${requestId}`, coordinates);
            //  to be listened from user client

            // Update emergency location in DB
            try {
                await Emergency.findByIdAndUpdate(requestId, {
                    $push: {
                        updates: {
                            status: 'location-update',
                            data: { coordinates },
                            timestamp: new Date(),
                        },
                    },
                });
            } catch (err) {
                console.error('Failed to update location in DB:', err.message);
            }


            // Pickup and arrival events
            socket.on('status-update', async ({ requestId, status, data }) => {
                io.emit(`status-update-${requestId}`, { status, data });
                // to be listened by hospital & emergency contacts

                // Update emergency status in DB
                try {
                    await Emergency.findByIdAndUpdate(requestId, {
                        $set: { status },
                        $push: {
                            updates: {
                                status,
                                data,
                                timestamp: new Date(),
                            },
                        },
                    });
                } catch (err) {
                    console.error('Failed to update status in DB:', err.message);
                }
            });

            socket.on('disconnect', () => {
                console.log('Socket disconnected:', socket.id);
            });
        });
    });
};
