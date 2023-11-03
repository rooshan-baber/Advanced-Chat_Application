import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
} from '@angular/common/http';
import { Observable } from 'rxjs';
import {ChatappService} from "../service/chatapp.service"

@Injectable()
export class AuthtokenInterceptor implements HttpInterceptor {

  constructor(private chatappService: ChatappService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const jwt = this.chatappService.getToken();
    return next.handle(req.clone({setHeaders:{authorization: `Bearer ${jwt}`}}));
  };
}
