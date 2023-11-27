import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { ServerConfigSettingsService } from "./ServerConfigSettingsService";

@Injectable()
export class ApplicationHttpInterceptor implements HttpInterceptor {
    constructor(private serverConfigSettingService: ServerConfigSettingsService) {
    }

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        var modifiedRequest: HttpRequest<any> = request;

        if (request.url.startsWith('.')) {
            var indexOfFirstSlash = request.url.indexOf('/');
            var serverName = request.url.substring(0, indexOfFirstSlash).toLowerCase();
            var serverConfigSettings = this.serverConfigSettingService.GetServerConfiguration(serverName);

            if (serverConfigSettings != null && serverConfigSettings != undefined) {
                var updatedUrl = this.serverConfigSettingService.GetBaseUrl(serverConfigSettings) + request.url.substring(indexOfFirstSlash);
                var updatedHeaders = request.headers;
                for (let newHeader of serverConfigSettings.DefaultHeaders) {
                    if (!updatedHeaders.has(newHeader.key)) {
                        updatedHeaders = updatedHeaders.append(newHeader.key, newHeader.value);
                    }
                }
                if (serverConfigSettings.IsAuthorized) {
                  updatedHeaders = updatedHeaders.append("Authorization", 'Bearer ' + sessionStorage.getItem("access_token"));
                }
                modifiedRequest = request.clone({
                    url: updatedUrl,
                    headers: updatedHeaders
                });
            }
            else {
                modifiedRequest = request.clone({
                    url: request.url.substring(indexOfFirstSlash)
                });
            }
        }

      return next.handle(modifiedRequest);
      //  pipe(catchError((error: HttpErrorResponse) => {
      //  if (error.status === 401) {
      //    // refresh token
      //  } else {
      //    return throwError(error);
      //  }
      //}));
    }
}
