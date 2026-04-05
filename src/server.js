import 'dotenv/config';
import http from 'http';
import { Server } from 'socket.io';
import { App as AppClass } from './app.js';
import TaskRoutes from './modules/tasks/task.route.js'
import UserRoutes from './modules/user/user.routes.js'
import ChatRoutes from './modules/chat/chat.routes.js'
import ReviewRoutes from './modules/review/review.route.js'
import { ChatService } from './modules/chat/chat.service.js';
import { ChatRepository } from './modules/chat/chat.repository.js';
import { TaskRepository } from './modules/tasks/task.repository.js';

// 1. Initialize the app instance with routes
const app = new AppClass([
    new TaskRoutes(),
    new UserRoutes(),
    new ChatRoutes(),
    new ReviewRoutes(),
]);

// 2. Create HTTP server from the express app
const server = http.createServer(app.expressApp);

// 3. Initialize Socket.io
const io = new Server(server, {
    cors: {
        origin: [
            process.env.CLIENT_URL,
            'https://echo-time-1.vercel.app',
            'http://localhost:5173',
            'http://localhost:3000'
        ].filter(Boolean),
        methods: ['GET', 'POST'],
        credentials: true,
        allowedHeaders: ['Content-Type', 'Authorization']
    }
});

// 4. Initialize Services for Socket handling
const chatRepo = new ChatRepository();
const taskRepo = new TaskRepository();
const chatService = new ChatService(chatRepo, taskRepo);

io.on('connection', (socket) => {
    console.log('User Connect:', socket.id);

    socket.on('join_task_chat', (taskId) => {
        socket.join(taskId);
        console.log(`User Joined room: ${taskId}`);
    });

    socket.on('send_message', async (data) => {
        try {
            // Save to database
            const savedMsg = await chatService.sendMessage(data.taskId, data.senderId, data.content);
            
            // Format for frontend
            const formattedMsg = {
                id: savedMsg.id,
                senderId: savedMsg.sender_id,
                text: savedMsg.content,
                senderProfile: savedMsg.sender,
                timestamp: new Date(savedMsg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            };

            // Broadcast to everyone in the room
            io.to(data.taskId).emit('receive_message', formattedMsg);
        } catch (error) {
            console.error('Socket Message Error:', error.message);
            socket.emit('error', { message: error.message });
        }
    });

    socket.on('disconnect', () => {
        console.log('User Disconnected');
    });
});

const PORT = process.env.PORT || 5000;
const HOST = '0.0.0.0'; 
server.listen(PORT, HOST, () => {
    console.log(`Echo Time Server (with Sockets) running on http://${HOST}:${PORT}`);
});

export default app.expressApp;