/**
 * Basic Realtime telemetry plugin using websockets.
 */

export default function RealtimeTelemetryPlugin(desired_domain_object_type) {
  return function (openmct) {
    let listeners = {};

    let socket = io();
    socket.on('connect', () => {
      console.log('connected to socket');
    });
    socket.on('disconnect', () => {
      console.log('disconnected from socket');
    });

    socket.on('realtime', (msg) => {
      // Get realtime message
      // console.log("realtime msg: ", msg)
      msg.forEach((point) => {
        // console.log("Realtime " + point.id + ": " + point.value + " timestamp " + point.timestamp)
        listeners[point.id].forEach((f) => f(point));
      });
    });

    let provider = {
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
        console.log('Subscribe to ', domainObject.identifier.key);
        listeners[domainObject.identifier.key].push(callback);

        return function unsubscribe() {
          listeners[domainObject.identifier.key]
            .filter((c) => c === callback)
            .forEach((_, index, arr) => delete arr[index]);

          if (listeners[domainObject.identifier.key].length === 0) {
            delete listeners[domainObject.identifier.key];
            console.log('Unsubscribe from ', domainObject.identifier.key);
            socket.emit('unsubscribe', domainObject.identifier.key);
          }
        };
      }
    };

    openmct.telemetry.addProvider(provider);
  };
}
