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

function updateUnreadIndicator(conversations) {
	const hasUnreadMessages = conversations?.some((c) => c?.hasUnread);

	if (!hasUnreadMessages) return;

	const sidebarMessagesTab = document.getElementById('messages-tab');

	if (!sidebarMessagesTab) return;

	sidebarMessagesTab.classList.add('unread-message');
}
