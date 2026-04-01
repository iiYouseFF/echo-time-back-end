import { BaseRepository } from "../BaseRepository.js";

export class TimeRepository extends BaseRepository{
    constructor(){
        super('time_transactions');
    }

    async executeTimeTransfer(taskId, workerId, hours) {
        const { data, error } = await this.db.rpc('complete_task_and_transfer_time', {
        target_task_id: taskId,
        worker_id: workerId,
        hours_to_transfer: hours
        });

        if (error) throw error;
        return data;
    }

    async getTransactionHistory(userId) {
        const { data, error } = await this.db
        .from(this.table)
        .select('*')
        .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
        .order('created_at', { ascending: false });

        if (error) throw error;
        return data;
    }
}