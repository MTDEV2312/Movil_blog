import { Injectable } from '@angular/core';
import { supabase } from '../supabase.client';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Geolocation } from '@capacitor/geolocation';
import { Router } from '@angular/router';
import { Auth } from '@angular/fire/auth';
import type News from '../interfaces/news.interface';
import { v4 as uuidv4 } from 'uuid'; 

@Injectable({
  providedIn: 'root'
})
export class NewsService {

  constructor(
    private router: Router,
    private auth: Auth
  ) {}

  async getNews(): Promise<News[]> {
    try {
      const { data, error } = await supabase
        .from('noticias_prueba')
        .select(`
          *,
          user_profiles!inner (
            nombre,
            imagen_url
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return data || [];

    } catch (error) {
      console.error('Error al obtener noticias:', error);
      return [];
    }
  }

  // Método original para crear noticias (requiere imagen)
  async createNews(titulo: string, contenido: string): Promise<void> {
    const user = this.auth.currentUser;

    if (!user) {
      console.error('Usuario no autenticado');
      this.router.navigate(['/auth']);
      throw new Error('Usuario no autenticado');
    }

    try {
      // 1. Capturar imagen
      const photo = await Camera.getPhoto({
        quality: 70,
        allowEditing: false,
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Camera
      });

      const fileName = `noticias/${Date.now()}.jpg`;
      const fileBlob = this.dataURLtoBlob(photo.dataUrl!);

      // 2. Subir imagen
      const { error: uploadError } = await supabase
        .storage
        .from('prueba-app')
        .upload(fileName, fileBlob, {
          upsert: false
        });

      if (uploadError) throw uploadError;

      // 3. Obtener URL pública de la imagen
      const { data: publicUrlData } = supabase
        .storage
        .from('prueba-app')
        .getPublicUrl(fileName);

      const imagenUrl = publicUrlData.publicUrl;

      // 4. Obtener ubicación
      const { coords } = await Geolocation.getCurrentPosition();
      const lat = coords.latitude;
      const lng = coords.longitude;
      const mapsUrl = `https://www.google.com/maps/@${lat},${lng},16z`;

      console.log('Usuario actual:', user.uid);
      console.log('Datos a insertar:', {
        titulo,
        contenido,
        imagen_url: imagenUrl,
        latitud: lat,
        longitud: lng,
        ubicacion_url: mapsUrl,
        user_id: user.uid,
      });

      // 5. Insertar en Supabase
      // Generar un UUID válido basado en el ID de Firebase
      const supabaseUserId = uuidv4();

      const { error: insertError } = await supabase
        .from('noticias_prueba')
        .insert({
          titulo,
          contenido,
          imagen_url: imagenUrl,
          latitud: lat,
          longitud: lng,
          ubicacion_url: mapsUrl,
          user_id: user.uid.toString(), // Asegurarnos que se guarda como string
          fecha: new Date().toISOString()
        });

      if (insertError) {
        console.error('Error detallado:', {
          code: insertError.code,
          message: insertError.message,
          details: insertError.details,
          hint: insertError.hint
        });
        throw insertError;
      }
    } catch (error) {
      console.error('Error al crear la noticia:', error);
      throw error;
    }
  }

  // Nuevo método específico para pokémons
  async createPokemonNews(titulo: string, contenido: string, imagenUrl: string): Promise<void> {
    const user = this.auth.currentUser;

    if (!user) {
      console.error('Usuario no autenticado');
      this.router.navigate(['/auth']);
      throw new Error('Usuario no autenticado');
    }

    try {
      const position = await Geolocation.getCurrentPosition();
      const lat = position.coords.latitude;
      const lng = position.coords.longitude;
      const mapsUrl = `https://www.google.com/maps?q=${lat},${lng}`;

      const { data, error: insertError } = await supabase
        .from('noticias_prueba')
        .insert({
          titulo,
          contenido,
          imagen_url: imagenUrl,
          latitud: lat,
          longitud: lng,
          ubicacion_url: mapsUrl,
          user_id: user.uid,
          fecha: new Date().toISOString()
        })
        .select()
        .single();

      if (insertError) throw insertError;

    } catch (error) {
      console.error('Error al crear la noticia del pokémon:', error);
      throw error;
    }
  }

  async updateNews(id: number, titulo: string, contenido: string): Promise<void> {
    const user = this.auth.currentUser;

    if (!user) {
      console.error('Usuario no autenticado');
      this.router.navigate(['/auth']);
      throw new Error('Usuario no autenticado');
    }

    try {
      const { error: updateError } = await supabase
        .from('noticias_prueba')
        .update({ 
          titulo,
          contenido,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .eq('user_id', user.uid); // Asegura que solo el dueño pueda editar

      if (updateError) throw updateError;
    } catch (error) {
      console.error('Error al actualizar la noticia:', error);
      throw error;
    }
  }

  subscribeToNewNews(callback: (noticia: News) => void): void {
    supabase
      .channel('public:noticias')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'noticias' },
        (payload) => {
          callback(payload.new as News);
        }
      )
      .subscribe();
  }

  private dataURLtoBlob(dataUrl: string): Blob {
    const arr = dataUrl.split(',');
    const mime = arr[0].match(/:(.*?);/)![1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) u8arr[n] = bstr.charCodeAt(n);
    return new Blob([u8arr], { type: mime });
  }
}
