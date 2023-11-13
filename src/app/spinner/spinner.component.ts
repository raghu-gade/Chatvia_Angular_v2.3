import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { SpinnerService } from './spinner.service';


@Component({
  selector: 'app-spinner',
  templateUrl: './spinner.component.html',
  styleUrls: ['./spinner.component.css']
})
export class SpinnerComponent implements OnInit {
  showLoader: boolean = false;
  @ViewChild('start', { static: true }) start: ElementRef<HTMLElement>;
  @ViewChild('complete', { static: true }) complete: ElementRef<HTMLElement>;

  constructor(public loaderService: SpinnerService) { }

  ngOnInit(): void {
  }

  ngAfterViewInit(): void {
    this.loaderService.isLoading.subscribe((value: boolean) => {
      this.showLoader = value;
      if (this.showLoader) {
        if (this.start.nativeElement) {
          this.start.nativeElement.click();
        }
      } else {
        if (this.complete.nativeElement) {
          this.complete.nativeElement.click();
        }
      }
    });
  }
}
