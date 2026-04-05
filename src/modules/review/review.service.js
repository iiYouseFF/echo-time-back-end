import { HttpException } from "../../core/HttpException.js";
import { TaskController } from "../tasks/task.controller.js";

export class ReviewService {
    constructor (reviewRepository, taskRepository) {
        this.reviewRepository = reviewRepository;
        this.taskRepository = taskRepository;
    }

    async addReview(taskId, reviewerId, rating, comment) {
        const task = await this.taskRepository.findById(taskId);
        if (!task || task.status !== 'completed') {
            throw new HttpException(400, 'You can only review completed tasks');
        }

        const revieweeId = (reviewerId === task.creator_id) ? task.assigned_to : task.creator_id;

        if (reviewerId === revieweeId) {
            throw new HttpException(400, 'You Cannot Review Yourself');
        }

        return await this.reviewRepository.createReview({
            task_id: taskId,
            reviewer_id: reviewerId,
            reviewee_id: revieweeId,
            rating,
            comment
        });
    }

    async getUserReputation(userId){
        const average = await this.reviewRepository.getAverageRating(userId);

        return {
            averageRating: average,
            level: average >= 4.5 ? 'Expert' : 'Beginner'
        };
    }
}