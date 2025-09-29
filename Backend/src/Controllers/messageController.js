import Message from "../Models/Message.js";
import User from "../Models/User.js";

export async function getMessages(req, res) {
    try {
        const recipientId = req.params.userId;

        const user = await User.findById(recipientId).select("userName fullName profilePic");
        if (!user) {
            return res.status(404).json({ message: 'Recipient Not exist' });
        }

        const message = await Message.find({
            $or: [
                { sender: req.user._id, recipient: recipientId },
                { sender: recipientId, recipient: req.user._id },
            ]
        })
            .populate("sender", "userName fullName profilePic")
            .populate("recipient", "userName fullName profilePic")
            .sort({ createdAt: 1 });

        res.status(201).json({ user, message });

    } catch (error) {
        console.error('Error in getMessages controller:', error.message);
        res.status(500).json({ message: 'Internal server error' });
    }
}