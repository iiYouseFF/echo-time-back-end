import 'dotenv/config';
import { App } from './app.js';
import TaskRoutes from './modules/tasks/task.route.js'
import UserRoutes from './modules/user/user.routes.js'
import ChatRoutes from './modules/chat/chat.routes.js'
import ReviewRoutes from './modules/review/review.route.js'

const app = new App([
    new TaskRoutes(),
    new UserRoutes(),
    new ChatRoutes(),
    new ReviewRoutes(),
]);

if (process.env.NODE_ENV !== 'production') {
    app.listen();
}

export default app.expressApp;