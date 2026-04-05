import { supabase } from '../../config/supabaseClient.js';

export class ChatRepository {
    constructor() {
        this.table = 'messages';
    }

    async saveMessage(messageData) {
        const { data, error } = await supabase
            .from(this.table)
            .insert({
                task_id: messageData.task_id,
                sender_id: messageData.sender_id,
                content: messageData.content
            })
            .select(`
                *,
                sender:profiles(full_name, avatar_url)
            `) // مهم جداً لجعل الـ Frontend يعرض الاسم فوراً
            .single();

        if (error) throw error;
        return data;
    }

    async getTaskHistory(taskId) {
        const { data, error } = await supabase
            .from(this.table)
            .select(`*, sender:profiles(full_name, avatar_url)`)
            .eq('task_id', taskId)
            .order('created_at', { ascending: true });

        if (error) throw error;
        return data;
    }
}