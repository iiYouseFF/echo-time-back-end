import { HttpExepction } from "../../core/HttpExepction.js";
import { TaskController } from "../tasks/task.controller.js";

export class ReviewService {
    constructor (reviewRepository, taksRepository) {
        this.reviewRepository = reviewRepository;
        this.taksRepository = taksRepository;
    }

    async addReview(taksId, reviewerId, rating, comment) {
        const task = await this.taksRepository.findById(taskId);
        if (!task || task.status !== 'completed') {
            throw new HttpExepction(400, 'You can only review completed tasks');
        }

        const revieweeId = (reviewerId === task.creator_id) ? task.assigned_to : task.creator_id;

        if (reviewerId === revieweeId) {
            throw new HttpExepction(400, 'You Cannot Review Yourself');
        }

        return await this.reviewRepository.creatReview({
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