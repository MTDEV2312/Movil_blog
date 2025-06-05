import { Component, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { NewsService } from '../../services/news.service';
import type News from '../../interfaces/news.interface';
import { addOutline, cloudOutline } from 'ionicons/icons';
import { addIcons } from 'ionicons';

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

  constructor(private newsService: NewsService) {
    addIcons({cloudOutline,addOutline});
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
}
