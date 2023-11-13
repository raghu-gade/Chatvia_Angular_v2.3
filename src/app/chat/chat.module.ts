import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbTooltipModule, NgbDropdownModule, NgbAccordionModule, NgbModalModule, NgbCollapseModule } from '@ng-bootstrap/ng-bootstrap';

import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar';

import { LightboxModule } from 'ngx-lightbox';

import { TabsModule } from './tabs/tabs.module';

import { ChatRoutingModule } from './chat-routing.module';

import {DatePipe} from '@angular/common';


import { PickerModule } from '@ctrl/ngx-emoji-mart';


import { SimplebarAngularModule } from 'simplebar-angular';

import { IndexComponent } from './index/index.component';
import { TranslateModule } from '@ngx-translate/core';
import { CarouselModule } from "ngx-owl-carousel-o";
import { ServiceWorkerModule } from '@angular/service-worker';
import { AngularFireModule } from "@angular/fire/compat";
import { environment } from 'src/environments/environment';


@NgModule({
  declarations: [IndexComponent],
  imports: [
    CarouselModule,
    LightboxModule,
    NgbAccordionModule,
    NgbModalModule,
    NgbCollapseModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ChatRoutingModule,
    NgbTooltipModule,
    NgbDropdownModule,
    TranslateModule,
    SimplebarAngularModule,
    PickerModule,
    TabsModule,
    PerfectScrollbarModule,
    AngularFireModule
    //ServiceWorkerModule.register('ngsw-worker.js', { registrationStrategy: 'registerImmediately' }),
  ],
  providers: [
    DatePipe
  ],
  exports: []
})
export class ChatModule { }
