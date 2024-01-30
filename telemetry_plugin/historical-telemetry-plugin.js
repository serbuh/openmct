/**
 * Basic historical telemetry plugin.
 */
'TelemetryDomainObject', '/CVASHistory/', 'localhost'

export default function HistoricalTelemetryPlugin(desired_domain_object_type, serverURL, IP) {
    return function install(openmct) {
        // var port = 16969;
        var provider = {
            supportsRequest: function (domainObject) {
                return domainObject.type === desired_domain_object_type;
            },
            request: function (domainObject, options) {
                var url = 'http://' + IP + ':' + port + serverURL
                    + domainObject.identifier.key
                    + '?start=' + options.start
                    + '&end=' + options.end;
                console.log('historical-telemetry-plugin.js: send request = ' + url);

                //http gibts nicht mehr!!!!!!!!!!!!!!!!!
                return fetch(url).then(function (resp) {
                    console.log(resp);
                    return resp.json();
                });
            }
        };
        openmct.telemetry.addProvider(provider);
    };
}