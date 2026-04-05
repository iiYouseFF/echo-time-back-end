import express from 'express';
import { TaskController } from './task.controller.js';
import { TaskService } from './task.service.js';
import { TaskRepository } from './task.repository.js';
import { UserRepository } from '../user/user.repository.js';
import { UserService } from '../user/user.service.js';
import { authMiddleware } from '../../middlewares/auth.middleware.js';
import { validationMiddleware } from '../../middlewares/validation.middleware.js';
import { createTaskSchema } from './task.validation.js';

export class TaskRoutes {
    constructor() {
        this.router = express.Router();
        this.path = '/tasks'

        const userRepository = new UserRepository();
        const userService = new UserService(userRepository);
        const taskRepository = new TaskRepository();
        const taskService = new TaskService(taskRepository, userService);
        const taskController = new TaskController(taskService);

        this.initializeRoutes(taskController);
    }

    initializeRoutes(controller) {
        this.router.post(
            `${this.path}`, 
            authMiddleware,
            validationMiddleware(createTaskSchema), 
            controller.create
        );

        this.router.get(
            `${this.path}/open`,
            controller.getAllOpen
        );

        this.router.patch(
            `${this.path}/:taskId/complete`,
            authMiddleware,
            controller.complete
        );
    }
}


export default TaskRoutes;