import { Component, OnInit } from '@angular/core';
import { ChatappService } from '../service/chatapp.service';
import { Router } from '@angular/router';
import * as moment from 'moment';
import { Subscription } from 'rxjs';
@Component({
  selector: 'app-homepage',
  templateUrl: './homepage.component.html',
  styleUrls: ['./homepage.component.css'],
})
export class HomepageComponent implements OnInit {
  messageSubscription: Subscription
  recipientUser: any = [];
  user!: string | null;
  userData!: string | null;
  userId: string = '';
  userChats: any[] = [];
  recipientId!: string;
  pChats: any;
  usernames: any;
  upChat: any;
  chatId: any;
  msgs: any[] = [];
  text: any;
  chatusername: any;
  chatdetails: any;

  constructor(private chatappservice: ChatappService, private router: Router) {
    this.messageSubscription = this.chatappservice.listenForMessages().subscribe((message) => {
      this.handleReceivedMessage(message);
    });
  }

  ngOnInit() {
    this.userData = localStorage.getItem('user');

    if (this.userData) {
      debugger;
      const userObject = JSON.parse(this.userData);
      this.user = userObject.name;
      this.userId = userObject._id;
      this.showchats();
      this.chatappservice.connectUser(this.userId);
    }
  }

  ngAfterViewInit() {
    // Call potentialChats and recipient functions in ngAfterViewInit
    this.potentialChats();
    this.recipient();
  }

  isUserOnline(userId: string): boolean {
    if (this.chatappservice.onUsers && this.chatappservice.onUsers.length > 0) {
      return this.chatappservice.onUsers.some((user:any) => user.userId === userId);
    }
    return false;
  }

  logout() {
    this.chatappservice.clearToken();
    this.chatappservice.clearUser();
    this.chatappservice.disconnectUser();
    this.router.navigate(['/login']);
  }

  showchats() {
    debugger;
    if (this.userId) {
      console.log('User ID:', this.userId);
      this.chatappservice.getUserChat(this.userId).subscribe((data) => {
        if (data) {
          this.userChats = data;
          this.recipient();
          console.log('User Chat Data:', this.userChats);
        } else {
          this.userChats = [];
        }
      });
    }
  }

  recipient() {
    debugger;

    if (this.userId && this.userChats.length > 0) {
      this.recipientUser = []; // Clear the recipientUser array
      for (const chat of this.userChats) {
        if (chat.members && chat.members.length > 0) {
          for (const mem of chat.members) {
            if (mem != this.userId) {
              this.recipientId = mem; // Extract recipient ID from index 1
              this.chatappservice
                .findUser(this.recipientId)
                .subscribe((data) => {
                  this.recipientUser.push(data);
                  if (this.recipientUser.length == this.userChats.length) {
                    console.log('recipient userssss: ', this.recipientUser);
                    // Create a new array for usernames
                    this.usernames = this.recipientUser.map(
                      (user: { username: any }) => user.username
                    );
                    console.log('Usernames: ', this.usernames);
                    return;
                  } // Push data for the current recipient
                });
            }
          }
        }
      }
    }
  }

  async potentialChats() {
    debugger;
    const userChatMembers = await this.chatappservice.getUserChat(this.userId).toPromise()
      .then(data => {
        if (data) {
          return data.reduce((members: string | any[], chat: { members: any; }) => {
            return members.concat(chat.members);
          }, []);
        } else {
          return [];
        }
      })
      .catch(error => {
        console.error("Error fetching user chat data: ", error);
        return [];
      });
  
    console.log("userChatMembers: ", userChatMembers);
  
    this.pChats = await this.chatappservice.findAllUsers().toPromise()
      .then(data => {
        // Filter users who are not in userChatMembers
        return data.filter((chat: any) => {
          return chat._id !== this.userId && !userChatMembers.includes(chat._id);
        });
      })
      .catch(error => {
        console.error("Error fetching potential chats: ", error);
        return [];
      });
  
    console.log('Users pChats: ', this.pChats);
  }
  
  newchat(singleUser: any) {
    debugger;
    // Check if the user is already in userChats
    const alreadyExists = this.userChats.some((chat) =>
      chat.members.includes(singleUser._id)
    );
  
    if (!alreadyExists) {
      const chatData = {
        members: [this.userId, singleUser._id],
      };
  
      this.chatappservice.createChat(chatData).subscribe((response) => {
        console.log('New Chat Created:', response);
  
        // Add the newly created chat to the userChats
        this.showchats();
        this.pChats = this.pChats.filter((chat: any) => chat._id !== singleUser._id);
      });
    } else {
      console.log('Chat with this user already exists.');
    }
  }

  updateChat(user: any) {
    this.chatdetails = user;
    this.chatusername = this.chatdetails.username;
    debugger;
    // Find a chat where both user._id and this.userId are in the members array
    const matchedUser = this.userChats.find((chat: any) =>
      chat.members.includes(user._id) && chat.members.includes(this.userId)
    );
  
    if (matchedUser) {
      this.upChat = matchedUser;
      this.chatId = this.upChat._id;
      this.chatappservice.getUserMsg(this.chatId).subscribe((data) => {
        this.msgs = data;
        console.log("messages: ", this.msgs);
        this.scrollToBottom();
      });
    } else {
      console.log('No chat found for the selected user.');
    }
  }
  
  
  formatMessageDate(date: string): string {
    return moment(date).calendar();
  }

  sendmsg(){
    debugger

    if (!this.chatId || !this.userId) {
      console.error('Chat ID or User ID is not available.');
      return;
    }
    const messageData = {
      chatId: this.chatId,
      senderId: this.userId,
      text: this.text,
    };
    
    this.chatappservice.emitMessage(messageData,this.chatdetails._id);
    this.chatappservice.createMsg(messageData).subscribe((data)=>{
      console.log('Message sent:', data);
      this.msgs.push(data);
      this.text = '';
      this.scrollToBottom();
    })
  }

  handleReceivedMessage(message: any) {
    debugger
    // Check if the message belongs to the currently opened chat
    if (message.chatId === this.chatId) {
      // Add the received message to the chat box
      this.msgs.push(message);
      this.text = '';
      this.scrollToBottom();
    }
  }


  scrollToBottom() {
    debugger
    setTimeout(() => {
      const chatBox = document.querySelector('.messages');
      chatBox?.scrollTo(0, chatBox.scrollHeight);
    }, 0);
  }      
}