(async function () {
	const conversationSelector = document.querySelector('#conversationSelector');
	const activeUserName = document.querySelector('#activeUserName');
	const conversationList = document.querySelector('#conversationList');
	const chatMessagesContainer = document.querySelector('#chatMessages');
	const messageInput = document.querySelector('#messageInput');
	const sendBtn = document.querySelector('#sendBtn');

	// @todo: Fetch conversations from DB and push into "conversations" array
	let conversations = [];

	const user = await getSessionUser();

	if (!user?.id) {
		throw new Error('Unauthorized');
	}

	const socket = io(window.location.host); // Defaults to window.location.host
	let activeConversation = null;

	// Listeners
	socket.on('connect', () => {
		console.log('WS Connected:', socket.id);
		socket.emit('register', user);
	});

	// New messages arrive here
	socket.on('receive_message', ({ conversationId, from, to, message, participants }) => {
		const convo = conversations.find((c) => c.conversationId === conversationId);

		if (convo) {
			convo.messages.push({
				sender: from.userId,
				text: message,
			});

			if (activeConversation?.conversationId === conversationId) {
				renderMessages();
			}
		} else {
			const newConvo = {
				conversationId,
				participants,
				from,
				to,
				messages: [
					{
						sender: from.userId,
						text: message,
					},
				],
			};
			conversations.push(newConvo);
			activeConversation = newConvo;

			if (user.username !== from.username) {
				activeUserName.textContent = from.username;
			}

			renderConversations();
			renderMessages();
		}
	});

	conversationSelector.addEventListener('input', function () {
		const userId = this.value;
		const username = this.options[this.selectedIndex].text;

		const convo = conversations.find((c) => c?.conversationId?.includes(userId));

		if (convo) {
			activeConversation = convo;
		} else {
			activeConversation = {
				participants: [user.id, userId],
				from: {
					userId: user.id,
					username: user.username,
				},
				to: {
					userId,
					username,
				},
				messages: [],
			};
		}

		activeUserName.textContent = username;

		renderConversations();
		renderMessages();
	});

	sendBtn.addEventListener('click', sendMessage);
	messageInput.addEventListener('keypress', (e) => {
		if (e.key === 'Enter') sendMessage();
	});

	// Functions
	function renderConversations() {
		conversationList.innerHTML = '';

		conversations.forEach((convo) => {
			const btn = document.createElement('button');

			const reciverUsername =
				convo.from.username === user.username ? convo.to.username : convo.from.username;

			btn.className = `list-group-item list-group-item-action`;
			btn.textContent = reciverUsername;

			if (convo.conversationId === activeConversation.conversationId) {
				btn.classList.add('active');
			}

			btn.onclick = function () {
				activeConversation = convo;
				activeUserName.textContent = reciverUsername;

				renderConversations();
				renderMessages();
			};

			conversationList.appendChild(btn);
		});
	}

	function renderMessages() {
		chatMessagesContainer.innerHTML = '';

		activeConversation.messages.forEach((msg) => {
			const wrapper = document.createElement('div');
			wrapper.className = `d-flex mb-2 ${msg.sender === user.id ? 'justify-content-end' : 'justify-content-start'}`;

			wrapper.innerHTML = `
							<div class="p-2 rounded ${msg.sender === user.id ? 'bg-primary text-white' : 'bg-white border'}" style="max-width: 70%;">
								${msg.text}
							</div>
						`;

			chatMessagesContainer.appendChild(wrapper);
		});

		chatMessagesContainer.scrollTop = chatMessagesContainer.scrollHeight;
	}

	function sendMessage() {
		if (!activeConversation) return;

		const text = messageInput.value.trim();

		if (!text) return;

		// Get/Switch the "to" participant in this 1:1 conversation - that would be The user who is NOT currently logged in
		const to =
			activeConversation.from.userId === user.id
				? activeConversation.to
				: activeConversation.from;

		socket.emit('private_message', {
			conversationId: activeConversation.conversationId,
			to,
			message: text,
		});

		messageInput.value = '';
	}

	function getSessionUser() {
		return fetch('/user').then((res) => res.json());
	}

	renderConversations();
})();
