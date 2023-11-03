import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import {ChatappService} from "../service/chatapp.service";
import { Router } from '@angular/router';
@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {

  constructor(private chatappservice: ChatappService, private router: Router) {}

  loginform = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required]),
  });

  LOGIN() {
    debugger
    if (this.loginform.valid) {
      this.chatappservice.loginUser(this.loginform.value).subscribe(
        (response) => {
          const token = response.token;
          if (token) {
            localStorage.setItem('Token', token);
            localStorage.setItem('user',JSON.stringify(response));
            this.router.navigate(['/homepage']);
          } else {
            console.warn('Token not found in the response.');
          }
        },
        (error) => {
          console.error('Error in loginUser service:', error);
        }
      );
    }
  };
}
