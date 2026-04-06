export class UserController{
    constructor(userService) {
        this.userService = userService;
    }

    getMe = async (req, res, next) => {
        try{
            const userId = req.user.id;
            const profile = await this.userService.getUserProfile(userId);

            res.status(200).json({
                success: true,
                data: profile
            });
        }catch(error){
            next(error);
        }
    }

    finishOnboarding = async (req, res, next) => {
        try {
            const userId = req.user.id;
            const surveyData = req.body;

            const profile = await this.userService.completeOnboarding(userId, surveyData);

            res.status(200).json({
            success: true,
            message: "Onboarding completed successfully",
            data: profile
            });
        } catch (error) {
            next(error);
        }
    };

    register = async (req, res, next) => {
        try {
            const { email, password, fullName, username, avatarData, bio, skills, idCardData } = req.body;
            const result = await this.userService.register(email, password, fullName, username, avatarData, bio, skills, idCardData);
            
            res.status(201).json({
            success: true,
            message: "User registered successfully. Please check your email for verification.",
            data: result
            });
        } catch (error) {
            next(error);
        }
    };

    checkUsername = async (req, res, next) => {
        try {
            const { username } = req.query;
            const exists = await this.userService.checkUsername(username);
            res.status(200).json({
                success: true,
                data: { exists }
            });
        } catch (error) {
            next(error);
        }
    };

        login = async (req, res, next) => {
        try {
            const { email, password } = req.body;
            const result = await this.userService.login(email, password);

            res.status(200).json({
            success: true,
            message: "Login successful",
            data: result
            });
        } catch (error) {
            next(error);
        }
    };
}