import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,HttpResponse
} from '@angular/common/http';
import { Observable, map } from 'rxjs';
import {EncryptionService} from '../service/encryption.service'

@Injectable()
export class EncryptionInterceptor implements HttpInterceptor {

  constructor(private ES:EncryptionService) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    debugger
    const encryptedBody = this.ES.encrypt(request.body);
    const encryptedRequest = request.clone({
      body: {"encryption":encryptedBody},
    });
    return next.handle(encryptedRequest);
    // .pipe(
    //   // Decrypt response body
    //   map((event: HttpEvent<any>) => {
    //     if (event instanceof HttpResponse) {
    //       debugger
    //       const decryptedBody = this.ES.decrypt(event.body);
    //       return event.clone({ body: decryptedBody });
    //     }
    //     return event;
    //   })
    // );
  } 
}
