(function() {
    var btnImages = document.getElementById('btn-choose-images');
    var inputImages = document.getElementById('images');
    var spanImages = document.getElementById('images-chosen');
    var previewContainer = document.getElementById('images-preview');
    var currentUrls = [];
    if (btnImages && inputImages) {
        btnImages.addEventListener('click', function() { inputImages.click(); });
        inputImages.addEventListener('change', function() {
            currentUrls.forEach(function(u) { URL.revokeObjectURL(u); });
            currentUrls = [];
            if (previewContainer) previewContainer.innerHTML = '';
            var n = this.files.length;
            if (spanImages) spanImages.textContent = n > 0 ? n + ' file(s) chosen' : '';
            for (var i = 0; i < n; i++) {
                var file = this.files[i];
                if (!file.type.match('^image/')) continue;
                var url = URL.createObjectURL(file);
                currentUrls.push(url);
                var img = document.createElement('img');
                img.src = url;
                img.alt = 'Preview';
                img.className = 'img-thumbnail';
                img.style.maxWidth = '120px';
                img.style.maxHeight = '120px';
                img.style.objectFit = 'cover';
                if (previewContainer) previewContainer.appendChild(img);
            }
        });
    }

    document.querySelectorAll('.favorite-btn').forEach(function(btn) {
        btn.addEventListener('click', function() {
            var id = this.getAttribute('data-id');
            fetch('/admin/social/' + id + '/favorite', { method: 'POST', headers: {'Content-Type': 'application/json'} })
                .then(function(res) { return res.json(); })
                .then(function(data) {
                    var icon = this.querySelector('i');
                    if (data.favorite) {
                        icon.classList.remove('bi-star');
                        icon.classList.add('bi-star-fill', 'text-warning');
                    } else {
                        icon.classList.add('bi-star');
                        icon.classList.remove('bi-star-fill', 'text-warning');
                    }
                }.bind(this));
        });
    });

    document.querySelectorAll('.reaction-btn').forEach(function(btn) {
        btn.addEventListener('click', function() {
            var id = this.getAttribute('data-id');
            var type = this.getAttribute('data-type');
            var card = this.closest('.post-card');
            card.querySelectorAll('.reaction-btn').forEach(function(b) { b.classList.remove('active-reaction'); });
            this.classList.add('active-reaction');
            fetch('/admin/social/' + id + '/reaction', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({type: type})
            })
                .then(function(res) { return res.json(); })
                .then(function(data) {
                    card.querySelectorAll('.reaction-count').forEach(function(span) {
                        var t = span.getAttribute('data-type');
                        var count = data.reactions.filter(function(r) { return r.type === t; }).length;
                        span.textContent = count;
                    });
                    var totalText = card.querySelector('.reaction-total-text');
                    if (totalText) {
                        totalText.innerHTML = '<span class="reaction-total">' + data.reactions.length + '</span> ' + (data.reactions.length === 1 ? 'person' : 'people') + ' reacted';
                    }
                });
        });
    });

    document.querySelectorAll('.delete-post-btn').forEach(function(btn) {
        btn.addEventListener('click', function() {
            var id = this.getAttribute('data-id');
            if (!confirm('Delete this post?')) return;
            fetch('/admin/social/' + id, { method: 'DELETE' })
                .then(function(res) { return res.json(); })
                .then(function(data) {
                    if (data.msg === 'Post deleted') this.closest('.post-card').remove();
                    else alert(data.msg || 'Something went wrong');
                }.bind(this));
        });
    });

    document.addEventListener('click', function(e) {
        var btn = e.target.closest('.reply-toggle-btn');
        if (btn) {
            var wrap = btn.closest('.comment-block').querySelector('.reply-form-wrap');
            if (wrap) wrap.classList.toggle('d-none');
        }
        var commentsToggle = e.target.closest('.comments-toggle-btn');
        if (commentsToggle) {
            var section = commentsToggle.closest('.comments-section');
            if (section) section.classList.toggle('comments-collapsed');
            var expanded = !section.classList.contains('comments-collapsed');
            if (commentsToggle.getAttribute) commentsToggle.setAttribute('aria-expanded', expanded);
        }
    });

    document.addEventListener('submit', function(e) {
        var form = e.target.closest('.reply-form');
        if (!form) return;
        e.preventDefault();
        var commentBlock = form.closest('.comment-block');
        var parentId = commentBlock.getAttribute('data-comment-id');
        var section = form.closest('.comments');
        var postId = section.getAttribute('data-post-id');
        var input = form.querySelector('.reply-input');
        var text = input && input.value ? input.value.trim() : '';
        if (!text) return;
        fetch('/admin/social/' + postId + '/comment', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({text: text, parent: parentId})
        })
            .then(function(res) { return res.json(); })
            .then(function(data) {
                if (data.comment) {
                    var repliesEl = commentBlock.querySelector('.replies');
                    if (!repliesEl) {
                        repliesEl = document.createElement('div');
                        repliesEl.className = 'replies ms-3 mt-1';
                        commentBlock.appendChild(repliesEl);
                    }
                    appendCommentRow(repliesEl, data.comment, parentId);
                    if (section) updateCommentsCount(section);
                }
                input.value = '';
                form.closest('.reply-form-wrap').classList.add('d-none');
            })
            .catch(function() { alert('Could not add reply.'); });
    });

    document.querySelectorAll('.comment-form').forEach(function(form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            var section = this.closest('.comments');
            var postId = section.getAttribute('data-post-id');
            var input = this.querySelector('.comment-input');
            var text = input.value.trim();
            if (!text) return;
            fetch('/admin/social/' + postId + '/comment', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({text: text})
            })
                .then(function(res) { return res.json(); })
                .then(function(data) {
                    if (data.comment) {
                        appendCommentRow(section.querySelector('.comment-list'), data.comment, null);
                        updateCommentsCount(section);
                    }
                    input.value = '';
                })
                .catch(function() { alert('Could not add comment.'); });
        });
    });

    function updateCommentsCount(section) {
        if (!section) return;
        var countEl = section.querySelector('.comments-count');
        if (!countEl) return;
        var blocks = section.querySelectorAll('.comment-block');
        countEl.textContent = '(' + blocks.length + ')';
    }

    function appendCommentRow(container, comment, parentId) {
        var section = container.closest('.comments-section');
        var isPostOwner = section && section.getAttribute('data-post-owner-id') === section.getAttribute('data-current-user-id');
        var block = document.createElement('div');
        block.className = 'comment-block mb-2';
        block.setAttribute('data-comment-id', comment._id);
        block.setAttribute('data-parent-id', parentId || '');
        var reactionCounts = { like: 0, love: 0, laugh: 0, wow: 0, sad: 0, angry: 0 };
        (comment.reactions || []).forEach(function(r) { reactionCounts[r.type] = (reactionCounts[r.type] || 0) + 1; });
        var dateStr = comment.createdAt ? new Date(comment.createdAt).toLocaleString() : '';
        var iconMap = { like: 'hand-thumbs-up', love: 'heart', laugh: 'emoji-laughing', wow: 'emoji-surprise', sad: 'emoji-frown', angry: 'emoji-angry' };
        var countsHtml = ['like', 'love', 'laugh', 'wow', 'sad', 'angry'].map(function(t) {
            return '<button type="button" class="btn btn-sm btn-outline-secondary p-1 comment-reaction-btn" data-comment-id="' + comment._id + '" data-type="' + t + '" title="' + t + '"><i class="bi bi-' + iconMap[t] + '"></i><span class="comment-reaction-count" data-type="' + t + '">' + (reactionCounts[t] || 0) + '</span></button>';
        }).join('');
        var replyPart = !parentId ? '<button type="button" class="btn btn-link btn-sm p-0 reply-toggle-btn">Reply</button>' : '';
        var deleteBtnHtml = isPostOwner ? '<button type="button" class="btn btn-link btn-sm p-0 text-danger delete-comment-btn" data-comment-id="' + comment._id + '"><i class="bi bi-trash"></i></button>' : '';
        block.innerHTML = '<div class="comment-row d-flex justify-content-between align-items-start flex-wrap gap-1 p-2 rounded bg-light"><div class="d-flex flex-column"><span class="fw-semibold small">' + comment.author.username + '</span><span class="small">' + comment.text + '</span><span class="small text-muted">' + dateStr + '</span></div><div class="d-flex align-items-center gap-1"><div class="comment-reactions d-flex flex-wrap gap-1">' + countsHtml + '</div>' + replyPart + deleteBtnHtml + '</div></div>' + (!parentId ? '<div class="reply-form-wrap d-none mt-1 ms-3"><form class="reply-form d-flex gap-2"><input type="text" class="form-control form-control-sm reply-input" placeholder="Reply..." name="text"><button type="submit" class="btn btn-sm btn-primary">Send</button></form></div><div class="replies ms-3 mt-1"></div>' : '');
        container.appendChild(block);
        bindCommentReactionButtons(block);
        bindDeleteCommentButtons(block);
    }

    function bindCommentReactionButtons(scope) {
        (scope || document).querySelectorAll('.comment-reaction-btn').forEach(function(btn) {
            if (btn._bound) return;
            btn._bound = true;
            btn.addEventListener('click', function() {
                var cid = this.getAttribute('data-comment-id');
                var type = this.getAttribute('data-type');
                fetch('/admin/social/comment/' + cid + '/reaction', { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({type: type}) })
                    .then(function(res) { return res.json(); })
                    .then(function(data) {
                        var block = this.closest('.comment-block');
                        block.querySelectorAll('.comment-reaction-count').forEach(function(span) {
                            var t = span.getAttribute('data-type');
                            var count = (data.reactions || []).filter(function(r) { return r.type === t; }).length;
                            span.textContent = count;
                        });
                    }.bind(this));
            });
        });
    }

    function bindDeleteCommentButtons(scope) {
        (scope || document).querySelectorAll('.delete-comment-btn').forEach(function(btn) {
            if (btn._bound) return;
            btn._bound = true;
            btn.addEventListener('click', function() {
                var cid = this.getAttribute('data-comment-id');
                var section = this.closest('.comments-section');
                fetch('/admin/social/comment/' + cid, { method: 'DELETE' })
                    .then(function(res) { return res.json(); })
                    .then(function(data) {
                        if (data.msg === 'Comment deleted') {
                            this.closest('.comment-block').remove();
                            updateCommentsCount(section);
                        } else alert(data.msg || 'Something went wrong');
                    }.bind(this));
            });
        });
    }

    bindCommentReactionButtons();
    bindDeleteCommentButtons();
})();
