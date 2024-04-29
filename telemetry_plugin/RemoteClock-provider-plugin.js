let object_name = 'PredefinedTelemetry';
let object_type = 'RemoteClockDomainObject';
let object_namespace = 'RemoteClockMainspace';

export default function RemoteClockProviderPlugin() {
  return function install(openmct) {
    // An object provider builds Domain Objects
    openmct.objects.addProvider(object_namespace, {
      get: function (identifier) {
        console.log('provider.get( ' + identifier.key + ' )'); //JSON.stringify(identifier, null, 4))
        return Promise.resolve({
          identifier: identifier,
          name: object_name,
          type: object_type
        });
      }
    });

    // Composition provider
    openmct.composition.addProvider({
      appliesTo: function (domainObject) {
        return false; //domainObject.identifier.namespace === object_namespace && domainObject.type === 'folder'
      },
      load: function (domainObject) {
        // console.log('Load for ' + domainObject.identifier.key)
        return null;
      }
    });

    // Add RemoteClock type
    console.log('AddType ' + object_type);

    openmct.types.addType(object_type, {
      name: 'RemoteClockTick',
      description: 'RemoteClockTick',
      cssClass: 'icon-telemetry'
    });
  };
}
