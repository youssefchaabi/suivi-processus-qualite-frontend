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
    // Préparé pour afficher le nom de l'utilisateur si dispo dans le JWT
    // À compléter selon la structure du token
    return '';
  }
}
