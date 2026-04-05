export class TaskController {
    constructor(taskService){
        this.taskService = taskService;
    }

    create = async (req, res, next) => {
        try {
            const userId = req.user.id;
            const taskData = req.body;

            const task = await this.taskService.createNewTask(userId, taskData);

            res.status(201).json({
                success: true,
                data: task
            });
        } catch(error){
            next(error);
        }
    }

    getAllOpen = async (req, res, next ) => {
        try {
            const tasks = await this.taskService.getAvailableTasks();
            res.status(200).json({
                success: true,
                data: tasks
            });
        } catch(error){
            next(error);
        }
    }

    complete = async (req, res, next) => {
        try {
            const { taskId } = req.params;
            const userId = req.user.id;

            const task = await this.taskService.completeTask(taskId, userId);

            res.status(200).json({
                success: true,
                data: task
            });
        } catch (error) {
            next(error);
        }
    };
}