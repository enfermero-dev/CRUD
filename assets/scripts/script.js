function init() {
    loadUserInfo();
    loadTableData();
}

function loadUserInfo(){
    // Load username from localstorage
    const userNameText = document.getElementById('userName');
    const savedUserName = localStorage.getItem('userName')
    userNameText.value = savedUserName;
    console.log('Loaded username ' + savedUserName);
    // If there is a user name, salute properly
    if (savedUserName) {document.getElementById('welcome').innerHTML = `Bienvenido,  ${savedUserName}`};
    // Now, put a listener to save this value on text change
    userNameText.addEventListener('keyup', saveUserName);
}

function loadTableData(){
    let savedTableData = localStorage.getItem('tableData');
    const dataTable = document.getElementById('data');
    if (savedTableData) {
        // Parse the saved data
        console.log('Found data, parsing')
        let parsedData = JSON.parse(savedTableData);
        for (let n = 0; n < parsedData.length; n++) {
            let row = document.createElement('tr');
            for (let key in parsedData[n]) {
                let cell = document.createElement('td');
                let cellText = document.createTextNode(parsedData[n][key]);
                cell.appendChild(cellText);
                row.appendChild(cell);
            }
            dataTable.appendChild(row);
        }
    } else {
        // No data saved
        console.log('No data found, creating placeholder text')
        let newRow = document.createElement('tr');
        newRow.id = "placeholder-text";
        newRow.className = "placeholder-text";
        let newCell = document.createElement('td');
        newCell.colSpan = 4;
        let cellText = document.createTextNode('Agregue un elemento haciendo click en "Agregar"');
        newCell.appendChild(cellText);
        newRow.appendChild(newCell);
        dataTable.appendChild(newRow);
    }
}

function saveUserName() {
    const userNameText = document.getElementById('userName');
    let newValue = userNameText.value;
    localStorage.setItem('userName',newValue);
    console.log('Saved ' + newValue);
    if (newValue) {document.getElementById('welcome').innerHTML = `Bienvenido,  ${newValue}`} else {document.getElementById('welcome').innerHTML = 'Bienvenido'};
}

init();