var chatSocket = new WebSocket("ws://192.168.23.186:9000");

function sendMessage() {
    msg = document.getElementById("chat-message").value.trim();
    document.getElementById("chat-message").value = ""
    if (msg !== '') chatSocket.send(msg);
}

var area = document.getElementById("chat-message");

area.addEventListener('input', function() {
    if (document.getElementById("chat-message").value.includes("\n")) {
        sendMessage()
    }
}, false);

chatSocket.onmessage = function(event) {
    console.log("Recieved:", event.data);

    var posx = ~~(85*Math.random());
    var posy = ~~(98*Math.random());

    const div = document.createElement("div");
    div.setAttribute("class", "message")
    const divText = document.createTextNode(event.data);
    div.style.cssText = 'position: absolute; left: ' + posx + '%; top: ' + posy + '%;'
    div.appendChild(divText);

    setTimeout(() => {
        div.remove();
    }, 30000);

    document.getElementById("messages").insertBefore(div, document.getElementById("message-insert-point"));
};
