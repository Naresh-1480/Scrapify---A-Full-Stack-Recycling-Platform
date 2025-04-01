const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const User = require('../models/User');
const auth = require('../middleware/auth');

// Get all conversations for the current user
router.get('/conversations', auth, async (req, res) => {
    try {
        // Get all messages where user is either sender or receiver
        const messages = await Message.find({
            $or: [{ sender: req.user.id }, { receiver: req.user.id }]
        })
        .sort({ createdAt: -1 })
        .populate('sender', 'firstName lastName')
        .populate('receiver', 'firstName lastName');

        // Group messages by conversation
        const conversations = {};
        messages.forEach(message => {
            const otherUserId = message.sender._id.toString() === req.user.id 
                ? message.receiver._id.toString() 
                : message.sender._id.toString();

            if (!conversations[otherUserId]) {
                conversations[otherUserId] = {
                    _id: otherUserId,
                    user: message.sender._id.toString() === req.user.id ? message.receiver : message.sender,
                    lastMessage: message.content,
                    lastMessageTime: message.createdAt,
                    unreadCount: 0
                };
            }

            if (!message.read && message.receiver._id.toString() === req.user.id) {
                conversations[otherUserId].unreadCount++;
            }
        });

        // Convert to array and sort by last message time
        const conversationsArray = Object.values(conversations).sort((a, b) => 
            b.lastMessageTime - a.lastMessageTime
        );

        res.json(conversationsArray);
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: 'Server error' });
    }
});

// Get messages between two users
router.get('/messages/:userId', auth, async (req, res) => {
    try {
        const messages = await Message.find({
            $or: [
                { sender: req.user.id, receiver: req.params.userId },
                { sender: req.params.userId, receiver: req.user.id }
            ]
        })
        .sort({ createdAt: 1 })
        .populate('sender', 'firstName lastName')
        .populate('receiver', 'firstName lastName');

        // Mark messages as read
        await Message.updateMany(
            {
                sender: req.params.userId,
                receiver: req.user.id,
                read: false
            },
            { read: true }
        );

        res.json(messages);
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: 'Server error' });
    }
});

// Send a new message
router.post('/messages', auth, async (req, res) => {
    try {
        const { receiver, content } = req.body;

        const newMessage = new Message({
            sender: req.user.id,
            receiver,
            content
        });

        await newMessage.save();
        
        // Populate sender and receiver details
        await newMessage.populate('sender', 'firstName lastName');
        await newMessage.populate('receiver', 'firstName lastName');

        res.status(201).json(newMessage);
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: 'Server error' });
    }
});

module.exports = router; 