import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Tache, StatutTache, PrioriteTache, TacheStats } from '../../../../models/tache.model';
import { TacheService } from '../../../../services/tache.service';
import { AuthService } from '../../../../services/authentification.service';
import { TacheModalComponent } from '../../components/tache-modal/tache-modal.component';
import { TacheDetailsComponent } from '../../components/tache-details/tache-details.component';
import { ConfirmDialogComponent } from '../../../../shared/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-taches-liste',
  templateUrl: './liste.component.html',
  styleUrls: ['./liste.component.scss']
})
export class TachesListComponent implements OnInit {
  taches: Tache[] = [];
  tachesFiltrees: Tache[] = [];
  tachesPaginees: Tache[] = [];
  stats: TacheStats = {
    total: 0,
    aFaire: 0,
    enCours: 0,
    terminees: 0,
    enRetard: 0,
    prochaines7Jours: 0
  };

  // Filtres
  filtreStatut: string = 'TOUS';
  filtrePriorite: string = 'TOUS';
  filtreRecherche: string = '';

  // Pagination
  pageSize: number = 2;
  pageIndex: number = 0;

  // États
  isLoading = true;
  currentUserId: string = '';

  // Enums pour le template
  StatutTache = StatutTache;
  PrioriteTache = PrioriteTache;

  constructor(
    private tacheService: TacheService,
    private authService: AuthService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    // Essayer d'abord getUserId, sinon utiliser un ID par défaut pour le développement
    this.currentUserId = this.authService.getUserId() || '687f8fef2ea8486e2cb65281';
    
    console.log('Current User ID:', this.currentUserId);
    
    this.loadTaches();
    this.loadStatistiques();
  }

  /**
   * Charger les tâches
   */
  loadTaches(): void {
    this.isLoading = true;
    this.tacheService.getTachesByUtilisateur(this.currentUserId).subscribe({
      next: (taches) => {
        this.taches = taches;
        this.filtrerTaches();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Erreur chargement tâches:', error);
        this.snackBar.open('Erreur lors du chargement des tâches', 'Fermer', { duration: 3000 });
        this.isLoading = false;
      }
    });
  }

  /**
   * Charger les statistiques
   */
  loadStatistiques(): void {
    this.tacheService.getStatistiques(this.currentUserId).subscribe({
      next: (stats) => {
        this.stats = stats;
      },
      error: (error) => {
        console.error('Erreur chargement statistiques:', error);
      }
    });
  }

  /**
   * Filtrer les tâches
   */
  filtrerTaches(): void {
    this.tachesFiltrees = this.taches.filter(tache => {
      // Filtre par statut
      if (this.filtreStatut !== 'TOUS' && tache.statut !== this.filtreStatut) {
        return false;
      }

      // Filtre par priorité
      if (this.filtrePriorite !== 'TOUS' && tache.priorite !== this.filtrePriorite) {
        return false;
      }

      // Filtre par recherche
      if (this.filtreRecherche) {
        const recherche = this.filtreRecherche.toLowerCase();
        return tache.titre.toLowerCase().includes(recherche) ||
               (tache.description && tache.description.toLowerCase().includes(recherche)) ||
               (tache.projetNom && tache.projetNom.toLowerCase().includes(recherche));
      }

      return true;
    });

    // Réinitialiser la pagination
    this.pageIndex = 0;
    this.updatePagination();
  }

  /**
   * Mettre à jour la pagination
   */
  updatePagination(): void {
    const startIndex = this.pageIndex * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.tachesPaginees = this.tachesFiltrees.slice(startIndex, endIndex);
  }

  /**
   * Gérer le changement de page
   */
  onPageChange(event: any): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.updatePagination();
  }

  /**
   * Ouvrir le modal de création
   */
  ouvrirModalCreation(): void {
    const dialogRef = this.dialog.open(TacheModalComponent, {
      width: '600px',
      data: { tache: null, userId: this.currentUserId }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadTaches();
        this.loadStatistiques();
        this.snackBar.open('Tâche créée avec succès', 'Fermer', { duration: 3000 });
      }
    });
  }

  /**
   * Ouvrir le modal de détails
   */
  ouvrirDetails(tache: Tache): void {
    this.dialog.open(TacheDetailsComponent, {
      width: '700px',
      data: { tache: { ...tache } }
    });
  }

  /**
   * Ouvrir le modal d'édition
   */
  ouvrirModalEdition(tache: Tache): void {
    const dialogRef = this.dialog.open(TacheModalComponent, {
      width: '600px',
      data: { tache: { ...tache }, userId: this.currentUserId }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadTaches();
        this.loadStatistiques();
        this.snackBar.open('Tâche modifiée avec succès', 'Fermer', { duration: 3000 });
      }
    });
  }

  /**
   * Supprimer une tâche
   */
  supprimerTache(tache: Tache): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Confirmer la suppression',
        message: `Êtes-vous sûr de vouloir supprimer la tâche "${tache.titre}" ?`
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result && tache.id) {
        this.tacheService.deleteTache(tache.id).subscribe({
          next: () => {
            this.loadTaches();
            this.loadStatistiques();
            this.snackBar.open('Tâche supprimée avec succès', 'Fermer', { duration: 3000 });
          },
          error: (error) => {
            console.error('Erreur suppression tâche:', error);
            this.snackBar.open('Erreur lors de la suppression', 'Fermer', { duration: 3000 });
          }
        });
      }
    });
  }

  /**
   * Marquer une tâche comme terminée
   */
  marquerTerminee(tache: Tache): void {
    if (tache.id) {
      this.tacheService.marquerTerminee(tache.id, this.currentUserId).subscribe({
        next: () => {
          this.loadTaches();
          this.loadStatistiques();
          this.snackBar.open('Tâche marquée comme terminée', 'Fermer', { duration: 3000 });
        },
        error: (error) => {
          console.error('Erreur marquage terminée:', error);
          this.snackBar.open('Erreur lors du marquage', 'Fermer', { duration: 3000 });
        }
      });
    }
  }

  /**
   * Obtenir la classe CSS pour le badge de statut
   */
  getStatutClass(statut: StatutTache): string {
    switch (statut) {
      case StatutTache.A_FAIRE: return 'badge-a-faire';
      case StatutTache.EN_COURS: return 'badge-en-cours';
      case StatutTache.TERMINEE: return 'badge-terminee';
      case StatutTache.EN_RETARD: return 'badge-en-retard';
      default: return '';
    }
  }

  /**
   * Obtenir la classe CSS pour le badge de priorité
   */
  getPrioriteClass(priorite: PrioriteTache): string {
    switch (priorite) {
      case PrioriteTache.HAUTE: return 'badge-haute';
      case PrioriteTache.MOYENNE: return 'badge-moyenne';
      case PrioriteTache.BASSE: return 'badge-basse';
      default: return '';
    }
  }

  /**
   * Formater le statut pour l'affichage
   */
  formatStatut(statut: StatutTache): string {
    switch (statut) {
      case StatutTache.A_FAIRE: return 'À faire';
      case StatutTache.EN_COURS: return 'En cours';
      case StatutTache.TERMINEE: return 'Terminée';
      case StatutTache.EN_RETARD: return 'En retard';
      default: return statut;
    }
  }

  /**
   * Formater la priorité pour l'affichage
   */
  formatPriorite(priorite: PrioriteTache): string {
    switch (priorite) {
      case PrioriteTache.HAUTE: return 'Haute';
      case PrioriteTache.MOYENNE: return 'Moyenne';
      case PrioriteTache.BASSE: return 'Basse';
      default: return priorite;
    }
  }

  /**
   * Vérifier si une tâche est urgente (échéance dans moins de 3 jours)
   */
  estUrgente(tache: Tache): boolean {
    if (!tache.dateEcheance || tache.statut === StatutTache.TERMINEE) {
      return false;
    }
    const aujourdhui = new Date();
    const echeance = new Date(tache.dateEcheance);
    const diffJours = Math.ceil((echeance.getTime() - aujourdhui.getTime()) / (1000 * 3600 * 24));
    return diffJours >= 0 && diffJours <= 3;
  }
}
