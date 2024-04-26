/**
 * Basic historical telemetry plugin.
 */

export default function HistoricalTelemetryPlugin(desired_domain_object_type, serverURL, IP) {
  return function install(openmct) {
    let provider = {
      supportsRequest: function (domainObject) {
        return domainObject.type === desired_domain_object_type;
      },
      request: async function (domainObject, options) {
        let url = `/history/${domainObject.identifier.key}/${options.start}/${options.end}/${options.strategy}/${options.size}`;
        const resp = await fetch(url);
        const data = await resp.json();
        console.log('Got ' + data.length + ' history items for ' + domainObject.identifier.key);
        return data;
      }
    };
    openmct.telemetry.addProvider(provider);
  };
}