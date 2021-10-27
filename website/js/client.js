const context = new AudioContext();
const message_ttl = 15;
var chatSocket = null;
var processorNode;

function startWebsocket(){
    try {
        chatSocket = new WebSocket("wss://chatmusik.aaroncottle.com.au:8443");
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
    } catch(err) {
        console.log("could not connect to the websocket");
    }
}

startWebsocket();

function sendMessage() {
    msg = document.getElementById("chat-message").value.trim();
    document.getElementById("chat-message").value = ""
    try {
        if (msg !== '') chatSocket.send(msg);
    } catch(err) {
        startWebsocket();
    }
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

(async () => {
    await context.audioWorklet.addModule('js/audioprocess.js');
    processorNode = new AudioWorkletNode(context, 'audio-processor');
    processorNode.parameters.get("sampleRate").value = context.sampleRate;
    processorNode.parameters.get("ttl").value = message_ttl;

    var compressor = context.createDynamicsCompressor();
    compressor.threshold.setValueAtTime(-50, context.currentTime);
    compressor.knee.setValueAtTime(40, context.currentTime);
    compressor.ratio.setValueAtTime(12, context.currentTime);
    compressor.attack.setValueAtTime(0, context.currentTime);
    compressor.release.setValueAtTime(0.25, context.currentTime);

    var gainNode = context.createGain();
    gainNode.gain.setValueAtTime(2, context.currentTime);

    processorNode.connect(compressor).connect(gainNode).connect(context.destination);
})();

const closeInterval = setInterval(function() {
    if (chatSocket === null || chatSocket.readyState >= 2) {
        console.log("Websocket closed, attempting to reopen");
        chatSocket = null;
        startWebsocket();
    }
}, 5000);
