import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {LoginComponent} from './login/login.component';
import {SignupComponent} from './signup/signup.component';
import {HomepageComponent} from './homepage/homepage.component';
const routes: Routes = [
  {path:'',pathMatch:'full', redirectTo: '/login',},
  { path: 'login', component: LoginComponent,},
  { path: 'signup', component: SignupComponent,},
  { path: 'homepage', component: HomepageComponent,},
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
