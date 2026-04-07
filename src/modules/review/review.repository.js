import { supabase } from "../../config/supabaseClient.js";
import { BaseRepository } from "../BaseRepository.js";

export class ReviewRepository extends BaseRepository {
    constructor(){
        super('reviews');
    }

    async createReview(reviewData) {
        const { data, error } = await this.db
        .from(this.table)
        .insert(reviewData)
        .select()
        .single();

        if (error) throw error;
        return data;
    }

    async getAverageRating(userId){
        const { data, error } = await this.db
        .from(this.table)
        .select('rating')
        .eq('reviewee_id', userId)

        if(error) throw error;
        if(data.length === 0 ) return 0;
        const sum = data.reduce((acc, curr) => acc + curr.rating, 0);
        return (sum / data.length).toFixed(1);
    }
}