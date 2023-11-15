import { Injectable } from '@angular/core';
import * as CryptoJS from 'crypto-js';

@Injectable({
  providedIn: 'root'
})
export class EncryptionService {
  private secretKey = '^!!)!)^&)^(#(';
  constructor() {
   }

   encrypt(data: any): string {
    debugger
    const encryptedText = CryptoJS.AES.encrypt(JSON.stringify(data), this.secretKey).toString();
    return encryptedText;
  }

  decrypt(encryptedText: string): any {
    debugger
    const decryptedBytes = CryptoJS.AES.decrypt(encryptedText, this.secretKey);
    const decryptedText = decryptedBytes.toString(CryptoJS.enc.Utf8);
    console.log('Decrypted Text:', decryptedText);
    return JSON.parse(decryptedText);
  }
}
