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
}