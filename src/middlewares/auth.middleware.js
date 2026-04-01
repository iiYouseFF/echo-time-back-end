import { supabase } from "../config/supabseClient.js";
import { HttpException } from "../core/HttpException.js";

export const authMiddleware = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if(!authHeader || !authHeader.startsWith('Bearer')){
            throw new HttpException(401, 'Authentication token missing or invalid');
        }

        const token = authHeader.split(' ')[1]; 

        if (!supabase) {
            throw new HttpException(500, "Supabase client not initialized. Check server logs for environment variable errors.");
        }

        const { data: { user }, error } = await supabase.auth.getUser(token);

        if (error || !user) {
            throw new HttpException(401, 'Invalid or expired session')
        }

        req.user = user;
        next(); 
    } catch (error) {
        next(error);
    }
}