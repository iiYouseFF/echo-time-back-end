import { supabase } from "../config/supabseClient.js";

export class BaseRepository {
    constructor(table){
        this.table = table;
        this.db = supabase;
    }

    async findAll(){
        const { data, error } = await this.db.from(this.table).select('*');
        if(error) throw error;
        return data;
    }

    async findById(id){
        const { data, error} = await this.db.from(this.table).select('*').eq('id', id).single();
        if(error) throw error;
        return data;
    }

    async create(entity){
        const { data, error } = await this.db.from(this.table).insert([entity]).select('*').single();
        if(error) throw error;
        return data;
    }

    async update(id, entity){
        const { data, error } = await this.db.from(this.table).update(entity).eq('id', id).select('*').single();
        if(error) throw error;
        return data;
    }

    async delete(id){
        const { error } = await this.db.from(this.table).delete().eq('id', id);
        if(error) throw error;
        return true;
    }
}