var chatSocket = new WebSocket("wss://chatmusik.aaroncottle.com.au:8443");
const context = new AudioContext();
const message_ttl = 15;

function sendMessage() {
    msg = document.getElementById("chat-message").value.trim();
    document.getElementById("chat-message").value = ""
    if (msg !== '') chatSocket.send(msg);
}

var area = document.getElementById("chat-message");

area.addEventListener('input', function() {
    if (context.state === 'suspended') {
        context.resume()
    }
    if (document.getElementById("chat-message").value.includes("\n")) {
        sendMessage()
    }
}, false);

var processorNode;

(async () => {
    await context.audioWorklet.addModule('js/audioprocess.js');
    processorNode = new AudioWorkletNode(context, 'audio-processor');
    processorNode.parameters.get("sampleRate").value = context.sampleRate;
    processorNode.parameters.get("ttl").value = message_ttl;
    processorNode.connect(context.destination);
})();

chatSocket.onmessage = function(event) {
    console.log("Recieved:", event.data);

    processorNode.port.postMessage(event.data);

    var posx = ~~(85*Math.random());
    var posy = ~~(98*Math.random());

    const div = document.createElement("div");
    div.setAttribute("class", "message")
    const divText = document.createTextNode(event.data);
    div.style.cssText = 'position: absolute; left: ' + posx + '%; top: ' + posy + '%;'
    div.appendChild(divText);

    setTimeout(() => {
        div.remove();
    }, message_ttl * 1000);

    document.getElementById("messages").insertBefore(div, document.getElementById("message-insert-point"));
};
