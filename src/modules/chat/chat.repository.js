import { supabase } from "../../config/supabaseClient.js";

export class ChatRepository {
    async saveMessage(taskId, senderId, content) {
        const { data, error } = await supabase
        .from('messages')
        .insert({ task_id: taskId, sender_id: senderId, content })
        .select('*, sender:profiles(full_name, avatar_url)')
        .single();

        if (error) throw error;
        return data;
    }

    async getHistory(taskId) {
        const { data, error } = await supabase
            .from('messages')
            .select('*, sender:profiles(full_name, avatar_url)')
            .eq('task_id', taskId)
            .order('created_at', { ascending: true });

        if (error) throw error;
        return data;
    }

    async getConversations(userId) {
        // 1. Get all task IDs where the user is a participant
        const { data: participations, error: pErr } = await supabase
            .from('tasks')
            .select('id')
            .or(`creator_id.eq.${userId},assigned_to.eq.${userId}`);

        if (pErr) throw pErr;
        const taskIds = participations.map(p => p.id);
        if (taskIds.length === 0) return [];

        // 2. Fetch tasks with profile info
        const { data: tasks, error: tErr } = await supabase
            .from('tasks')
            .select(`
                id, title, status, creator_id, assigned_to,
                creator:profiles!creator_id(id, full_name, avatar_url),
                assignee:profiles!assigned_to(id, full_name, avatar_url)
            `)
            .in('id', taskIds);

        if (tErr) throw tErr;

        const results = [];
        for (const task of tasks) {
            const { data: lastMsg } = await supabase
                .from('messages')
                .select('content, created_at')
                .eq('task_id', task.id)
                .order('created_at', { ascending: false })
                .limit(1)
                .single();

            const otherUser = task.creator_id === userId ? task.assignee : task.creator;
            
            results.push({
                taskId: task.id,
                taskTitle: task.title,
                taskStatus: task.status,
                participant: otherUser || { full_name: 'Unknown User' },
                lastMessage: lastMsg?.content || 'No messages yet',
                lastMessageTime: lastMsg?.created_at
            });
        }

        return results.sort((a, b) => new Date(b.lastMessageTime || 0) - new Date(a.lastMessageTime || 0));
    }
    
    async deleteHistory(taskId) {
        const { error } = await supabase
            .from('messages')
            .delete()
            .eq('task_id', taskId);

        if (error) throw error;
        return true;
    }
}