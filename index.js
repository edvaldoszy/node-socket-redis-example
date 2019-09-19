const cluster = require('cluster');
const { createServer } = require('http');
const socket = require('socket.io');

const app = require('./app');
const chatController = require('./controllers/chat-controller');

const { NODE_ENV, PORT = '3000' } = process.env;
const port = parseInt(PORT);


if (cluster.isMaster && NODE_ENV === 'production') {
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

    srv.listen(port, _ => console.log(`Worker ${process.pid} started at port ${port}`));
}
