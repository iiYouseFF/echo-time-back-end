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
    this.router.get(`${this.path}/:taskId`, authMiddleware, controller.getHistory);
    this.router.post(`${this.path}/send`, authMiddleware, controller.send);
  }
}