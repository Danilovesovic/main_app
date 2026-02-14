const http = require('http');
const { Server } = require('socket.io');
const express = require('express');
const session = require('express-session');
const router = require('./router');
const db = require('./database');
const app = express();

const server = http.createServer(app);
const io = new Server(server);

app.use(
	session({
		secret: 'keyboard cat',
		resave: false,
		saveUninitialized: true,
		cookie: { secure: false },
	})
);

app.set('view engine', 'ejs');
app.set('view options', { root: __dirname + '/views' });
app.use(express.static('public'));
app.use(express.static(__dirname + "/node_modules/bootstrap/dist/css/"));
app.use(express.static(__dirname + "/node_modules/bootstrap-icons/font/"));
app.use(express.static(__dirname + "/node_modules/jquery/dist/"));
app.use(express.static(__dirname + "/node_modules/socket.io/client-dist/"));
app.use(express.urlencoded({extended: true}));
app.use(express.json());

app.use('/', router);

server.listen(3000, function () {
	console.log('Server is running on port 3000');
});

const onlineUsers = new Map();

io.on('connection', (socket) => {
	// console.log('connection');

	socket.on('disconnect', () => {
		// console.log('disconnect ', socket.id);
		// @todo: Remove user from onlineUsers on disconnect
	});

	socket.on('register', (user) => {
		// console.log('register ', user);

		// socket.user = user;
		onlineUsers.set(user.id, socket.id);
	});

	socket.on('private_message', (private_message) => {
		// console.log('private_message ', private_message);

		const { from, to, message } = private_message;

		const sendTo = [onlineUsers.get(from.userId), onlineUsers.get(to.userId)].filter(Boolean);
		const conversationId = [from.userId, to.userId].sort().join('_');
		const participants = [from.userId, to.userId];

		// @note: Continue from here.
		// @todo: Store transferred messages through this socket in the DB
		// @todo: Create Mongoose Conversation model. Maybe something like the following
		////   conversationId: '', ???????
		////   participants: ['', ''],
		////   from: {userId: '', username: ''}
		////   to: {userId: '', username: ''}
		////   messages: [{ sender: '', text: '' }],
		// @todo: Rethink to store "from" and "to" within "message" obj
		// @todo: move "from" obj within "participants" arr and try to normalize who send a message check
		// @todo: move "to" obj within "participants" arr and try to normalize who send a message check

		io.to(sendTo).emit('receive_message', {
			conversationId,
			from,
			to,
			message,
			participants,
		});
	});
});
