(async function () {
	const conversationSelector = document.querySelector('#conversationSelector');
	const activeUserName = document.querySelector('#activeUserName');
	const conversationList = document.querySelector('#conversationList');
	const chatMessagesContainer = document.querySelector('#chatMessages');
	const messageInput = document.querySelector('#messageInput');
	const sendBtn = document.querySelector('#sendBtn');

	let conversations = await getConversations();

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
	socket.on('receive_message', ({ conversationId, from, to, newMessage, participants }) => {
		if (isAdminMessagesPage()) {
			const convo = conversations.find((c) => c._id === conversationId);

			if (convo) {
				if (activeConversation?._id === conversationId) {
					convo.messages.push(newMessage);
					renderMessages();
				} else {
					convo.hasUnread = true;
				}
			} else {
				const newConvo = {
					_id: conversationId,
					participants,
					from,
					to,
					messages: [newMessage],
				};
				conversations.push(newConvo);
				activeConversation = newConvo;

				if (user.username !== from.username) {
					activeUserName.textContent = from.username;
				}

				renderMessages();
			}

			renderConversations();
		} else {
			// @todo: Add red circle on Messages tab in the sidebar. CONTINUE FROM HERE!
		}
	});

	if (isAdminMessagesPage()) {
		conversationSelector.addEventListener('input', async function () {
			const userId = this.value;
			const username = this.options[this.selectedIndex].text;

			const convo = conversations?.find((c) =>
				c?.participants?.find((p) => p?._id === userId)
			);

			if (convo) {
				convo.hasUnread = false;
				activeConversation = convo;

				const messages = await getConversationMessages(convo._id);
				activeConversation.messages = messages;
			} else {
				activeConversation = {
					participants: [
						{ _id: user.id, username: user.username },
						{ _id: userId, username },
					],
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
	}

	// Functions
	function renderConversations() {
		if (!isAdminMessagesPage()) return;

		conversationList.innerHTML = '';

		conversations.forEach((convo) => {
			const btn = document.createElement('button');

			const reciverParticipant = convo.participants.find((p) => p._id !== user.id);

			btn.className = `list-group-item list-group-item-action`;
			btn.textContent = reciverParticipant.username;

			if (convo._id === activeConversation?._id) {
				btn.classList.add('active');
			}

			if (convo.hasUnread) {
				btn.classList.add('conversation-btn');
			}

			btn.onclick = async function () {
				convo.hasUnread = false;
				activeConversation = convo;

				activeUserName.textContent = reciverParticipant.username;

				const messages = await getConversationMessages(convo._id);

				activeConversation.messages = messages;

				btn.classList.remove('conversation-btn');

				renderConversations();
				renderMessages();
			};

			conversationList.appendChild(btn);
		});
	}

	// @todo: Rethink. Maybe send messages as argument to the renderMessages
	function renderMessages() {
		if (!isAdminMessagesPage()) return;

		chatMessagesContainer.innerHTML = '';

		activeConversation.messages.forEach((msg) => {
			const wrapper = document.createElement('div');
			wrapper.className = `d-flex mb-2 ${msg.sender._id === user.id ? 'justify-content-end' : 'justify-content-start'}`;

			wrapper.innerHTML = `
							<div class="p-2 rounded ${msg.sender._id === user.id ? 'bg-primary text-white' : 'bg-white border'}" style="max-width: 70%;">
								${msg.text}
							</div>
						`;

			chatMessagesContainer.appendChild(wrapper);
		});

		chatMessagesContainer.scrollTop = chatMessagesContainer.scrollHeight;
	}

	function sendMessage() {
		if (!isAdminMessagesPage()) return;

		const text = messageInput.value.trim();

		if (!activeConversation?.participants?.length) {
			return;
		}

		const reciver = activeConversation.participants.find((p) => p._id !== user.id);

		if (!text?.length || !reciver?._id) {
			return;
		}

		socket.emit('private_message', {
			conversationId: activeConversation._id,
			to: { userId: reciver._id, username: reciver.username },
			message: text, // @todo: Change message to text
		});

		messageInput.value = '';
	}

	function getSessionUser() {
		return fetch('/user').then((res) => res.json());
	}

	async function getConversations() {
		return fetch('/admin/conversation').then((res) => res.json());
	}

	async function getConversationMessages(conversationId) {
		if (!conversationId) {
			return [];
		}

		return fetch(`/admin/message/${conversationId}`).then((res) => res.json());
	}

	function isAdminMessagesPage() {
		return window.location.pathname === '/admin/messages';
	}

	renderConversations();
})();
