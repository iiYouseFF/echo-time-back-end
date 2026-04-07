import { HttpException } from "../../core/HttpException.js";
import { supabase } from "../../config/supabaseClient.js";
import { decode } from 'base64-arraybuffer';
import { createClient } from '@supabase/supabase-js';

export class UserService {
    constructor(userRepository) {
        this.userRepository = userRepository;
    }

    async getUserProfile(userId) {
        const user = await this.userRepository.getUserData(userId);
        if (!user) {
            throw new HttpException(404, 'User Not Found');
        }
        
        // Handle private signed URL for National ID if it exists
        if (user.id_card_url) {
            try {
                const path = user.id_card_url.split('national-ids/')[1]?.split('?')[0];
                if (path) {
                    const { data: signedData } = await supabase.storage
                        .from('national-ids')
                        .createSignedUrl(path, 3600); // 1 hour expiry
                    user.id_card_url = signedData?.signedUrl || user.id_card_url;
                }
            } catch (e) {
                console.error("Error generating signed URL for user profile:", e);
            }
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

    async addBalance(userId, amount) {
        if (!amount || typeof amount !== 'number' || amount <= 0) {
            throw new HttpException(400, 'Invalid amount');
        }
        const user = await this.getUserProfile(userId);
        const newBalance = (user.time_balance || 0) + amount;
        return await this.userRepository.updateBalance(userId, newBalance);
    }

    async getStreaks(userId) {
        return await this.userRepository.getStreaks(userId);
    }

    async updateStreaks(userId, streaks) {
        return await this.userRepository.updateStreaks(userId, streaks);
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
        // 0. Normalize and Validate Username
        const normalizedUsername = username.toLowerCase().trim().replace(/\s+/g, '');
        
        // Regex: 3-20 chars, lowercase letters, numbers, underscores, and dots only
        const usernameRegex = /^[a-z0-9._]{3,20}$/;
        if (!usernameRegex.test(normalizedUsername)) {
            throw new HttpException(400, 'Username must be 3-20 characters long and contain only lowercase letters, numbers, underscores, or dots (no spaces).');
        }

        // 1. Check if username is taken (using normalized version)
        const usernameExists = await this.userRepository.existsByUsername(normalizedUsername);
        if (usernameExists) {
            throw new HttpException(400, 'Username is already taken');
        }

        // 2. Auth Sign Up
        const { data: authData, error: authError } = await supabase.auth.signUp({
            email,
            password,
        });

        if (authError) throw new HttpException(400, authError.message);

        // 3. Handle File Uploads (Optimized for Base64)
        let avatarUrl = null;
        let idCardUrl = null;

        // Function to strip possible base64 headers
        const cleanBase64 = (base64) => {
            if (!base64) return null;
            return base64.replace(/^data:image\/\w+;base64,/, "");
        };

        if (avatarData) {
            const cleaned = cleanBase64(avatarData);
            const { data: uploadData, error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(`${authData.user.id}/avatar_${Date.now()}.png`, decode(cleaned), {
                    contentType: 'image/png',
                    upsert: true
                });
            
            if (uploadError) {
                console.error('Avatar upload error:', uploadError);
            } else {
                const { data: publicUrlData } = supabase.storage.from('avatars').getPublicUrl(uploadData.path);
                avatarUrl = publicUrlData.publicUrl;
            }
        }

        if (idCardData) {
            const cleaned = cleanBase64(idCardData);
            const { data: uploadData, error: uploadError } = await supabase.storage
                .from('national-ids')
                .upload(`${authData.user.id}/id_card_${Date.now()}.png`, decode(cleaned), {
                    contentType: 'image/png',
                    upsert: true
                });
            
            if (uploadError) {
                console.error('ID Card upload error:', uploadError);
            } else {
                const { data: publicUrlData } = supabase.storage.from('national-ids').getPublicUrl(uploadData.path);
                idCardUrl = publicUrlData.publicUrl;
            }
        }

        // 4. Create Profile
        const profile = await this.userRepository.createProfile({
            id: authData.user.id,
            full_name: fullName,
            username: normalizedUsername,
            email: email,
            avatar_url: avatarUrl,
            bio: bio,
            skills: skills || [],
            id_card_url: idCardUrl,
            is_verified: false,
            status: 'pending',
            time_balance: 5,
            is_onboarded: true
        });

        return { user: { ...authData.user, ...profile } };
    }

    async checkUsername(username) {
        if (!username) return false;
        const normalized = username.toLowerCase().trim().replace(/\s+/g, '');
        return await this.userRepository.existsByUsername(normalized);
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

    // --- Admin Services ---

    async getAllUsers() {
        const users = await this.userRepository.getAllUsers();
        
        // Generate signed URLs for all users' National IDs for the admin
        return await Promise.all(users.map(async (u) => {
            if (u.id_card_url) {
                const path = u.id_card_url.split('national-ids/')[1]?.split('?')[0];
                if (path) {
                    const { data } = await supabase.storage
                        .from('national-ids')
                        .createSignedUrl(path, 3600);
                    u.id_card_url = data?.signedUrl || u.id_card_url;
                }
            }
            return u;
        }));
    }

    async updateStatus(userId, statusData) {
        // Ensure only allowed fields are updated via this method
        const allowedUpdates = ['is_verified', 'is_banned', 'role', 'status']; 
        const filteredData = Object.keys(statusData)
            .filter(key => allowedUpdates.includes(key))
            .reduce((obj, key) => {
                obj[key] = statusData[key];
                return obj;
            }, {});
        
        return await this.userRepository.updateStatus(userId, filteredData);
    }

    async getSystemStats() {
        return await this.userRepository.getSystemStats();
    }
}