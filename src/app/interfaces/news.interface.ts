export default interface News {
  id: number;
  titulo: string;
  contenido: string;
  imagen_url: string;
  latitud?: number;
  longitud?: number;
  ubicacion_url?: string;
  user_id: string;
  fecha: string;
  created_at?: string;
  updated_at?: string;
  user_profiles?: {
    nombre: string;
    imagen_url: string;
  };
}