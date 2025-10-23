import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/authentification.service';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-main-layout',
  templateUrl: './main-layout.component.html',
  styleUrls: ['./main-layout.component.scss']
})
export class MainLayoutComponent implements OnInit {
  isSidenavOpen = true;
  currentUser: any;
  userRole: string = '';
  notificationCount = 0;

  menuItems = [
    {
      label: 'Dashboard',
      icon: 'dashboard',
      route: '/dashboard',
      roles: ['ADMIN', 'CHEF_PROJET', 'PILOTE_QUALITE']
    },
    {
      label: 'Fiches Qualité',
      icon: 'description',
      route: '/fiches-qualite',
      roles: ['ADMIN', 'CHEF_PROJET', 'PILOTE_QUALITE']
    },
    {
      label: 'Fiches de Suivi',
      icon: 'assignment',
      route: '/fiches-suivi',
      roles: ['ADMIN', 'CHEF_PROJET', 'PILOTE_QUALITE']
    },
    {
      label: 'Projets',
      icon: 'folder_open',
      route: '/projets',
      roles: ['ADMIN', 'CHEF_PROJET']
    },
    {
      label: 'Rapports KPI',
      icon: 'assessment',
      route: '/rapports',
      roles: ['ADMIN', 'CHEF_PROJET', 'PILOTE_QUALITE']
    },
    {
      label: 'Analytics IA',
      icon: 'psychology',
      route: '/ai-dashboard',
      roles: ['ADMIN', 'PILOTE_QUALITE']
    },
    {
      label: 'Notifications',
      icon: 'notifications',
      route: '/notifications',
      roles: ['ADMIN', 'CHEF_PROJET', 'PILOTE_QUALITE']
    },
    {
      label: 'Historique',
      icon: 'history',
      route: '/historique',
      roles: ['ADMIN', 'CHEF_PROJET', 'PILOTE_QUALITE']
    },
    {
      label: 'Utilisateurs',
      icon: 'people',
      route: '/utilisateurs',
      roles: ['ADMIN']
    },
    {
      label: 'Nomenclatures',
      icon: 'settings',
      route: '/nomenclatures',
      roles: ['ADMIN']
    }
  ];

  constructor(
    private authService: AuthService,
    private notificationService: NotificationService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadUserInfo();
    this.loadNotificationCount();
  }

  loadUserInfo(): void {
    // Récupérer les infos utilisateur depuis le token
    this.userRole = this.authService.getRole() || '';
    this.currentUser = {
      nom: 'Utilisateur',
      role: this.userRole
    };
  }

  loadNotificationCount(): void {
    // Simuler le chargement des notifications
    // À remplacer par un vrai appel au service
    this.notificationCount = 5;
  }

  toggleSidenav(): void {
    this.isSidenavOpen = !this.isSidenavOpen;
  }

  hasRole(roles: string[]): boolean {
    return roles.includes(this.userRole);
  }

  getVisibleMenuItems() {
    return this.menuItems.filter(item => this.hasRole(item.roles));
  }

  isActiveRoute(route: string): boolean {
    return this.router.url.startsWith(route);
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }

  navigateToProfile(): void {
    this.router.navigate(['/profile']);
  }

  navigateToNotifications(): void {
    this.router.navigate(['/notifications']);
  }
}
