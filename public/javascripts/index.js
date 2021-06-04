let name = null;
let roomNo = null;
let roomId = null;
let chat = io.connect('/chat');

/**
 * it sends an Ajax query using JQuery
 * @param url the url to send to
 * @param data the data to send (e.g. a Javascript structure)
 */
function sendAjaxQuery(url, data, callback) {
    $.ajax({
        url: url,
        data: JSON.stringify(data),
        contentType: 'application/json',
        dataType: 'json',
        type: 'POST',
        success: callback,
        error: function (response) {
            console.log(response.responseText);
        }
    });
}

/**
 * called when the submit button is pressed
 * @param url
 */
function submitData(url) {
    console.log('submitData()');
    // The .serializeArray() method creates a JavaScript array of objects
    // https://api.jquery.com/serializearray/
    const formArray= $("form").serializeArray();
    const data={};
    for (let index in formArray){
        data[formArray[index].name]= formArray[index].value;
    }

    const callback = () => {
        console.log('Data submitted');
    }
    // const data = JSON.stringify($(this).serializeArray());
    sendAjaxQuery(url, data, callback);
}

function registerSW() {
    if('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/sw.js')
            .then((reg) => {
                console.log('Service worker registration successful with scope:', reg.scope);
            }).catch((error) => {
            console.error(error);
        });
    }
}

/**
 * called by <body onload>
 * it initialises the interface and the expected socket messages
 * plus the associated actions
 */
function init() {
    // it sets up the interface so that userId and room are selected
    document.getElementById('initial_form').style.display = 'block';
    document.getElementById('chat_interface').style.display = 'none';
    registerSW();
    initChatSocket();
    if ('indexedDB' in window) {
        initDatabase();
    }
    else {
        console.log('This browser doesn\'t support IndexedDB');
    }
}

/**
 * it initialises the socket for /chat
 */

function initChatSocket() {
    // called when someone joins the room. If it is someone else it notifies the joining of the room
    chat.on('joined', function (roomId, userId, roomNo) {
        if (userId === name) {
            // it enters the chat
            hideLoginInterface(roomNo, userId);
        } else {
            // notifies that someone has joined the room
            writeOnChatHistory('<b>' + userId + '</b>' + ' joined room ' + roomNo);
        }
    });
    // called when a message is received
    chat.on('chat', function (roomId, userId, chatText) {
        let who = userId;
        if (userId === name) who = 'Me';
        writeOnChatHistory('<b>' + who + ':</b> ' + chatText);
    });
    // update canvas
    chat.on('drawing', (roomId, userId, width, height, prevX, prevY, currX, currY, color, thickness) => {
        drawOnCanvas(width, height, prevX, prevY, currX, currY, color, thickness);
    });
    // clean canvas
    chat.on('clear canvas', (roomId, userId) => {
        let who = userId;
        if (userId === name) who = 'Me';
        writeOnChatHistory('Canvas just cleared by ' + who + '.');
        clearCanvas();
    });
    // update image info panel
    chat.on('update panel', (userId, imageTitle, imageAuthor, imageDp) => {
        let who = userId;
        if (userId === name) who = 'Me';
        writeOnChatHistory('Image information panel just updated by ' + who + '.');
        writeOnPanel(imageTitle, imageAuthor, imageDp);
    })
}

async function displayChatHistory(roomId) {
    let data = await getCachedData(roomId);
    console.log(data)
    if (data && data.length > 0) {
        for (let res of data)
            writeOnChatHistory('<b>' + res.name + ':</b> ' + res.message);
    }
}

/**
 * called to generate a random room number
 * This is a simplification. A real world implementation would ask the server to generate a unique room number
 * so to make sure that the room number is not accidentally repeated across uses
 */
function generateRoom() {
    roomNo = Math.round(Math.random() * 10000);
    document.getElementById('roomNo').value = 'R' + roomNo;
}

/**
 * called when the Send button is pressed. It gets the text to send from the interface
 * and sends the message via  socket
 */
function sendChatText() {
    let chatText = document.getElementById('chat_input').value;
    chat.emit('chat', roomId, name, chatText);
    storeCachedData({roomNo: roomId, name: name, message: chatText});
}

/**
 * used to connect to a room. It gets the user name and room number from the
 * interface
 */
function connectToRoom() {
    roomNo = document.getElementById('roomNo').value;
    name = document.getElementById('username').value;
    let imageUrl= document.getElementById('imageUrl').value;
    if (!name) name = 'Unknown-' + Math.random();
    roomId = roomNo + '-' + imageUrl

    submitData('/image_save');
    initCanvas(chat, imageUrl, roomId, name);

    // join the room
    chat.emit('create or join', roomId, name, roomNo);
    displayChatHistory(roomId).then(r => {});

    submitData('/users/add');
}

/**
 * it appends the given html text to the history div
 * this is to be called when the socket receives the chat message (socket.on ('message'...)
 * @param text: the text to append
 */
function writeOnChatHistory(text) {
    if (text==='') return;
    let history = document.getElementById('history');
    let paragraph = document.createElement('p');
    paragraph.innerHTML = text;
    history.appendChild(paragraph);
    // scroll to the last element
    history.scrollTop = history.scrollHeight;
    document.getElementById('chat_input').value = '';
}

/**
 * it hides the initial form and shows the chat
 * @param room the selected room
 * @param user
 */
function hideLoginInterface(room, user) {
    document.getElementById('initial_form').style.display = 'none';
    document.getElementById('chat_interface').style.display = 'block';
    document.getElementById('who_you_are').innerHTML= user;
    document.getElementById('in_room').innerHTML= ' '+room;
}

/**
 * Update the image information panel for everyone
 */
function updatePanel() {
    let imageTitle = document.getElementById('imageTitle').value;
    let imageAuthor = document.getElementById('imageAuthor').value;
    let imageDp = document.getElementById('imageDp').value;

    submitData('/users/updatePanel');
    chat.emit('update panel', roomId, name, roomNo, imageTitle, imageAuthor, imageDp);
}

function writeOnPanel(title, author, dp) {
    document.getElementById('imageTitle').value = title;
    document.getElementById('imageAuthor').value = author;
    document.getElementById('imageDp').value = dp;
}
