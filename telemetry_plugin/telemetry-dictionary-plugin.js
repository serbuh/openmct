import dictionary_src from './openmct_interface.json' assert { type: 'json' };
// window.dictionary = dictionary_src

export default function TelemetryDictionaryPlugin() {
    function get_openmct_interface() {
        return Promise.resolve(dictionary_src)
        // return fetch('../telemetry_plugin/openmct_interface.json').then(function (response) {
        //     return response.json();
        // });
    }

    return function install(openmct) {
        // The addRoot function takes an "object identifier" as an argument
        openmct.objects.addRoot({
            namespace: 'TelemetryMainspace',
            key: 'RootObject'
        });
        
        // An object provider builds Domain Objects
        openmct.objects.addProvider('TelemetryMainspace', {
            get: function (identifier) {
                return get_openmct_interface().then(function (dictionary) {
                    // console.log(JSON.stringify(identifier, null, 4))
                    // console.log("Getting root " + dictionary.name + " identifier: " + identifier.namespace + " -> " + identifier.key);
                    if (identifier.key === 'RootObject') {
                        return {
                            identifier: identifier,
                            name: dictionary.name,
                            type: 'folder',
                            location: 'ROOT'
                        };
                    // } else if (identifier.key === 'Somekey') {
                    //     console.log("FOLDER!" + JSON.stringify(identifier, null, 4))
                    //     return {
                    //         identifier: identifier,
                    //         name: "PAPKA",
                    //         type: 'folder',
                    //         location: 'TelemetryMainspace:RootObject'
                    //     };
                    } else {
                        var measurement = dictionary.measurements.filter(function (m) {
                            return m.key === identifier.key;
                        })[0];
    
                        return {
                            identifier: identifier,
                            name: measurement.name,
                            type: 'TelemetryDomainObject',
                            telemetry: {
                                values: measurement.values
                            },
                            location: 'TelemetryMainspace:RootObject'
                        };
                    }
                });
            }
        });

        // Composition provider
        openmct.composition.addProvider({
            appliesTo: function (domainObject) {
                // console.log("domainObject " + JSON.stringify(domainObject, null, 4))
                return domainObject.identifier.namespace === 'TelemetryMainspace'
                    && domainObject.type === 'folder';
                    // && domainObject.identifier.key === 'RootObject';
            },
            load: function (domainObject) {
                return get_openmct_interface()
                    .then(function (dictionary) {
                        return dictionary.measurements.map(function (m) {
                            // console.log("COMPOSITION load " + m.key)
                            return {
                                namespace: 'TelemetryMainspace',
                                key: m.key
                            };
                        });
                    });
            }
        });

        openmct.types.addType('TelemetryDomainObject', {
            name: 'Telemetry Point',
            description: 'Telemetry',
            cssClass: 'icon-telemetry',
        });
    };
}