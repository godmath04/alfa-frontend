import { Injectable, computed, signal } from '@angular/core';
import { ProfileResponse } from './profile.model';

@Injectable({ providedIn: 'root' })
export class ProfileStateService {
  private readonly _profile = signal<ProfileResponse | null>(null);
  private readonly _photoUrl = signal<string | null>(null);
  private readonly _loading = signal<boolean>(false);
  private readonly _uploading = signal<boolean>(false);

  readonly profile = computed(() => this._profile());
  readonly photoUrl = computed(() => this._photoUrl());
  readonly loading = computed(() => this._loading());
  readonly uploading = computed(() => this._uploading());

  setProfile(data: ProfileResponse): void {
    this._profile.set(data);
  }

  setPhotoUrl(url: string): void {
    this._photoUrl.set(url);
  }

  setLoading(value: boolean): void {
    this._loading.set(value);
  }

  setUploading(value: boolean): void {
    this._uploading.set(value);
  }

  clear(): void {
    this._profile.set(null);
    if (this._photoUrl()) {
      URL.revokeObjectURL(this._photoUrl()!);
    }
    this._photoUrl.set(null);
    this._loading.set(false);
    this._uploading.set(false);
  }
}
