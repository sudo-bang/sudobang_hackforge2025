import twilio from 'twilio';
import dotenv from 'dotenv';
import User from '../models/User.js';
dotenv.config();

const client = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);

function formatPhoneNumber(input) {
    // Remove all spaces
    const trimmed = String(input).replace(/\s+/g, '');

    // Validate and format
    if (/^\+\d{10,15}$/.test(trimmed)) {
        // Valid format with country code
        return trimmed;
    } else if (/^\d{10}$/.test(trimmed)) {
        // No country code, assume Indian number
        return '+91' + trimmed;
    } else {
        throw new Error("Invalid phone number format.");
    }
}


/**
 * Send WhatsApp message using Twilio
 * @param {string} to - recipient phone number in E.164 format (+1234567890)
 * @param {string} body - message content
 */
export const sendWhatsApp = (to, body) => {
  return client.messages
    .create({
      from: `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER}`, // Twilio WhatsApp-enabled number
      to: `whatsapp:${formatPhoneNumber(to)}`,
      body,
    })
    .then((msg) => console.log('WhatsApp message sent:', msg.sid))
    .catch((err) => console.error('WhatsApp error:', err.message));
};



// utils/twilio.js




const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const fromWhatsApp = 'whatsapp:' + process.env.TWILIO_WHATSAPP_NUMBER;



// Helper function to send WhatsApp messages to emergency contacts
export const notifyEmergencyContacts = async (userId, message) => {
  try {
    const user = await User.findById(userId);
    if (!user || !user.emergencyContacts || user.emergencyContacts.length === 0) return;

    for (const contact of user.emergencyContacts) {
      if (contact.number) {
        await client.messages.create({
          from: fromWhatsApp,
          to: `whatsapp:${contact.number}`,
          body: `🚨 ${user.name}'s Update: ${message}`,
        });
      }
    }
  } catch (err) {
    console.error('Failed to send WhatsApp message:', err.message);
  }
};

