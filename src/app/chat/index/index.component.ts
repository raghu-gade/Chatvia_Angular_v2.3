import {
  Component,
  OnInit,
  ViewChild,
  TemplateRef,
  RendererFactory2,
  Renderer2,
  ElementRef,
} from '@angular/core';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NgbOffcanvas } from '@ng-bootstrap/ng-bootstrap';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
import { chat, groups } from './data';
import { Chats, Groups } from './chat.model';
import { Lightbox } from 'ngx-lightbox';
import { environment } from '../../../environments/environment';
import { AuthenticationService } from '../../core/services/auth.service';
import { AuthfakeauthenticationService } from '../../core/services/authfake.service';
import * as $ from 'jquery';
import * as Twilio from 'twilio-chat';
import { isSupported } from '@firebase/messaging';

import {
  Messaging,
  getMessaging,
  getToken,
  onMessage,
} from '@firebase/messaging';

// Date Format
import { DatePipe, provideCloudinaryLoader } from '@angular/common';
import { ChatService } from '../chat.service';
import {
  Client,
  ConnectionState,
  Conversation,
  Message,
  Participant,
  SendMediaOptions,
  User,
  PushNotification,
} from '@twilio/conversations';

import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { SpinnerService } from 'src/app/spinner/spinner.service';
import { ToastrService } from 'ngx-toastr';
import { SendNotificationByIdentity } from 'src/app/models/SendNotificationByIdentity';
import * as firebase from 'firebase/compat';
import { FirebaseApp, initializeApp } from 'firebase/app';
import { connect, createLocalVideoTrack } from 'twilio-video';

@Component({
  selector: 'app-index',
  templateUrl: './index.component.html',
  styleUrls: ['./index.component.scss'],
})

/**
 * Chat-component
 */
export class IndexComponent implements OnInit {
  activetab = 2;
  chat: Chats[];
  groups: Groups[];
  formData!: FormGroup;
  @ViewChild('scrollRef') scrollRef: any;
  emoji = '';
  isreplyMessage = false;
  isgroupMessage = false;
  mode: string | undefined;
  public isCollapsed = true;
  token: any;
  client: Client;
  currentTime: Date;
  currentConversation: Conversation;
  messages: Array<Message> = [];
  chatList: any = [];
  isTyping: boolean;
  $nameSubscriber: Subscription;
  sendMessage: string = '';
  phoneNumber: any = '';
  identity: any = '';
  friendlyName: any = '';
  error: any;
  newUser: any = '';
  public chatClient: Client;
  userlogo: any = '';
  selectedUsers = [];
  ChannelName: any;
  channelIdentity: any;
  groupList: any = [];
  message: any;
  BrowserToken: any;
  videotoken: any;
  roomName: any;

  joinRoomName: any;
  roomObj: any;
  microphone = true;
  previewing: boolean;
  roomParticipants;
  remoteVideo: ElementRef;
  localVideo: ElementRef;
  isVideoChat: boolean = false;
  localParticipant: any;
  conversationName:string
  //remoteParticipant:any
  // remoteParticipant = document.getElementById('remoteParticipant');
  // remoteIdentity = document.getElementById('remoteIdentity');

  public msgBody: SendNotificationByIdentity;

  private conSub: any;
  public app: FirebaseApp;
  public messaging: Messaging;
  public initialized = false;

  listLang = [
    { text: 'English', flag: 'assets/images/flags/us.jpg', lang: 'en' },
    { text: 'Spanish', flag: 'assets/images/flags/spain.jpg', lang: 'es' },
    { text: 'German', flag: 'assets/images/flags/germany.jpg', lang: 'de' },
    { text: 'Italian', flag: 'assets/images/flags/italy.jpg', lang: 'it' },
    { text: 'Russian', flag: 'assets/images/flags/russia.jpg', lang: 'ru' },
  ];

  lang: string;
  images: { src: string; thumb: string; caption: string }[] = [];

  constructor(
    private authFackservice: AuthfakeauthenticationService,
    private authService: AuthenticationService,
    private router: Router,
    public translate: TranslateService,
    private modalService: NgbModal,
    private offcanvasService: NgbOffcanvas,
    public formBuilder: FormBuilder,
    private datePipe: DatePipe,
    private lightbox: Lightbox,
    private chatService: ChatService,
    private loader: SpinnerService,
    private toastr: ToastrService,
    private renderer: Renderer2,

  ) {
    this.$nameSubscriber = this.chatService.userName.subscribe(
      (name) => (this.userName = name)
    );

  }

  /**
   * Open lightbox
   */
  openImage(index: number, i: number): void {
    // open lightbox
    this.lightbox.open(this.message[index].imageContent, i, {
      showZoom: true,
    });
  }

  senderName: any;
  senderProfile: any;
  isToday: any;
  contactsList: User[];
  userList: any;
  ngOnInit(): void {
    document.body.setAttribute('data-layout-mode', 'light');
    this.isToday = new Date();
    //this.FCMInit()

    this.connectTwilio();
    // Validation
    this.formData = this.formBuilder.group({
      message: ['', [Validators.required]],
    });

    const user = this.userName;
    this.senderName = user;
    this.senderProfile = 'assets/images/user.png';
    this.chat = chat;
    this.groups = groups;
    this.lang = this.translate.currentLang;
    this.onListScroll();
    this.getContacts();

  }

  // FCMInit() {
  //   try {
  //     // eslint-disable-next-line @typescript-eslint/no-explicit-any
  //     debugger
  //     //this.app = initializeApp((window as any).firebaseConfig);
  //     this.app = initializeApp(environment.firebase);
  //     this.messaging = getMessaging(this.app);
  //     this.initialized = true;
  //     //this.initFcmServiceWorker();

  //   } catch(err) {
  //     console.log(err)
  //     console.warn("Couldn't initialize firebase app");
  //   }
  // }

  ngAfterViewInit() {
    this.scrollRef.SimpleBar.getScrollElement().scrollTop = 100;
  }
  //  initFcmServiceWorker = async (): Promise<void> => {
  //     if (!this.initialized) {
  //       return;
  //     }

  //     try {
  //       debugger
  //       const registration = await navigator.serviceWorker.register(
  //         "firebase-messaging-sw.js"
  //       );
  //       //this.subscribeFcmNotifications(this.client);
  //       console.log("ServiceWorker registered with scope:", registration.scope);
  //     } catch (e) {
  //       console.log("ServiceWorker registration failed:", e);
  //     }
  //   };
  // subscribeFcmNotifications = async (
  //     convoClient: Client
  //   ): Promise<void> => {
  //     if (!this.initialized) {
  //       return;
  //     }
  // try {
  //     const permission = await Notification.requestPermission();
  //     debugger
  //     if (permission !== "granted") {
  //       console.log("FcmNotifications: can't request permission:", permission);
  //       return;
  //     }

  //     const fcmToken = await getToken(this.messaging, { vapidKey: environment.firebase.vapidKey});
  //     if (!fcmToken) {
  //       console.log("FcmNotifications: can't get fcm token");
  //       return;
  //     }

  //     console.log("FcmNotifications: got fcm token", fcmToken);
  //     try{
  //     await this.client.setPushRegistrationId("fcm", fcmToken).then(a=>{
  //       console.log(a)
  //     }).catch(e=>{console.log(e)})
  //     debugger
  //   }
  //   catch (e) {
  //     console.log(e)
  //     console.log("subscribeFcmNotifications failed:", e);
  //   }
  //     onMessage(this.messaging, (payload) => {
  //       console.log("FcmNotifications: push received", payload);
  //       if (convoClient) {
  //         convoClient.handlePushNotification(payload);
  //       }
  //     });
  //   } catch (e) {
  //     console.log(e)
  //     console.log("subscribeFcmNotifications failed:", e);
  //   }
  //   };
  showNotification = (pushNotification: PushNotification): void => {
    // if (!this.initialized) {
    //   return;
    // }

    // TODO: remove when new version of sdk will be released
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const notificationTitle = pushNotification.data.conversationTitle || '';
    debugger;
    const notificationOptions = {
      body: pushNotification.body ?? '',
      icon: 'favicon.ico',
    };

    const notification = new Notification(
      notificationTitle,
      notificationOptions
    );
    notification.onclick = (event) => {
      console.log('notification.onclick', event);
      event.preventDefault(); // prevent the browser from focusing the Notification's tab
      // TODO: navigate to the corresponding conversation
      notification.close();
    };
  };

  /**
   * Show user profile
   */
  // tslint:disable-next-line: typedef
  showUserProfile() {
    document.getElementById('profile-detail').style.display = 'block';
  }

  /**
   * Close user chat
   */
  // tslint:disable-next-line: typedef
  closeUserChat() {
    document.getElementById('chat-room').classList.remove('user-chat-show');
  }

  /**
   * Logout the user
   */
  logout() {
    if (environment.defaultauth === 'firebase') {
      this.authService.logout();
    } else if (environment.defaultauth === 'fackbackend') {
      this.authFackservice.logout();
    }
    this.router.navigate(['/account/login']);
  }

  /**
   * Set language
   * @param lang language
   */
  setLanguage(lang) {
    this.translate.use(lang);
    this.lang = lang;
  }

  openCallModal(content) {
    this.modalService.open(content, { centered: true });
  }

  openVideoModal(videoContent) {
    this.modalService.open(videoContent, { centered: true });
  }

  /**
   * Show user chat
   */
  // tslint:disable-next-line: typedef
  userName: any = 'Doris Brown';
  userStatus: any = 'online';
  userProfile: any = 'assets/images/users/avatar-4.jpg';
  // messaging: any;
  showChat(event: any, id: any) {
    var removeClass = document.querySelectorAll('.chat-user-list li');
    removeClass.forEach((element: any) => {
      element.classList.remove('active');
    });

    document.querySelector('.user-chat').classList.add('user-chat-show');
    document.querySelector('.chat-welcome-section').classList.add('d-none');
    document.querySelector('.user-chat').classList.remove('d-none');
    event.target.closest('li').classList.add('active');
    var data = this.chat.filter((chat: any) => {
      return chat.id === id;
    });
    this.userName = data[0].name;
    this.userStatus = data[0].status;
    this.userProfile = data[0].profilePicture;
    this.message = data[0].messages;
    this.onListScroll();
  }
  getContacts() {
    this.contactsList = [];
    this.loader.show();
    this.chatService.getUsers().subscribe(
      (data: any) => {
        let users = data.users;
        users.forEach((x: any) => {
          this.contactsList.push(x);
        });
        const sorted = this.contactsList.sort((a, b) =>
          a.identity > b.identity ? 1 : -1
        );

        const grouped = sorted.reduce((groups, contact) => {
          const letter = this.translate.instant(contact.identity).charAt(0);
          groups[letter] = groups[letter] || [];
          groups[letter].push(contact);

          return groups;
        }, {});

        // contacts list
        this.userList = Object.keys(grouped).map((key) => ({
          key,
          contacts: grouped[key],
        }));
        this.loader.hide();
      },
      (error: any) => {
        console.log(error);
        this.loader.hide();
      }
    );
  }
  selectUsers(e, item) {
    console.log(e.currentTarget.checked);
    console.log(item);
    if (e.currentTarget.checked == true) {
      this.selectedUsers.push(item);
    }
    if (e.currentTarget.checked == false) {
      //let unselectedIndex=this.selectedUsers.findIndex(x => x == item.sid)
      this.selectedUsers.splice(this.selectedUsers.indexOf(item.sid), 1);
      //   if (this.selectedUsers.find(x => x == item.sid)) {
      //     this.selectedUsers.splice(this.selectedUsers.findIndex(x => x == item.sid), 1);
      //  }
      console.log(this.selectedUsers);
    }
  }

  // Contact Search
  ContactSearch() {
    var input: any,
      filter: any,
      ul: any,
      li: any,
      a: any | undefined,
      i: any,
      txtValue: any;
    input = document.getElementById('searchContact') as HTMLAreaElement;
    filter = input.value.toUpperCase();
    ul = document.querySelectorAll('.chat-user-list');
    ul.forEach((item: any) => {
      li = item.getElementsByTagName('li');
      for (i = 0; i < li.length; i++) {
        a = li[i].getElementsByTagName('h5')[0];
        txtValue = a?.innerText;
        if (txtValue?.toUpperCase().indexOf(filter) > -1) {
          li[i].style.display = '';
        } else {
          li[i].style.display = 'none';
        }
      }
    });
  }

  // Message Search
  MessageSearch() {
    var input: any,
      filter: any,
      ul: any,
      li: any,
      a: any | undefined,
      i: any,
      txtValue: any;
    input = document.getElementById('searchMessage') as HTMLAreaElement;
    filter = input.value.toUpperCase();
    ul = document.getElementById('users-conversation');
    li = ul.getElementsByTagName('li');
    for (i = 0; i < li.length; i++) {
      a = li[i].getElementsByTagName('p')[0];
      txtValue = a?.innerText;
      if (txtValue?.toUpperCase().indexOf(filter) > -1) {
        li[i].style.display = '';
      } else {
        li[i].style.display = 'none';
      }
    }
  }

  // Filter Offcanvas Set
  onChatInfoClicked(content: TemplateRef<any>) {
    this.offcanvasService.open(content, { position: 'end' });
  }

  /**
   * Returns form
   */
  get form() {
    return this.formData.controls;
  }

  /**
   * Save the message in chat
   */
  messageSave() {
    var groupMsg = document.querySelector('.pills-groups-tab.active');
    const message = this.formData.get('message')!.value;
    if (!groupMsg) {
      document.querySelector(
        '.chat-user-list li.active .chat-user-message'
      ).innerHTML = message ? message : this.img;
    }
    var img = this.img ? this.img : '';
    var status = this.img ? true : '';
    var dateTime = this.datePipe.transform(new Date(), 'h:mm a');
    var chatReplyUser =
      this.isreplyMessage == true
        ? (
            document.querySelector(
              '.replyCard .replymessage-block .flex-grow-1 .conversation-name'
            ) as HTMLAreaElement
          ).innerHTML
        : '';
    var chatReplyMessage =
      this.isreplyMessage == true
        ? (
            document.querySelector(
              '.replyCard .replymessage-block .flex-grow-1 .mb-0'
            ) as HTMLAreaElement
          ).innerText
        : '';
    this.message.push({
      id: 1,
      message: message,
      name: this.senderName,
      profile: this.senderProfile,
      time: dateTime,
      align: 'right',
      isimage: status,
      imageContent: [img],
      replayName: chatReplyUser,
      replaymsg: chatReplyMessage,
    });
    this.onListScroll();

    // Set Form Data Reset
    this.formData = this.formBuilder.group({
      message: null,
    });
    this.isreplyMessage = false;
    this.emoji = '';
    this.img = '';
    chatReplyUser = '';
    chatReplyMessage = '';
    document.querySelector('.replyCard')?.classList.remove('show');
  }
  messageSend() {
    var groupMsg = document.querySelector('.pills-groups-tab.active');

    this.msgBody = new SendNotificationByIdentity();
    const message = this.sendMessage;

    // if (!groupMsg) {
    //   document.querySelector('.chat-user-list li.active .chat-user-message').innerHTML = message ? message: this.img;
    // }
    if (this.sendMessage != undefined || this.sendMessage != null) {
      this.currentConversation
        .sendMessage(message)
        .then((result) => {
          this.loader.show();
          // this.chatService.sendNotificationByIdentity(this.msgBody).subscribe((data)=>{
          //   this.loader.hide()
          // },
          // (err)=>{this.loader.hide()
          // console.log("error", err);})
          this.message = '';
          this.sendMessage = '';
        })
        .catch((err) => console.log(err));
    }
    this.onListScroll();
    var img = this.img ? this.img : '';
    var status = this.img ? true : '';
    var dateTime = this.datePipe.transform(new Date(), 'h:mm a');
    var chatReplyUser =
      this.isreplyMessage == true
        ? (
            document.querySelector(
              '.replyCard .replymessage-block .flex-grow-1 .conversation-name'
            ) as HTMLAreaElement
          ).innerHTML
        : '';
    var chatReplyMessage =
      this.isreplyMessage == true
        ? (
            document.querySelector(
              '.replyCard .replymessage-block .flex-grow-1 .mb-0'
            ) as HTMLAreaElement
          ).innerText
        : '';

    this.formData = this.formBuilder.group({
      message: null,
    });
    this.isreplyMessage = false;
    this.emoji = '';
    this.img = '';
    chatReplyUser = '';
    chatReplyMessage = '';
    // this.sendMessage=''
    // document.querySelector('.replyCard')?.classList.remove('show');
  }

  onListScroll() {
    if (this.scrollRef !== undefined) {
      setTimeout(() => {
        this.scrollRef.SimpleBar.getScrollElement().scrollTop =
          this.scrollRef.SimpleBar.getScrollElement().scrollHeight;
      }, 500);
    }
  }

  // Emoji Picker
  showEmojiPicker = false;
  sets: any = [
    'native',
    'google',
    'twitter',
    'facebook',
    'emojione',
    'apple',
    'messenger',
  ];
  set: any = 'twitter';
  toggleEmojiPicker() {
    this.showEmojiPicker = !this.showEmojiPicker;
  }

  addEmoji(event: any) {
    const { emoji } = this;
    const text = `${emoji}${event.emoji.native}`;
    this.emoji = text;
    this.showEmojiPicker = false;
  }

  onFocus() {
    this.showEmojiPicker = false;
  }
  onBlur() {}

  closeReplay() {
    document.querySelector('.replyCard')?.classList.remove('show');
  }

  // Copy Message
  copyMessage(event: any) {
    navigator.clipboard.writeText(
      event.target.closest('.chats').querySelector('.messageText').innerHTML
    );
    document.getElementById('copyClipBoard')?.classList.add('show');
    setTimeout(() => {
      document.getElementById('copyClipBoard')?.classList.remove('show');
    }, 1000);
  }

  // Delete Message
  deleteMessage(event: any) {
    event.target.closest('.chats').remove();
  }

  deleteMsg(event: any, data) {
    this.loader.show();
    data
      .remove()
      .then((a) => {
        event.target.closest('.chats').remove();
        this.loader.hide();
        this.toastr.success('Message Deleted');
      })
      .catch((err) => {
        this.loader.hide();
        console.log(err);
        this.toastr.error(err);
      });
  }
  deleteConversation(event) {
    this.loader.show();
    this.currentConversation
      .delete()
      .then((a) => {
        //this.fetchUserChats();
        this.connectTwilio();
        // var removeClass = document.querySelectorAll('.chat-user-list li');
        // removeClass.forEach((element: any) => {
        //   element.classList.remove('active');
        // });
        // this.fetchMessages();
        document.querySelector('.user-chat').classList.remove('user-chat-show');
        document
          .querySelector('.chat-welcome-section')
          .classList.remove('d-none');
        document.querySelector('.user-chat').classList.add('d-none');
        this.toastr.success(
          'DeletedConversation :' + this.currentConversation.friendlyName
        );
        // e.target.closest('li').classList.add('active');

        //this.loader.hide();
      })
      .catch((err) => {
        this.loader.hide();
        console.log(err);
        this.toastr.error(err);
      });
  }

  // Delete All Message
  deleteAllMessage(event: any) {
    var allMsgDelete: any = document
      .getElementById('users-conversation')
      ?.querySelectorAll('.chats');
    allMsgDelete.forEach((item: any) => {
      item.remove();
    });
  }

  // Replay Message
  replyMessage(event: any, align: any) {
    this.isreplyMessage = true;
    document.querySelector('.replyCard')?.classList.add('show');
    var copyText = event.target
      .closest('.chats')
      .querySelector('.messageText').innerHTML;
    (
      document.querySelector(
        '.replyCard .replymessage-block .flex-grow-1 .mb-0'
      ) as HTMLAreaElement
    ).innerHTML = copyText;
    var msgOwnerName: any =
      event.target.closest('.chats').classList.contains('right') == true
        ? 'You'
        : document.querySelector('.username')?.innerHTML;
    (
      document.querySelector(
        '.replyCard .replymessage-block .flex-grow-1 .conversation-name'
      ) as HTMLAreaElement
    ).innerHTML = msgOwnerName;
  }

  /**
   * Open center modal
   * @param centerDataModal center modal data
   */
  centerModal(centerDataModal: any) {
    this.modalService.open(centerDataModal, { centered: true });
  }

  // File Upload
  imageURL: string | undefined;
  img: any;
  fileChange(event: any) {
    //     const file =  fetch("https://v.fastcdn.co/u/ed1a9b17/52533501-0-logo.svg");
    //     const fileBlob =  file.blob();

    // // Send a media message
    // const sendMediaOptions: SendMediaOptions = {
    //     contentType: file.headers.get("Content-Type"),
    //     filename: "twilio-logo.svg",
    //     media: fileBlob
    // };

    //  this.currentConversation.prepareMessage().addMedia(sendMediaOptions);

    // example for sending media message as FormData
    const formData = new FormData();
    formData.append('file', $('#formInputFile')[0].files[0]);
    // get desired channel (for example, with getChannelBySid promise)

    this.chatService
      .getChannel(this.currentConversation.sid)
      .then(function (channel) {
        // send media with all FormData parsed atrtibutes

        channel.sendMessage(formData);
      });

    // let fileList: any = event.target as HTMLInputElement;
    // let file: File = fileList.files[0];
    // const reader = new FileReader();
    // reader.onload = () => {
    //   this.imageURL = reader.result as string;
    //   this.img = this.imageURL;
    // };
    // reader.readAsDataURL(file);
  }

  /**
   * Topbar Light-Dark Mode Change
   */
  changeMode(mode: string) {
    this.mode = mode;
    switch (mode) {
      case 'light':
        document.body.setAttribute('data-layout-mode', 'light');
        break;
      case 'dark':
        document.body.setAttribute('data-layout-mode', 'dark');
        break;
      default:
        document.body.setAttribute('data-layout-mode', 'light');
        break;
    }
  }

  /***
   * ========== Group Msg ============
   */
  /**
   * Show user chat
   */
  // tslint:disable-next-line: typedef
  showGroupChat(event: any, id: any) {
    var removeClass = document.querySelectorAll('.chat-list li');
    removeClass.forEach((element: any) => {
      element.classList.remove('active');
    });
    document.querySelector('.user-chat').classList.add('user-chat-show');
    document.querySelector('.chat-welcome-section').classList.add('d-none');
    document.querySelector('.user-chat').classList.remove('d-none');
    event.target.closest('li').classList.add('active');
    var data = this.groups.filter((group: any) => {
      return group.id === id;
    });
    this.userName = data[0].name;
    this.userProfile = '';
    this.message = data[0].messages;
  }

  /**
   * Open add group modal
   * @param content content
   */
  // tslint:disable-next-line: typedef
  openGroupModal(content: any) {
    this.modalService.open(content, { centered: true });
  }
  openSingleChat(content: any) {
    this.modalService.open(content, { centered: true });
  }

  // Group Search
  GroupSearch() {
    var input: any,
      filter: any,
      ul: any,
      li: any,
      a: any | undefined,
      i: any,
      txtValue: any;
    input = document.getElementById('searchGroup') as HTMLAreaElement;
    filter = input.value.toUpperCase();
    ul = document.querySelectorAll('.group-list');
    ul.forEach((item: any) => {
      li = item.getElementsByTagName('li');
      for (i = 0; i < li.length; i++) {
        a = li[i].getElementsByTagName('h5')[0];
        txtValue = a?.innerText;
        if (txtValue?.toUpperCase().indexOf(filter) > -1) {
          li[i].style.display = '';
        } else {
          li[i].style.display = 'none';
        }
      }
    });
  }
  /////////////////////////////////////////
  connectTwilio() {
    this.loader.show();
    this.chatService.getToken(this.userName).subscribe(
      (data: any) => {
        this.token = data.item1;
        this.CallRedirect();
      },
      (error) => {
        this.toastr.error(error);
        this.loader.hide();
      }
    );
  }

  CallRedirect() {
    this.loader.show();
    if (this.token != null || this.token != '' || this.token != undefined) {
      this.client = new Client(this.token);
      //this.client =  Conversation.
      if (this.currentConversation == undefined || this.currentConversation == null) {
        this.listenToEvents();
      } else {
        this.fetchUserChats();
      }
    } else {
      (error) => console.log(error);
      this.loader.hide();
    }
  }
  public async requestPermission() {
    debugger;
    await this.chatService.connect(this.token);
    // const app = await initializeApp(environment.firebase);
    const messaging = getMessaging();
    this.chatService.chatConnectedEmitter.subscribe( () => {
    getToken(messaging, { vapidKey: environment.firebase.vapidKey })
      .then((currentToken) => {
        debugger;
        if (currentToken) {
          console.log('Hurraaa!!! we got the token.....');
          console.log(currentToken);
          debugger;
          this.BrowserToken = currentToken;
          // this.conSub = this.chatService.chatConnectedEmitter.subscribe( () => {
          //   debugger
          //let a = this.chatService.chatClient;
          this.client.setPushRegistrationId('fcm', this.BrowserToken);

          //this.client.setPushRegistrationId('fcm', this.BrowserToken);
          //.then(async (returnedToken) => {
          //console.log('Token registered successfully:', returnedToken);
          try {
            onMessage(messaging, (payload) => {
              debugger;
              //alert(payload.data.twi_body);
              console.log(
                'New foreground notification from Firebase Messaging!',
                payload.notification
              );
              console.log(payload);
              this.client.handlePushNotification(payload);
            });
          } catch (e) {
            console.log(e);
          }

          // })
          // .catch(error => {
          //   debugger
          //     console.error('Error occurred:', error);
          // });

          // })
        } else {
          console.log(
            'No registration token available. Request permission to generate one.'
          );
        }
      })
      .catch((err) => {
        console.log('An error occurred while retrieving token. ', err);
      });
    });
  }
  listen() {
    const messaging1 = (async () => {
      try {
        const isSupportedBrowser = await isSupported();
        if (isSupportedBrowser) {
          console.log(isSupportedBrowser);
          //return getMessaging(messaging1);
        }
        console.log('Firebase not supported this browser');
        return null;
      } catch (err) {
        console.log(err);
        return null;
      }
    })();

    // onMessage(messaging, (payload) => {
    //   console.log('Message received. ', payload);
    //   this.client.handlePushNotification(payload);
    //   this.messaging=payload;
    // });
  }
  listenToEvents() {
    this.loader.show();

    this.client.on('initialized', () => {
      debugger;
      console.log('Client initialized');
      this.requestPermission();
      this.fetchUserChats();
    });

    this.client.on('initFailed', (error: any) => {
      console.log('Client initialization failed: ', error);
    });

    this.client.on('connectionStateChanged', (state: ConnectionState) => {
      console.log('Connection state change: ', state);
    });

    this.client.on('connectionError', (error: any) => {
      console.log('Connection error: ', error);
    });

    this.client.on('tokenAboutToExpire', () => {
      console.log('About to expire');
      // this.getToken().subscribe(async (token) => {
      //   this.client = await this.client.updateToken(token);
      // })
    });

    this.client.on('tokenExpired', () => {
      console.log('Token expired');
      this.client.removeAllListeners();
      this.connectTwilio();
    });

    this.client.on('conversationAdded', (conv: Conversation) => {
      setTimeout(async () => {
        if (conv.dateCreated && conv.dateCreated > this.currentTime) {
          console.log('Conversation added', conv);
          await conv.setAllMessagesUnread();
          let newChat = {
            chat: conv,
            unreadCount: 0,
            lastMessage: '',
          };
          //this.chatList = [newChat,...this.chatList];
        }
      }, 500);
      this.loader.hide();
    });
    //this.client.setPushRegistrationId('fcm',  this.BrowserToken);

    this.client.on('typingStarted', (user: Participant) => {
      console.log('typing..', user);
      if (
        user.conversation.sid === this.currentConversation.sid &&
        user.identity != this.userName
      )
        this.isTyping = true;
    });

    this.client.on('typingEnded', (user: Participant) => {
      console.log('typing end..', user);
      if (user.conversation.sid === this.currentConversation.sid)
        this.isTyping = false;
    });
    // fired when a participant has joined the conversation
    this.client.on('participantJoined', (participant) => {
      debugger;
      console.log('Participant Added', participant);
    });

    this.client.on('conversationRemoved', (conv: Conversation) => {
      // Fired when the attributes or the metadata of a conversation have been updated
      this.loader.hide();
      //this.fetchUserChats();
      console.log('conversationRemoved', conv);
    });
    this.client.on('pushNotification', (pushNotification: PushNotification) => {
      debugger;
      this.showNotification(pushNotification);
      // pushNotification was received by the client
      debugger;
      console.log(pushNotification);
    });
    this.client.on('messageAdded', async (msg: Message) => {
      console.log('Message added', msg);
      //const messaging = getMessaging();
      //this.getNotificationMsg(messaging)

      if (
        this.currentConversation &&
        this.currentConversation.sid === msg.conversation.sid
      ) {
        this.messages.push(msg);

        await this.currentConversation.updateLastReadMessageIndex(msg.index);
        this.chatList = this.chatList.map((el) => {
          if (el.chat.sid === this.currentConversation.sid) {
            el.lastMessage = msg.body;
          }
          return el;
        });
      } else {
        this.chatList = this.chatList.map((el) => {
          if (el.chat.sid === msg.conversation.sid) {
            el.lastMessage = msg.body;
            el.unreadCount++;
          }
          return el;
        });
      }
    });

    this.loader.hide();
  }
  public async getNotificationMsg(msg) {
    debugger;
    // const messaging1 = (async () => {
    //   try {
    //       const isSupportedBrowser = await isSupported();
    //       if (isSupportedBrowser) {
    //         console.log(isSupportedBrowser)
    //          return getMessaging();
    //       }
    //       console.log('Firebase not supported this browser');
    //       return null;
    //   } catch (err) {
    //       console.log(err);
    //       return null;
    //   }
    //   })();

    const messaging = getMessaging();

    onMessage(messaging, (payload) => {
      debugger;
      console.log('Message received. ', payload);
      this.client.handlePushNotification(payload);
      //this.messaging=payload;
    });

    //       const onMessageListener = async () =>
    //   new Promise((resolve) =>
    //     (async () => {
    //         const messagingResolve = await messaging;
    //         onMessage(messagingResolve, (payload) => {
    //             // console.log('On message: ', messaging, payload);
    //             debugger
    //             resolve(payload);
    //         });
    //     })()
    // );
    //   // onMessage(msg, (payload) =>  {
    //   // debugger
    //   // console.log('Message received. ', payload);
    //   // this.client.handlePushNotification(payload);
    //   // this.messaging=payload;

    // });
  }
  fetchUserChats() {
    this.loader.show();
    this.chatList = [];
    this.groupList = [];
    this.client
      .getSubscribedConversations()
      .then((convs) => {
        let chats: any = [...convs.items];
        // for (let i = 0; i < chats.length; i++) {
        //   debugger
        //      let obj = {
        //     chat: chat,
        //     unreadCount:  chats[i].getUnreadMessagesCount(),
        //     lastMessage: (chats[i].getMessages()).items[
        //       chats[i].lastReadMessageIndex || 0
        //     ],
        //   };
        //   this.chatList.push(obj);

        // }
        if (chats.length > 0) {
          chats.forEach(async (chat: Conversation) => {
            let obj = {
              chat: chat,
              unreadCount: await chat.getUnreadMessagesCount(),
              lastMessage: (await chat.getMessages()).items[
                chat.lastReadMessageIndex || 0
              ],
              users: await chat.getParticipants(),
            };

            if (obj.users.length <= 2) {
              this.chatList.push(obj);
            }
            if (obj.users.length > 2) {
              this.groupList.push(obj);
            }

            // this.chatList.push(obj);
          });
        }
        this.loader.hide();
      })
      .catch((error) => {
        console.log(error);
        this.loader.hide();
        this.toastr.error(error);
      });
  }
  showChatMsg(e, data) {
    this.loader.show();
    this.messages = [];
    this.sendMessage = null;
    this.currentConversation = data;
    document.getElementById('endbutton').style.visibility="hidden"
    document.getElementById('endbutton').style.display="none"
    this.userlogo = this.currentConversation._participants.size;
    this.friendlyName = data.friendlyName;
    var removeClass = document.querySelectorAll('.chat-user-list li');
    removeClass.forEach((element: any) => {
      element.classList.remove('active');
    });
    this.fetchMessages();
    document.querySelector('.user-chat').classList.add('user-chat-show');
    document.querySelector('.chat-welcome-section').classList.add('d-none');
    document.querySelector('.user-chat').classList.remove('d-none');
    e.target.closest('li').classList.add('active');
    document.getElementById('forVideoTab').style.visibility="visible"
    document.getElementById('forVideoTab').style.display="block"

    // var data1 = this.chat.filter((chat:any) => {
    //   return chat.id === id;
    // });
    // this.userName = data[0].name
    // this.userStatus = data[0].status
    // this.userProfile = data[0].profilePicture
    //this.message = data[0].messages

    this.onListScroll();
  }
  showgroupChatMsg(e, data) {
    this.loader.show();
    this.messages = [];
    this.sendMessage = null;
    this.currentConversation = data;
    document.getElementById('endbutton').style.visibility="hidden"
    document.getElementById('endbutton').style.display="none"
    this.userlogo = this.currentConversation._participants.size;
    this.friendlyName = data.friendlyName;
    //var removeClass = document.querySelectorAll('.chat-user-list li');
    var removeClass = document.querySelectorAll('.chat-list li');
    removeClass.forEach((element: any) => {
      element.classList.remove('active');
    });
    this.fetchMessages();
    document.querySelector('.user-chat').classList.add('user-chat-show');
    document.querySelector('.chat-welcome-section').classList.add('d-none');
    document.querySelector('.user-chat').classList.remove('d-none');
    e.target.closest('li').classList.add('active');
    document.getElementById('forVideoTab').style.visibility="visible"
    document.getElementById('forVideoTab').style.display="block"

    // var data1 = this.chat.filter((chat:any) => {
    //   return chat.id === id;
    // });
    // this.userName = data[0].name
    // this.userStatus = data[0].status
    // this.userProfile = data[0].profilePicture
    //this.message = data[0].messages

    this.onListScroll();
  }
  fetchMessages(skip?: number) {
    // this.isLoading = true;
    // this.chatService.getMessagesByConvId(e.sid).subscribe({
    //   next: (data) => {
    //     debugger
    //     this.messages=data.messages
    //     this.isLoading = false;
    //   },
    //   error: (err: any) => {
    //    console.log(err);
    //   }
    // })
    this.loader.show();
    this.currentConversation
      .getMessages(30, skip)
      .then(async (result) => {
        this.messages = [...result.items, ...this.messages];
        if (!skip) {
          let resetTo =
            this.messages.length >= 1
              ? this.messages[this.messages.length - 1].index
              : 0;
          await this.currentConversation.updateLastReadMessageIndex(resetTo);
          this.chatList = this.chatList.map((el) => {
            if (el.chat.sid == this.currentConversation.sid) {
              el.unreadCount = 0;
            }
            return el;
          });
          console.log(this.chatList);
          this.loader.hide();
        }
        this.loader.hide();
      })
      .catch((error) => {
        this.loader.hide();
        console.log(error);
      });
    this.loader.hide();
  }
  AddPartcipant(content) {
    this.modalService.open(content, { centered: true });
  }
  AddNonPartcipant(content) {
    this.modalService.open(content, { centered: true });
  }
  OpenNewConversation(content) {
    this.modalService.open(content, { centered: true });
  }

  AddParticipant() {
    this.loader.show();
    if (this.identity != undefined || this.identity != null) {
      this.client
        .getUser(this.identity)
        .then((res) => {
          this.currentConversation
            .add(this.identity)
            .then((a) => {
              console.log(a);
              this.currentConversation.join();
              this.loader.hide();
              this.toastr.success('Added Participant :' + this.identity);
            })
            .catch((err) => {
              this.modalService.dismissAll();
              this.loader.hide();
              console.log(err.body);
              this.toastr.error(err.body.message);
            });
        })
        .catch((err) => {
          this.loader.hide();
          this.error = 'User not found in Twilio';
          this.toastr.error(this.error);
          setTimeout(() => {
            this.error = null;
          }, 2000);
          this.identity = null;
        });
    }
    //this.identity = null;
    this.modalService.dismissAll();
    //this.identity = null;
    this.connectTwilio();
  }
  AddNonParticipant() {
    this.loader.show();
    if (this.phoneNumber != undefined || this.phoneNumber != null) {
      const proxyAddress = '+18595873984';
      const address = this.phoneNumber;
      const attributes = {
        identity: address,
      };
      this.currentConversation
        .addNonChatParticipant(proxyAddress, address, attributes)
        .then((a) => {
          console.log(a, 'a');
          this.currentConversation.join();
          this.modalService.dismissAll();
          this.connectTwilio();
          this.toastr.success('Added Participant :' + this.phoneNumber);
          this.phoneNumber = '';
          this.loader.hide();
        })
        .catch((err) => {
          this.modalService.dismissAll();
          console.log(err.body, 'while adding the Participant');
          this.loader.hide();
          this.toastr.error(err.body.message);
        });
    }
    //this.phoneNumber=null
  }
  AddNewConversation() {
    this.loader.show();
    if ((this.newUser != undefined || this.newUser != null) && (this.conversationName != undefined || this.conversationName != null) ) {
      this.client
        .getUser(this.newUser)
        .then((res) => {
          this.client
            .createConversation({
              friendlyName: this.conversationName,
            })
            .then(async (channel: Conversation) => {
              channel.join().then(async () => {
                debugger;
                await channel.setAllMessagesUnread();
                // added code for channel with friendly name
                channel.add(this.newUser).then(() => {
                  this.currentConversation = channel;
                  this.modalService.dismissAll();

                  this.fetchUserChats();
                  //this.showChatMsg(this.newUser, this.currentConversation)
                  document
                    .querySelector('.user-chat')
                    .classList.remove('user-chat-show');
                  document
                    .querySelector('.chat-welcome-section')
                    .classList.remove('d-none');
                  document.querySelector('.user-chat').classList.add('d-none');
                  this.toastr.success(
                    'Added conversation with paroticipant:' + this.newUser
                  );
                  //this.loader.hide();
                });
              });
            })
            .catch((error) => {
              console.log(error);
              this.loader.hide();
              this.modalService.dismissAll();
            });
        })
        .catch((err) => {
          this.modalService.dismissAll();
          this.loader.hide();
          //this.isLoading = false;
          this.error = 'User not found in Twilio';
          this.toastr.error(this.error);
          setTimeout(() => {
            this.error = null;
          }, 2000);
          this.newUser = null;
        });
    }
  }
  CreateGroup() {
    this.loader.show();
    if (
      (this.channelIdentity != null || this.channelIdentity != undefined) &&
      this.selectedUsers.length > 0
    ) {
      this.client
        .createConversation({
          uniqueName: this.channelIdentity,
          friendlyName: this.channelIdentity,
        })
        .then(async (channel: Conversation) => {
          channel.join().then(async () => {
            await channel.setAllMessagesUnread();

            // added code for channel with friendly name
            this.selectedUsers.forEach(async (x) => {
              await channel.add(x.identity);
            });
            //this.toastr.success("Group Created:"+this.currentConversation.friendlyName)
            this.currentConversation = channel;
            this.modalService.dismissAll();
            this.fetchUserChats();
            document
              .querySelector('.user-chat')
              .classList.remove('user-chat-show');
            document
              .querySelector('.chat-welcome-section')
              .classList.remove('d-none');
            document.querySelector('.user-chat').classList.add('d-none');
            // e.target.closest('li').classList.add('active');
            // this.showChatMsg(this.ChannelName, this.currentConversation)
            this.toastr.success(
              'Group created with channel:' +
                this.currentConversation.friendlyName
            );
            //this.loader.hide();
          });
        })
        .catch((error) => {
          this.modalService.dismissAll();
          this.selectedUsers = [];
          this.loader.hide();
          console.log(error.body);
          this.toastr.error(error.body.message);
        });
    } else {
      this.toastr.error('Please enter valid fields');
      this.loader.hide();
      this.selectedUsers = [];
    }
  }

  //Video Chat

  public async JoinVideoChat() {
    this.loader.show();
    await this.chatService.getVideoChatToken(this.userName).subscribe(
      (data: any) => {
        this.modalService.dismissAll();
        this.videotoken = data.item1;
        document.getElementById('forVideoTab').style.visibility="hidden"
        document.getElementById('forVideoTab').style.display="none"
        connect(this.videotoken, {
          audio: true,
          name: this.joinRoomName,
          video: { width: 100, height: 150 },
        }).then(
          (room) => {
            this.loader.hide();
            this.toastr.success('Joined room:' + room.name);
            this.roomObj = room;
            console.log(room);
            this.listenToVideoEvents()

            this.isVideoChat = true;
            console.log(`Successfully joined a Room: ${room}`);
          },
          (error) => {
            console.error(`Unable to connect to Room: ${error.message}`);
          }
        );
      },
      (error) => {
        this.toastr.error(error);
        this.loader.hide();
        return;
      }
    );
  }
  trackSubscribed(div, track) {
    //   const trackElement = track.attach();
    // div.appendChild(trackElement);
    if(track.kind=='video'){
      track.dimensions.width=250
      track.dimensions.height= 100
    }
    console.log(track.dimensions)
    debugger
    document.getElementById('remoteVideo').appendChild(track.attach());
  }
  trackUnsubscribed(track) {
    track.detach().forEach((element) => element.remove());
  }
  RoomSearch() {}
  mute() {
    this.roomObj.localParticipant.audioTracks.forEach(function (audioTrack) {
      audioTrack.track.disable();
    });
    this.microphone = false;
  }

  unmute() {
    this.roomObj.localParticipant.audioTracks.forEach(function (audioTrack) {
      audioTrack.track.enable();
    });
    this.microphone = true;
  }
  attachTracks(tracks) {
    const element = tracks.attach();
    this.renderer.data.id = tracks.sid;
    this.renderer.setStyle(element, 'height', '100%');
    this.renderer.setStyle(element, 'max-width', '100%');
    //this.renderer.appendChild(this.remoteVideo.nativeElement, element);
  }
  // startLocalVideo(): void {
  //   this.roomObj.localParticipant.videoTracks.forEach(publication => {
  //   const element = publication.track.attach();
  //   this.renderer.data.id = publication.track.sid;
  //   this.renderer.setStyle(element, 'width', '25%');
  //   //this.renderer.appendChild(this.localVideo.nativeElement, element);
  //   })}

  //   detachTracks(tracks): void {
  //   tracks.tracks.forEach(track => {
  //   let element = this.remoteVideo.nativeElement;
  //   while (element.firstChild) {
  //   element.removeChild(element.firstChild);
  //   }});}

  // attachParticipantTracks(participant): void {
  //   participant.tracks.forEach(part => {
  //   this.trackPublished(part);
  //   });}

  // trackPublished(publication) {
  //   if (publication.isSubscribed)
  //   this.attachTracks(publication.track);

  //   if (!publication.isSubscribed)
  //   publication.on('subscribed', track => {
  //   this.attachTracks(track);
  //   });
  //   }

  disconnect(e) {
    this.loader.show();
      if (this.roomObj && this.roomObj !== null) {
        this.roomObj.localParticipant.videoTracks.forEach(publication => {
          publication.unpublish();
          publication.track.stop();
          this.roomObj.disconnect();
          this.roomObj = null;
          document.getElementById('endbutton').style.visibility="hidden"
          document.getElementById('endbutton').style.display="none"
          this.toastr.success(`Participant "${this.localParticipant}" has disconnected from the Room` );
          this.loader.hide()
        });



    }
  }
  trackRemoved(e){debugger
  console.log(e)}

  trackPublished(publication, participant) {
    console.log(
      `RemoteParticipant ${participant.identity} published a RemoteTrack: ${publication}`
    );
    // assert(!publication.isSubscribed);
    // assert.equal(publication.track, null);

    publication.on('subscribed', (track) => {
      console.log(`LocalParticipant subscribed to a RemoteTrack: ${track}`);
      // assert(publication.isSubscribed);
      // assert(publication.track, track);
    });

    publication.on('unsubscribed', (track) => {
      console.log(`LocalParticipant unsubscribed from a RemoteTrack: ${track}`);
      // assert(!publication.isSubscribed);
      // assert.equal(publication.track, null);
    });
  }

  listenToVideoEvents(){
    const remoteParticipant = document.getElementById('remoteParticipant');
    const remoteIdentity = document.getElementById('remoteIdentity');

    const room= this.roomObj
    document.querySelector('.user-chat').classList.add('user-chat-show');
    document.querySelector('.chat-welcome-section').classList.add('d-none');
    document.querySelector('.user-chat').classList.remove('d-none');
    //document.getElementById('chat-room').classList.add('user-chat-show');
    createLocalVideoTrack().then((track) => {
      debugger;
      const localMediaContainer =     document.getElementById('localParticipant');
      if(track.kind=='video'){
        track.dimensions.width=50
        track.dimensions.height = 25
      }


      localMediaContainer.appendChild(track.attach());
      console.log(track)
      const element = track.attach();
      const localParticipant = room.localParticipant;
    this.localParticipant = localParticipant.identity;

    // const tracksDiv = document.createElement('div');
    //   tracksDiv.setAttribute('id', localParticipant.sid);
    //   remoteParticipant.appendChild(tracksDiv);
    //   remoteIdentity.innerHTML = localParticipant.identity;

    // localParticipant.publishTrack(track).then(localTrackPublication => {
    //   console.log(localTrackPublication)
    //   //console.log(`Track`+ ${track.name}+' was published with SID' +${localTrackPublication.tracksid})
    // })
    });
    document.getElementById('endbutton').style.visibility="visible"
    document.getElementById('endbutton').style.display="block"
    this.roomParticipants = room.participants;
    // room.participants.forEach(participant => {
    //  //this.attachParticipantTracks(participant);
    //   });
    debugger;

    room.on('participantDisconnected', (participant) => {
      console.log('disconnected');
      // this.detachTracks(participant);
    });

    room.on('participantConnected', (participant) => {
      this.toastr.info(participant.identity + 'joined the room');
      console.log(
        `A remote Participant connected: ${participant.identity}`
      );
      debugger;

      const tracksDiv = document.createElement('div');
      tracksDiv.setAttribute('id', participant.sid);
      remoteParticipant.appendChild(tracksDiv);
      remoteIdentity.innerHTML = participant.identity;

      //           const div = document.createElement('div');
      // div.id = participant.sid;
      // div.innerText = participant.identity;

      participant.on('trackSubscribed', (track) =>
        this.trackSubscribed(tracksDiv, track)
      );
      participant.on('trackUnsubscribed', this.trackUnsubscribed);

      participant.tracks.forEach((publication) => {
        if (publication.isSubscribed) {
          this.trackSubscribed(tracksDiv, publication.track);
        }
      });

      document.body.appendChild(tracksDiv);
      // participant.tracks.forEach(publication => {
      // if (publication.isSubscribed) {
      //   const track = publication.track;
      //     document.getElementById('remote-media-div').appendChild(track.attach());
      //   }
      // });
      // participant.on('trackSubscribed', track => {
      //   document.getElementById('remote-media-div').appendChild(track.attach());
      //   });
    });

    room.participants.forEach((participant) => {
      participant.tracks.forEach((publication) => {
        if (publication.track) {
          console.log(publication.track);
          //document.getElementById('remote-media-div').appendChild(publication.track.attach());
        }
      });

      participant.on('trackSubscribed', (track) => {
        debugger;
        console.log(track);
        const div = document.createElement('div');
        div.id = participant.sid;
        div.innerText = participant.identity;
        this.trackSubscribed(div, track);
        //document.getElementById('remote-media-div').appendChild(track.attach());
      });
    });

    // Log Participants as they disconnect from the Room
    room.once('participantDisconnected', (participant) => {
      document.getElementById('endbutton').classList.remove('end-button-show');
      this.toastr.success(
        `Participant "${participant.identity}" has disconnected from the Room`
      );
      console.log(
        `Participant "${participant.identity}" has disconnected from the Room`
      );
    });

  }

  public async startVideoChat() {
    this.loader.show();
    await this.chatService.getVideoChatTokenWithRoom(this.userName, this.friendlyName).subscribe(
      (data: any) => {
        debugger
        this.videotoken = data.item1;
        connect(this.videotoken, {
          audio: true,
          name: this.roomName,
          video: { width: 360, height:  150},
        }).then(
          (room) => {
            this.roomObj = room;
            console.log(room);
            this.modalService.dismissAll();
            this.loader.hide();
            console.log(`Successfully joined a Room: ${room.name}`);
            this.listenToVideoEvents()
          },
          (error) => {
            console.error(`Unable to connect to Room: ${error.message}`);
          }
        );
      },
      (error) => {
        this.toastr.error(error);
        this.loader.hide();
        return;
      }
    );

  }

}
