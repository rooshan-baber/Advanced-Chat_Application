import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import {ChatappService} from "../service/chatapp.service";
import { Router } from '@angular/router';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent {
  constructor(private chatappservice: ChatappService, private router: Router) {}

  signupform = new FormGroup({
    username: new FormControl('', [Validators.required]),
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required]),
  });

  signup(){
    if(this.signupform.valid){
      this.chatappservice.saveUser(this.signupform.value).subscribe((result:any)=>{
        console.log(result);
        if(Object.keys(result).length>0){
          debugger
          this.router.navigate(["/login"]);
        }
      });
    }
  }
}
