/**
 * Basic Realtime telemetry plugin using websockets.
 */

export default function RealtimeTelemetryPlugin(desired_domain_object_type) {
  return function (openmct) {
    let listeners = {};

    my_socket.on('realtime', (msg) => {
      // Get realtime message
      // console.log("realtime msg: ", msg)
      msg.forEach((point) => {
        //console.log('Realtime ' + point.id + ': ' + point.value + ' timestamp ' + point.timestamp);
        if (listeners[point.id]){
          listeners[point.id].forEach(
            f => f(point)
          )
        } else {
          console.warn (`${point.id} not in listeners` )
        }
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
          my_socket.emit('subscribe', domainObject.identifier.key);
        }

        // Add callback for the listener
        console.log('Subscribe to ', domainObject.identifier.key);
        listeners[domainObject.identifier.key].push(callback);

        return function unsubscribe() {
          listeners[domainObject.identifier.key]
            .forEach((c, index, arr) => {
              if (c === callback) 
                arr.splice(index,1)
            });

          if (listeners[domainObject.identifier.key].length === 0) {
            delete listeners[domainObject.identifier.key];
            console.log('Unsubscribe from ', domainObject.identifier.key);
            my_socket.emit('unsubscribe', domainObject.identifier.key);
          }
        };
      }
    };

    openmct.telemetry.addProvider(provider);
  };
}
