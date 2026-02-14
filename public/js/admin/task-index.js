(function() {
    var descBtns = document.querySelectorAll('.btn-decs');
    var deleteBtns = document.querySelectorAll('.delete-btns');
    deleteBtns.forEach(function(btn) {
        btn.addEventListener('click', deleteTask);
    });
    descBtns.forEach(function(btn) {
        btn.addEventListener('click', showDescription);
    });

    function deleteTask(e) {
        var id = e.target.getAttribute('data-id');
        fetch('/admin/task/' + id, { method: 'DELETE' })
            .then(function(res) { return res.json(); })
            .then(function(data) {
                if (data.msg === 'Task deleted successfully') {
                    location.reload();
                } else {
                    alert('Something went wrong');
                }
            });
    }

    function showDescription(e) {
        var desc = e.target.getAttribute('data-description');
        var modalEl = document.getElementById('exampleModal');
        if (!modalEl || typeof bootstrap === 'undefined') return;
        var modal = new bootstrap.Modal(modalEl);
        var title = document.querySelector('.modal-title');
        var body = document.querySelector('.modal-body');
        if (title) title.innerText = 'Description';
        if (body) body.innerText = desc;
        modal.show();
    }
})();
