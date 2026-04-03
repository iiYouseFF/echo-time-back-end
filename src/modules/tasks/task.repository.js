import { BaseRepository } from "../BaseRepository.js";

export class TaskRepository extends BaseRepository{
    constructor() {
        super('tasks');
    }

    async findByStatus(status){
        const { data, error} = await this.db
        .from(this.table)
        .select('*, profiles!creator_id(full_name, avatar_url)')
        .eq('status', status);
        if(error) throw error;
        return data;
    }

    async create(taskData) {
        const { data, error } = await this.db
        .from(this.table)
        .insert(taskData)
        .select()
        .single();
        if(error) throw error;
        return data;
    }
}