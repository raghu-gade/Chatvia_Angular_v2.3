import { Injectable } from '@angular/core';

import { Observable } from 'rxjs';

export class HeaderConfig {
    key: string;
    value: string | string[]
}

export class HttpClientConfiguration {
    ServerName: string;
    BaseUrl: string;
    HttpsBaseUrl: string;
    DefaultHeaders: HeaderConfig[];
    IsHttps: boolean;
    IsAuthorized: boolean;
    IdentityServerAddress: string;
    WebAddress: string;
    ClientID: string;
    ApiScope: string;
}
@Injectable()
export class ServerConfigSettingsService {
  private configuration: HttpClientConfiguration[];

  constructor() {
      this.configuration = [];
  }

  SetServerConfiguration(serverConfig: any) {
      this.configuration = <HttpClientConfiguration[]>serverConfig;
  }

  GetServerConfiguration(serverName: string): HttpClientConfiguration {
      return this.configuration.find(x => x.ServerName.toLowerCase() === serverName.toLowerCase());
  }

  BuildCompleteUrl(requestUrl: string): string {
      var updatedUrl: string = requestUrl;

      if (requestUrl.startsWith('.')) {
          var indexOfFirstSlash = requestUrl.indexOf('/');
          var serverName = requestUrl.substring(0, indexOfFirstSlash).toLowerCase();
          var serverConfigSettings = this.GetServerConfiguration(serverName);

          if (serverConfigSettings != null && serverConfigSettings != undefined) {
              let baseUrl: string = this.GetBaseUrl(serverConfigSettings);
              updatedUrl = serverConfigSettings.BaseUrl + requestUrl.substring(indexOfFirstSlash);
          }
      }
      return updatedUrl;
  }

  GetBaseUrl(serverConfigSettings: HttpClientConfiguration): string {
      let baseUrl: string = serverConfigSettings.IsHttps ? serverConfigSettings.HttpsBaseUrl : serverConfigSettings.BaseUrl;
      if (baseUrl && baseUrl.endsWith('/')) {
          baseUrl = baseUrl.substring(0, baseUrl.length - 1);
      }

      return baseUrl;
  }
}
