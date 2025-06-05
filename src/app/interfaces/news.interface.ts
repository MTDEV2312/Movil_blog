export default interface News {
  id: number;  // Cambiado de string a number
  titulo: string;
  contenido: string;
  imagen_url: string;
  latitud: number;
  longitud: number;
  ubicacion_url: string;
  fecha: string;         
  user_id: string;
}