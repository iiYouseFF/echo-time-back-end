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
}