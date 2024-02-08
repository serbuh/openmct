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

import objectUtils from 'objectUtils';

import TelemetryEvaluator from './TelemetryEvaluator.js';

export class TelemetryExpressionProvider {
  constructor(openmct) {
    this.openmct = openmct;
    this.telemetryAPI = openmct.telemetry;
    this.timeAPI = openmct.time;
    this.objectAPI = openmct.objects;
    this.perObjectProviders = {};
  }
  canProvideTelemetry(domainObject) {
    return domainObject.type === 'telemetry-expression';
  }
  supportsRequest(domainObject) {
    return domainObject.type === 'telemetry-expression';
  }
  supportsSubscribe(domainObject) {
    return domainObject.type === 'telemetry-expression';
  }
 
  async subscribe(domainObject, callback) {
    let wrappedUnsubscribe;
    let unsubscribeCalled = false;
    const objectIds = await domainObject
      .telemetryPoints.split("\n")
      .map(async (point) => await this.objectAPI.get(objectUtils.parseKeyString(point)));

    const samples = domainObject.samples;

    objectIds.forEach(
      function (linkedDomainObject) {
        if (!unsubscribeCalled) {
          wrappedUnsubscribe = this.subscribeToAverage(linkedDomainObject, samples, callback);
        }
      }.bind(this)
    )
      .catch(logError);

    return function unsubscribe() {
      unsubscribeCalled = true;
      if (wrappedUnsubscribe !== undefined) {
        wrappedUnsubscribe();
      }
    };
  }
  subscribeToAverage(domainObject, samples, callback) {
    const telemetryEvaluator = new TelemetryEvaluator(this.telemetryAPI, this.timeAPI, domainObject, samples, callback);
    const createAverageDatum = telemetryEvaluator.createAverageDatum.bind(telemetryEvaluator);

    return this.telemetryAPI.subscribe(domainObject, createAverageDatum);
  }
  async request(domainObject, request) {
    const objectIds = await domainObject
      .telemetryPoints.split("\n")
      .map(async (point) => await this.objectAPI.get(objectUtils.parseKeyString(point)));

    const samples = domainObject.samples;

    return objectIds.map(
      function (linkedDomainObject) {
        return this.requestAverageTelemetry(linkedDomainObject, request, samples);
      }.bind(this)
    );
  }
  /**
   * @private
   */
  requestAverageTelemetry(domainObject, request, samples) {
    const averageData = [];
    const addToAverageData = averageData.push.bind(averageData);
    const telemetryAverager = new TelemetryEvaluator(this.telemetryAPI, this.timeAPI, domainObject, samples, addToAverageData );
    const createAverageDatum = telemetryAverager.createAverageDatum.bind(telemetryAverager);

    return this.telemetryAPI.request(domainObject, request).then(function (telemetryData) {
      telemetryData.forEach(createAverageDatum);

      return averageData;
    });
  }
  /**
   * @private
   */
  async getLinkedObject(domainObject) {
    // Each new line represents one telemetry point 
    const objectIds = await domainObject
      .telemetryPoints.split("\n")
      .map(async (point) => await this.objectAPI.get(objectUtils.parseKeyString(point)));

    return objectIds;
  }
}

function logError(error) {
  if (error.stack) {
    console.error(error.stack);
  } else {
    console.error(error);
  }
}
