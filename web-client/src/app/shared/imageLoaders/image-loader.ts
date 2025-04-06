import { IMAGE_LOADER, ImageLoader } from '@angular/common';
import { Injectable, Provider } from '@angular/core';
import { environment } from '../../../environments/environment';

export const ImageSizes = {
  original: { suffix: 'Original', width: 1920 },
  normal: { suffix: 'Normal', width: 1080 },
  medium: { suffix: 'Medium', width: 800 },
  small: { suffix: 'Small', width: 400 },
  tiny: { suffix: 'Tiny', width: 80 },
};

@Injectable({
  providedIn: 'root',
})
export class ImageUrlService {
  private readonly apiBase = environment.apiBaseUrl;

  isApiImage(src: string): boolean {
    return src.includes('/journeys/') || src.startsWith('http');
  }

  buildApiImageUrl(src: string, size: string): string {
    if (src.includes(`/${size}`)) {
      return src;
    }

    const match = src.match(/\/journeys\/([^/]+)\/cover\/([^/]+)/);
    if (!match) return src;

    const [, journeyId, coverId] = match;
    return `${this.apiBase}/journeys/${journeyId}/cover/${coverId}/${size}`;
  }

  buildPlaceholderUrl(src: string, sizeSuffix: string): string {
    if (sizeSuffix === 'Original') return src;

    const path = src.substring(0, src.lastIndexOf('.'));
    const ext = src.substring(src.lastIndexOf('.'));
    return `${path}_${sizeSuffix}${ext}`;
  }
}

export function travelSidecarImageLoader(): ImageLoader {
  return (config: { src: string }): string => {
    const { src } = config;
    if (!src) return '';

    return src;
  };
}

export const provideTravelSidecarImageLoader: Provider = {
  provide: IMAGE_LOADER,
  useFactory: () => travelSidecarImageLoader(),
  deps: [ImageUrlService],
};
