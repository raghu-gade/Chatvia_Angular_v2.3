import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { AuthConfig, OAuthService } from "angular-oauth2-oidc";
// import { ServerConfigSettingsService } from "./serverconfigsettingsservice";
import { SpinnerService } from "../spinner/spinner.service";
import { ServerConfigSettingsService } from "./ServerConfigSettingsService";

@Injectable()
export class AppInitializerService {
    router: any;

    constructor(private http: HttpClient, private oauthService: OAuthService, private serverConfigSettingsService: ServerConfigSettingsService, private spinnerService: SpinnerService) {
    }

    loadServerConfig(): Promise<any> {
debugger
      return this.http.get("configuration/serverconfig.json")
        .toPromise()
        .then(data => {
          debugger
          this.serverConfigSettingsService.SetServerConfiguration(data)
          this.SetUpIdentityServerLoginAuthConfig();

        })
        .catch(err => console.log("Server configuration not found."));
    }


    private SetUpIdentityServerLoginAuthConfig() {
      var serverConfig = this.serverConfigSettingsService.GetServerConfiguration(".LOCAL");
      var authConfig: AuthConfig = {
        issuer: serverConfig.IdentityServerAddress,
        redirectUri: serverConfig.WebAddress + '/',
        clientId: serverConfig.ClientID,
        // scope: serverConfig.ApiScope,
        clearHashAfterLogin: false,
        silentRefreshTimeout: 600000,
        silentRefreshRedirectUri: serverConfig.WebAddress + '/silent-refresh.html',
      //  oidc: true,
        responseType: "code",
        sessionChecksEnabled: true,
      };
      this.oauthService.configure(authConfig);
     // this.oauthService.tokenValidationHandler = new JwksValidationHandler();
      this.oauthService.setupAutomaticSilentRefresh();
    }
}

export function serverConfigInitializerFactory(startupService: AppInitializerService): Function {
  return () => startupService.loadServerConfig();
}
