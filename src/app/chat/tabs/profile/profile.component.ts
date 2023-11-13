import { Component, OnInit } from '@angular/core';
import { ChatService } from '../../chat.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
/**
 * Tabs-Profile component
 */
export class ProfileComponent implements OnInit {

  senderName:any;
  senderProfile:any;
  $nameSubscriber: Subscription;


  constructor( private chatService: ChatService) {
    this.$nameSubscriber = this.chatService.userName.subscribe(name => this.senderName = name)
  }

  ngOnInit(): void {
    const user = window.localStorage.getItem('currentUser');
    //this.senderName = user
    this.senderProfile = 'assets/images/user.png'
  }

}
