import dictionary_src from './openmct_interface.json' assert { type: 'json' };
// window.dictionary = dictionary_src

export default function TelemetryDictionaryPlugin() {
    function get_openmct_interface() {
        return Promise.resolve(dictionary_src)
        // return fetch('../telemetry_plugin/openmct_interface.json').then(function (response) {
        //     return response.json();
        // });

    }

    // An object provider builds Domain Objects
    var CVAS_objectProvider = {
        get: function (identifier) {
            return get_openmct_interface().then(function (dictionary) {
                if (identifier.key === 'RootObject') {
                    // JSON.stringify(identifier, null, 4)
                    // console.log("Getting root " + dictionary.name + " identifier: " + identifier.namespace + " -> " + identifier.key);
                    return {
                        identifier: identifier,
                        name: dictionary.name,
                        type: 'folder',
                        location: 'ROOT'
                    };
                } else {
                    var measurement = dictionary.measurements.filter(function (m) {
                        return m.key === identifier.key;
                    })[0];
                    // console.log("Getting measurement " + measurement.name + " identifier: " + identifier.namespace + " -> " + identifier.key)

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
    };

    // The composition of a domain object is the list of objects it contains, as shown (for example) in the tree for browsing.
    // Can be used to populate a hierarchy under a custom root-level object based on the contents of a telemetry dictionary.
    // "appliesTo"  returns a boolean value indicating whether this composition provider applies to the given object
    // "load" returns an array of Identifier objects (like the channels this telemetry stream offers)
    var CVAS_compositionProvider = {
        appliesTo: function (domainObject) {
            // console.log("domainObject " + domainObject.name + " type " + domainObject.type)
            return domainObject.identifier.namespace === 'TelemetryMainspace'
                && domainObject.type === 'folder';
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
    };

    return function install(openmct) {
        // The addRoot function takes an "object identifier" as an argument
        openmct.objects.addRoot({
            namespace: 'TelemetryMainspace',
            key: 'RootObject'
        });

        openmct.objects.addProvider('TelemetryMainspace', CVAS_objectProvider);

        openmct.composition.addProvider(CVAS_compositionProvider);

        openmct.types.addType('TelemetryDomainObject', {
            name: 'CVAS Telemetry Point',
            description: 'Telemetry of CVAS',
            cssClass: 'icon-telemetry',
        });
    };
}