import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FicheQualiteService } from '../../services/fiche-qualite.service';
import { FicheSuiviService } from '../../services/fiche-suivi.service';
import { FicheProjetService } from '../../services/fiche-projet.service';
import { AuthService } from '../../services/authentification.service';
import { ChartConfiguration, ChartData, ChartType } from 'chart.js';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  // Stats Cards
  totalFichesQualite = 0;
  fichesEnCours = 0;
  tauxConformite = 0;
  projetsActifs = 0;

  // User info
  currentUser: any;
  userRole: string = '';

  // Loading states
  isLoading = true;

  // Charts data
  evolutionChartData: ChartData<'line'> = {
    labels: [],
    datasets: []
  };

  statutChartData: ChartData<'doughnut'> = {
    labels: [],
    datasets: []
  };

  performanceChartData: ChartData<'bar'> = {
    labels: [],
    datasets: []
  };

  // Chart options
  lineChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top',
      },
      title: {
        display: true,
        text: 'Évolution Mensuelle des Fiches'
      }
    },
    scales: {
      y: {
        beginAtZero: true
      }
    }
  };

  doughnutChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'right',
      },
      title: {
        display: true,
        text: 'Répartition par Statut'
      }
    }
  };

  barChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top',
      },
      title: {
        display: true,
        text: 'Performance par Type'
      }
    },
    scales: {
      y: {
        beginAtZero: true
      }
    }
  };

  // Chart types
  lineChartType: ChartType = 'line';
  doughnutChartType: ChartType = 'doughnut';
  barChartType: ChartType = 'bar';

  // Recent activities
  recentActivities: any[] = [];

  constructor(
    private ficheQualiteService: FicheQualiteService,
    private ficheSuiviService: FicheSuiviService,
    private ficheProjetService: FicheProjetService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadUserInfo();
    this.loadDashboardData();
  }

  loadUserInfo(): void {
    // Récupérer les infos utilisateur depuis le token
    this.userRole = this.authService.getRole() || '';
    this.currentUser = {
      nom: 'Utilisateur',
      role: this.userRole
    };
  }

  loadDashboardData(): void {
    this.isLoading = true;

    // Load stats
    this.loadStats();

    // Load charts data
    this.loadEvolutionChart();
    this.loadStatutChart();
    this.loadPerformanceChart();

    // Load recent activities
    this.loadRecentActivities();

    setTimeout(() => {
      this.isLoading = false;
    }, 1000);
  }

  loadStats(): void {
    // Total Fiches Qualité
    this.ficheQualiteService.getAll().subscribe({
      next: (fiches: any[]) => {
        this.totalFichesQualite = fiches.length;
        this.fichesEnCours = fiches.filter((f: any) => f.statut === 'EN_COURS').length;
        
        // Calculer taux de conformité
        const fichesTerminees = fiches.filter((f: any) => f.statut === 'TERMINE').length;
        this.tauxConformite = this.totalFichesQualite > 0 
          ? Math.round((fichesTerminees / this.totalFichesQualite) * 100) 
          : 0;
      },
      error: (error: any) => console.error('Erreur chargement fiches:', error)
    });

    // Projets Actifs
    this.ficheProjetService.getAll().subscribe({
      next: (projets: any[]) => {
        this.projetsActifs = projets.filter((p: any) => p.statut === 'EN_COURS').length;
      },
      error: (error: any) => console.error('Erreur chargement projets:', error)
    });
  }

  loadEvolutionChart(): void {
    this.ficheQualiteService.getAll().subscribe({
      next: (fiches: any[]) => {
        // Grouper par mois
        const moisMap = new Map<string, number>();
        const mois = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];
        
        // Initialiser les 6 derniers mois
        const now = new Date();
        for (let i = 5; i >= 0; i--) {
          const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
          const key = `${mois[date.getMonth()]} ${date.getFullYear()}`;
          moisMap.set(key, 0);
        }

        // Compter les fiches par mois
        fiches.forEach((fiche: any) => {
          if (fiche.dateCreation) {
            const date = new Date(fiche.dateCreation);
            const key = `${mois[date.getMonth()]} ${date.getFullYear()}`;
            if (moisMap.has(key)) {
              moisMap.set(key, (moisMap.get(key) || 0) + 1);
            }
          }
        });

        this.evolutionChartData = {
          labels: Array.from(moisMap.keys()),
          datasets: [
            {
              label: 'Fiches Créées',
              data: Array.from(moisMap.values()),
              borderColor: '#2563eb',
              backgroundColor: 'rgba(37, 99, 235, 0.1)',
              tension: 0.4,
              fill: true
            }
          ]
        };
      },
      error: (error: any) => console.error('Erreur chargement évolution:', error)
    });
  }

  loadStatutChart(): void {
    this.ficheQualiteService.getAll().subscribe({
      next: (fiches: any[]) => {
        const statutMap = new Map<string, number>();
        
        fiches.forEach((fiche: any) => {
          const statut = fiche.statut || 'NON_DEFINI';
          statutMap.set(statut, (statutMap.get(statut) || 0) + 1);
        });

        const colors = {
          'EN_COURS': '#f59e0b',
          'TERMINE': '#10b981',
          'EN_ATTENTE': '#6b7280',
          'ANNULE': '#ef4444',
          'NON_DEFINI': '#9ca3af'
        };

        this.statutChartData = {
          labels: Array.from(statutMap.keys()).map(s => this.formatStatut(s)),
          datasets: [
            {
              data: Array.from(statutMap.values()),
              backgroundColor: Array.from(statutMap.keys()).map(s => colors[s as keyof typeof colors] || '#9ca3af')
            }
          ]
        };
      },
      error: (error: any) => console.error('Erreur chargement statuts:', error)
    });
  }

  loadPerformanceChart(): void {
    this.ficheQualiteService.getAll().subscribe({
      next: (fiches: any[]) => {
        const typeMap = new Map<string, number>();
        
        fiches.forEach((fiche: any) => {
          const type = fiche.typeFiche || 'Autre';
          typeMap.set(type, (typeMap.get(type) || 0) + 1);
        });

        this.performanceChartData = {
          labels: Array.from(typeMap.keys()),
          datasets: [
            {
              label: 'Nombre de Fiches',
              data: Array.from(typeMap.values()),
              backgroundColor: '#2563eb',
              borderColor: '#1e40af',
              borderWidth: 1
            }
          ]
        };
      },
      error: (error: any) => console.error('Erreur chargement performance:', error)
    });
  }

  loadRecentActivities(): void {
    // Simuler des activités récentes (à remplacer par un vrai service d'historique)
    this.recentActivities = [
      {
        icon: 'add_circle',
        color: 'primary',
        title: 'Nouvelle fiche qualité créée',
        description: 'Fiche #FQ-2024-001',
        time: 'Il y a 2 heures',
        user: 'Jean Dupont'
      },
      {
        icon: 'check_circle',
        color: 'success',
        title: 'Fiche validée',
        description: 'Fiche #FQ-2024-002',
        time: 'Il y a 4 heures',
        user: 'Marie Martin'
      },
      {
        icon: 'assignment',
        color: 'info',
        title: 'Nouveau projet créé',
        description: 'Projet Migration Cloud',
        time: 'Il y a 1 jour',
        user: 'Pierre Durand'
      },
      {
        icon: 'warning',
        color: 'warning',
        title: 'Fiche en retard',
        description: 'Fiche #FQ-2024-003',
        time: 'Il y a 2 jours',
        user: 'Sophie Bernard'
      }
    ];
  }

  formatStatut(statut: string): string {
    const statutMap: { [key: string]: string } = {
      'EN_COURS': 'En Cours',
      'TERMINE': 'Terminé',
      'EN_ATTENTE': 'En Attente',
      'ANNULE': 'Annulé',
      'NON_DEFINI': 'Non Défini'
    };
    return statutMap[statut] || statut;
  }

  // Navigation rapide
  navigateToFiches(): void {
    this.router.navigate(['/fiches-qualite']);
  }

  navigateToProjets(): void {
    this.router.navigate(['/projets']);
  }

  navigateToRapports(): void {
    this.router.navigate(['/rapports']);
  }

  navigateToNotifications(): void {
    this.router.navigate(['/notifications']);
  }

  // Actions rapides
  createFiche(): void {
    this.router.navigate(['/fiches-qualite/create']);
  }

  createProjet(): void {
    this.router.navigate(['/projets/create']);
  }

  viewReports(): void {
    this.router.navigate(['/rapports']);
  }

  manageNotifications(): void {
    this.router.navigate(['/notifications']);
  }

  refreshDashboard(): void {
    this.loadDashboardData();
  }
}
