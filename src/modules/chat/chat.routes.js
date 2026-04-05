import express from 'express';
import { ChatController } from './chat.controller.js';
import { ChatService } from './chat.service.js';
import { ChatRepository } from './chat.repository.js';
import { TaskRepository } from '../tasks/task.repository.js';
import { authMiddleware } from '../../middlewares/auth.middleware.js';

export default class ChatRoutes {
  constructor() {
    this.router = express.Router();
    this.path = '/chat';
    
    const chatRepo = new ChatRepository();
    const taskRepo = new TaskRepository();
    const chatService = new ChatService(chatRepo, taskRepo);
    const chatController = new ChatController(chatService);

    this.initializeRoutes(chatController);
  }

  initializeRoutes(controller) {
    // جلب كل المحادثات الخاصة بالمستخدم
    this.router.get('/chat/conversations', authMiddleware, controller.getConversations);
    // إرسال رسالة
    this.router.post('/chat/send', authMiddleware, controller.send);
    // جلب تاريخ محادثة معينة
    this.router.get('/chat/history/:taskId', authMiddleware, controller.getHistory);
  }
}