/**
 * Basic Realtime telemetry plugin using websockets.
 */


export default function RealtimeTelemetryPlugin(desired_domain_object_type, serverURL, IP) {
    return function (openmct) {
        // var port = 16969;
        // var socket = new WebSocket('ws://' + IP + ':' + port + serverURL);
        // var listeners = {};
        // var point; // TODO Is that right thing to do in JS? JS shouted at me that point is not defined at line: point = JSON.parse(event.data);

        // // This is the WebSockets function that gets called to push data updates from the real-time server to the real-time client
        // // (see realtime-server.js/notifySubscribers())
        // socket.onmessage = function (event) {
        //     point = JSON.parse(event.data);
        //     // console.log("realtime-telemetry-plugin.js: received new data for channel " + point.id + ": time = " + point.timestamp + " value = " + point.value);
        //     if (listeners[point.id]) {
        //         listeners[point.id].forEach(function (l) {
        //             l(point);
        //         });
        //     }
        // };

        var listeners = {};

        var socket = io()
        socket.on("connect", ()=>{
            console.log("connected to socket")
        })
        socket.on("disconnect", ()=> {
            console.log("disconnected from socket")
        })

        socket.on("realtime", msg => {
            // Get realtime message
            // console.log("realtime msg: ", msg)
            msg.forEach(point => {
                // console.log("Realtime " + point.id + ": " + point.value + " timestamp " + point.timestamp)
                listeners[point.id]
                    .forEach(f => f(point))
            })
        });
        
        var provider = {
            supportsSubscribe: function (domainObject) {
                return domainObject.type === desired_domain_object_type;
            },
            subscribe: function (domainObject, callback, options) {
                // Initialize listener for specific key
                if (!listeners[domainObject.identifier.key]) {
                    listeners[domainObject.identifier.key] = [];
                    socket.emit('subscribe', domainObject.identifier.key);
                }
                
                // Add callback for the listener
                console.log("Subscribe to ", domainObject.identifier.key)
                listeners[domainObject.identifier.key].push(callback);
                
                return function unsubscribe () {                    
                    listeners[domainObject.identifier.key]
                    .filter(c => c == callback)
                    .forEach ((_,index,arr) => delete arr[index])
                    
                    if (listeners[domainObject.identifier.key].length==0) {
                        delete listeners[domainObject.identifier.key]
                        console.log("Unsubscribe from ", domainObject.identifier.key)
                        socket.emit('unsubscribe', domainObject.identifier.key);
                    }
                };
            }
        };

        openmct.telemetry.addProvider(provider);
    };
}