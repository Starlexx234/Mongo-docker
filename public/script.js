document.addEventListener('DOMContentLoaded', function() {
    const outputDiv = document.getElementById('output');
    const loginForm = document.getElementById('loginForm');
    const logoutButton = document.getElementById('logoutButton');
    const employeeSection = document.getElementById('employeeSection');
    const updateEmployeeForm = document.getElementById('updateEmployeeForm');
    const errorMessage = document.createElement('div');
    errorMessage.style.color = 'red';
    loginForm.appendChild(errorMessage);

    function displayEmployees() {
        fetch('/employees')
            .then(response => response.json())
            .then(data => {
                outputDiv.innerHTML = '<h2>Employees</h2>';
                data.forEach(employee => {
                    const employeeDiv = document.createElement('div');
                    employeeDiv.innerHTML = `<p>${employee.name} - ${employee.position} - ${employee.department}</p>`;
                    
                    const deleteButton = document.createElement('button');
                    deleteButton.textContent = 'Delete';
                    deleteButton.onclick = function() {
                        deleteEmployee(employee._id);
                    };
                    
                    const updateButton = document.createElement('button');
                    updateButton.textContent = 'Update';
                    updateButton.onclick = function() {
                        updateEmployeeForm.style.display = 'block';
                        document.getElementById('updateId').value = employee._id;
                        document.getElementById('updateName').value = employee.name;
                        document.getElementById('updatePosition').value = employee.position;
                        document.getElementById('updateDepartment').value = employee.department;
                    };
    
                    employeeDiv.appendChild(deleteButton);
                    employeeDiv.appendChild(updateButton);
                    outputDiv.appendChild(employeeDiv);
                });
            })
            .catch(error => console.error('Error:', error));
    }

    function addEmployee(name, position, department) {
        fetch('/employees', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, position, department })
        })
        .then(response => response.json())
        .then(data => {
            console.log('New employee added:', data);
            displayEmployees();
        })
        .catch(error => console.error('Error:', error));
    }

    window.deleteEmployee = function(id) {
        fetch(`/employees/${id}`, {
            method: 'DELETE'
        })
        .then(response => response.json())
        .then(data => {
            console.log(data.message);
            displayEmployees();
        })
        .catch(error => console.error('Error:', error));
    }

    window.showUpdateForm = function(id, name, position, department) {
        document.getElementById('updateId').value = id;
        document.getElementById('updateName').value = name;
        document.getElementById('updatePosition').value = position;
        document.getElementById('updateDepartment').value = department;
        updateEmployeeForm.style.display = 'block';
    }

    function updateEmployee(id, name, position, department) {
        fetch(`/employees/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, position, department })
        })
        .then(response => response.json())
        .then(data => {
            console.log('Employee updated:', data);
            updateEmployeeForm.style.display = 'none';
            displayEmployees();
        })
        .catch(error => console.error('Error:', error));
    }

    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        fetch('/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                console.log(data.message);
                employeeSection.style.display = 'block';
                loginForm.style.display = 'none';
                logoutButton.style.display = 'block';
                displayEmployees();
            } else {
                errorMessage.textContent = data.message;
            }
        })
        .catch(error => {
            console.error('Error:', error);
            errorMessage.textContent = 'An error occurred. Please try again.';
        });
    });

    logoutButton.addEventListener('click', function() {
        fetch('/logout', {
            method: 'POST'
        })
        .then(response => response.json())
        .then(data => {
            console.log(data.message);
            employeeSection.style.display = 'none';
            loginForm.style.display = 'block';
            logoutButton.style.display = 'none';
        })
        .catch(error => console.error('Error:', error));
    });

    document.getElementById('addEmployeeForm').addEventListener('submit', function(e) {
        e.preventDefault();
        const name = document.getElementById('name').value;
        const position = document.getElementById('position').value;
        const department = document.getElementById('department').value;
        addEmployee(name, position, department);
    });

    document.getElementById('updateEmployeeForm').addEventListener('submit', function(e) {
        e.preventDefault();
        const id = document.getElementById('updateId').value;
        const name = document.getElementById('updateName').value;
        const position = document.getElementById('updatePosition').value;
        const department = document.getElementById('updateDepartment').value;
        updateEmployee(id, name, position, department);
    });

    // Новые функции для отчетов
    function getDepartmentCountReport() {
        fetch('/report/departmentCount')
            .then(response => response.json())
            .then(data => {
                outputDiv.innerHTML = '<h2>Employee Count by Department</h2>';
                data.forEach(department => {
                    outputDiv.innerHTML += `<p>${department._id}: ${department.count}</p>`;
                });
            })
            .catch(error => console.error('Error:', error));
    }

    function getPositionCountReport() {
        fetch('/report/positionCount')
            .then(response => response.json())
            .then(data => {
                outputDiv.innerHTML = '<h2>Employee Count by Position</h2>';
                data.forEach(position => {
                    outputDiv.innerHTML += `<p>${position._id}: ${position.count}</p>`;
                });
            })
            .catch(error => console.error('Error:', error));
    }

    function getEmployeesByDepartment(department) {
        fetch(`/report/employeesByDepartment?department=${department}`)
            .then(response => response.json())
            .then(data => {
                outputDiv.innerHTML = `<h2>Employees in ${department}</h2>`;
                data.forEach(employee => {
                    outputDiv.innerHTML += `<p>${employee.name} - ${employee.position}</p>`;
                });
            })
            .catch(error => console.error('Error:', error));
    }

    // Добавим события для кнопок отчетов
    document.getElementById('departmentCountReportButton').addEventListener('click', getDepartmentCountReport);
    document.getElementById('positionCountReportButton').addEventListener('click', getPositionCountReport);
    document.getElementById('employeesByDepartmentForm').addEventListener('submit', function(e) {
        e.preventDefault();
        const department = document.getElementById('departmentFilter').value;
        if(department === ''){
            displayEmployees();
        } else {
            getEmployeesByDepartment(department);
        }
    });
});
