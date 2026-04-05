import { HttpException } from '../../core/HttpException.js';

export class ChatService {
    constructor(chatRepo, taskRepo) {
        this.chatRepo = chatRepo;
        this.taskRepo = taskRepo;
    }

    async sendMessage(taskId, userId, content) {
        // 1. التحقق من صلاحية الوصول وحالة المهمة
        const task = await this.taskRepo.findById(taskId);
        if (!task) throw new HttpException(404, "Task not found");

        // 2. التحقق من أن المهمة لم تنتهِ (نظام الشات المؤقت)
        if (task.status === 'completed') {
            throw new HttpException(403, "This task is completed. Chat is closed.");
        }

        // 3. التحقق من أن المستخدم هو صاحب المهمة أو المنفذ
        if (task.creator_id !== userId && task.assigned_to !== userId) {
            throw new HttpException(403, "You are not part of this task.");
        }

        return await this.chatRepo.saveMessage({
            task_id: taskId,
            sender_id: userId,
            content
        });
    }

    async getHistory(taskId, userId) {
        // 1. التحقق من وجود المهمة
        const task = await this.taskRepo.findById(taskId);
        if (!task) throw new HttpException(404, "Task not found");

        // 2. التحقق من الصلاحية (أن المستخدم جزء من المهمة)
        if (task.creator_id !== userId && task.assigned_to !== userId) {
            throw new HttpException(403, "You are not part of this task.");
        }

        return await this.chatRepo.getTaskHistory(taskId);
    }
}