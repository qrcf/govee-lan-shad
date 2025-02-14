const dgram = require('dgram');
const WebSocket = require('ws');

const UDP_RECEIVE_PORT = 4002;
const UDP_SEND_PORT = 4001;
const MULTICAST_ADDRESS = '239.255.255.250'; // Example multicast address

// UDP Sockets
const udpReceiveSocket = dgram.createSocket({ type: 'udp4', reuseAddr: true });
const udpSendSocket = dgram.createSocket('udp4');
const udpControlSocket = dgram.createSocket('udp4');

//
udpSendSocket.bind(() => {
    udpSendSocket.setMulticastTTL(128); // Set TTL
    // udpSendSocket.setMulticastInterface('192.168.68.54'); // Replace with your local IP
});


udpControlSocket.bind(() => {
    udpSendSocket.setMulticastTTL(128); // Set TTL
    // udpSendSocket.setMulticastInterface('192.168.68.54'); // Replace with your local IP
});

// WebSocket Server
const wss = new WebSocket.Server({ port: 8080 });


// UDP Receive Socket
udpReceiveSocket.on('message', (msg, rinfo) => {
    const messageDecoded = JSON.parse(msg.toString())
    if (messageDecoded.msg.cmd === 'scan') {
        const ip = messageDecoded.msg.data.ip
        console.log(ip)
        console.log(`Received message: ${msg} from ${rinfo.address}:${rinfo.port}`);

    }
    // Broadcast message to WebSocket clients
    wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(messageDecoded));
        }
    });
});

udpReceiveSocket.on('listening', () => {
    const address = udpReceiveSocket.address();
    console.log(`UDP Receive socket listening on ${address.address}:${address.port}`);
    udpReceiveSocket.addMembership(MULTICAST_ADDRESS);
});

udpReceiveSocket.bind(UDP_RECEIVE_PORT);

// Handle WebSocket connections
wss.on('connection', (ws) => {
    console.log('WebSocket client connected');
    setTimeout(() => {
        udpSendSocket.send("{\"msg\":{\"cmd\":\"scan\",\"data\":{\"account_topic\":\"reserve\"}}}", UDP_SEND_PORT, MULTICAST_ADDRESS, (err) => {
            if (err) console.error('UDP Send Error:', err);
        });
    })
    // Receive messages from WebSocket and forward via UDP
    ws.on('message', (message) => {
        console.log(`Forwarding message to UDP: ${message}`);
        udpSendSocket.send(message, UDP_SEND_PORT, MULTICAST_ADDRESS, (err) => {
            if (err) console.error('UDP Send Error:', err);
        });
    });
});

console.log('WebSocket server listening on ws://localhost:8080');