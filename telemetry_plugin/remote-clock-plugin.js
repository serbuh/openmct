
let openmctInstance;

export default function RemoteClockPlugin(key, name, namespace) {
  const object_key = key
  const object_name = name
  const object_namespace = namespace
  
  return function install(openmct) {
    openmctInstance = openmct;

    openmct.objects.addProvider(namespace,{
      get: function (identifier) {
        return Promise.resolve({
          identifier: identifier,
          name: object_name,
          type: object_key
        });
      },
      supportsSubscribe: (domainObject) => {
        domainObject.type === object_key
      },
      subscribe: (domainObject, callback) => {
        console.log ("Remote Clock Subscribed ", domainObject, callback)
        //my_socket.emit("subscribe-video", domainObject.configuration.imagePortSource)
        // my_socket.on("video-point", msg => {
  
        //   callback(msg);
        // })
        return () => {
          console.log ("Unsubscribe remote clock")
          // my_socket.emit("unsubscribe-video", domainObject.configuration.imagePortSource)
        };
      },
      supportsRequest: (domainObject, options) => {
        return domainObject.type === object_key ;
      },
      request: async (domainObject, options) => {
        console.log ("Remote Hitoric Request")
        // const result = await fetch(`/video/frame-ids-between/${options.start}/${options.end}`);
        // const data = await result.json();
  
        // return data;
      }
    }
  
  );

    openmct.types.addType(object_key, {
      key: object_key,
      namespace: object_namespace,
      name: object_name,
      cssClass: 'icon-image',

    });

  };
}



