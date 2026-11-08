import Conversation from "../models/Conversation.js";

/* =====================================================
   💬 CREATE OR GET CONVERSATION
===================================================== */
export const getOrCreateConversation = async (
  req,
  res
) => {
  try {
    const currentUser =
      req.user.id || req.user._id;

    const { userId } = req.params;

    // 🔥 FIND EXISTING
    let conversation =
      await Conversation.findOne({
        participants: {
          $all: [currentUser, userId],
        },
      });

    // 🔥 CREATE NEW
    if (!conversation) {
      conversation =
        await Conversation.create({
          participants: [
            currentUser,
            userId,
          ],
        });
    }

    res.json(conversation);

  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};