const bytesPayload = payload.find(x => x.variable === "payload").value;
const medicaoRealParaCalculoInicial = 0;
const medicaoLidaParaCalculoInicial = 0;
// const intervalo_medicao = device.params.find(x => x.key === "intervalo_medicao").value;
// const minutos = dayjs().minute();

function Decode(bytes) {
    return milesight(bytes);
}

function milesight(bytes) {
    var decoded = {};

    for (var i = 0; i < bytes.length;) {
        var channel_id = bytes[i++] + bytes[i++];
        var channel_type = bytes[i++] + bytes[i++];

        // BATTERY
        if (channel_id == '01' && channel_type == '75') {
            let hex = (bytes[i++] + bytes[i++]);
            decoded.battery = parseInt(hex, 16);
        }
        // TEMPERATURE
        else if (channel_id == '03' && channel_type == '67') {
            // ℃
            let byte2 = (bytes[i++] + bytes[i++]);
            let byte1 = (bytes[i++] + bytes[i++]);
            let hex = (byte1 + byte2);
            decoded.temperature = parseInt(hex, 16) / 10;
            // readInt16LE(bytes.slice(i, i + 2)) / 10;
            // ℉
            // decoded.temperature = readInt16LE(bytes.slice(i, i + 2)) / 10 * 1.8 + 32;
            // i +=2;
        }
        // HUMIDITY
        else if (channel_id == '04' && channel_type == '68') {
            let hex = (bytes[i++] + bytes[i++]);
            decoded.humidity = parseInt(hex, 16) / 2;
        }
        // PULSE COUNTER
        else if (channel_id == '05' && channel_type == 'c8') {
            let byte4 = (bytes[i++] + bytes[i++]);
            let byte3 = (bytes[i++] + bytes[i++]);
            let byte2 = (bytes[i++] + bytes[i++]);
            let byte1 = (bytes[i++] + bytes[i++]);
            let hex = (byte1 + byte2 + byte3 + byte4);
            console.log("puslo em hex = "+hex);
            decoded.pulse = parseInt(hex, 16);
        }
    }

    return decoded;
}

var parse = Decode(bytesPayload);

// if(minutos%intervalo_medicao == 0 || (minutos+1)%intervalo_medicao == 0){
switch (bytesPayload.slice(0, 4)) {
    case '0175':
        payload = ([
            {
                'variable': 'bateria',
                'value': parse.battery,
                'unit': '%'
            },
            {
                'variable': 'temperatura',
                'value': parse.temperature,
                'unit': '°C'
            },
            {
                'variable': 'umidade',
                'value': parse.humidity,
                'unit': '%'
            },
        ]);
        break;
    case '05c8':
        var hidrometro = (12765.2 + (parse.pulse / 10)).toFixed(0);
        payload = ([
            {
                'variable': 'pulso',
                'value': parse.pulse,
            },
            {
                'variable': 'hidrometro',
                'value': hidrometro,
            }
        ])
        break;
}
// } else {
//     payload = ([{}]);
// }
