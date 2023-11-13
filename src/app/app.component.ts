import { Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  message:any
  BrowserToken:any
  constructor(public translate: TranslateService) {
    translate.addLangs(['en', 'es', 'it', 'ru', 'de']);
    translate.setDefaultLang('en');

    const browserLang = translate.getBrowserLang();
    translate.use(browserLang.match(/en|it|es|ru|de/) ? browserLang : 'en');
  }
  ngOnInit(): void {
      // this.requestPermission();
      // this.listen();
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
