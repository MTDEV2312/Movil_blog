import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { 
  IonContent, 
  IonHeader, 
  IonTitle, 
  IonToolbar,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonButtons,
  IonButton,
  IonChip,
  IonGrid,
  IonRow,
  IonCol,
  IonModal,
  IonIcon 
} from '@ionic/angular/standalone';
import { NewsService } from '../../services/news.service';


@Component({
  selector: 'app-api',
  templateUrl: './api.page.html',
  styleUrls: ['./api.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonButtons,
    IonButton,
    IonChip,
    IonGrid,
    IonRow,
    IonCol,
    IonModal,
    IonIcon
  ]
})
export class APIPage implements OnInit {
  pokemons: any[] = [];
  selectedPokemon: any = null;
  isModalOpen = false;

  constructor(
    private http: HttpClient,
    private newsService: NewsService
  ) { }

  ngOnInit() {
    this.loadInitialPokemons();
  }

  loadInitialPokemons() {
    this.http.get<any>('https://pokeapi.co/api/v2/pokemon?limit=5')
      .subscribe({
        next: (res) => {
          this.pokemons = res.results;
          // Cargar detalles de cada pokemon
          this.pokemons.forEach(pokemon => {
            this.loadPokemonDetails(pokemon);
          });
        },
        error: (error) => console.error('Error:', error)
      });
  }

  loadPokemonDetails(pokemon: any) {
    this.http.get<any>(pokemon.url).subscribe({
      next: (details) => {
        pokemon.details = details;
      }
    });
  }

  openModal(pokemon: any) {
    this.selectedPokemon = pokemon;
    this.isModalOpen = true;
  }

  closeModal() {
    this.isModalOpen = false;
  }

  getImageUrl(pokemon: any) {
    if (pokemon?.details?.sprites?.front_default) {
      return pokemon.details.sprites.front_default;
    }
    return 'assets/icon/favicon.png';
  }

  async guardarComoPokemon(pokemon: any) {
    try {
      const titulo = pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1);
      const contenido = this.generarContenidoPokemon(pokemon);
      const imagenUrl = pokemon.details.sprites.front_default;

      await this.newsService.createPokemonNews(titulo, contenido, imagenUrl);
      this.closeModal();
    } catch (error) {
      console.error('Error al guardar pokemon como noticia:', error);
    }
  }

  private generarContenidoPokemon(pokemon: any): string {
    const tipos = pokemon.details.types
      .map((t: any) => t.type.name)
      .join(', ');

    const stats = pokemon.details.stats
      .map((s: any) => `${s.stat.name}: ${s.base_stat}`)
      .join('\n');

    return `Pokémon: ${pokemon.name.toUpperCase()}
Tipos: ${tipos}

Estadísticas:
${stats}`;
  }
}
