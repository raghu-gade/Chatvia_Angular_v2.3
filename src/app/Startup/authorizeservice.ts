import { Injectable } from '@angular/core';
import { BehaviorSubject, timer } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthorizeService {
  isAuthorized: boolean;
  isAuthorizeUser$ = new BehaviorSubject<boolean>(false);
  userDetails$ = new BehaviorSubject<boolean>(false);
  userInfo: any;
  helper: any;
  token: any;
  accessTokenLifeTimeMillSec: number;
  constructor() {
    //this.helper = new JwtHelperService();
  }
  setUserInfo(userInfo: any) {
    this.userInfo = userInfo;
  }
  getTokenExpirationDate() {
    var expdate;
    this.decodeToken();
    if (this.token) {
      expdate = new Date(this.token.exp * 1000);
    }
    return expdate;
  }
  getTokenNotBeForeDate() {
    var notBeforeDate
    if (this.token) {
      notBeforeDate = new Date(this.token.nbf * 1000);
    }
    return notBeforeDate;
  }
  decodeToken() {
    //this.token = this.helper.decodeToken(sessionStorage.getItem("access_token"));
  }
  setTimeForShowContineSessionInMillSec() {
    this.accessTokenLifeTimeMillSec = this.getTokenExpirationDate() - this.getTokenNotBeForeDate();
  }
  getTimerForPopUp() {
    return timer(this.accessTokenLifeTimeMillSec * 0.7);
  }
  getTimerForLogout() {
    return timer(this.accessTokenLifeTimeMillSec);
  }
}
