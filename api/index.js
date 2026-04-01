import 'dotenv/config';
import App from '../src/app.js';
import TaskRoutes from '../src/modules/tasks/task.route.js';
import UserRoutes from '../src/modules/user/user.routes.js';

const appInstance = new App([
    new TaskRoutes(),
    new UserRoutes()
]);

export default appInstance.app;
