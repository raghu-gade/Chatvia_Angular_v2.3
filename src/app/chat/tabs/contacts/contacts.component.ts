import { Component, OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { contacts } from './data';
import { Contacts, User } from './contacts.model';
import { TranslateService } from '@ngx-translate/core';
import { SpinnerService } from 'src/app/spinner/spinner.service';
import { ToastrService } from 'ngx-toastr';
import { ChatService } from '../../chat.service';


@Component({
  selector: 'app-contacts',
  templateUrl: './contacts.component.html',
  styleUrls: ['./contacts.component.scss']
})
/**
 * Tab-contacts component
 */
export class ContactsComponent implements OnInit {

  contacts: Contacts[];
  contactsList: User[];
  userList:any

  constructor(private modalService: NgbModal, public translate: TranslateService, private loader: SpinnerService,
    private toastr: ToastrService,  private chatService: ChatService) { }

  ngOnInit(): void {
this.getContacts();

  }
  getContacts()
  {
    this.contactsList=[]
    this.loader.show();
    this.chatService.getUsers().subscribe(
      (data:any) => {
        debugger
        let users = data.users
        users.forEach((x: any) => {
          this.contactsList.push(x);
        });
        const sorted =  this.contactsList.sort((a, b) => a.identity > b.identity ? 1 : -1);

        const grouped = sorted.reduce((groups, contact) => {
          const letter = this.translate.instant(contact.identity).charAt(0);
          groups[letter] = groups[letter] || [];
          groups[letter].push(contact);

          return groups;
        }, {});
        debugger

        // contacts list
        this.userList=Object.keys(grouped).map(key => ({ key, contacts: grouped[key] }));
      this.loader.hide();
    },
    (error:any) => {
      console.log(error)
      this.loader.hide()
    }
  )
  }


  /**
   * Contacts modal open
   * @param content content
   */
  // tslint:disable-next-line: typedef
  openContactsModal(content) {
    this.modalService.open(content, { centered: true });
  }
}
