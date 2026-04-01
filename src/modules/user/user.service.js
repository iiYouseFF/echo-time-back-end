import { HttpExepction } from "../../core/HttpExepction.js";

export class UserService {
    constructor(userRepository) {
        this.userRepository = userRepository;
    }

    async getUserProfile(userId) {
        const user = await this.userRepository.findById(userId);
        if (!user) {
            throw new HttpExepction(404, 'User Not Found');
        }
        return user;
    }

    async checkTimeBalance(userId, requiredHourse) {
        const user = await this.getUserProfile(userId);
        if(user.time_balance < requiredHourse) {
            throw new HttpExepction(400, 'Insufficient time balance to create this task');
        }
        return true;
    }

    async completeOnboarding(userId, surveyData) {
        if (!surveyData.interests || surveyData.interests.length === 0) {
            throw new HttpExepction(400, "Please select at least one interest");
        }

        const updatedProfile = await this.userRepository.update(userId, {
            preferences: surveyData,
            is_onboarded: true,
            skills: surveyData.interests 
        });

        return updatedProfile;
    }

    async register(email, password, fullName) {
        const { data: authData, error: authError } = await supabase.auth.signUp({
            email,
            password,
        });

        if (authError) throw new HttpExepction(400, authError.message);

        const profile = await this.userRepository.createProfile({
            id: authData.user.id,
            full_name: fullName,
            email: email,
            time_balance: 5,
            is_onboarded: false
        });

        return { user: authData.user, profile};
    }

    async login(email, password) {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
        });

        if (error) throw new HttpExepction(401, "Invalid email or password");

        const profile = await this.userRepository.findById(data.user.id);

        return { 
            token: data.session.access_token, 
            user: data.user, 
            is_onboarded: profile.is_onboarded 
        };
    }
}