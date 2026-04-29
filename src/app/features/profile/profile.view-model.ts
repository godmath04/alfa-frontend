import { Injectable, inject, DestroyRef, Signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ProfileService } from './profile.service';
import { ProfileStateService } from './profile.state';
import { UpdateProfileRequest, ProfileResponse } from './profile.model';

@Injectable({ providedIn: 'root' })
export class ProfileViewModel {
  private readonly _service = inject(ProfileService);
  private readonly _state = inject(ProfileStateService);
  private readonly _destroyRef = inject(DestroyRef);

  // Explicit types so the Angular Language Service resolves them without deep inference
  readonly profile:  Signal<ProfileResponse | null> = this._state.profile;
  readonly photoUrl: Signal<string | null>          = this._state.photoUrl;
  readonly loading:  Signal<boolean>                = this._state.loading;
  readonly uploading: Signal<boolean>               = this._state.uploading;

  loadProfile(): void {
    this._state.setLoading(true);
    this._service.getProfile()
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe({
        next: (data) => {
          this._state.setProfile(data);
          this._state.setLoading(false);
          this.loadPhoto();
        },
        error: () => this._state.setLoading(false)
      });
  }

  loadPhoto(): void {
    this._service.getPhoto()
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe({
        next: (blob) => {
          const url = URL.createObjectURL(blob);
          this._state.setPhotoUrl(url);
        },
        error: () => {} // If no photo exists or error, do nothing
      });
  }

  updateProfile(data: UpdateProfileRequest, onSuccess: () => void, onError: () => void): void {
    this._state.setLoading(true);
    this._service.updateProfile(data)
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe({
        next: () => {
          this._state.setLoading(false);
          this.loadProfile(); // Reload to get updated data
          onSuccess();
        },
        error: () => {
          this._state.setLoading(false);
          onError();
        }
      });
  }

  uploadPhoto(file: File): void {
    // Instant local preview — no round-trip needed
    const previewUrl = URL.createObjectURL(file);
    this._state.setPhotoUrl(previewUrl);

    // Upload in background with localized spinner
    this._state.setUploading(true);
    this._service.uploadPhoto(file)
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe({
        next: () => {
          this._state.setUploading(false);
        },
        error: () => {
          this._state.setUploading(false);
          // Revert to server photo on failure
          this.loadPhoto();
        }
      });
  }

  clear(): void {
    this._state.clear();
  }
}
