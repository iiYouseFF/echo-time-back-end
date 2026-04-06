export class ChatController {
  constructor(chatService) {
    this.chatService = chatService;
  }

  send = async (req, res, next) => {
    try {
      const { taskId, content } = req.body;
      const senderId = req.user.id;
      const message = await this.chatService.sendMessage(taskId, senderId, content);
      res.status(201).json({ success: true, data: message });
    } catch (error) {
      next(error);
    }
  };

  getHistory = async (req, res, next) => {
    try {
      const { taskId } = req.params;
      const userId = req.user.id;
      const messages = await this.chatService.getHistory(taskId, userId);
      res.status(200).json({ success: true, data: messages });
    } catch (error) {
      next(error);
    }
  };

  // جلب كل محادثات المستخدم الحالي
  getConversations = async (req, res, next) => {
    try {
      const userId = req.user.id;
      const conversations = await this.chatService.getConversations(userId);
      res.status(200).json({ success: true, data: conversations });
    } catch (error) {
      next(error);
    }
  };
}