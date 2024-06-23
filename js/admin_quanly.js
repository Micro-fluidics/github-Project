
// Firebase Configuration
var firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_AUTH_DOMAIN",
    databaseURL: "YOUR_DATABASE_URL",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_STORAGE_BUCKET",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
};
firebase.initializeApp(firebaseConfig);

// Your existing admin_quanly.js code

function LoadListDevice() {
    let list = JSON.parse(localStorage.getItem('Devices')) || [];
    if (list.length === 0) {
        initializeDefaultDevices();
        list = JSON.parse(localStorage.getItem('Devices'));
    }
    let str = "";
    for (let i = 0; i < list.length; i++) {
        let x = list[i];
        str += `
            <tr>
                <td>${i + 1}</td>
                <td>${x.type}</td>
                <td>${x.name}</td>
                <td>${x.folder}</td>
                <td>${x.location}</td>
                <td>
                    <button class="btn-form btn-small" onclick="EditDevice(${x.id})">Edit</button>
                    <button class="btn-form btn-small" onclick="DeleteDevice(${x.id})">Delete</button>
                    <button class="btn-form btn-small" onclick="moveDeviceUp(${x.id})">↑</button>
                    <button class="btn-form btn-small" onclick="moveDeviceDown(${x.id})">↓</button>
                </td>
            </tr>
        `;
    }
    document.getElementById("listDevice").innerHTML = str;
    document.getElementById('tongsosp').textContent = list.length;
    document.getElementById('tongsosp1').textContent = list.length;

    // Update SVG if any ADC sensor is present in the list
    list.forEach(device => {
        document.getElementById('type-device').value = device.type;
        document.getElementById('name-device').value = device.name;
        document.getElementById('folder').value = device.folder;
        document.getElementById('location').value = device.location;

        if (device.type === "ADC1" || device.type === "ADC2") {
            updateDelayValue();  // Call the function to update the SVG for the specific ADC sensor
        }
    });

    createSmallerTable();
}



        function createSmallerTable() {
            console.log("Creating smaller table...");
            // Get the table body of listDevice
            var listDeviceBody = document.getElementById("listDevice");
            if (!listDeviceBody) {
                console.error("listDevice body not found!");
                return;
            }

            // Create a new table body element for listDevice1
            var listDevice1Body = document.createElement("tbody");
            listDevice1Body.id = "listDevice1";

            // Create the first row with custom labels
            var labelRow = document.createElement("tr");
            var counterLabel = document.createElement("td");
            counterLabel.textContent = "   #";
            var sensorLabel = document.createElement("td");
            sensorLabel.textContent = " Sensor";
            var commandLabel = document.createElement("td");
            commandLabel.textContent = "Command";
            var timeOnLabel = document.createElement("td");
            timeOnLabel.textContent = "     Time On";
            var delayLabel = document.createElement("td");
            delayLabel.textContent = "     Delay";


            // Append the label row to listDevice1Body
            listDevice1Body.appendChild(labelRow);

            // Loop through each row in the original table starting from index 1
            for (var i = 0; i < listDeviceBody.rows.length; i++) {
                console.log("Copying row", i);
                // Clone the row
                var newRow = listDeviceBody.rows[i].cloneNode(true);
                // Remove all buttons from the cloned row
                var buttons = newRow.querySelectorAll("button");
                buttons.forEach(function(button) {
                    button.parentNode.removeChild(button);
                });
                // Add padding to each cell for column spacing
                for (var j = 0; j < newRow.cells.length; j++) {
                    newRow.cells[j].style.padding = "0 30px"; // Adjust the padding as needed
                }
                // Append the cloned row to listDevice1
                listDevice1Body.appendChild(newRow);

                // Add an empty row with the desired height after each row
                if (i < listDeviceBody.rows.length - 1) {
                    var emptyRow = document.createElement("tr");
                    var emptyCell = document.createElement("td");
                    emptyCell.style.height = "20px"; // Adjust the height value as needed
                    emptyRow.appendChild(emptyCell);
                    listDevice1Body.appendChild(emptyRow);
                }
            }

            // Replace the content of listDevice1 with the content of listDevice1Body
            var listDevice1 = document.getElementById("listDevice1");
            listDevice1.innerHTML = listDevice1Body.innerHTML;

            console.log("Smaller table created successfully!");
        }


    function AddDevice() {
        let list = JSON.parse(localStorage.getItem('Devices')) || [];
        var id = Date.now(); // Generating a new ID for the device
        var type = document.getElementById("type-device").value;
        var name = document.getElementById("name-device").value;
        var folder = document.getElementById("folder").value;
        var location = document.getElementById("location").value; // Get the value of the new location field

        if (type === "choose") {
            alert("Please select a Sensor!");
            return false;
        }
        if (!name || name === "choose") {
            alert("Operation Mode cannot be empty!");
            return false;
        }

        if (name === "const On" || name === "const Off") {
            folder = "0";  // Set default value for folder if "const On" or "const Off" is selected
            location = "0";  // Set default value for location if "const On" or "const Off" is selected
        } else {
            if (!folder || isNaN(folder)) {  // isNaN function checks if the input is not a number
                alert("Please enter time in milliseconds using numeric values only!");
                return false;
            }
            if (!location || isNaN(location)) {  // isNaN function checks if the input is not a number
                alert("Please enter delay in milliseconds using numeric values only!");
                return false;
            }
        }

        var device = {
            "id": id,
            "type": type,
            "name": name,
            "folder": folder,
            "location": location // Add the location property
        };
        list.push(device);
        localStorage.setItem('Devices', JSON.stringify(list));
        alert("Device added successfully!");
        LoadListDevice(); // Refresh the list
    }

    function DeleteDevice(id) {
        let list = JSON.parse(localStorage.getItem('Devices')) || [];
        if (confirm("You definitely want to delete!")) {
            var index = list.findIndex(x => x.id == id);
            if (index >= 0) {
                list.splice(index, 1);
            }
            localStorage.setItem('Devices', JSON.stringify(list));
            alert('Deleted successfully');
            LoadListDevice();
        }
    }

    // Global variable to keep track of the currently editing device's ID
    var currentlyEditingId = null;

    function SaveDeviceChanges() {
        if (currentlyEditingId === null) {
            alert("No device selected for editing!");
            return;
        }

        let list = JSON.parse(localStorage.getItem('Devices'));
        let deviceIndex = list.findIndex(x => x.id === currentlyEditingId);
        if (deviceIndex !== -1) {
            let device = list[deviceIndex];
            device.name = document.getElementById('name-device').value;
            device.folder = document.getElementById('folder').value;
            device.type = document.getElementById('type-device').value;
            device.location = document.getElementById('location').value;

            if (device.name === "const On" || device.name === "const Off") {
                device.folder = "0";  // Set default value for folder if "const On" or "const Off" is selected
                device.location = "0";  // Set default value for location if "const On" or "const Off" is selected
            }

            localStorage.setItem('Devices', JSON.stringify(list));
            alert("Device updated successfully!");
            LoadListDevice(); // Refresh the list
        } else {
            alert("Device not found!");
        }
    }

    function moveDeviceUp(deviceId) {
        let list = JSON.parse(localStorage.getItem('Devices'));
        let index = list.findIndex(x => x.id === deviceId);
        if (index > 0) { // Check if it's not the first item
            [list[index], list[index - 1]] = [list[index - 1], list[index]]; // Swap with the above item
            localStorage.setItem('Devices', JSON.stringify(list));
            LoadListDevice(); // Reload the list
        }
    }

    function moveDeviceDown(deviceId) {
        let list = JSON.parse(localStorage.getItem('Devices'));
        let index = list.findIndex(x => x.id === deviceId);
        if (index < list.length - 1) { // Check if it's not the last item
            [list[index], list[index + 1]] = [list[index + 1], list[index]]; // Swap with the below item
            localStorage.setItem('Devices', JSON.stringify(list));
            LoadListDevice(); // Reload the list
        }
    }

    document.addEventListener('DOMContentLoaded', LoadListDevice);

