import { Component, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { NewsService } from '../../services/news.service';
import type News from '../../interfaces/news.interface';
import { getAuth } from 'firebase/auth'; // Agregar este import
import { addIcons } from 'ionicons';
import { cloudOutline, addOutline } from 'ionicons/icons';

@Component({
  selector: 'app-news',
  templateUrl: './news.page.html',
  styleUrls: ['./news.page.scss'],
  standalone: true,
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    RouterModule
  ]
})
export class NewsPage implements OnInit {
  noticias: News[] = [];
  editableNoticias: Set<string> = new Set();
  isModalOpen = false;
  newNoticia = {
    titulo: '',
    contenido: ''
  };
  editingNoticia: News | null = null;
  isEditModalOpen = false;
  private auth = getAuth(); // Agregar esta propiedad

  constructor(private newsService: NewsService) {
    // Registrar los iconos
    addIcons({
      'cloud-outline': cloudOutline,
      'add-outline': addOutline
    });
  }

  async ngOnInit() {
    await this.cargarNoticias();
  }

  async cargarNoticias() {
    try {
      const user = this.auth.currentUser;
      this.noticias = await this.newsService.getNews();
      
      // Guardamos los IDs de las noticias editables
      if (user) {
        this.editableNoticias = new Set(
          this.noticias
            .filter(noticia => noticia.user_id === user.uid)
            .map(noticia => noticia.id.toString())
        );
      }
    } catch (error) {
      console.error('Error al cargar noticias:', error);
    }
  }

  async crearNoticia() {
    try {
      await this.newsService.createNews(this.newNoticia.titulo, this.newNoticia.contenido);
      this.isModalOpen = false;
      this.newNoticia = { titulo: '', contenido: '' };
      await this.cargarNoticias();
    } catch (error) {
      console.error('Error al crear noticia:', error);
    }
  }

  abrirModal() {
    this.isModalOpen = true;
  }

  cerrarModal() {
    this.isModalOpen = false;
  }

  canEdit(noticia: News): boolean {
    return this.editableNoticias.has(noticia.id.toString());
  }

  abrirModalEdicion(noticia: News) {
    this.editingNoticia = { ...noticia };
    this.isEditModalOpen = true;
  }

  cerrarModalEdicion() {
    this.editingNoticia = null;
    this.isEditModalOpen = false;
  }

  async actualizarNoticia() {
    if (!this.editingNoticia) return;

    try {
      await this.newsService.updateNews(
        this.editingNoticia.id,
        this.editingNoticia.titulo,
        this.editingNoticia.contenido
      );
      await this.cargarNoticias();
      this.cerrarModalEdicion();
    } catch (error) {
      console.error('Error al actualizar noticia:', error);
    }
  }
}
