import dictionary_src from './openmct_interface.json' assert { type: 'json' };
// window.dictionary = dictionary_src

class SuperObjectProvider {
    #get_openmct_interface() {
        return Promise.resolve(dictionary_src)
    }

    constructor(openmct) {
        this.openmct = openmct;
    }

    async get(identifier) {
        //console.log("GET! " + identifier.key);//JSON.stringify(identifier, null, 4))
        return this.#get_openmct_interface().then(function (dictionary) {
            // console.log(JSON.stringify(identifier, null, 4))
            if (identifier.key === 'RootObject') {
                // Create root folder
                return {
                    identifier: identifier,
                    name: "PredefinedTelemetry",
                    type: 'folder',
                    location: 'ROOT'
                };
            } else {
                var measurement = dictionary.measurements.filter(function (m) {
                    return m.key === identifier.key;
                })[0];
                if (measurement.node_type === 'folder') {
                    //console.log("FOLDER " + identifier.key)
                    return {
                        identifier: identifier,
                        name: measurement.name,
                        type: 'folder',
                        location: 'TelemetryMainspace:RootObject'
                    };    
                } else {
                    return {
                        identifier: identifier,
                        name: measurement.name,
                        type: 'TelemetryDomainObject',
                        telemetry: {
                            values: measurement.values
                        },
                        location: 'TelemetryMainspace:Folder_0_key'
                    };
                }
            }
        });
    }
}

export default function TelemetryDictionaryPlugin() {
    function get_openmct_interface() {
        return Promise.resolve(dictionary_src)
    }

    return function install(openmct) {
        // The addRoot function takes an "object identifier" as an argument
        openmct.objects.addRoot({
            namespace: 'TelemetryMainspace',
            key: 'RootObject'
        });
        
        const objectProvider = new SuperObjectProvider(
            openmct
        );

        // An object provider builds Domain Objects
        openmct.objects.addProvider('TelemetryMainspace', objectProvider);

        // Composition provider
        openmct.composition.addProvider({
            appliesTo: function (domainObject) {
                
                // const predicate = domainObject.key === "RootObject"
                // console.log("AppliesTo? "+JSON.stringify(domainObject, null, 4) + "\n " + predicate)
                return domainObject.identifier.namespace === 'TelemetryMainspace'
                    && domainObject.type === 'folder';
                    // && domainObject.identifier.key === "RootObject";
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