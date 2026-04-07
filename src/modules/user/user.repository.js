import { BaseRepository } from "../BaseRepository.js";

export class UserRepository extends BaseRepository {
    constructor(){
        super('profiles');
    }

    async findByUsername(username){
        const { data, error } = await this.db
        .from(this.table)
        .select('*')
        .eq('username', username)
        .single();
        if(error && error.code !== 'PGRST116') throw error;
        return data;
    }

    async existsByUsername(username) {
        const { count, error } = await this.db
            .from(this.table)
            .select('*', { count: 'exact', head: true })
            .eq('username', username);
        
        if (error) throw error;
        return count > 0;
    }

    async updateBalance(userId, newBalance){
        const { data, error } = await this.db
        .from(this.table)
        .update({ time_balance: newBalance })
        .eq('id', userId)
        .select()
        .single();

        if (error) throw error;
        return data;
    }

    async getStreaks(userId) {
        const { data, error } = await this.db.from(this.table).select('preferences').eq('id', userId).single();
        if (error) throw error;
        return data.preferences?.streaks || this._getDefaultStreaks();
    }

    async updateStreaks(userId, streaks) {
        const { data: curData } = await this.db.from(this.table).select('preferences').eq('id', userId).single();
        const prefs = curData?.preferences || {};
        prefs.streaks = streaks;

        const { data, error } = await this.db.from(this.table).update({ preferences: prefs }).eq('id', userId).select('preferences').single();
        if (error) throw error;
        return data.preferences.streaks;
    }

    _getDefaultStreaks() {
        return {
            learning: { count: 0, lastDate: null, freezesLeft: 1, totalEarned: 0, dailyActions: 0 },
            helping: { count: 0, lastDate: null, freezesLeft: 1, totalEarned: 0, dailyActions: 0 },
            contribution: { count: 0, lastDate: null, freezesLeft: 1, totalEarned: 0, dailyActions: 0 }
        };
    }

    async createProfile(profileData) {
        const { data, error } = await this.db
            .from(this.table)
            .insert(profileData)
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    async getUserData(userId) {
        const { data: profile, error: profileError } = await this.db
            .from(this.table)
            .select('*')
            .eq('id', userId)
            .single();

        if (profileError) throw profileError;

        // Get helps count (tasks completed by user)
        const { count: helpsCount, error: helpsError } = await this.db
            .from('tasks')
            .select('*', { count: 'exact', head: true })
            .eq('assigned_to', userId)
            .eq('status', 'completed');

        if (helpsError) throw helpsError;

        // Get total tasks created by user
        const { count: tasksCount, error: tasksError } = await this.db
            .from('tasks')
            .select('*', { count: 'exact', head: true })
            .eq('creator_id', userId);

        if (tasksError) throw tasksError;

        return {
            ...profile,
            helps_count: helpsCount || 0,
            tasks_count: tasksCount || 0
        };
    }

    // --- Admin Methods ---

    async getAllUsers() {
        const { data, error } = await this.db
            .from(this.table)
            .select('*')
            .order('created_at', { ascending: false });
        
        if (error) throw error;
        return data;
    }

    async updateStatus(userId, statusData) {
        const { data, error } = await this.db
            .from(this.table)
            .update(statusData)
            .eq('id', userId)
            .select()
            .single();
        
        if (error) throw error;
        return data;
    }

    async getSystemStats() {
        // Total Users
        const { count: userCount } = await this.db
            .from(this.table)
            .select('*', { count: 'exact', head: true });

        // Total Tasks (Flow)
        const { count: taskCount } = await this.db
            .from('tasks')
            .select('*', { count: 'exact', head: true });

        // Total Completed Hours (Sum)
        const { data: completedTasks } = await this.db
            .from('tasks')
            .select('hours')
            .eq('status', 'completed');
        
        const totalHoursFlow = (completedTasks || []).reduce((acc, curr) => acc + (curr.hours || 0), 0);

        // Pending Verifications
        const { count: pendingVerifs } = await this.db
            .from(this.table)
            .select('*', { count: 'exact', head: true })
            .eq('is_verified', false);

        return {
            totalUsers: userCount || 0,
            totalTasks: taskCount || 0,
            totalHours: totalHoursFlow,
            pendingVerifs: pendingVerifs || 0
        };
    }

    // --- Advanced Admin Diagnostics ---

    async getRecentTransactions() {
        const { data, error } = await this.db
            .from('tasks') // Assume completed tasks are the source of hour flow
            .select('*, sender:profiles!creator_id(username, full_name), receiver:profiles!assigned_to(username, full_name)')
            .eq('status', 'completed')
            .order('updated_at', { ascending: false })
            .limit(50);
        
        if (error) throw error;
        return data;
    }

    async getCategoryStats() {
        const { data, error } = await this.db
            .from('tasks')
            .select('category');
        
        if (error) throw error;

        const stats = (data || []).reduce((acc, curr) => {
            const cat = curr.category || 'Other';
            acc[cat] = (acc[cat] || 0) + 1;
            return acc;
        }, {});

        return Object.entries(stats).map(([name, count]) => ({ name, count }));
    }

    async getFlaggedReviews() {
        // Fetch reviews with status issues or low ratings
        const { data, error } = await this.db
            .from('reviews')
            .select('*, task:tasks(title, hours), reviewer:profiles!reviewer_id(username), reviewee:profiles!reviewee_id(username)')
            .lt('rating', 3) // Flag reviews below 3 stars
            .order('created_at', { ascending: false });
        
        if (error) throw error;
        return data;
    }
}