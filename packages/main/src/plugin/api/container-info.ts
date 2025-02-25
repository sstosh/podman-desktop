/**********************************************************************
 * Copyright (C) 2022 Red Hat, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * SPDX-License-Identifier: Apache-2.0
 ***********************************************************************/

import type Dockerode from 'dockerode';

export interface ContainerInfo extends Dockerode.ContainerInfo {
  engineId: string;
  engineName: string;
  StartedAt: string;
}

export interface HostConfig {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  PortBindings?: any;
}

export interface ContainerCreateOptions {
  name?: string | undefined;
  // eslint-disable-next-line @typescript-eslint/ban-types
  ExposedPorts?: { [port: string]: {} } | undefined;
  HostConfig?: HostConfig | undefined;
  Image?: string | undefined;
}
