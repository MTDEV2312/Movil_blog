# Blog App

Esta es una aplicación de blog desarrollada con Ionic Angular y Supabase como backend.

![App Screenshot](ruta_imagen_app.png)

## 📋 Requisitos Previos

- Node.js (v14 o superior)
- Ionic CLI
- Angular CLI
- Cuenta en Supabase

## 🚀 Instalación

1. Clona el repositorio
```bash
git clone https://github.com/tu-usuario/blog-app.git
cd blog-app
```

2. Instala las dependencias
```bash
npm install
```

3. Configura las variables de entorno

Crea un archivo `environment.ts` en `src/environments/` con la siguiente estructura:
```typescript
export const environment = {
  production: false,
  supabaseUrl: 'TU_SUPABASE_URL',
  supabaseKey: 'TU_SUPABASE_ANON_KEY'
};
```

4. Configura el cliente de Supabase

Crea un archivo `supabase.client.ts` en `src/app/` con la siguiente estructura:
```typescript
import { createClient } from '@supabase/supabase-js';
import { environment } from '../environments/environment';

export const supabase = createClient(
  environment.supabaseUrl,
  environment.supabaseKey
);
```

## 💻 Uso

Para ejecutar en desarrollo:
```bash
ionic serve
```

## 📱 Capturas de Pantalla

### Pagina de Noticias
![Pagina Noticias](https://github.com/user-attachments/assets/c9141acc-d857-4545-9fbb-442efbe07ae7)


### Api Consumida
![API CONSUMIDA](https://github.com/user-attachments/assets/ae595939-dec7-4dae-9791-a469cd67a99f)


## 🛠️ Construido Con

- [Ionic Framework](https://ionicframework.com/)
- [Angular](https://angular.io/)
- [Supabase](https://supabase.io/)

## 📄 Notas Importantes

- Los archivos de configuración (`environment.ts` y `supabase.client.ts`) no están incluidos en el repositorio por seguridad.
- Debes crear estos archivos localmente siguiendo la estructura proporcionada arriba.
- Nunca compartas tus claves de Supabase en el repositorio.


