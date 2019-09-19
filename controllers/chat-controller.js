const redis = require('redis');



function controller(io) {

    const users = {};

    const sub = redis.createClient({ host: '192.168.99.100' });
    const pub = redis.createClient({ host: '192.168.99.100' });


    function onServerMessageReceived(data) {
        console.log('Message received from servers', data);
        const { from, to, message } = data;

        const user = users[to];
        if (user) {
            // O usuário está conectar neste servidor
            // envia o evento para o cliente
            user.emit('chat', message);
        }
    }

    function onClientMessageReceived({ from, to, message }) {
        console.log('Message received from client', { from, to, message });

        const user = users[to];
        if (!user) {
            // O usuário não está conectar neste nó
            // publica no canal do Redis
            pub.publish('servers', JSON.stringify({ from, to, message }));
            console.log('Sent message to servers');
        } else {
            // O usuário está conectado no mesmo nó
            // faz o emit diretamente para o socket
            user.emit('chat', message);
            console.log('Sent message to client');
        }
    }

    sub.subscribe('servers');
    sub.on('message', (channel, data) => {
        if (channel == 'servers') {
            onServerMessageReceived(JSON.parse(data));
        }
    });

    io.on('connection', client => {

        client.on('chat', onClientMessageReceived);

        console.log('Client connected', client.id);
        users[client.id] = client;
    });
}


module.exports = controller;
