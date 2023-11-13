import { Component, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-lockscreen',
  templateUrl: './lockscreen.component.html',
  styleUrls: ['./lockscreen.component.scss']
})

/**
 * Lock-screen component
 */
export class LockscreenComponent implements OnInit {

  lockscreenForm: UntypedFormGroup;
  submitted = false;

  year: number = new Date().getFullYear();

  constructor(private formBuilder: UntypedFormBuilder) { }

  ngOnInit(): void {
    this.lockscreenForm = this.formBuilder.group({
      password: ['', Validators.required],
    });
  }

  // convenience getter for easy access to form fields
  get f() { return this.lockscreenForm.controls; }

  /**
   * On submit form
   */
  onSubmit() {
    this.submitted = true;

    // stop here if form is invalid
    if (this.lockscreenForm.invalid) {
      return;
    }
  }
}
