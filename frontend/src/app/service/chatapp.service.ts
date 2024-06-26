import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject, map } from 'rxjs';
import { io, Socket } from 'socket.io-client';
@Injectable({
  providedIn: 'root',
})
export class ChatappService {
  private socket!: Socket;
  private messageSubject = new Subject<any>();
  noti: any[] = [];
  chatIdd: any;
  unNoti: any[] = [];
  reNoti: any[] = [];
  constructor(private http: HttpClient,) {
    
  }
  authToken: any;
  onUsers!: any;
  tokenSet = false;
  //Create User
  saveUser(data: any): Observable<any> {
    debugger;
    return this.http.post<any>('http://localhost:4000/signup', data);
  }
  //Check User on Login
  loginUser(data: any): Observable<any> {
    debugger;
    return this.http.post('http://localhost:4000/login', data).pipe(
      map((response: any) => {
        if (response && response.token) {
          this.authToken = response.token;
        }
        return response;
      })
    );
  }

  //Find User By Id
  findUser(userId:string): Observable<any> {
    debugger
    return this.http.get<any>(`http://localhost:4000/findUser/${userId}`);
  }

  //Find All Users
  findAllUsers():Observable<any>{
    debugger
    return this.http.get<any>("http://localhost:4000/allUsers")
  }
  
  //Create Chat
  createChat(data: any): Observable<any> {
    debugger;
    return this.http.post<any>('http://localhost:4000/newchat', data);
  }

  //Get Chats of User
  getUserChat(userId:string): Observable<any> {
    debugger;
    return this.http.get<any>(`http://localhost:4000/finduserchat/${userId}`);
  } 

  //Get Chats
  getChat(firstId:string,secondId:string): Observable<any> {
    debugger;
    return this.http.get<any>(`http://localhost:4000/findchat/${firstId}/${secondId}`);
  }

  //Create message
  createMsg(data: any): Observable<any> {
    debugger;
    return this.http.post<any>('http://localhost:4000/newmsg', data);
  }

  //Get Message
  getUserMsg(chatId:any): Observable<any> {
    debugger;
    return this.http.get<any>(`http://localhost:4000/getmsg/${chatId}`);
  }
  // Function to set the token
  setToken(token: string) {
    localStorage.setItem(this.authToken, token);
  }

  // Function to get the saved token
  getToken(): string | null {
    return localStorage.getItem('Token');
  }

  // Function to clear the saved token
  clearToken() {
    debugger;
    localStorage.removeItem('Token');
  }


  // Function to clear the saved User
  clearUser() {
    debugger;
    localStorage.removeItem('user');
  }

  islogin(): boolean {
    return !!this.authToken;
  }

  updateChatIdd(chatId: string) {
    this.chatIdd = chatId;
  }
  //a new socket connection
  connectUser(userId:string){
    debugger
    this.socket = io('10.250.10.197:5000');
    this.socket.emit("addNewUser",userId);
    this.socket.on("getOnlineUsers",((res)=>{
      this.onUsers = res;
      console.log("Online Users: ",this.onUsers);
    }));

    this.socket.on('getMessage', (message) => {
      this.messageSubject.next(message);
    });

    this.socket.on('getNotification', (res) => {
      if(res.senderId === this.chatIdd){
          res.isRead = true;
          this.noti.push(res);
          this.noti.reverse();
          console.log("Notif:",this.noti);
      }else{
        this.noti.push(res);
        this.noti.reverse();
        console.log("Notif:",this.noti);
      }
      this.unNoti = this.noti.filter((notification) => !notification.isRead);
      console.log("Unread Notifications:", this.unNoti);
      this.reNoti = this.noti.filter((notification) => notification.isRead);
      console.log("read Notifications:", this.reNoti);
    });
  }

  disconnectUser(){
    debugger
    this.socket.emit("dis");
  }

  emitMessage(messageData: any, recipientId: any) {
    this.socket.emit('privateMessage', messageData, recipientId);
  }

  listenForMessages(): Observable<any> {
    debugger
    return this.messageSubject.asObservable();
  }
  
}