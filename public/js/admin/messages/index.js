(async function () {
	const conversationSelector = document.querySelector('#conversationSelector');
	const activeUserName = document.querySelector('#activeUserName');
	const conversationList = document.querySelector('#conversationList');
	const chatMessagesContainer = document.querySelector('#chatMessages');
	const messageTextArea = document.querySelector('#messageTextArea');
	const sendBtn = document.querySelector('#sendBtn');

	let conversations = await getConversations();

	if (!isAdminMessagesPage()) {
		updateUnreadIndicator(conversations);
	}

	const user = await getSessionUser();

	if (!user?.id) {
		throw new Error('Unauthorized');
	}

	const socket = io(window.location.host); // Defaults to window.location.host
	let activeConversation = null;

	// Listeners
	socket.on('connect', () => {
		console.log('WS Connected:', socket.id);
	});

	// new messages arrive here
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
			const sidebarMessagesTab = document.getElementById('messages-tab');
			sidebarMessagesTab.classList.add('unread-message');
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
		messageTextArea.addEventListener('input', () => {
			// this handles textarea vertical grow
			messageTextArea.style.height = 'auto';
			messageTextArea.style.height = messageTextArea.scrollHeight + 'px';

			// this will scroll the messages container to the last message on the textarea height expand
			chatMessagesContainer.scrollTop = chatMessagesContainer.scrollHeight;
		});
	}

	// Functions
	function renderConversations() {
		if (!isAdminMessagesPage()) return;

		conversationList.innerHTML = '';

		conversations.forEach((convo) => {
			const btn = document.createElement('button');

			const reciver = convo.participants.find((p) => p._id !== user.id);

			btn.className = `list-group-item list-group-item-action`;
			btn.textContent = reciver.username;

			if (convo._id === activeConversation?._id) {
				btn.classList.add('active');
			}

			if (convo.hasUnread) {
				btn.classList.add('unread-message');
			}

			btn.onclick = async function () {
				convo.hasUnread = false;
				activeConversation = convo;

				activeUserName.textContent = reciver.username;

				const messages = await getConversationMessages(convo._id);

				activeConversation.messages = messages;

				btn.classList.remove('unread-message');

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

		// @todo: The messages arr can expand a lot over time. Add virtualization or load the last {{n}} messages.
		activeConversation.messages.forEach((msg) => {
			const wrapper = document.createElement('div');

			const isMineMessage = msg.sender._id === user.id;

			wrapper.className = `d-flex mb-2 ${isMineMessage ? 'justify-content-end' : 'justify-content-start'}`;
			wrapper.innerHTML = `
						<div class="rounded ${isMineMessage ? 'bg-primary text-white' : 'bg-white border'}" style="max-width: 70%;">
							<div class="small fw-bold border-bottom px-2 pb-1 pt-1 ${isMineMessage ? 'text-end text-white border-info' : 'text-start text-muted border-secondary'}" style="font-size: 0.75rem;">
								${isMineMessage ? 'You' : msg.sender.username}
							</div>
							<div class="p-2 message-text">${msg.text}</div>
						</div>
						`;

			chatMessagesContainer.appendChild(wrapper);
		});

		chatMessagesContainer.scrollTop = chatMessagesContainer.scrollHeight;
	}

	function sendMessage() {
		if (!isAdminMessagesPage()) return;

		const text = messageTextArea.value?.trim();

		if (!activeConversation?.participants?.length || !text?.length) {
			return;
		}

		const reciver = activeConversation.participants.find((p) => p._id !== user.id);

		if (!reciver?._id) {
			return;
		}

		socket.emit('private_message', {
			conversationId: activeConversation._id,
			to: { userId: reciver._id, username: reciver.username },
			message: text, // @todo: Change message to text
		});

		messageTextArea.value = '';
		messageTextArea.style.height = 'auto';
		messageTextArea.focus();
	}

	renderConversations();
})();
