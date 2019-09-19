# node-socket-redis-example

Projeto de exemplo para uso de Socket com Redis


## Introdução

Existe um problema quando de trabalha com socket em cluster, dado que a conexão do cliente fica restrita apenas no servidor (nó) que ele está conectado.

Quando se tem a necessidade de enviar mensagens para outros clientes conectados em outros nós, se faz necessário o uso de um servidor central (Redis no nosso caso) para fazer a comunicação entre os nós distintos.


## Iniciando

No exemplo é utilizado o Docker com Docker Compose para subir o servidor do Redis.

Execute o comando `docker-compose up -d` no diretório do projeto e aguarde a conclusão da operação. Uma vez terminado, o servidor do Redis está pronto para receber conexões, vamos agora iniciar o projeto e ver o funcionamento.

Ainda no diretório do projeto, execute o comando `node index.js` para iniciar o script e será exibido no servidor uma mensagem similar à `Worker 3886 started at port 3000`.


## Utilizando

Pronto, agora é só acessar em seu navegador o endereço `http://127.0.0.1:3000/?server=http://127.0.0.1:3000` do servidor e uma página HTML em branco será exibida.

Abra a ferramento de desenvolvedor no navegador e na aba console você verá a mensagem "Estou conectado".

Perceba que no console do servidor será exibida uma mensagem dizendo que um cliente se conectou e o ID do cliente, copie este ID.

Em outra aba do navegador abra o mesmo endereço para abrir outra conexão de socket.

No console da nova aba, digite o comando:

```js
sendMessage({ from: null, to: '<ID copiado do console do servidor>', message: 'Sua mensagem personalizada' });
```

Exemplo:

```js
sendMessage({ from: null, to: '7hAwZIofMlPYDSYKAAAA', message: 'testando o envio de mensagen' });
```

e observe que na outra aba, no console será exibido a mensagem recebida.


## Fazendo uso do Redis

Até agora iniciamos apenas um servidor e a comunicação acontece de forma local, vamos simular outro servidor agora e ver o funcionamento do script com o Redis.

Abra outro terminal no diretório do projeto e digite o comando:

```shell
$ PORT=3001 node index.js`
```

Pronto, é como se tivéssemos outro servidor de aplicação, aguardando conexões dos clientes.

Abra o navegador no endereço do novo servidor `http://127.0.0.1:3001/?server=http://127.0.0.1:3001` e abra novamente o console, como fizemos nos passos anteriores.

Digite no console o mesmo comando do exemplo anterior:

```js
sendMessage({ from: null, to: '7hAwZIofMlPYDSYKAAAA', message: 'testando o envio de mensagen' });
```

e você verá que a mensagem será recebida normalmente pelo outro cliente, mas perceba agora que no console do servidor, é exibido uma mensagem similar a `[4565] Message received from servers`, isso indica que o servidor recebeu a mensagem vinda do servidor do Redis, verificou a existência da conexão local (pelo ID do Socket) e fez o `.emit()` para o cliente.


## Como funciona

Uma vez que as conexões estão no mesmo servidor, o script verifica isso e faz a emissão a mensagem diretamente para a conexão do cliente.

Quando os clientes estão conectados em servidores separados, quando o script recebe uma mensagem de um cliente, ele verifica se este ID existe de forma local, caso contrário, faz um `publish` no canal do servidor Redis, que por sua vez distriui a mensagem para todos os outros servidores conectados no mesmo canal.

Quando o servidor recebe a mensagem do Redis, verifica pelo ID a existência da conexão do cliente, caso não exista, não faz absolutamente nada, agora se existe, faz envio de mensagem recebida para o cliente, utilizando da conexão aberta.


## Contato

Qualquer dúvida quanto ao funcionamento do projeto, entre em contato pelo e-mail: `edvaldoszy@gmail.com`.

Abraços, até mais.
