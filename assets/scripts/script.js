function init() {
    loadUserInfo();
    loadTableData();
    document.getElementById('btYes').addEventListener('click', saveTestingData);
    document.getElementById('btNo').addEventListener('click', hideModal);
    document.getElementById('btDelete').addEventListener('click', deleteSavedData);
    document.getElementById('btDeleteItem').addEventListener('click', deleteItem);
    document.getElementById('btAddItem').addEventListener('click', addItem);
    document.getElementById('btOk').addEventListener('click', hideModal);
    console.log('[  READY  ]\n\nCall "saveTestingData()" from console to create test data, or "deleteSavedData()" to clear local data ');
}

function loadUserInfo() {
    // Load username from localstorage
    const userNameText = document.getElementById('userName');
    const savedUserName = localStorage.getItem('userName')
    userNameText.value = savedUserName;
    console.log('Loaded username ' + savedUserName);
    // If there is a user name, salute properly
    if (savedUserName) { document.getElementById('welcome').innerHTML = `Bienvenido,  ${savedUserName}` };
    // Now, put a listener to save this value on text change
    userNameText.addEventListener('keyup', saveUserName);
}

function loadTableData() {
    let savedTableData = localStorage.getItem('tableData');
    const dataTable = document.getElementById('data');
    // console.log(savedTableData);
    if (savedTableData) {
        // Parse the saved data
        console.log('Found data, parsing')
        let parsedData = JSON.parse(savedTableData);
        console.log('- Found ' + Object.keys(parsedData).length + ' items')
        for (let n = 1; n < (Object.keys(parsedData).length) + 1; n++) {
            console.log('- Reading data # ' + n + " :: " + parsedData[n]['name'])
            let row = document.createElement('tr');
            row.id = 'element-' + n;
            row.classList.add('selectable');
            Object.keys(parsedData[n]).forEach((key) => {
                let cell = document.createElement('td');
                let cellText = document.createTextNode(parsedData[n][key]);
                cell.appendChild(cellText);
                cell.id = key;
                row.appendChild(cell);
            });
            dataTable.appendChild(row);
            // Make it selectable
            document.getElementById('element-' + n).addEventListener('click', selectWrapperFn);
        }
    } else {
        // No data saved
        console.log('No data found, creating placeholder text')
        let newRow = document.createElement('tr');
        newRow.id = 'placeholder-text';
        newRow.className = 'placeholder-text';
        let newCell = document.createElement('td');
        newCell.colSpan = 4;
        let cellText = document.createTextNode('Agregue un elemento haciendo click en "Agregar"');
        newCell.appendChild(cellText);
        newRow.appendChild(newCell);
        dataTable.appendChild(newRow);
        document.getElementById('modalForm').classList.remove('hidden');
    }
}

const selectWrapperFn = function (event) {
    // Using a wrapper because if i hardcode the argument on runtime at object creation,
    // i will reference a non existent element when deleting and reenumerating elements.
    // This function instead will look for the ID after reenumerating.
    const selectedItemID = event.currentTarget.id;
    selectElement(selectedItemID);
}

function selectElement(element) {
    console.log('Selected item ' + element);
    // First, clear any selected status
    let elements = document.getElementsByClassName('selectable');
    for (let currentElement of elements) {
        currentElement.classList.remove('selected');
    };
    // Now, add selected class to the item
    document.getElementById(element).classList.add('selected');
}

function saveUserName() {
    const userNameText = document.getElementById('userName');
    let newValue = userNameText.value;
    localStorage.setItem('userName', newValue);
    console.log('Saved ' + newValue);
    if (newValue) { document.getElementById('welcome').innerHTML = `Bienvenido,  ${newValue}` } else { document.getElementById('welcome').innerHTML = 'Bienvenido' };
}

function saveTestingData() {
    // This function is for tessting, can be called from console.
    let data = {
        1: {
            priority: "Alta",
            name: "Batmovil",
            description: "Vehículo multipropósito",
            features: "Todoterreno, híbrido, blindado, inteligente"
        },
        2: {
            priority: "Normal",
            name: "Refuerzo de titanio líquido",
            description: "Adición de blindaje al traje",
            features: "Resistente a disparos pero flexible para facilitar movilidad"
        },
        3: {
            priority: "Normal",
            name: "Malla térmica",
            description: "Control de temperatura interna",
            features: "Pronto debo ir a Alaska a una misión, por lo que necesito un mejor control de la termperatura interna"
        },
        4: {
            priority: "Baja",
            name: "Enlace de control satelital",
            description: "Acceso desde el traje a EYESAT-23",
            features: "Para mejor vigilancia y control de entorno, necesito acceso rápido a nuestro satélite infrarrojo"
        }
    }
    let jsonData = JSON.stringify(data);
    localStorage.setItem('tableData', jsonData);
    localStorage.setItem('userName', 'Batman');
    /* Done, now simulating some fancing loading data text for few seconds... */
    document.getElementById('btYes').classList.add('hidden');
    document.getElementById('btNo').classList.add('hidden');
    document.getElementById('status-text').innerText = "El escáner biométrico ha detectado su identidad correcta, descargando datos...";
    const reloadNow = setTimeout(reloadPage, 3500);
    return ('Saved testing data on localstorage');
}

function addItem() {
    let row = document.createElement('tr');
    // Get how many items are on the table
    let items = document.getElementsByClassName('selectable');
    let itemCounter = items.length + 1; // Adding one for the new item
    // Add a new item
    row.id = 'element-' + itemCounter;
    row.classList.add('selectable');
    let cells = document.getElementsByClassName('newItemtextBox')
    for (let n = 0; n < cells.length; n++) {
        let cell = document.createElement('td');
        let newText = cells[n].value;
        let cellText = document.createTextNode(newText);
        cells[n].value = "";
        cell.appendChild(cellText);
        cell.id = cells[n].id;
        row.appendChild(cell);
    };
    const dataTable = document.getElementById('data');
    dataTable.appendChild(row);
    // Make it selectable
    document.getElementById('element-' + itemCounter).addEventListener('click', selectWrapperFn);
    saveItems();
}

function deleteItem() {
    // Search for a .0selected item
    let selectedItem = document.getElementsByClassName('selected');
    if (selectedItem.length > 0) {
        selectedItem[0].remove();
        console.log('Deleted selected item');
        reenumerateItems();
        saveItems();
    } else {
        modalAlert('Advertencia', 'Seleccione antes un item para eliminar')
    }
}

function saveItems() {
    let data = {};
    const elements = document.getElementsByClassName('selectable');
    let n = 0;
    for (const currentElement of elements) {
        n++;
        let itemData = document.querySelectorAll('tr#' + currentElement.id + ' td');
        data[n] = {};
        for (const currentItemData of itemData) {
            // console.log('Saving content: ' + n + ' ' + currentItemData.id + ': ' + currentItemData.innerText);
            data[n][currentItemData.id] = currentItemData.innerText;
        }
        // console.log(data[n]);
    };
    // console.log(data);
    console.log('Data saved (' + n + ' elements)');
    let jsonData = JSON.stringify(data);
    localStorage.setItem('tableData', jsonData);
}

function reenumerateItems() {
    const elements = document.getElementsByClassName('selectable');
    let counter = 1;
    if (elements.length > 0) {
        for (counter; counter < (elements.length + 1); counter++) {
            elements[counter - 1].id = 'element-' + counter;
        }
        console.log('Elements reenumerated (' + counter + ' total)');
    } else {
        console.log('No elements found');
    }
}

function hideModal() {
    document.getElementById('btOk').classList.add('hidden');
    document.getElementById('modalForm').classList.add('hidden');
}

function reloadPage() {
    location.reload();
}

function deleteSavedData() {
    localStorage.clear();
    document.getElementById('btYes').classList.add('hidden');
    document.getElementById('btNo').classList.add('hidden');
    document.getElementById('status-title').innerText = "Eliminando datos";
    document.getElementById('status-text').innerText = "Espere unos segundos...";
    document.getElementById('modalForm').classList.remove('hidden');
    const reloadNow = setTimeout(reloadPage, 2000);
    return ('All data deleted');
}

function modalAlert(title, message) {
    document.getElementById('btYes').classList.add('hidden');
    document.getElementById('btNo').classList.add('hidden');
    document.getElementById('btOk').classList.remove('hidden');
    document.getElementById('status-title').innerText = title;
    document.getElementById('status-text').innerText = message;
    document.getElementById('modalForm').classList.remove('hidden');
}

init();