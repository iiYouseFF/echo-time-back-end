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
}