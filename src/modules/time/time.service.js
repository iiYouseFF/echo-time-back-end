import { HttpException } from "../../core/HttpException.js";

export class TimeService{
    constructor(timeRepository, taskRepository){
        this.timeRepository = timeRepository;
        this.taskRepository = taskRepository;
    }

    async completeTaskExchange(taskId, currentUserId){
        const task = await this.timeRepository.findById(taskId);
        if (!task) throw new HttpException(404, "Task Not Found");

        if (task.creator_id !== currentUserId) {
            throw new HttpException(403, 'Only the task creator can confirm completion');
        }

        if (!task.assigned_to) {
            throw new HttpException(400, 'Cannot complete a task that has no assigned worker');
        }

        if (task.status === 'completed') {
            throw new HttpException(400, 'Task is already completed');
        }

        return await this.timeRepository.executeTimeTransfer(
            taskId,
            task.assigned_to,
            task.estimated_hours
        );
    }
}