import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthorizeService } from '../authorizeservice';
import { SpinnerService } from 'src/app/spinner/spinner.service';
import { ChatService } from 'src/app/chat/chat.service';
import { ServerConfigSettingsService } from '../ServerConfigSettingsService';

@Component({
  selector: 'app-main',
  template:'',
  styleUrls: ['./main.component.scss']
})
export class MainComponent implements OnInit{
  constructor(private router: Router, private authorizeService: AuthorizeService, private spinnerService: SpinnerService,private chatService: ChatService
    ,private serverConfigSettingsService: ServerConfigSettingsService,) {
    this.spinnerService.show();
}
ngOnInit() {
  debugger
  this.authorizeService.isAuthorizeUser$.asObservable()
  .subscribe((auth) => {
    debugger
      if (this.authorizeService.isAuthorized) {
        this.Login()
      }
      this.spinnerService.hide();
  });
}
Login(){
  var Userdata= this.authorizeService.userInfo
  debugger
  //Userdata.info.firstname ='thanujav'

    this.chatService.setUsername(Userdata.info.firstname)
    this.router.navigate(["chat"]);
    // console.log(this.error)
  }
}
