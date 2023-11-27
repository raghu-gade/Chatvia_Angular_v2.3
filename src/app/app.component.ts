import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { OAuthService } from 'angular-oauth2-oidc';
import { Subscription, filter } from 'rxjs';
import { SpinnerService } from './spinner/spinner.service';
import { AuthorizeService } from './Startup/authorizeservice';
import { UserIdleService } from 'angular-user-idle';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  isAutherized: boolean;
  isSessionContinue: boolean;
  tokenExpirySubscription: Subscription;
  tokenBeforeExpirySubscription: Subscription;
  accessTokenLifeTimeMillSec: any;
  message:any
  BrowserToken:any
  constructor(public translate: TranslateService,private oauthService: OAuthService, private router: Router, private spinnerService: SpinnerService, private authorizeService: AuthorizeService,private userIdle: UserIdleService) {
    // translate.addLangs(['en', 'es', 'it', 'ru', 'de']);
    // translate.setDefaultLang('en');

    // const browserLang = translate.getBrowserLang();
    // translate.use(browserLang.match(/en|it|es|ru|de/) ? browserLang : 'en');
    this.configure();
  }
  ngOnInit(): void {
      // this.requestPermission();
      // this.listen();
      this.userIdle.startWatching();
      this.userIdle.onTimerStart().subscribe(count => this.idelTimeout(count));
  }
  idelTimeout(count: any) {
    this.oauthService.logOut();
  }
  configure() {
    debugger
    this.spinnerService.show();
    this.isSessionContinue = false;
    this.oauthService.loadDiscoveryDocumentAndTryLogin({ disableOAuth2StateCheck: true })
      .then(_ => {
        if (!this.oauthService.hasValidIdToken() ||
          !this.oauthService.hasValidAccessToken()) {
          this.oauthService.initLoginFlow(window.location.hash);
        }
        else {
          debugger
          this.authorizeService.isAuthorized = true;
          console.log("Auherized");
          this.oauthService.state = this.oauthService.state === '' ? window.location.hash : this.oauthService.state;
          this.oauthService.loadUserProfile()
            .then((data) => {
              var currentAuthStatus;
              data['email'] = data['unique_name'];
              this.authorizeService.userInfo = data;
              this.authorizeService.setTimeForShowContineSessionInMillSec();
              this.accessTokenLifeTimeMillSec = this.authorizeService.accessTokenLifeTimeMillSec;
              console.log(data);
              this.authorizeService.isAuthorizeUser$.asObservable()
                .subscribe((status) => {
                  currentAuthStatus = status;
                });
              this.spinnerService.hide();
              this.router.navigate([this.landingPage()]);
              //this.router.navigate(['/']);
              this.authorizeService.isAuthorizeUser$.next(!currentAuthStatus);
              this.oauthService.events
                .pipe(filter(e => ['session_terminated', 'session_error'].includes(e.type)))
                .subscribe(e => this.LogoutToken());
              // this.oauthService.setupAutomaticSilentRefresh();
              //this.showPopUpForBeforeTokenExpiry();
            })

        }
      });
  }
  LogoutToken() {
    this.configure();
  }
  landingPage() {

    if (this.authorizeService.isAuthorized) {
      // this.sharedService.userContext = this.authorizeService.userInfo;
      if (this.oauthService.state.startsWith('#/'))
        return '/' + this.oauthService.state.substr(2);
      else
        return '/' + this.oauthService.state;
    }
  }
  // requestPermission() {
  //   const messaging = getMessaging();
  //   getToken(messaging,
  //    { vapidKey: environment.firebase.vapidKey}).then(
  //      (currentToken) => {
  //       debugger
  //        if (currentToken) {
  //          console.log("Hurraaa!!! we got the token.....");
  //          console.log(currentToken);
  //           this.BrowserToken = currentToken;

  //        } else {
  //          console.log('No registration token available. Request permission to generate one.');
  //        }
  //    }).catch((err) => {
  //       console.log('An error occurred while retrieving token. ', err);
  //   });
  // }
  // listen() {
  //   const messaging = getMessaging();
  //   onMessage(messaging, (payload) => {
  //     console.log('Message received. ', payload);
  //     this.message=payload;
  //   });
  // }



}
