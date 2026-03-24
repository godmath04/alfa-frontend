import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AuthRoutingModule } from './auth-routing-module';
import { SharedModule } from '../../shared/shared-module';
import { Login } from './pages/login/login';

@NgModule({
  declarations: [Login],
  imports: [CommonModule, AuthRoutingModule, SharedModule],
})
export class AuthModule {}
