export class ReviewController {
    constructor(reviewService){
        this.reviewService = reviewService;
    }

    postReview = async (req, res, next) => {
        try {
            const { taskId, rating, comment } = req.body;
            const reviewerId = req.user.id;

            const review = await this.reviewService.addReview(taskId, reviewerId, rating, comment);

            res.status(201).json({
                success: true,
                data: review
            });
        } catch (error) {
            next(error);
        }
    };

    getReputation = async (req, res, next) => {
        try {
            const { userId } = req.params;
            const reputation = await this.reviewService.getUserReputation(userId);

            res.status(200).json({
                success: true,
                data: reputation
            });
        } catch (error) {
            next(error);
        }
  };
}