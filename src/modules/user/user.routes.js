import express from 'express';
import { UserController } from './user.controller.js';
import { UserService } from './user.service.js';
import { UserRepository } from './user.repository.js';
import { authMiddleware } from '../../middlewares/auth.middleware.js';

export class UserRoutes {
    constructor() {
        this.router = express.Router();
        this.path = '/users';

        const userRepository = new UserRepository();
        const userService = new UserService(userRepository);
        const userController = new UserController(userService);

        this.initializeRoutes(userController);
    }

    initializeRoutes(controller){
        this.router.get(
            `${this.path}/me`,
            authMiddleware,
            controller.getMe
        );

        this.router.post(
            `${this.path}/onboarding`,
            authMiddleware,
            controller.finishOnboarding
        );

        this.router.post(
            `${this.path}/register`,
            controller.register
        );

        this.router.get(
            `${this.path}/check-username`,
            controller.checkUsername
        );

        this.router.post(
            `${this.path}/login`,
            controller.login
        );
    }
}

export default UserRoutes;