import { HttpException } from '../../core/HttpException.js';

export class ChatService {
  constructor(chatRepo, taskRepo) {
    this.chatRepo = chatRepo;
    this.taskRepo = taskRepo;
  }

  async sendMessage(taskId, senderId, content) {
    const task = await this.taskRepo.findById(taskId);
    if (!task) throw new HttpException(404, "Task not found");

    if (task.status === 'completed') {
        throw new Error("Task Finished. Chat is disabled.");
    }

    if (task.creator_id !== senderId && task.assigned_to !== senderId) {
        throw new HttpException(403, "Not authorized to chat in this task");
    }

    return await this.chatRepo.saveMessage(taskId, senderId, content);
  }

  async getHistory(taskId, userId) {
    const task = await this.taskRepo.findById(taskId);
    if (!task) throw new HttpException(404, "Task not found");

    if (task.creator_id !== userId && task.assigned_to !== userId) {
        throw new HttpException(403, "Not authorized to view history");
    }

    return await this.chatRepo.getHistory(taskId);
  }

  async getConversations(userId) {
    return await this.chatRepo.getConversations(userId);
  }

  async deleteConversation(taskId, userId) {
    const task = await this.taskRepo.findById(taskId);
    if (!task) throw new HttpException(404, "Task not found");

    if (task.creator_id !== userId && task.assigned_to !== userId) {
        throw new HttpException(403, "Not authorized to delete this conversation");
    }

    return await this.chatRepo.deleteHistory(taskId);
  }
}