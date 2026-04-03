import { HttpException } from '../../core/HttpException.js';

export class ChatService {
  constructor(chatRepository, taskRepository) {
    this.chatRepository = chatRepository;
    this.taskRepository = taskRepository;
  }

  async validateAccess(taskId, userId) {
    const task = await this.taskRepository.findById(taskId);
    if (!task) throw new HttpException(404, 'Task not found');

    // Temporarily allowing all authenticated users to chat on open tasks 
    // until full task assignment module is deployed
    // const isParticipant = task.creator_id === userId || task.assigned_to === userId;
    // if (!isParticipant) throw new HttpException(403, 'Unauthorized access to this chat');

    // الشات يغلق إذا كانت المهمة مكتملة
    if (task.status === 'completed') {
      throw new HttpException(403, 'This chat is archived because the task is completed');
    }

    return task;
  }

  async sendMessage(taskId, senderId, content) {
    await this.validateAccess(taskId, senderId);
    return await this.chatRepository.saveMessage({
      task_id: taskId,
      sender_id: senderId,
      content
    });
  }

  async getHistory(taskId, userId) {
    await this.validateAccess(taskId, userId);
    return await this.chatRepository.getMessagesByTaskId(taskId);
  }
}