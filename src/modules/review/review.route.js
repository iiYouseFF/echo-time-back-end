import express from 'express';
import { ReviewController } from './review.controller.js';
import { ReviewService } from './review.service.js';
import { ReviewRepository } from './review.repository.js';
import { TaskRepository } from '../tasks/task.repository.js';
import { authMiddleware } from '../../middlewares/auth.middleware.js';

export class ReviewRoutes {
    constructor() {
        this.router = express.Router();
        this.path = '/reviews';

        const reviewRepository = new ReviewRepository();
        const taskRepository = new TaskRepository();
        const reviewService = new ReviewService(reviewRepository, taskRepository);
        const reviewController = new ReviewController(reviewService);

        this.initializeRoutes(reviewController);
    }

    initializeRoutes(controller) {
        // POST /reviews - إضافة تقييم جديد
        this.router.post(
            `${this.path}`,
            authMiddleware,
            controller.postReview
        );

        // GET /reviews/reputation/:userId - الحصول على السمعة
        this.router.get(
            `${this.path}/reputation/:userId`,
            controller.getReputation
        );

        // GET /reviews/user/:userId - الحصول على جميع تقييمات المستخدم
        this.router.get(
            `${this.path}/user/:userId`,
            controller.getUserReviews
        );
    }
}

export default ReviewRoutes;
