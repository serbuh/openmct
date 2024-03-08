
/*****************************************************************************
 * Open MCT, Copyright (c) 2014-2023, United States Government
 * as represented by the Administrator of the National Aeronautics and Space
 * Administration. All rights reserved.
 *
 * Open MCT is licensed under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * http://www.apache.org/licenses/LICENSE-2.0.
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 * License for the specific language governing permissions and limitations
 * under the License.
 *
 * Open MCT includes source code licensed under additional open source
 * licenses. See the Open Source Licenses file (LICENSES.md) included with
 * this source code distribution or the Licensing information page available
 * at runtime from the About dialog for additional information.
 *****************************************************************************/


let openmctInstance;

export default function VideoPlugin() {
  return function install(openmct) {
    openmctInstance = openmct;
    openmct.types.addType('example.imagery', {
      key: 'example.imagery',
      name: 'Example Imagery',
      cssClass: 'icon-image',
      description:
        'Creates a image source based on the UDP port of the image provider. 5555 for emulator',
      creatable: true,
      initialize: (object) => {
        object.configuration = {
          imageLocation: '',
          imageLoadDelayInMilliSeconds: 1000,
          imageSamples: [],
          layers: [],
          imageFreshness: {
            fadeOutDelayTime: '0s',
            fadeOutDurationTime: '0s'
          },
          showCompassHUD: false
        };

        object.telemetry = {
          values: [
            {
              name: 'Name',
              key: 'name'
            },
            {
              name: 'Time',
              key: 'utc',
              format: 'utc',
              hints: {
                domain: 2
              }
            },
            {
              name: 'Local Time',
              key: 'local',
              format: 'local-format',
              hints: {
                domain: 1
              }
            },
            {
              name: 'Image',
              key: 'url',
              format: 'image',
              hints: {
                image: 1
              },

            },
            {
              name: 'Image Thumbnail',
              key: 'thumbnail-url',
              format: 'thumbnail',
              hints: {
                thumbnail: 1
              },
              source: 'url'
            },
            {
              name: 'Image Download Name',
              key: 'imageDownloadName',
              format: 'imageDownloadName',
              hints: {
                imageDownloadName: 1
              }
            }
          ]
        };
      },
      form: [
        {
          key: 'imagePortSource',
          name: 'Video source (port)',
          control: 'numberfield',
          cssClass: 'l-inline',
          property: ['configuration', 'imagePortSource']
        },
      ]
    });


    openmct.telemetry.addFormat({
      key: 'thumbnail',
      format: (url) => {
        return `${url}/thumb`;
      }
    });
    openmct.telemetry.addProvider(getRealtimeProvider(openmct));
    openmct.telemetry.addProvider(getHistoricalProvider(openmct));
    openmct.telemetry.addProvider(getLadProvider(openmct));
  };
}

function getRealtimeProvider(openmct) {
  return {
    supportsSubscribe: (domainObject) => domainObject.type === 'example.imagery',
    subscribe: (domainObject, callback) => {
      socket.emit("subscribe-video", domainObject.configuration.imagePortSource)
      socket.on("video-point", msg => {

        callback(msg);
      })
      return () => {
        socket.emit("unsubscribe-video", domainObject.configuration.imagePortSource)
      };
    }
  };
}

function getHistoricalProvider(openmct) {
  return {
    supportsRequest: (domainObject, options) => {
      return domainObject.type === 'example.imagery' && options.strategy !== 'latest';
    },
    request: async (domainObject, options) => {
      const result = await fetch(`/video/frame-ids-between/${options.start}/${options.end}`);
      const data = await result.json();

      return data;
    }
  };
}

function getLadProvider(openmct) {
  return {
    supportsRequest: (domainObject, options) => {
      return domainObject.type === 'example.imagery' && options.strategy === 'latest';
    },
    request: async (domainObject, options) => {
      const result = await fetch(`/video/frame-id-at/${openmct.time.now()}`);
      const data = await result.json();

      return Promise.resolve([data]);

    }
  };
}

