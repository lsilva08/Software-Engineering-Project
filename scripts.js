let users = []
let page = 1
let totalPages = 0
let actualAction = ""

$(document).ready(function () {

    $('#userModal').on('hidden.bs.modal', function (e) {
        fillForm({ id: ' ', firstName: ' ', lastName: ' ', email: ' ' })
    })

    getUsers();

});

function getUsers() {
    fetch(`http://localhost:5000/users?page=${page}`)
        .then(response => {
            if (response.status === 400) {
                page--
                reloadData()
                return Promise.reject();
            }
            return response.json()
        })
        .then(body => {
            totalPages = body.pages
            users = [...body.data]
            const tbody = $('#user-table-body')

            if (users.length) {
                users.forEach(user => {
                    tbody.append(`
                        <tr>
                            <th scope="row">${user.id}</th>
                            <td>${user.firstName}</td>
                            <td>${user.lastName}</td>
                            <td>${user.email}</td>
                            <td>
                            <ion-icon name="create-outline" class="action-icon edit-icon" data-toggle="modal"
                                data-target="#userModal" onclick="editUser(${user.id})"></ion-icon>
                            <ion-icon name="trash-outline" class="action-icon delete-icon" onclick="remove(${user.id})"></ion-icon>
                            </td>
                        </tr >
                    `)
                });
            } else {
                tbody.append(`
                    <tr>
                        <td class="no-users-alert" colspan="5">
                            There is no users
                        </td>
                    </tr>
                `)
            }

            const paginationButtons = $('#pagination-buttons')
            for (let i = 1; i <= totalPages; i++) {
                paginationButtons.append(`
                    <button type="button" class="btn btn-secondary" onclick="changePage(${i})">${i}</button>
                `)
            }


        })
}

function changePage(nextPage) {
    page = nextPage
    reloadData()
}

function createUser() {
    actualAction = "create"
    changeModalTitle('New Stock')
}

function editUser(id) {
    actualAction = "update"
    const user = users.find(user => user.id === id)
    changeModalTitle(`${user.firstName} ${user.lastName}`)
    fillForm(user)
}

function changeModalTitle(text) {
    $('#userModalLabel').html(text)
}

function fillForm({ id, firstName, lastName, email }) {
    $('#userIdInput').val(id)
    $('#firstNameInput').val(firstName)
    $('#lastNameInput').val(lastName)
    $('#emailInput').val(email)
}

function saveChanges() {

    var firstName = $('#firstNameInput').val()
    var lastName = $('#lastNameInput').val()
    var email = $('#emailInput').val()

    const user = { firstName, lastName, email }

    const id = $('#userIdInput').val()

    const url = actualAction === 'create' ? 'http://localhost:5000/users' : `http://localhost:5000/users/${id}`
    const method = actualAction === 'create' ? 'post' : 'put'

    fetch(url, {
        method,
        headers: {
            'Accept': 'application/json, text/plain, /',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(user)
    }).then(res => res.json())
        .then(() => closeModalAndReloadData());
}

function remove(id) {

    fetch(`http://localhost:5000/users/${id}`, {
        method: 'delete',
        headers: {
            'Accept': 'application/json, text/plain, /',
            'Content-Type': 'application/json'
        },
    }).then(() => closeModalAndReloadData())
}


function closeModalAndReloadData() {
    $('#userModal').modal('hide')
    reloadData()
}

function reloadData() {
    $('#pagination-buttons').html('')
    $('#user-table-body').html('')
    getUsers()
}
