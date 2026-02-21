const http = require('http');
const { Server } = require('socket.io');
const express = require('express');
const session = require('express-session');
const router = require('./router');
const db = require('./database');
const Conversation = require('./models/Conversation');
const Message = require('./models/Message');
const app = express();

const server = http.createServer(app);
const io = new Server(server);

const withSession = session({
	secret: 'keyboard cat',
	resave: false,
	saveUninitialized: true,
	cookie: { secure: false },
});

app.use(withSession);

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

server.listen(3300, function () {
	console.log('Server is running on port 3000');
});

io.use((socket, next) => withSession(socket.request, {}, next));
io.use((socket, next) => {
	const user = socket.request.session?.user;

	if (!user?._id) {
		return next(new Error('Unauthorized'));
	}

	socket.user = user;
	next();
});

io.on('connection', (socket) => {
	// console.log('connection');

	const userId = socket.user._id.toString();
	socket.join(userId);

	socket.on('disconnect', () => {
		// console.log('disconnect');
	});

	socket.on('private_message', async (private_message) => {
		// console.log('private_message ', private_message);

		const { to, message, conversationId } = private_message;
		const fromUser = socket.user;

		const participants = [fromUser._id, to.userId].sort();

		/*  */
		let conversation = await Conversation.findOne({ _id: conversationId });

		if (!conversation?._id) {
			conversation = await Conversation.create({
				participants,
				lastReadAt: participants.map((userId) => ({
					user: userId,
					date: new Date(),
				})),
			});
		}

		const newMessage = await Message.create({
			conversation: conversation._id,
			sender: fromUser._id,
			text: message,
		});
		await newMessage.populate('sender', 'username');

		await Conversation.findByIdAndUpdate(conversation._id, {
			lastMessage: newMessage._id,
			updatedAt: new Date(),
		});
		/*  */

		const sendTo = [fromUser._id.toString(), to.userId.toString()]

		io.to(sendTo).emit('receive_message', {
			conversationId: conversation._id,
			from: { userId: fromUser._id, username: fromUser.username },
			to, // @todo: Remove this "to". Looks is unnecessary here
			newMessage,
			participants: [
				{ _id: fromUser._id, username: fromUser.username },
				{ _id: to.userId, username: to.username },
			],
		});
	});
});
