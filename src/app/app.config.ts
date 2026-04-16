import { ApplicationConfig, inject, provideAppInitializer, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { importProvidersFrom } from '@angular/core';
import {
  LucideAngularModule,
  Mail, Lock, Eye, EyeOff, User, Stethoscope, BarChart3,
  CheckCircle2, Check, Phone, MapPin, Calendar, IdCard,
  ArrowLeft, AlertCircle, Home, FileText, LogOut,
  ClipboardList, Zap, Loader2, Clock, TimerOff
} from 'lucide-angular';

import { APP_ROUTES } from './app.routes';
import { authInterceptor } from './core/interceptors/auth/auth-interceptor';
import { Translate } from './core/services/translate';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(APP_ROUTES),
    provideHttpClient(withInterceptors([authInterceptor])),
    provideAppInitializer(() => {
      const translate = inject(Translate);
      return translate.load();
    }),
    importProvidersFrom(
      LucideAngularModule.pick({
        Mail, Lock, Eye, EyeOff, User, Stethoscope, BarChart3,
        CheckCircle2, Check, Phone, MapPin, Calendar, IdCard,
        ArrowLeft, AlertCircle, Home, FileText, LogOut,
        ClipboardList, Zap, Loader2, Clock, TimerOff
      })
    ),
  ]
};
