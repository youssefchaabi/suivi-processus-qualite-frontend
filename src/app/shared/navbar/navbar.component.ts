import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/authentification.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent {
  notificationCount = 0; // À brancher plus tard sur le service de notifications

  constructor(public authService: AuthService, private router: Router, private snackBar: MatSnackBar) {}

  logout() {
    this.authService.logout();
    this.snackBar.open('Déconnexion réussie.', 'Fermer', { duration: 2000, panelClass: ['mat-snack-bar-success'] });
    this.router.navigate(['/login']);
  }

  goToDashboard() {
    const role = this.authService.getRole();
    if (role === 'ADMIN') {
      this.router.navigate(['/admin/dashboard']);
    } else if (role === 'CHEF_PROJET') {
      this.router.navigate(['/fiche-qualite/dashboard']);
    } else if (role === 'PILOTE_QUALITE') {
      this.router.navigate(['/fiche-suivi/dashboard']);
    } else {
      this.router.navigate(['/']);
    }
  }

  getUserName(): string {
    // Affiche le nom de l'utilisateur si dispo dans le JWT
    const token = localStorage.getItem('token');
    if (!token) return '';
    try {
      const decoded: any = JSON.parse(atob(token.split('.')[1]));
      return decoded.nom || '';
    } catch {
      return '';
    }
  }
}
