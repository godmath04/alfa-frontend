import { NgModule, provideAppInitializer, inject, provideBrowserGlobalErrorListeners } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { provideHttpClient, withInterceptors } from '@angular/common/http';

import { AppRoutingModule } from './app-routing-module';
import { App } from './app';
import { Translate } from './core/services/translate';
import { authInterceptor } from './core/interceptors/auth/auth-interceptor';

@NgModule({
  declarations: [App],
  imports: [
    BrowserModule,
    AppRoutingModule
  ],
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideHttpClient(withInterceptors([authInterceptor])),
    provideAppInitializer(() => {
      const translate = inject(Translate);
      return translate.load();
    })
  ],
  bootstrap: [App]
})
export class AppModule { }