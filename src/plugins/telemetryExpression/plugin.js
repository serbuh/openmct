/*****************************************************************************
 * Open MCT, Copyright (c) 2014-2024, United States Government
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

import TelemetryExpressionProvider from './src/TelemetryExpressionProvider.js';

const DEFAULT_SAMPLES = 10;

export default function plugin() {
  return function install(openmct) {
    openmct.types.addType('telemetry-expression', {
      name: 'Telemetry Expression',
      description:
        'Provides telemetry values that represent the expression described in the expression field in the form',
      creatable: true,
      cssClass: 'icon-telemetry',
      initialize: function (domainObject) {
        domainObject.samples = DEFAULT_SAMPLES;
        domainObject.telemetry = {};
        domainObject.telemetry.values = openmct.time
          .getAllTimeSystems()
          .map(function (timeSystem, index) {
            return {
              key: timeSystem.key,
              name: timeSystem.name,
              hints: {
                domain: index + 1
              }
            };
          });
        domainObject.telemetry.values.push({
          key: 'value',
          name: 'Value',
          hints: {
            range: 1
          }
        });
      },
      form: [
        {
          key: 'telemetryPoints',
          name: 'Telemetry Points (namespace:key, one in each line)',
          control: 'textfield',
          required: true,
          cssClass: 'l-input-lg'
        },
        
        {
          key: 'telemetryExpression',
          name: 'Expression',
          control: 'textfield',
          required: true,
          cssClass: 'l-input-lg'
        },

        {
          key: 'samples',
          name: 'Samples to Collect for each point',
          control: 'textfield',
          required: true,
          cssClass: 'l-input-sm'
        }
      ]
    });
    openmct.telemetry.addProvider(new TelemetryExpressionProvider(openmct));
  };
}
