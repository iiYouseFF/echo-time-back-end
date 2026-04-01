import express from 'express';
import { TimeController } from './time.controller.js';
import { TimeService } from './time.service.js';
import { TimeRepository } from './time.repository.js';
import { TaskRepository } from '../task/task.repository.js';
import { authMiddleware } from '../../middlewares/auth.middleware.js';
import { roleMiddleware } from '../../middlewares/role.middleware.js';

export class TimeRoutes {
  constructor() {
    this.router = express.Router();
    this.path = '/time';

    const timeRepo = new TimeRepository();
    const taskRepo = new TaskRepository();
    const timeService = new TimeService(timeRepo, taskRepo);
    const timeController = new TimeController(timeService);

    this.initializeRoutes(timeController);
  }

  initializeRoutes(controller) {
    this.router.post(
        `${this.path}/confirm/:taskId`,
        authMiddleware,
        controller.confirmCompletion
    )

    this.router.get(
        `${this.path}/admin/history`,
        authMiddleware,
        roleMiddleware(['admin']),
        controller.getAllHistory
    );
  }
}

export default TimeRoutes;