import { UserRepository } from "../modules/user/user.repository.js";
import { HttpExepction } from "../core/HttpExepction.js";

export const roleMiddleware = (allowedRoles) => {
    return async (req, res, next) => {
        try{
            if(!req.user) {
                throw new HttpExepction(401, 'Unauthorized');
            }

            const userRepository = new UserRepository();
            const profile = await userRepository.findById(req.user.id);

            if(!profile || !allowedRoles.includes(profile.role)) {
                throw new HttpExepction(403, 'Forbidden: You do not have the required permissions');
            }

            req.userRole = profile.role;
            next();
        } catch (error) {
            next(error);
        }
    }
}