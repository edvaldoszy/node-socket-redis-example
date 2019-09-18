const { createServer } = require('http');
const socket = require('socket.io');

const app = require('./app');
const chatController = require('./controllers/chat-controller');


const srv = createServer(app);

const io = socket(srv);
chatController(io);

srv.listen(3000, _ => console.log('Server started at 3000'));
