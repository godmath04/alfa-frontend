import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AuthRoutingModule } from './auth-routing-module';
import { SharedModule } from '../../shared/shared-module';
import { Login } from './pages/login/login';
import { Register } from './pages/register/register';

@NgModule({
  declarations: [Login, Register],
  imports: [CommonModule, AuthRoutingModule, SharedModule],
})
export class AuthModule {}
