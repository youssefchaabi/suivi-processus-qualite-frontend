import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/authentification.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NotificationService } from 'src/app/services/notification.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit {
  notificationCount = 0;
  private pollingHandle: any;
  searchQuery = '';
  showSearch = false;

  constructor(public authService: AuthService, private router: Router, private snackBar: MatSnackBar, private notifService: NotificationService) {}

  ngOnInit(): void {
    const userId = this.authService.getUserId();
    if (!userId) return;
    const fetch = () => this.notifService.getNonLues(userId).subscribe(list => this.notificationCount = list.length);
    fetch();
    this.pollingHandle = setInterval(fetch, 5000);
  }

  ngOnDestroy(): void {
    if (this.pollingHandle) clearInterval(this.pollingHandle);
  }

  goToNotifications(): void {
    this.router.navigate(['/notifications']);
  }

  logout() {
    this.authService.logout();
    this.snackBar.open('Déconnexion réussie.', 'Fermer', { duration: 2000, panelClass: ['mat-snack-bar-success'] });
    this.router.navigate(['/']);
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
      return decoded.nom || decoded.email || '';
    } catch {
      return '';
    }
  }

  toggleSearch(): void {
    this.showSearch = !this.showSearch;
    if (!this.showSearch) {
      this.searchQuery = '';
    }
  }

  onSearch(): void {
    if (this.searchQuery.trim()) {
      console.log('Recherche:', this.searchQuery);
      // TODO: Implémenter la logique de recherche
      this.snackBar.open(`Recherche: ${this.searchQuery}`, 'Fermer', { duration: 2000 });
    }
  }

  getRoleLabel(): string {
    const role = this.authService.getRole();
    switch (role) {
      case 'ADMIN': return 'Administrateur';
      case 'CHEF_PROJET': return 'Chef de Projet';
      case 'PILOTE_QUALITE': return 'Pilote Qualité';
      default: return '';
    }
  }
}
