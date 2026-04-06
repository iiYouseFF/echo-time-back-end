import { HttpException } from "../../core/HttpException.js";
import { supabase } from "../../config/supabaseClient.js";

export class UserService {
    constructor(userRepository) {
        this.userRepository = userRepository;
    }

    async getUserProfile(userId) {
        const user = await this.userRepository.getUserData(userId);
        if (!user) {
            throw new HttpException(404, 'User Not Found');
        }
        
        // Ensure default values for reputation data 
        return {
            ...user,
            badges: user.badges || [],
            ratingAvg: user.ratingAvg || 0,
            freelanceUnlocked: user.freelanceUnlocked || false,
            helps_count: user.helps_count || 0,
            tasks_count: user.tasks_count || 0
        };
    }

    async checkTimeBalance(userId, requiredHourse) {
        const user = await this.getUserProfile(userId);
        if(user.time_balance < requiredHourse) {
            throw new HttpException(400, 'Insufficient time balance to create this task');
        }
        return true;
    }

    async completeOnboarding(userId, surveyData) {
        if (!surveyData.interests || surveyData.interests.length === 0) {
            throw new HttpException(400, "Please select at least one interest");
        }

        const updatedProfile = await this.userRepository.update(userId, {
            preferences: surveyData,
            is_onboarded: true,
            skills: surveyData.interests 
        });

        return updatedProfile;
    }

    async register(email, password, fullName, username, avatarData, bio, skills, idCardData) {
        // 1. Check if username is taken
        const usernameExists = await this.userRepository.existsByUsername(username);
        if (usernameExists) {
            throw new HttpException(400, 'Username is already taken');
        }

        // 2. Auth Sign Up
        const { data: authData, error: authError } = await supabase.auth.signUp({
            email,
            password,
        });

        if (authError) throw new HttpException(400, authError.message);

        // 3. Handle File Uploads (Optimized for Base64 or Buffers)
        let avatarUrl = null;
        let idCardUrl = null;

        if (avatarData) {
            const { data: uploadData, error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(`${authData.user.id}/avatar_${Date.now()}.png`, Buffer.from(avatarData, 'base64'), {
                    contentType: 'image/png'
                });
            if (!uploadError) {
                const { data: publicUrlData } = supabase.storage.from('avatars').getPublicUrl(uploadData.path);
                avatarUrl = publicUrlData.publicUrl;
            }
        }

        if (idCardData) {
            const { data: uploadData, error: uploadError } = await supabase.storage
                .from('national-ids')
                .upload(`${authData.user.id}/id_card_${Date.now()}.png`, Buffer.from(idCardData, 'base64'), {
                    contentType: 'image/png'
                });
            if (!uploadError) {
                idCardUrl = uploadData.path; 
            }
        }

        // 4. Create Profile
        const profile = await this.userRepository.createProfile({
            id: authData.user.id,
            full_name: fullName,
            username: username,
            email: email,
            avatar_url: avatarUrl,
            bio: bio,
            skills: skills || [],
            id_card_url: idCardUrl,
            is_verified: false,
            time_balance: 5,
            is_onboarded: true // Since they did the multi-step signup
        });

        return { user: { ...authData.user, ...profile } };
    }

    async checkUsername(username) {
        return await this.userRepository.existsByUsername(username);
    }

    async login(email, password) {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
        });

        if (error) throw new HttpException(401, "Invalid email or password");

        const profile = await this.userRepository.findById(data.user.id);

        return { 
            token: data.session.access_token, 
            user: { ...data.user, ...profile }, 
            is_onboarded: profile.is_onboarded 
        };
    }

    async getUserData(userId) {
        const user = await this.userRepository.getUserData(userId);
        if (!user) {
            throw new HttpException(404, 'User Not Found');
        }
        return user;
    }
}