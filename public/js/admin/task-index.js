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
        var modalEl = document.getElementById('exampleModal');
        if (!modalEl || typeof bootstrap === 'undefined') return;
        var modal = new bootstrap.Modal(modalEl);
        var title = document.querySelector('.modal-title');
        var body = document.querySelector('.modal-body');
        var closeBtn = document.getElementById('modal-close');
        var saveBtn = document.getElementById('modal-save');
        closeBtn.innerText = "Odustani";
        saveBtn.innerText = "Potvrdi";
        saveBtn.classList.remove("d-none");
        if (title) title.innerText = 'Potvrda brisanja';
        if (body) body.innerText = "Da li ste sigurni da zelite da obrišete task?";
        modal.show();

        saveBtn.addEventListener('click', () => {
            if (!id) return;

        fetch('/admin/task/' + id, { method: 'DELETE' })
            .then(function(res) { return res.json(); })
            .then(function(data) {
                if (data.msg === 'Task deleted successfully') {
                    location.reload();
                } else {
                    alert('Something went wrong');
                }
            });
            modal.hide();
        })
    }

    function showDescription(e) {
        var desc = e.target.getAttribute('data-description');
        var modalEl = document.getElementById('exampleModal');
        if (!modalEl || typeof bootstrap === 'undefined') return;
        var modal = new bootstrap.Modal(modalEl);
        var title = document.querySelector('.modal-title');
        var body = document.querySelector('.modal-body');
        var closeBtn = document.getElementById('modal-close');
        var saveBtn = document.getElementById('modal-save');

        if (title) title.innerText = 'Description';
        if (body) body.innerText = desc;
        closeBtn.innerText = "Close";
        saveBtn.innerText = "Save changes";
        saveBtn.classList.add("d-none");
        modal.show();
    }
})();
