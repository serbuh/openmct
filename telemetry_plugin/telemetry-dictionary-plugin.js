import dictionary_src from './openmct_interface.json' assert { type: 'json' };

let object_type = 'TelemetryDomainObject';
let object_namespace = 'TelemetryMainspace';

export default function TelemetryDictionaryPlugin() {
    function get_openmct_interface() {
        return Promise.resolve(dictionary_src)
    }

    return function install(openmct) {
        // The addRoot function takes an "object identifier" as an argument
        openmct.objects.addRoot({
            namespace: object_namespace,
            key: 'RootFolder'
        });

        // An object provider builds Domain Objects
        openmct.objects.addProvider(object_namespace, {
            get: function(identifier) {
                //console.log("GET! " + identifier.key);//JSON.stringify(identifier, null, 4))
                return get_openmct_interface().then(function (dictionary) {
                    // console.log(JSON.stringify(identifier, null, 4))
                    if (identifier.key === 'RootFolder') {
                        // Create root folder
                        return {
                            identifier: identifier,
                            name: dictionary.name || "PredefinedTelemetry", // If root name is defined in the json - use it. otherwise put the default name
                            type: 'folder',
                            location: 'ROOT',
                            notes:dictionary.notes 
                        };
                    } else {
                        var measurement = dictionary.measurements.filter(function (m) {
                            return m.key === identifier.key;
                        })[0];
                        // Asuming that telemetry entries has 'value' fields. Otherwise treating as a folder
                        if (measurement.hasOwnProperty('values')) {
                            // Telemetry entry
                            return {
                                identifier: identifier,
                                name: measurement.name,
                                type: object_type,
                                notes:measurement.notes,
                                telemetry: {
                                    values: measurement.values
                                },
                                location: object_namespace + ':' + measurement.nested_under
                            };
                        } else {
                            // Folder
                            return {
                                identifier: identifier,
                                name: measurement.name,
                                type: 'folder',
                                notes:measurement.notes,
                                location: object_namespace + ':' + measurement.nested_under
                            };    
                        }
                    }
                });
            }
        });

        // Composition provider
        openmct.composition.addProvider({
            appliesTo: function (domainObject) {
                return domainObject.identifier.namespace === object_namespace
                    && domainObject.type === 'folder';
            },
            load: function (domainObject) {
                // console.log("Load for " + domainObject.identifier.key)
                return get_openmct_interface()
                    .then(function (dictionary) {
                        return dictionary.measurements
                            .filter(m => domainObject.identifier.key === m.nested_under)
                            .map(function (m) {
                            // console.log("   load " + domainObject.identifier.key + " -> " + m.key + " under " + m.nested_under)
                            return {
                                namespace: object_namespace,
                                key: m.key
                            };
                        });
                    });
            }
        });

        openmct.types.addType(object_type, {
            name: 'Telemetry Point',
            description: 'Telemetry',
            cssClass: 'icon-telemetry',
        });
    };
}