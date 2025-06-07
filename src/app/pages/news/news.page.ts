import { Component, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { NewsService } from '../../services/news.service';
import type News from '../../interfaces/news.interface';
import { addOutline, cloudOutline, createOutline } from 'ionicons/icons';
import { addIcons } from 'ionicons';
import { getAuth } from 'firebase/auth'; // Agregar este import

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
  isModalOpen = false;
  newNoticia = {
    titulo: '',
    contenido: ''
  };
  editingNoticia: News | null = null;
  isEditModalOpen = false;
  private auth = getAuth(); // Agregar esta propiedad

  constructor(private newsService: NewsService) {
    addIcons({ cloudOutline, addOutline, createOutline });
    console.log('Íconos registrados');
  }

  ngOnInit() {
    this.cargarNoticias();
  }

  async cargarNoticias() {
    try {
      this.noticias = await this.newsService.getNews();
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
    const user = this.auth.currentUser;
    const userIdFromAuth = user?.uid?.toString() || '';
    const userIdFromNews = noticia.user_id?.toString() || '';
    
    console.log('Comparando IDs:', {
      authId: userIdFromAuth,
      newsId: userIdFromNews,
      match: userIdFromAuth === userIdFromNews,
      noticia: noticia
    });
    
    return userIdFromAuth === userIdFromNews;
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
