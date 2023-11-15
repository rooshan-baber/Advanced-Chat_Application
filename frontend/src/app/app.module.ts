import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginComponent } from './login/login.component';
import { SignupComponent } from './signup/signup.component';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { ChatappService } from './service/chatapp.service';
import { AuthtokenInterceptor } from './authtoken/authtoken.interceptor';
import { EncryptionInterceptor } from './encryption/encryption.interceptor';
import { ReactiveFormsModule } from '@angular/forms';
import { HomepageComponent } from './homepage/homepage.component';
import * as moment from 'moment';
@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    SignupComponent,
    HomepageComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    ReactiveFormsModule,
    FormsModule
  ],
  providers: [
    ChatappService,
    { provide: HTTP_INTERCEPTORS, useClass: AuthtokenInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: EncryptionInterceptor, multi: true },
    { provide: 'moment', useValue: moment }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
