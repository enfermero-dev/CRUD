function init() {
    loadUserInfo();
    loadTableData();
    fBindInputBoxes();
    fBindID('btYes', 'click', saveTestingData);
    fBindID('btNo', 'click', hideModal);
    fBindID('btDelete', 'click', deleteSavedData);
    fBindID('btDeleteItem', 'click', deleteItem);
    fBindID('btAddItem', 'click', addItem);
    fBindID('btOk', 'click', hideModal);
    fBindID('btToday', 'click', fillDateToday);
    fBindID('btDeselect', 'click', selectNone);
    fBindID('btEditItem', 'click', replaceItem);
    console.log('[  READY  ]\n\nCall "saveTestingData()" from console to create test data, or "deleteSavedData()" to clear local data ');
}

function fBindID(elementId, event, method) {
    document.getElementById(elementId).addEventListener(event, method);
}

function fBindInputBoxes() {
    const inputBoxes = document.getElementsByClassName('newItemtextBox');
    for (n = 0; n < inputBoxes.length; n++) {
        inputBoxes[n].addEventListener('keypress', addItemWrapper);
    }
}

const addItemWrapper = function (event) {
    const argument = event.key;
    if (argument === 'Enter') {
        addItem();
    }
}

function loadUserInfo() {
    // Load info data from localstorage
    const infoDataElement = document.getElementsByClassName('infoTextBox');
    for (let n = 0; n < infoDataElement.length; n++) {
        // Iterate in each inputbox
        let savedInfoData = localStorage.getItem(infoDataElement[n].id);
        infoDataElement[n].value = savedInfoData;
        if (infoDataElement[n].type == 'text') {
            // Put a listener to save this value on text change
            infoDataElement[n].addEventListener('keyup', saveUserInfoWrapper);
        } else {
            infoDataElement[n].addEventListener('change', saveUserInfoWrapper);
        }
    }
    // If there is a user name, salute properly
    const savedUserName = document.getElementById('userName').value;
    if (savedUserName) {
        document.getElementById('welcome').innerHTML = `Bienvenido,  ${savedUserName}`
    };
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
            console.log('- Reading data # ' + n)
            let row = document.createElement('tr');
            row.id = 'element-' + n;
            row.classList.add('selectable');
            Object.keys(parsedData[n]).forEach((key, index) => {
                let cell = document.createElement('td');
                let cellText = document.createTextNode(parsedData[n][key]);
                // Add custom classes from the input's special data-classes, if any.
                const getCurrentInputEquivalent = document.getElementsByClassName('newItemtextBox');
                const customClasses = getCurrentInputEquivalent[index].getAttribute('data-classes');
                // This will replace any class set before:
                if (customClasses) { cell.className = customClasses; };
                // Set 'readonly' if applicable
                if (cellText.nodeValue === 'readonly') {
                    cell.innerHTML = '';
                    cell.classList.add('readonly');
                } else {
                    cell.appendChild(cellText);
                }
                cell.id = key;
                row.appendChild(cell);
            });
            dataTable.appendChild(row);
            // Make it selectable
            document.getElementById('element-' + n).addEventListener('click', selectWrapperFn);
            calculateAll()
        }
    } else {
        // No data saved
        console.log('No data found, creating placeholder text')
        let newRow = document.createElement('tr');
        newRow.id = 'placeholder-text';
        newRow.className = 'placeholder-text';
        let newCell = document.createElement('td');
        newCell.colSpan = 4;
        let cellText = document.createTextNode('Añada un elemento haciendo click en "Agregar"');
        newCell.appendChild(cellText);
        newRow.appendChild(newCell);
        dataTable.appendChild(newRow);
        // Show splash screen:
        document.getElementById('modalForm').classList.remove('hidden');
    }
}

const selectWrapperFn = function (event) {
    // Using a wrapper because if i hardcode the argument on runtime at object creation,
    // i will reference a non existent element when deleting and reenumerating elements.
    // This function instead will look for the ID after reenumerating.
    const argument = event.currentTarget.id;
    selectElement(argument);
}

function selectNone() {
    let elements = document.getElementsByClassName('selected');
    elements[0].classList.remove('selected');
    const getEditBoxes = document.getElementsByClassName('newItemtextBox');
    for (let n = 0; n < getEditBoxes.length; n++) {
        getEditBoxes[n].value = '';
    }
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
    // Put the values on the input boxes for editing the values
    const getSelectedRow = document.getElementsByClassName('selected');
    const tdElements = getSelectedRow[0].querySelectorAll('td');
    const getEquivalentEditBox = document.getElementsByClassName('newItemtextBox');
    // loop through each td element and add it to the getSelectedValues array
    for (let n = 0; n < tdElements.length; n++) {
        if (getEquivalentEditBox[0].getAttribute('number')) {
            const getSelectedValues = tdElements[n].innerText;
            getEquivalentEditBox[n].value = getSelectedValues;
        } else {
            const getSelectedValues = tdElements[n].innerText;
            getEquivalentEditBox[n].value = getSelectedValues.replace(/\./g, "");
        }
    }
}

const saveUserInfoWrapper = function (event) {
    const argument = event.currentTarget.id;
    saveUserInfo(argument)
}

function saveUserInfo(optionalElementID) {
    if (optionalElementID === undefined) {
        // Save all userinfo fields
        const userInfoElements = document.getElementsByClassName('infoTextBox');
        for (n = 0; n < userInfoElements.length; n++) {
            var newValue = undefined;
            if (userInfoElements[n].classList.contains('readonly')) {
                newValue = 'readonly';
            } else {
                newValue = userInfoElements[n].value;
            }
            localStorage.setItem(userInfoElements[n].id, newValue);
        }
    } else {
        // Save only the specified element on the optional argument
        const userInfoElement = document.getElementById(optionalElementID);
        var newValue = undefined;
        if (userInfoElement.classList.contains('readonly')) {
            newValue = 'readonly';
        } else {
            newValue = userInfoElement.value;
        }
        localStorage.setItem(optionalElementID, newValue);
    }
}

function calculateAll() {
    const multiplyByQtyElements = document.getElementsByClassName('multiplyByQty');
    const multiplyByValueElements = document.getElementsByClassName('multiplyByValue');
    const multiplyByTotalElements = document.getElementsByClassName('multiplyByTotal');
    for (n = 0; n < multiplyByTotalElements.length; n++) {
        multiplyByTotalElements[n].innerText = formatNumber(
            Number(multiplyByQtyElements[n].innerText) * Number(multiplyByValueElements[n].innerText.replace(/\./g, ""))
        )
    }
}

function saveTestingData() {
    // This function is for tessting, can be called from console.
    let data = {
        1: {
            field1: "1",
            field2: "Batimóvil",
            field3: "1.500.000.000",
            field4: "readonly"
        },
        2: {
            field1: "100",
            field2: "Batigarras",
            field3: "50.000",
            field4: "readonly"
        },
        3: {
            field1: "1",
            field2: "Traje",
            field3: "100.000.000",
            field4: "readonly"
        },
        4: {
            field1: "500",
            field2: "Batarangs",
            field3: "6.000.000",
            field4: "readonly"
        }
    }
    let jsonData = JSON.stringify(data);
    localStorage.setItem('tableData', jsonData);
    localStorage.setItem('userName', 'Pepito');
    localStorage.setItem('userBusiness', 'Pepito y Hnos. SA');
    localStorage.setItem('userProjectName', 'Sitio Web CRUD');
    localStorage.setItem('userProjectCode', 'Pepito-001');
    localStorage.setItem('projectDestName', 'Juanito');
    localStorage.setItem('projectDestBusiness', 'Juanito LTDA');
    localStorage.setItem('projectStartDate', '2023-05-24');
    localStorage.setItem('projectEndDate', '2023-05-30');
    document.getElementById('btYes').classList.add('hidden');
    document.getElementById('btNo').classList.add('hidden');
    document.getElementById('status-title').innerText = "";
    document.getElementById('status-text').innerText = "Rellenando datos de prueba...";
    const reloadNow = setTimeout(reloadPage, 300);
    return ('Saved testing data on localstorage');
}

function addItem() {
    var cells = document.getElementsByClassName('newItemtextBox');
    var proceed = true;
    for (let n = 0; n < cells.length; n++) {
        if (!cells[n].classList.contains('readonlyTextBox')) {
            if (cells[n].value === '') {
                proceed = false;
                fAlert('Por favor, ingrese todos los campos', 'warning');
            }
        }
    }
    if (proceed) {
        let row = document.createElement('tr');
        // Get how many items are on the table
        let items = document.getElementsByClassName('selectable');
        let itemCounter = items.length + 1; // Adding one for the new item
        // Add a new item
        row.id = 'element-' + itemCounter;
        row.classList.add('selectable');
        for (let n = 0; n < cells.length; n++) {
            let cell = document.createElement('td');
            var cellText = "";
            // Add custom classes from the input's special data-classes, if any.
            const getCurrentInputEquivalent = document.getElementsByClassName('newItemtextBox');
            const customClasses = getCurrentInputEquivalent[n].getAttribute('data-classes');
            // This will replace any class set before:
            if (customClasses) { cell.className = customClasses; };
            console.log(customClasses);
            if (cells[n].classList.contains('readonlyTextBox')) {
                cell.innerHTML = '';
                cell.classList.add('readonly');
            } else {
                // Check if the input field is a number type
                let newText;
                if (cells[n].getAttribute('type') === 'number') {
                    newText = formatNumber(cells[n].value);
                } else {
                    newText = cells[n].value;
                }
                cellText = document.createTextNode(newText);
                cell.appendChild(cellText);
            }
            cells[n].value = "";
            cell.id = cells[n].id;
            row.appendChild(cell);
        };
        const dataTable = document.getElementById('data');
        dataTable.appendChild(row);
        // Make it selectable
        document.getElementById('element-' + itemCounter).addEventListener('click', selectWrapperFn);
        saveItems();
        fAlert('Registro agregado', 'info');
        calculateAll();
        selectNone();
        setFocusFirstInput();
    }
}

function replaceItem() {
    var selectedItem = document.getElementsByClassName('selected');
    if (selectedItem.length > 0) {
        var cells = document.getElementsByClassName('newItemtextBox');
        var proceed = true;
        for (let n = 0; n < cells.length; n++) {
            if (!cells[n].classList.contains('readonlyTextBox')) {
                if (cells[n].value === '') {
                    proceed = false;
                    fAlert('Por favor, ingrese todos los campos', 'warning');
                }
            }
        }
        if (proceed) {
            let row = document.createElement('tr');
            // Get how many items are on the table
            let items = document.getElementsByClassName('selectable');
            let itemCounter = items.length + 1; // Adding one for the new item
            // Add a new item
            row.id = 'element-' + itemCounter;
            row.classList.add('selectable');
            for (let n = 0; n < cells.length; n++) {
                let cell = document.createElement('td');
                var cellText = "";
                // Add custom classes from the input's special data-classes, if any.
                const getCurrentInputEquivalent = document.getElementsByClassName('newItemtextBox');
                const customClasses = getCurrentInputEquivalent[n].getAttribute('data-classes');
                // This will replace any class set before:
                if (customClasses) { cell.className = customClasses; };
                if (cells[n].classList.contains('readonlyTextBox')) {
                    cell.innerHTML = '';
                    cell.classList.add('readonly');
                } else {
                    // Check if the input field is a number type
                    let newText;
                    if (cells[n].getAttribute('type') === 'number') {
                        newText = formatNumber(cells[n].value);
                    } else {
                        newText = cells[n].value;
                    }
                    cellText = document.createTextNode(newText);
                    cell.appendChild(cellText);
                }
                cells[n].value = "";
                cell.id = cells[n].id;
                row.appendChild(cell);
            };
            // Now find the current selected element and replace it
            selectedItem[0].replaceWith(row);
            // const dataTable = document.getElementById('data');
            // dataTable.appendChild(row);
            // Make it selectable
            document.getElementById('element-' + itemCounter).addEventListener('click', selectWrapperFn);
            saveItems();
            fAlert('Registro modificado', 'info');
            calculateAll();
            setFocusFirstInput();
        }
    } else {
        fAlert('Debe seleccionar antes un elemento para editar','warning');
    }
}

function setFocusFirstInput() {
    const inputBoxes = document.getElementsByClassName('newItemtextBox');
    inputBoxes[0].focus();
}

function formatNumber(number) {
    return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

function deleteItem() {
    // Search for a selected item
    let selectedItem = document.getElementsByClassName('selected');
    if (selectedItem.length > 0) {
        selectedItem[0].remove();
        fAlert('Registro eliminado', 'info');
        console.log('Deleted selected item');
        reenumerateItems();
        saveItems();
    } else {
        // modalAlert('Advertencia', 'Seleccione antes un item para eliminar');
        fAlert('Seleccione antes un registro para eliminar', 'warning');
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
            if (currentItemData.classList.contains('readonly')) {
                data[n][currentItemData.id] = 'readonly';
            } else {
                data[n][currentItemData.id] = currentItemData.innerText;
            }
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
    document.getElementById('status-text').innerText = "Espere...";
    document.getElementById('modalForm').classList.remove('hidden');
    const reloadNow = setTimeout(reloadPage, 500);
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

function fillDateToday() {
    document.getElementById('projectStartDate').value = getToday();
    saveUserInfo('projectStartDate');
}

function getToday() {
    const date = new Date();
    const year = (date.getFullYear().toString());
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Why 0 to 11, javascript?... why?....
    const day = String(date.getDate()).padStart(2, '0');
    const formatDate = `${year}-${month}-${day}`;
    return formatDate;
}

function fAlert(message, type) {
    const newAlert = document.createElement('div');
    newAlert.classList.add('alert-box');
    const newText = document.createElement('p');
    switch (type) {
        case 'info':
            newText.classList.add('alert-box-info');
            break;
        case 'warning':
            newText.classList.add('alert-box-warning');
            break;
        default:
            newText.classList.add('alert-box-normal');
    }
    newAlert.classList.add('alert-box-hidden');
    newText.innerHTML = message;
    newAlert.appendChild(newText);
    const date = new Date();
    const ms = date.getMilliseconds().toString();
    const alertID = 'alert' + ms;
    newAlert.id = alertID;
    document.getElementById('main-body').appendChild(newAlert);
    const createdAlert = document.getElementById(alertID);
    setTimeout(function () { createdAlert.classList.remove('alert-box-hidden'); 0 })
    setTimeout(function () { createdAlert.classList.add('alert-box-hidden'); }, 3000)
}

init();