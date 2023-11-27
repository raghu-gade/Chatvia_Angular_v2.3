import { Injectable } from '@angular/core';
import { CanLoad, CanActivate, Route, Router } from '@angular/router';
import { AuthorizeService } from '../Startup/authorizeservice';


@Injectable()
export class AuthGuardService implements CanLoad {
  constructor(private authService: AuthorizeService, private router: Router) {
  }
  canLoad(route: Route): boolean {
    console.log("authguard");
    if (this.authService.userInfo['Operations'] != undefined) {
    return true;
  }
  return false;

}
}
