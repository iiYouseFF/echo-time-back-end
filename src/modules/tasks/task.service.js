import { HttpException } from "../../core/HttpException.js";

export class TaskService {
    constructor(taskRepository, userService) {
        this.taskRepository = taskRepository;
        this.userService = userService;
    }

    async createNewTask(userId, taskData) {
        const { title, description, estimated_hours, required_skills } = taskData;
        
        await this.userService.checkTimeBalance(userId, estimated_hours);

        const newTask = await this.taskRepository.create({
            creator_id: userId,
            title,
            description,
            estimated_hours,
            required_skills,
            status: 'open'
        });

        return newTask;
    }

    async getAvailableTasks() {
        return await this.taskRepository.findByStatus('open');
    }

    async acceptTask(taskId, userId) {
        // 1. التحقق من وجود المهمة
        const task = await this.taskRepository.findById(taskId);
        if (!task) throw new HttpException(404, "Task not found");

        // 2. التحقق أن المهمة لا تزال مفتوحة
        if (task.status !== 'open') {
            throw new HttpException(400, "This task is no longer available.");
        }

        // 3. لا يمكن للمنشئ قبول مهمته بنفسه
        if (task.creator_id === userId) {
            throw new HttpException(403, "You cannot accept your own task.");
        }

        // 4. تعيين المستخدم كمنفذ وتحديث الحالة
        return await this.taskRepository.update(taskId, {
            assigned_to: userId,
            status: 'in_progress'
        });
    }

    async completeTask(taskId, userId) {
        // 1. التحقق من وجود المهمة
        const task = await this.taskRepository.findById(taskId);
        if (!task) throw new HttpException(404, "Task not found");

        // 2. التحقق من أن المستخدم هو صاحب المهمة (Creator only can complete)
        if (task.creator_id !== userId) {
            throw new HttpException(403, "Only the task creator can mark it as completed.");
        }

        // 3. تحديث حالة المهمة
        return await this.taskRepository.update(taskId, { status: 'completed' });
    }
}