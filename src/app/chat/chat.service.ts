import { HttpClient } from '@angular/common/http';
import { ElementRef, EventEmitter, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { Channel, Client } from 'twilio-chat';
import * as Twilio from 'twilio-chat';

@Injectable({
  providedIn: 'root'
})
export class ChatService {

  constructor(private http:HttpClient, private router: Router) { }

  private url = "https://localhost:7141/api/";
  public chatClient: Client;
  public chatConnectedEmitter: EventEmitter<any> = new EventEmitter<any>()
  public chatDisconnectedEmitter: EventEmitter<any> = new EventEmitter<any>()

  userName:BehaviorSubject<string> = new BehaviorSubject('');
  activeChannel: Channel;
  app:any
  analytics:any

  remoteVideo: ElementRef;
  localVideo: ElementRef;
  previewing: boolean;
  msgSubject = new BehaviorSubject("");
  roomObj: any;
  microphone = true;
  roomParticipants;

  setUsername(text:string){
    this.userName.next(text);
  }
  getUserName(){
  this.userName =this.userName
  }
  connect(token) {
    Twilio.Client.create(token).then( (client: Client) => {
      this.chatClient = client;
      this.chatConnectedEmitter.emit(true);
    }).catch( (err: any) => {
      this.chatDisconnectedEmitter.emit(true);
      if( err.message.indexOf('token is expired') ) {
        localStorage.removeItem('twackToken');
        this.router.navigate(['/']);
      }
    });
  }
  // createChannel(uniqueName, ){
  //   this.activeChannel =  this.chatClient.createChannel({
  //     uniqueName: uniqueChannelName,
  //     friendlyName: `Chat with ${otherUserId}`,
  //   });

  // }
  getChannel(sid: string): Promise<Channel> {

    return this.chatClient.getChannelBySid(sid);

  }

  getToken(name:string): Observable<any>{

    return this.http.get(this.url + 'Chat?name=' +name);
  }

  getUsers(){
    return this.http.get(this.url + 'User/GetUsers');
  }
  getFirebase(app, analytics) {
    this.app=app
    this.analytics = analytics
  }
  getFirebaseApp(){
    return this.app,this.analytics
  }
  sendNotificationByIdentity(msgBody): Observable<any>{
    debugger
    return this.http.post(this.url + 'Chat/SendNotificationByIdentity', msgBody);
  }
  getVideoChatToken(name:string): Observable<any>{
    return this.http.get(this.url + 'Chat/CreateVideoAccessToken?name=' +name);
  }

  getVideoChatTokenWithRoom(name:string, roomName:string): Observable<any>{
    return this.http.get(this.url + 'Chat/CreateVideoTokenWithRoom?name=' +name+'&room='+roomName);
  }
  GetParticipantsByConversationSid(sid){
    return this.http.get(this.url + 'Chat/GetParticipantsByConversationSid?ConversationId='+sid);
  }





}
