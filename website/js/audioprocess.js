var index = 0;
var messages = [];
var time = 0;

// white-noise-processor.js
class audioProcessor extends AudioWorkletProcessor {

    static parameterDescriptors = [
        {
            name: "sampleRate",
            defaultValue: 48000
        },
        {
            name: "ttl",
            defaultValue: 15
        }
    ];

    constructor() {
        super();
        this.port.onmessage = (e) => {
            messages.push([time, e.data]);
        }
    }

    process (inputs, outputs, parameters) {
        const output = outputs[0];

        output.forEach(channel => {
            for (let i = 0; i < channel.length; i++){
                if ((messages.length > 0) && ((time - messages[0][0]) > parameters.ttl[0])){
                    messages.shift();
                }

                messages.forEach(message => {
                    channel[i] += (Math.min(time - message[0], 1) * Math.max(0, Math.min(parameters.ttl[0] + message[0] - time, 1))) *
                                  (1/8)*Math.sin(2 * Math.PI * message[1].length * 100 * time);
                });
                
                index++;
                time = index/parameters.sampleRate[0];
            }
        });
        return true;
    }
}

registerProcessor('audio-processor', audioProcessor)
