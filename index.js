const cluster = require('cluster');
const { createServer } = require('http');
const socket = require('socket.io');

const app = require('./app');
const chatController = require('./controllers/chat-controller');


if (cluster.isMaster) {
    console.log(`Master ${process.pid} is running`);

    // Fork workers.
    const cpus = require('os').cpus().length;
    for (let i = 0; i < cpus; i++) {
        cluster.fork();
    }

    cluster.on('exit', worker => {
        console.log(`worker ${worker.process.pid} died`);
    });

} else {
    // Workers can share any TCP connection
    // In this case it is an HTTP server
    const srv = createServer(app);
    chatController(socket(srv));

    srv.listen(3000, _ => console.log(`Worker ${process.pid} started at port 3000`));
}