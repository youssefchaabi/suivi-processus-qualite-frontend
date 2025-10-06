import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/authentification.service';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSnackBar } from '@angular/material/snack-bar';
import { HistoriqueService, ActionHistorique, FiltresHistorique } from '../../services/historique.service';
import { UtilisateurService } from '../../services/utilisateur.service';

@Component({
  selector: 'app-historique',
  templateUrl: './historique.component.html',
  styleUrls: ['./historique.component.scss']
})
export class HistoriqueComponent implements OnInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  // Données
  historique: ActionHistorique[] = [];
  filteredHistorique: ActionHistorique[] = [];
  paginatedHistorique: ActionHistorique[] = [];
  users: any[] = [];

  // Filtres
  selectedType: string = '';
  selectedModule: string = '';
  selectedUser: string = '';
  selectedPeriod: string = '';
  startDate: Date | null = null;
  endDate: Date | null = null;

  // Statistiques
  totalActions: number = 0;
  actionsToday: number = 0;
  actionsThisWeek: number = 0;
  actionsThisMonth: number = 0;

  // Pagination
  pageSize: number = 10;
  currentPage: number = 0;

  // États
  loading: boolean = false;

  constructor(
    private historiqueService: HistoriqueService,
    private utilisateurService: UtilisateurService,
    private snackBar: MatSnackBar,
    private router: Router,
    private auth: AuthService
  ) { }

  ngOnInit(): void {
    // Défensif: si pas de token, ne pas déclencher d'appels (le guard redirigera)
    // Ne pas initialiser si non connecté ou token expiré
    if (!this.auth.isLoggedIn()) {
      return;
    }
    this.loadHistorique();
    this.loadUsers();
    this.loadStats();
  }

  loadHistorique(): void {
    this.loading = true;
    this.historiqueService.getAllHistorique().subscribe({
      next: (data: ActionHistorique[]) => {
        this.historique = data;
        this.filteredHistorique = [...data];
        this.updatePaginatedData();
        this.loading = false;
      },
      error: (error: any) => {
        console.error('Erreur lors du chargement de l\'historique:', error);
        this.loading = false;
        this.snackBar.open('Erreur lors du chargement de l\'historique', 'Fermer', { duration: 3000 });
      }
    });
  }

  loadUsers(): void {
    this.utilisateurService.getUtilisateurs().subscribe({
      next: (data: any[]) => {
        this.users = data;
      },
      error: (error: any) => {
        console.error('Erreur lors du chargement des utilisateurs:', error);
      }
    });
  }

  loadStats(): void {
    this.historiqueService.getTotalActions().subscribe({
      next: (total: number) => this.totalActions = total
    });
    this.historiqueService.getActionsToday().subscribe({
      next: (today: number) => this.actionsToday = today
    });
    this.historiqueService.getActionsThisWeek().subscribe({
      next: (week: number) => this.actionsThisWeek = week
    });
    this.historiqueService.getActionsThisMonth().subscribe({
      next: (month: number) => this.actionsThisMonth = month
    });
  }

  applyFilters(): void {
    const filtres: FiltresHistorique = {
      typeAction: this.selectedType || undefined,
      module: this.selectedModule || undefined,
      utilisateurId: this.selectedUser || undefined,
      dateDebut: this.startDate || undefined,
      dateFin: this.endDate || undefined,
      periode: this.selectedPeriod as any || undefined
    };

    this.loading = true;
    this.historiqueService.getHistoriqueWithFilters(filtres).subscribe({
      next: (data: ActionHistorique[]) => {
        this.filteredHistorique = data;
        this.currentPage = 0;
        this.updatePaginatedData();
        this.loading = false;
      },
      error: (error: any) => {
        console.error('Erreur lors du filtrage:', error);
        this.loading = false;
        this.snackBar.open('Erreur lors du filtrage', 'Fermer', { duration: 3000 });
      }
    });
  }

  clearFilters(): void {
    this.selectedType = '';
    this.selectedModule = '';
    this.selectedUser = '';
    this.selectedPeriod = '';
    this.startDate = null;
    this.endDate = null;
    this.filteredHistorique = [...this.historique];
    this.currentPage = 0;
    this.updatePaginatedData();
  }

  exportHistorique(): void {
    const filtres: FiltresHistorique = {
      typeAction: this.selectedType || undefined,
      module: this.selectedModule || undefined,
      utilisateurId: this.selectedUser || undefined,
      dateDebut: this.startDate || undefined,
      dateFin: this.endDate || undefined,
      periode: this.selectedPeriod as any || undefined
    };

    this.historiqueService.exportHistorique(filtres).subscribe({
      next: (blob: Blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `historique_${new Date().toISOString().split('T')[0]}.xlsx`;
        link.click();
        window.URL.revokeObjectURL(url);
        this.snackBar.open('Export réussi', 'Fermer', { duration: 3000 });
      },
      error: (error: any) => {
        console.error('Erreur lors de l\'export:', error);
        this.snackBar.open('Erreur lors de l\'export', 'Fermer', { duration: 3000 });
      }
    });
  }

  onPageChange(event: PageEvent): void {
    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;
    this.updatePaginatedData();
  }

  updatePaginatedData(): void {
    const startIndex = this.currentPage * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.paginatedHistorique = this.filteredHistorique.slice(startIndex, endIndex);
  }

  getActionTypeClass(typeAction: string): string {
    switch (typeAction) {
      case 'CREATION': return 'creation';
      case 'MODIFICATION': return 'modification';
      case 'SUPPRESSION': return 'suppression';
      case 'SOUMISSION': return 'soumission';
      case 'VALIDATION': return 'validation';
      case 'CONNEXION': return 'connexion';
      case 'DECONNEXION': return 'deconnexion';
      default: return '';
    }
  }

  getActionIcon(typeAction: string): string {
    switch (typeAction) {
      case 'CREATION': return 'add';
      case 'MODIFICATION': return 'edit';
      case 'SUPPRESSION': return 'delete';
      case 'SOUMISSION': return 'send';
      case 'VALIDATION': return 'check_circle';
      case 'CONNEXION': return 'login';
      case 'DECONNEXION': return 'logout';
      default: return 'info';
    }
  }

  getActionDescription(action: ActionHistorique): string {
    const userName = `${action.utilisateur.nom} ${action.utilisateur.prenom}`;
    
    switch (action.typeAction) {
      case 'CREATION':
        return `a créé un nouvel élément dans le module ${action.module}`;
      case 'MODIFICATION':
        return `a modifié un élément dans le module ${action.module}`;
      case 'SUPPRESSION':
        return `a supprimé un élément dans le module ${action.module}`;
      case 'SOUMISSION':
        return `a soumis un formulaire dans le module ${action.module}`;
      case 'VALIDATION':
        return `a validé un élément dans le module ${action.module}`;
      case 'CONNEXION':
        return `s'est connecté au système`;
      case 'DECONNEXION':
        return `s'est déconnecté du système`;
      default:
        return `a effectué une action dans le module ${action.module}`;
    }
  }
} 