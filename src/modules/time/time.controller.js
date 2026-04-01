export class TimeController {
    constructor(timeService) {
        this.timeService = timeService;
    }

    confirmCompletion = async (req, res, next) => {
        try {
            const { taskId } = req.params;
            const userId = req.user.id;

            await this.timeService.completeTaskExchange(taskId, userId);

            res.status(200).json({
                success: true,
                message: 'Task completed and time transferred successfully'
            });
        } catch (error) {
            next(error);
        }
    }

    
}