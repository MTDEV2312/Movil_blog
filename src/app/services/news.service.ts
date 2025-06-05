import { Injectable } from '@angular/core';
import { supabase } from '../supabase.client';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Geolocation } from '@capacitor/geolocation';
import { Router } from '@angular/router';
import type News from '../interfaces/news.interface';

@Injectable({
  providedIn: 'root'
})
export class NewsService {

  constructor(private router: Router) {}

  async getNews(): Promise<News[]> {
    const { data, error } = await supabase
      .from('news')
      .select('*')
      .order('created_at', { ascending: false });
      
    if (error) {
      console.error('Error al obtener noticias:', error);
      return [];
    }
    return data as News[] || [];
  }

  async createNews(titulo: string, contenido: string): Promise<void> {
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      console.error('Usuario no autenticado:', authError);
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
        .from('imagenes-noticias')
        .upload(fileName, fileBlob, {
          upsert: false
        });

      if (uploadError) throw uploadError;

      // 3. Obtener URL pública de la imagen
      const { data: publicUrlData } = supabase
        .storage
        .from('imagenes-noticias')
        .getPublicUrl(fileName);

      const imagenUrl = publicUrlData.publicUrl;

      // 4. Obtener ubicación
      const { coords } = await Geolocation.getCurrentPosition();
      const lat = coords.latitude;
      const lng = coords.longitude;
      const mapsUrl = `https://www.google.com/maps/@${lat},${lng},16z`;

      console.log('Usuario actual:', user.id);
      console.log('Datos a insertar:', {
        titulo,
        contenido,
        imagen_url: imagenUrl,
        latitud: lat,
        longitud: lng,
        ubicacion_url: mapsUrl,
        user_id: user.id,
      });

      // 5. Insertar en Supabase
      const { data, error: insertError } = await supabase
        .from('news')
        .insert({
          titulo,
          contenido,
          imagen_url: imagenUrl,
          latitud: lat,
          longitud: lng,
          ubicacion_url: mapsUrl,
          user_id: user.id,
          fecha: new Date().toISOString() // Agregamos la fecha
        })
        .select()
        .single();

      console.log('Respuesta de inserción:', {
        data,
        error: insertError,
        userId: user.id,
        session: await supabase.auth.getSession()
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
