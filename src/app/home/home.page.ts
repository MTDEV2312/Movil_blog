import { Component} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonList, IonItem, IonInput, IonButton } from '@ionic/angular/standalone';
import { Router } from '@angular/router';
import { Auth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from '@angular/fire/auth';

@Component({
  selector: 'app-auth',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule, IonList, IonItem, IonInput, IonButton, IonHeader]
})
export class HomePage {
  email: string = '';
  password: string = '';
  error: string = '';

  constructor(
    private router: Router,
    private auth: Auth
  ) { }

  async login() {
    try {
      const userCredential = await signInWithEmailAndPassword(
        this.auth,
        this.email,
        this.password
      );
      if (userCredential.user) {
        this.router.navigate(['/profile']);
      }
    } catch (error: any) {
      this.error = error.message;
      console.error('Error de inicio de sesión:', error);
    }
  }

  async register() {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        this.auth,
        this.email,
        this.password
      );
      if (userCredential.user) {
        alert('¡Registro exitoso! Por favor verifica tu correo electrónico.');
      }
    } catch (error: any) {
      this.error = error.message;
      console.error('Error de registro:', error);
    }
  }
}
