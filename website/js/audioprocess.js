var index = 0;
var time = 0;
var messages = [];
var overtones = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];

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

        for (let i = 0; i < overtones.length; i++) {overtones[i] = 0;}
        messages.forEach(message => {
            var message_vol = (1/32)*Math.sin((time - message[0]) * Math.PI/parameters.ttl[0]);
            message[1].split(" ").forEach(word => {
                var overtone_index = Math.min(word.length, overtones.length - 1);
                if (overtones[overtone_index] <= 1/8){
                    overtones[overtone_index] += message_vol;
                }
            });
        });

        output.forEach(channel => {
            for (let i = 0; i < channel.length; i++){
                if ((messages.length > 0) && ((time - messages[0][0]) > parameters.ttl[0])){
                    messages.shift();
                }
                overtones.forEach((vol,num) => {
                    if (vol > 0){
                        channel[i] += 0.25*vol*Math.sin(num*2*Math.PI*(100 * time + 50*Math.cos(2*Math.PI*0.01*time)));
                        channel[i] += envelope(time, 0.01, 0.99, 0, 0, 0, 1)*0.25*(-0.5*Math.cos(Math.PI*0.01*time) + 0.5)*vol*Math.sin(num*2*Math.PI*(150 * time + 75*Math.cos(2*Math.PI*0.01*time)));
                        channel[i] += envelope(0.713*time, 0.01, 0.99, 0, 0, 0, 1)*0.25*(-0.5*Math.cos(0.03*time) + 0.5)*vol*Math.sin(num*2*Math.PI*(225 * time + 112.5*Math.cos(2*Math.PI*0.01*time)));
                        channel[i] += envelope((5 + (time + 4*Math.sin(0.5*time))/time)*(time + 0.2), 0.01, 0.99, 0, 0, 0, 1)*0.4*(-0.5*Math.cos(0.05*0.534*time) + 0.5)*vol*Math.sin(num*2*Math.PI*(250 * time + 125*Math.cos(2*Math.PI*0.01*time)));
                    }
                });
                
                index++;
                time = index/parameters.sampleRate[0];
            }
        });
        return true;
    }
}

registerProcessor('audio-processor', audioProcessor)

function envelope(p, a, d, s, h, r, l){
    p = p % l;
    if (p <= a){
        return p/a;
    } else if (p <= d + a){
        return 1 - (1-s)/d*(p-a);
    } else if (p <= a + d + h){
        return s;
    } else if (p <= a + d + h + r){
        return s - (s/r)*(p - a - d - h);
    } else {
        return 0;
    }
}
