import { supabase } from "../config/supabseClient.js";
import { HttpExepction } from "../core/HttpExepction.js";

export const authMiddleware = async (req, res, next) => {
    try {
        const auhtHeader = req.headers.authorization;
        if(!auhtHeader || !auhtHeader.startWith('Bearer')){
            throw new HttpExepction(401, 'Authentication token missing or invalid');
        }

        const token = auhtHeader.split(' ')[1]; 

        const { data: { user }, error } = await supabse.auth.getUser(token);

        if (error || !user) {
            throw new HttpExepction(401, 'Invalid or expired session')
        }

        req.user = user;
        next(); 
    } catch (error) {
        next(error);
    }
}