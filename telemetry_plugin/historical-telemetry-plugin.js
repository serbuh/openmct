/**
 * Basic historical telemetry plugin.
 */

export default function HistoricalTelemetryPlugin(desired_domain_object_type, serverURL, IP) {
    return function install(openmct) {
        var provider = {
            supportsRequest: function (domainObject) {
                return domainObject.type === desired_domain_object_type;
            },
            request: async function (domainObject, options) {
                var url = `/history/${domainObject.identifier.key}/${options.start}/${options.end}/${options.strategy}/${options.size}`
                // console.log("Request for Historic data: " ,domainObject,options);

                const resp = await fetch(url);
                const data = await resp.json();
                // console.log("Got Historic data: " ,data);
                return data
            }
        };
        openmct.telemetry.addProvider(provider);
    };
}