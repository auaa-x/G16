let username = null;
let roomNo = null;
let chat = io.connect('/chat');
let news = io.connect('/news');
let isInitChat = false;
let isInitPos = false;
let picU = null;
let chatL = [];
let posL = [];

/**
 * called by <body onload>
 * it initialises the interface and the expected socket messages
 * plus the associated actions
 */
function init() {
    // it sets up the interface so that userId and room are selected
    document.getElementById('initial_form').style.display = 'block';
    document.getElementById('chat_interface').style.display = 'none';

    let dbParams = new Object();
    dbParams.db_name = "SISO";
    dbParams.db_version = "2";
    dbParams.db_store_name = "Test";
    dbObject.init(dbParams);
    console.log("initialize indexDB success!");

    initChatSocket();
    initNewsSocket();
}

function initIndexDB() {
    dbObject.put({ "url": picU, "chatList": chatL, "posList": posL }, roomNo);
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
 * it initialises the socket for /chat
 */

function initChatSocket() {
    // called when someone joins the room. If it is someone else it notifies the joining of the room
    chat.on('joined', function (room, userId) {
        if (userId === username) {
            // it enters the chat
            hideLoginInterface(room, userId);
        } else {
            // notifies that someone has joined the room
            writeOnChatHistory('<b>' + userId + '</b>' + ' joined room ' + room);
        }
    });
    // called when a message is received
    chat.on('chat', function (room, userId, chatText) {
        //Write into indexDB
        var obj = chatL;
        var tmp = {};
        tmp[userId] = chatText;
        obj.push(tmp);

        dbObject.put({ "url": picU, "chatList": obj, "posList": posL }, roomNo);

        let who = userId
        if (userId === username) who = 'Me';
        writeOnChatHistory('<b>' + who + ':</b> ' + chatText);
    });

    chat.on('chatInit', function (room, userId, chatList) {
        if (isInitChat) {
            return;
        }
        chatL = chatList;
        for (var i = 0; i < chatList.length; i++) {
            if (i < chatList.length - 3) {
                continue;
            }

            var chatText = chatList[i];
            var list = chatText.split(":");
            let who = list[0];
            let context = list[1];
            if (who == userId) who = 'Me';
            writeOnChatHistory('<b>' + who + ':</b> ' + context);
        }

        isInitChat = true;
    });

    chat.on('drawingInit', function (posList) {
        if (isInitPos) {
            return;
        }

        posL = posList;

        for (var i = 0; i < posList.length; i++) {
            var data = posList[i];
            var w = canvas.width;
            var h = canvas.height;
            drawLine(data.x0 * w, data.y0 * h, data.x1 * w, data.y1 * h, data.color);
        }

        isInitPos = true;
    });

    chat.on("getPic", function (picUrl) {
        var targetUrl = document.getElementById('showpic');
        targetUrl.src = picUrl;
    })
}

/**
 * it initialises the socket for /news
 */
function initNewsSocket() {
    news.on('joined', function (room, userId) {
        if (userId !== username) {
            // notifies that someone has joined the room
            writeOnNewsHistory('<b>' + userId + '</b>' + ' joined news room ' + room);
        }
    });

    // called when some news is received (note: only news received by others are received)
    news.on('news', function (room, userId, newsText) {
        writeOnNewsHistory('<b>' + userId + ':</b> ' + newsText);
    });
}


/**
 * called when the Send button is pressed. It gets the text to send from the interface
 * and sends the message via  socket
 */
function sendChatText() {
    let chatText = document.getElementById('chat_input').value;
    chat.emit('chat', roomNo, username, chatText);
}
/**
 * called when the Send button is pressed for news. It gets the text to send from the interface
 * and sends the message via  socket
 */
function sendNewsText() {
    let newsText = document.getElementById('news_input').value;
    news.emit('news', roomNo, username, newsText);
    document.getElementById('news_input').value = '';
}

/**
 * used to connect to a room. It gets the user name and room number from the
 * interface
 * It connects both chat and news at the same time
 */
function connectToRoom() {
    roomNo = document.getElementById('roomNo').value;
    username = document.getElementById('username').value;
    picUrl = document.getElementById('pic').value;


    if (!roomNo) {
        alert("roomNumber cannot be null!");
        return;
    }

    targetUrl = document.getElementById('showpic');
    targetUrl.src = picUrl;

    chat.emit('picUrl', roomNo, picUrl);

    if (!username) username = 'Unknown User-' + Math.ceil(10 * Math.random());
    chat.emit('create or join', roomNo, username, picUrl);
    news.emit('create or join', roomNo, username);

    setTimeout(() => {
        initIndexDB();
    }, 3000);
}

/**
 * it appends the given html text to the history div
 * @param text: teh text to append
 */
function writeOnChatHistory(text) {
    let history = document.getElementById('chat_history');
    let paragraph = document.createElement('p');
    paragraph.innerHTML = text;
    history.appendChild(paragraph);
    document.getElementById('chat_input').value = '';
}

/**
 * it appends the given html text to the history div
 * @param text: teh text to append
 */
function writeOnNewsHistory(text) {
    let history = document.getElementById('news_history');
    let paragraph = document.createElement('p');
    paragraph.innerHTML = text;
    history.appendChild(paragraph);
    document.getElementById('news_input').value = '';
}

/**
 * it hides the initial form and shows the chat
 * @param room the selected room
 * @param userId the user name
 */
function hideLoginInterface(room, userId) {
    document.getElementById('initial_form').style.display = 'none';
    document.getElementById('chat_interface').style.display = 'block';
    document.getElementById('who_you_are').innerHTML = userId;
    document.getElementById('in_room').innerHTML = ' ' + room;
}

var socket = io();
var canvas = document.getElementsByClassName('whiteboard')[0];
var colors = document.getElementsByClassName('color');
var context = canvas.getContext('2d');

var current = {
    color: 'black'
};
var drawing = false;

canvas.addEventListener('mousedown', onMouseDown, false);
canvas.addEventListener('mouseup', onMouseUp, false);
canvas.addEventListener('mouseout', onMouseUp, false);
canvas.addEventListener('mousemove', throttle(onMouseMove, 10), false);

//Touch support for mobile devices
canvas.addEventListener('touchstart', onMouseDown, false);
canvas.addEventListener('touchend', onMouseUp, false);
canvas.addEventListener('touchcancel', onMouseUp, false);
canvas.addEventListener('touchmove', throttle(onMouseMove, 10), false);

for (var i = 0; i < colors.length; i++) {
    colors[i].addEventListener('click', onColorUpdate, false);
}

// socket.on('drawing', onDrawingEvent);

// window.addEventListener('resize', onResize, false);
onResize();

chat.on('drawing', onDrawingEvent);

function drawLine(x0, y0, x1, y1, color, emit) {
    context.beginPath();
    context.moveTo(x0 * 2, y0);
    context.lineTo(x1 * 2, y1);
    context.strokeStyle = color;
    context.lineWidth = 2;
    context.stroke();
    context.closePath();

    if (!emit) { return; }

    var w = canvas.width;
    var h = canvas.height;
    //Write into indexDB
    var pos = {
        "x0": x0 / w,
        "y0": y0 / h,
        "x1": x1 / w,
        "y1": y1 / h,
        "color": color,
        "RoomId": roomNo
    };

    var obj = posL;
    obj.push(pos);
    dbObject.put({ "url": picU, "chatList": chatL, "posList": obj }, roomNo);

    chat.emit('point', pos,roomNo);
}

function onMouseDown(e) {
    drawing = true;
    current.x = e.clientX || e.touches[0].clientX;
    current.y = e.clientY || e.touches[0].clientY;
}

function onMouseUp(e) {
    if (!drawing) { return; }
    drawing = false;
    drawLine(current.x, current.y, e.clientX || e.touches[0].clientX, e.clientY || e.touches[0].clientY, current.color, true);
}

function onMouseMove(e) {
    if (!drawing) { return; }
    drawLine(current.x, current.y, e.clientX || e.touches[0].clientX, e.clientY || e.touches[0].clientY, current.color, true);
    current.x = e.clientX || e.touches[0].clientX;
    current.y = e.clientY || e.touches[0].clientY;
}

function onColorUpdate(e) {
    current.color = e.target.className.split(' ')[1];
}

// limit the number of events per second
function throttle(callback, delay) {
    var previousCall = new Date().getTime();
    return function () {
        var time = new Date().getTime();

        if ((time - previousCall) >= delay) {
            previousCall = time;
            callback.apply(null, arguments);
        }
    };
}

function onDrawingEvent(data) {
    var w = canvas.width;
    var h = canvas.height;
    drawLine(data.x0 * w, data.y0 * h, data.x1 * w, data.y1 * h, data.color);
}

// make the canvas fill its parent
function onResize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

chat.on('update point',()=>{
    onResize();
})

function delAllPosition() {
    console.log('clear!');
    chat.emit('delPos', roomNo);
    dbObject.put({ "url": picU, "chatList": chatL, "posList": "" }, roomNo);
    
}