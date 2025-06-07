export interface UserProfile {
  user_id: string;      // ID del usuario (relacionado con Auth)
  nombre: string;       // Nombre completo del usuario
  imagen_url: string;   // URL de la imagen de perfil
  created_at: string;   // Fecha de creación del perfil
}