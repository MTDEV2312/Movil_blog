import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { 
  IonContent, 
  IonHeader, 
  IonTitle, 
  IonToolbar,
  IonItem,
  IonLabel,
  IonInput,
  IonButton,
  IonCard,
  IonCardContent
} from '@ionic/angular/standalone';
import { getAuth } from 'firebase/auth';
import { supabase } from '../../supabase.client';
import { UserProfile } from '../../interfaces/profile.interface';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonItem,
    IonLabel,
    IonInput,
    IonButton,
    // Removemos IonImg
    IonCard,
    IonCardContent
  ]
})
export class ProfilePage implements OnInit {
  profileForm: FormGroup;
  imagePreview: string | null = null;
  loading = false;
  hasExistingProfile = false;
  private auth = getAuth();

  constructor(
    private fb: FormBuilder,
    private router: Router
  ) {
    this.profileForm = this.fb.group({
      nombre: ['', Validators.required],
      imagen: [null, Validators.required]
    });
  }

  async ngOnInit() {
    try {
      const user = this.auth.currentUser;
      if (user) {
        const profile = await this.getProfile(user.uid);
        if (profile) {
          this.hasExistingProfile = true;
          this.profileForm.patchValue({
            nombre: profile.nombre
          });
          this.imagePreview = profile.imagen_url;
          // Si ya tiene perfil, la imagen no es requerida para actualizar
          this.profileForm.get('imagen')?.setValidators(null);
          this.profileForm.get('imagen')?.updateValueAndValidity();
        }
      }
    } catch (error) {
      console.error('Error al cargar perfil:', error);
    }
  }

  async onImageSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.imagePreview = URL.createObjectURL(file);
      this.profileForm.patchValue({ imagen: file });
    }
  }

  async getProfile(userId: string): Promise<UserProfile | null> {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select()
        .eq('user_id', userId)
        .maybeSingle();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error al obtener perfil:', error);
      return null;
    }
  }

  async continueWithoutUpdate() {
    await this.router.navigate(['/news']);
  }

  async onSubmit() {
    if (this.profileForm.valid) {
      this.loading = true;
      try {
        const user = this.auth.currentUser;
        if (!user) throw new Error('No hay usuario autenticado');

        let imageUrl = this.imagePreview;
        const imageFile = this.profileForm.get('imagen')?.value;

        if (imageFile && imageFile instanceof File) {
          try {
            const fileExt = imageFile.name.split('.').pop();
            const fileName = `${user.uid}-${Date.now()}.${fileExt}`;
            const filePath = `${fileName}`;

            const { error: uploadError } = await supabase.storage
              .from('profiles')
              .upload(filePath, imageFile);

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
              .from('profiles')
              .getPublicUrl(filePath);

            imageUrl = publicUrl;
          } catch (uploadError) {
            console.error('Error al subir imagen:', uploadError);
            throw new Error('Error al subir la imagen de perfil');
          }
        }

        const profile: UserProfile = {
          user_id: user.uid,
          nombre: this.profileForm.get('nombre')?.value,
          imagen_url: imageUrl!,
          created_at: new Date().toISOString()
        };

        const { error } = await supabase
          .from('user_profiles')
          .upsert(profile, {
            onConflict: 'user_id'
          });

        if (error) throw error;

        await this.router.navigate(['/news']);
      } catch (error) {
        console.error('Error al guardar perfil:', error);
      } finally {
        this.loading = false;
      }
    }
  }
}
