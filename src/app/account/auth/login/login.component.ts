import { Component, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { first } from 'rxjs/operators';

import { AuthenticationService } from '../../../core/services/auth.service';
import { AuthfakeauthenticationService } from '../../../core/services/authfake.service';

import { environment } from '../../../../environments/environment';
import { ChatService } from 'src/app/chat/chat.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})

/**
 * Login component
 */
export class LoginComponent implements OnInit {

  loginForm: UntypedFormGroup;
  submitted = false;
  error = '';
  returnUrl: string;
  userName:string

  // set the currenr year
  year: number = new Date().getFullYear();

  // tslint:disable-next-line: max-line-length
  constructor(private formBuilder: UntypedFormBuilder, private route: ActivatedRoute, private router: Router, public authenticationService: AuthenticationService, public authFackservice: AuthfakeauthenticationService,
    private chatService: ChatService) { }


  ngOnInit(): void {
    // this.loginForm = this.formBuilder.group({
    //   email: ['chatvia@themesbrand.com', [Validators.required, Validators.email]],
    //   password: ['123456', [Validators.required]],
    // });

    // reset login status
    // this.authenticationService.logout();
    // get return url from route parameters or default to '/'
    // tslint:disable-next-line: no-string-literal
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
  }

  // convenience getter for easy access to form fields
  get f() { return this.loginForm.controls; }

  /**
   * Form submit
   */
  onSubmit() {
    this.submitted = true;

    // stop here if form is invalid

      if (environment.defaultauth === 'firebase') {
        this.authenticationService.login(this.f.email.value, this.f.password.value).then((res: any) => {
          this.router.navigate(['/']);
        })
          .catch(error => {
            this.error = error ? error : '';
            console.log(this.error)
          });
      } else if (environment.defaultauth === 'fackbackend') {
        // this.authFackservice.login(this.f.email.value, this.f.password.value)
        //   .pipe(first())
        //   .subscribe(
        //     data => {
        //       this.router.navigate(['/']);
        //     },
        //     error => {
        //       this.error = error ? error : '';
        //     });
        this.chatService.setUsername(this.userName)
        this.router.navigate(['/']);
        console.log(this.error)
      }

  }

}
