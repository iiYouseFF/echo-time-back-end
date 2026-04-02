import 'dotenv/config';
import App from './app.js';
import TaskRoutes from './modules/tasks/task.route.js'
import UserRoutes from './modules/user/user.routes.js'

const app = new App([
    new TaskRoutes(),
    new UserRoutes(),
    new AuthRoutes(),
]);

if (process.env.NODE_ENV !== 'production') {
    app.listen();
}

export default app;