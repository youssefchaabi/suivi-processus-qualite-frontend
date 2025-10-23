import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.scss']
})
export class AdminDashboardComponent implements OnInit {
  stats = {
    totalUsers: 0,
    activeUsers: 0,
    nomenclatures: 0,
    recentActivity: 0
  };

  recentActivities = [
    {
      icon: 'person_add',
      color: 'primary',
      title: 'Nouvel utilisateur créé',
      description: 'Jean Dupont - Chef Projet',
      time: 'Il y a 2 heures'
    },
    {
      icon: 'edit',
      color: 'accent',
      title: 'Nomenclature modifiée',
      description: 'TYPE_FICHE - Audit',
      time: 'Il y a 4 heures'
    },
    {
      icon: 'verified_user',
      color: 'success',
      title: 'Utilisateur activé',
      description: 'Marie Martin - Pilote Qualité',
      time: 'Il y a 1 jour'
    }
  ];

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.loadStats();
  }

  loadStats(): void {
    // Simuler le chargement des stats
    this.stats = {
      totalUsers: 12,
      activeUsers: 8,
      nomenclatures: 24,
      recentActivity: 15
    };
  }

  navigateToUsers(): void {
    this.router.navigate(['/utilisateurs']);
  }

  navigateToNomenclatures(): void {
    this.router.navigate(['/nomenclatures']);
  }
}