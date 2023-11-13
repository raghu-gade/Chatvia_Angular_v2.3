import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable()
export class SpinnerService {
    private loadCount: number = 0;
  public isLoading: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  public preventAbuse:boolean= false;

    show() {
      if (this.loadCount == 0) {
            this.isLoading.next(true);
        }
        this.loadCount++;
      //this.preventAbuse = true;

    }

    hide() {
        if (this.loadCount > 0) {
            this.loadCount--;
        }
        else {
            this.loadCount = 0;
        }
      if (this.loadCount == 0) {
          this.isLoading.next(false);
      }
        //setTimeout(() => {
        //  this.preventAbuse = false;
        //}, 800);


    }

    hideAll() {
        this.loadCount = 0;
      this.isLoading.next(false);
      //this.preventAbuse = false;

    }
}
