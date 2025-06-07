import { Injectable } from '@angular/core';
import { SupabaseClient } from '@supabase/supabase-js';
import { UserProfile } from '../interfaces/profile.interface';

@Injectable({
  providedIn: 'root'
})
export class ProfileService {
  constructor(private supabase: SupabaseClient) {}

  async uploadProfileImage(file: File) {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `profiles/${fileName}`;

    const { error: uploadError, data } = await this.supabase.storage
      .from('profiles')
      .upload(filePath, file);

    if (uploadError) throw uploadError;
    
    const { data: { publicUrl } } = this.supabase.storage
      .from('profiles')
      .getPublicUrl(filePath);

    return publicUrl;
  }

  async createProfile(profile: UserProfile) {
    const { data, error } = await this.supabase
      .from('user_profiles')
      .upsert(profile, {
        onConflict: 'user_id'
      });

    if (error) throw error;
    return data;
  }

  async getProfile(userId: string) {
    const { data, error } = await this.supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) throw error;
    return data as UserProfile;
  }
}
