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
import mount from 'utils/mount';

import Plot from '../PlotView.vue';

export default function OverlayPlotViewProvider(openmct) {
  function isCompactView(objectPath) {
    let isChildOfTimeStrip = objectPath.find((object) => object.type === 'time-strip');

    return isChildOfTimeStrip && !openmct.router.isNavigatedObject(objectPath);
  }

  return {
    key: 'plot-overlay',
    name: 'Overlay Plot',
    cssClass: 'icon-telemetry',
    canView(domainObject, objectPath) {
      return domainObject.type === 'telemetry.plot.overlay';
    },

    canEdit(domainObject, objectPath) {
      return domainObject.type === 'telemetry.plot.overlay';
    },

    view: function (domainObject, objectPath) {
      let _destroy = null;
      let component = null;

      return {
        show: function (element) {
          let isCompact = isCompactView(objectPath);
          const { vNode, destroy } = mount(
            {
              el: element,
              components: {
                Plot
              },
              provide: {
                openmct,
                domainObject,
                path: objectPath
              },
              data() {
                return {
                  options: {
                    compact: isCompact
                  }
                };
              },
              template: '<plot ref="plotComponent" :options="options"></plot>'
            },
            {
              app: openmct.app,
              element
            }
          );
          _destroy = destroy;
          component = vNode.componentInstance;
        },
        getViewContext() {
          if (!component) {
            return {};
          }

          return component.$refs.plotComponent.getViewContext();
        },
        destroy: function () {
          if (_destroy) {
            _destroy();
          }
        }
      };
    }
  };
}
