/**
 * Open the WebSocket and store the connection in a global variable.  Also,
 * specify the functions to call in response to events associated with the
 * WebSocket.
 */
const wsUri = "ws://" + document.location.host + document.location.pathname + "endpoint";
const websocket = new WebSocket(wsUri); 

websocket.onopen = function (event) {
    console.log("opened websocket: " + wsUri);
};

websocket.onmessage = function (event) {
    console.log("received: " + event.data);
    updateTextArea(event.data, "in");
};

websocket.close = function (event) {
    displayError("Connection closed. Refresh the browser.");
};

websocket.onerror = function (event) {
    displayError("ERROR: " + event.data + ". Inspect the browser's developer console.");
};

function displayError(msg) {
    var errdiv = document.getElementById("errorText");
    errdiv.innerHTML = msg;
} 

/*
 * Update the textarea by appending the supplied text to the text that is
 * already there.  The text shows up as JSON, so it has to be parsed into
 * a JSON object to let us retrieve the data.
 */
function updateTextArea(data, inOut) {
    // Parse the data as JSON so the fields can be accessed
    var json = JSON.parse(data);
    // Use the JSON notation to retrieve the data fields
    var name = json.name;
    var message = json.message;
    // Build the text to display then show it
    var out = (inOut === "in") ? "<div class=\"in\">" : "<div class=\"out\">";
    out += "<p>" + message + "</p><span>";
    out += (inOut === "in") ? name  : "Me";
    out += "</span></div>";
    var textArea = document.getElementById("messages");
    textArea.innerHTML = textArea.innerHTML + out;
    // Attempt to move the scrolling of the textarea to show the lowest item
    // The effectiveness of this varies by browser
    textArea.scrollTop = textArea.scrollHeight;
    // Logging only helps when you have the browser's developer tools open
    console.log("Writing: " + data);
}

/*
 * Clear any existing text from the message box and set focus there
 */
function prepMessageBox() {
    var messageBox = document.getElementById("message");
    messageBox.value = "";
    messageBox.focus();
}

const messageForm = document.getElementById("messageForm");
messageForm.addEventListener("submit", function(event) {
    event.preventDefault();
    displayError("");
    // Get the test of the message.  If the message is blank, use "..."
    var userName = document.getElementById("userName").value;
    if (userName === "") {
        displayError("Name is required");
        return;
    }
    // Get the test of the message.  If the message is blank, use "..."
    var message = document.getElementById("message").value.trim();
    if (message === "") {
        message = "...";
    }
    // Get the user name
    var name = document.getElementById("userName").value;
    // Set the message text field to blank so it is ready for the next
    // message
    document.getElementById("message").value = "";
    // Build a JSON object and convert it to a string so it can be sent
    var json = JSON.stringify({
        "name": name,
        "message": message
    });
    // Update the textarea just like we would with an incoming message
    updateTextArea(json, "out");
    // Send the message
    sendText(json);
    // Prepare for the next message
    prepMessageBox();
}); 

/*
 * Send the message to the server endpoint and log the activity to the console
 */
function sendText(json) {
    console.log("sending text: " + json);
    if(isOpen(websocket)) {
        websocket.send(json);
    }
}

function isOpen(websocket) {
    return websocket.readyState === websocket.OPEN;
}