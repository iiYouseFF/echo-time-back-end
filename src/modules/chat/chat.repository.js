import { BaseRepository } from '../BaseRepository.js';

export class ChatRepository extends BaseRepository {
  constructor() {
    super('messages');
  }

  async saveMessage(messageData) {
    const { data, error } = await this.db
      .from(this.table)
      .insert(messageData)
      .select(`*, sender:profiles(full_name, avatar_url)`)
      .single();

    if (error) throw error;
    return data;
  }

  async getMessagesByTaskId(taskId) {
    const { data, error } = await this.db
      .from(this.table)
      .select(`*, sender:profiles(full_name, avatar_url)`)
      .eq('task_id', taskId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data;
  }
}