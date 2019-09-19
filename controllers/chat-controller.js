const redis = require('redis');

const { pid } = process;
const {
    REDIS_HOST = '127.0.0.1',
    REDIS_CHANNEL = 'servers',
} = process.env;


function controller(io) {

    const users = {};

    const sub = redis.createClient({ host: REDIS_HOST });
    const pub = redis.createClient({ host: REDIS_HOST });


    function onServerMessageReceived(data) {
        console.log(`[${pid}] Message received from servers ${JSON.stringify(data)}`);
        const { from, to, message } = data;

        const user = users[to];
        if (user) {
            // O usuário está conectar neste servidor
            // envia o evento para o cliente
            user.emit('chat', message);
        }
    }

    function onClientMessageReceived({ from, to, message }) {
        const data = { from, to, message };
        console.log(`[${pid}] Message received from client ${JSON.stringify(data)}`);

        const user = users[to];
        if (!user) {
            // O usuário não está conectar neste nó
            // publica no canal do Redis
            pub.publish(REDIS_CHANNEL, JSON.stringify({ from, to, message }));
            console.log(`[${pid}] Sent message to servers`);
        } else {
            // O usuário está conectado no mesmo nó
            // faz o emit diretamente para o socket
            user.emit('chat', message);
            console.log(`[${pid}] Sent message to client`);
        }
    }

    sub.subscribe(REDIS_CHANNEL);
    sub.on('message', (channel, data) => {
        if (channel == REDIS_CHANNEL) {
            onServerMessageReceived(JSON.parse(data));
        }
    });

    io.on('connection', client => {

        client.on('disconnect', () => {
            console.log(`[${pid}] Client disconnected ${client.id}`);
            delete users[client.id];
        });

        client.on('chat', onClientMessageReceived);

        console.log(`[${pid}] Client connected ${client.id}`);
        users[client.id] = client;
    });
}


module.exports = controller;
