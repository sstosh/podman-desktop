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

import type { ImageInfo } from '../../../../main/src/plugin/api/image-info';
import type { ImageInfoUI } from './ImageInfoUI';
import moment from 'moment';
import filesize from 'filesize';
import { Buffer } from 'buffer';

export class ImageUtils {
  // extract SHA256 from image id and take the first 12 digits
  getShortId(id: string): string {
    if (id.startsWith('sha256:')) {
      id = id.substring('sha256:'.length);
    }
    return id.substring(0, 12);
  }

  getHumanSize(size: number): string {
    return filesize(size);
  }

  getHumanDate(date: number): string {
    return moment(date * 1000).fromNow();
  }

  getName(repoTag: string) {
    return repoTag.split(':')[0];
  }

  getTag(repoTag: string) {
    return repoTag.split(':')[1];
  }

  getEngineId(containerInfo: ImageInfo): string {
    return containerInfo.engineId;
  }

  getEngineName(containerInfo: ImageInfo): string {
    return containerInfo.engineName;
  }

  getBase64EncodedName(name: string) {
    return Buffer.from(name, 'binary').toString('base64');
  }

  getImagesInfoUI(imageInfo: ImageInfo): ImageInfoUI[] {
    if (!imageInfo.RepoTags) {
      return [
        {
          id: imageInfo.Id,
          shortId: this.getShortId(imageInfo.Id),
          humanCreationDate: this.getHumanDate(imageInfo.Created),
          humanSize: this.getHumanSize(imageInfo.Size),
          name: '<none>',
          engineId: this.getEngineId(imageInfo),
          engineName: this.getEngineName(imageInfo),
          tag: '',
          base64RepoTag: this.getBase64EncodedName('<none>'),
        },
      ];
    } else {
      return imageInfo.RepoTags.map(repoTag => {
        return {
          id: imageInfo.Id,
          shortId: this.getShortId(imageInfo.Id),
          humanCreationDate: this.getHumanDate(imageInfo.Created),
          humanSize: this.getHumanSize(imageInfo.Size),
          name: this.getName(repoTag),
          engineId: this.getEngineId(imageInfo),
          engineName: this.getEngineName(imageInfo),
          tag: this.getTag(repoTag),
          base64RepoTag: this.getBase64EncodedName(repoTag),
        };
      });
    }
  }

  getImageInfoUI(imageInfo: ImageInfo, base64RepoTag: string): ImageInfoUI {
    const images = this.getImagesInfoUI(imageInfo);
    const matchingImages = images.filter(image => image.base64RepoTag === base64RepoTag);
    if (matchingImages.length === 1) {
      return matchingImages[0];
    }
    throw new Error(`Unable to find a matching image for id ${imageInfo.Id} and tag ${base64RepoTag}`);
  }
}
