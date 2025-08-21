import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { FormulairesObligatoiresService } from '../../services/formulaires-obligatoires.service';
import { UtilisateurService } from '../../services/utilisateur.service';

export interface FormulaireObligatoire {
  id?: string;
  nom: string;
  description: string;
  typeFormulaire: 'QUALITE' | 'SUIVI' | 'AUDIT' | 'CONTROLE';
  responsableId: string;
  dateEcheance: Date;
  priorite: 'HAUTE' | 'MOYENNE' | 'BASSE';
  statut: 'EN_ATTENTE' | 'SOUMIS' | 'EN_RETARD' | 'ANNULE';
  notifie: boolean;
  commentaires?: string;
  dateCreation?: Date;
  dateModification?: Date;
}

@Component({
  selector: 'app-formulaires-obligatoires',
  templateUrl: './formulaires-obligatoires.component.html',
  styleUrls: ['./formulaires-obligatoires.component.scss']
})
export class FormulairesObligatoiresComponent implements OnInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  // Données
  formulaires: FormulaireObligatoire[] = [];
  filteredFormulaires: FormulaireObligatoire[] = [];
  paginatedFormulaires: FormulaireObligatoire[] = [];
  users: any[] = [];

  // Filtres
  selectedStatut: string = '';
  selectedPriorite: string = '';
  selectedResponsable: string = '';
  selectedType: string = '';
  searchTerm: string = '';

  // Statistiques
  totalFormulaires: number = 0;
  formulairesEnRetard: number = 0;
  formulairesEcheanceProche: number = 0;
  formulairesSoumis: number = 0;

  // Pagination
  pageSize: number = 6;
  currentPage: number = 0;

  // États
  loading: boolean = false;

  constructor(
    private formulairesService: FormulairesObligatoiresService,
    private utilisateurService: UtilisateurService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.loadFormulaires();
    this.loadUsers();
    this.calculateStats();
  }

  loadFormulaires(): void {
    this.loading = true;
    this.formulairesService.getAllFormulaires().subscribe({
      next: (data: FormulaireObligatoire[]) => {
        this.formulaires = data;
        this.filteredFormulaires = [...data];
        this.updatePaginatedData();
        this.calculateStats();
        this.loading = false;
      },
      error: (error: any) => {
        console.error('Erreur lors du chargement des formulaires:', error);
        this.loading = false;
        this.snackBar.open('Erreur lors du chargement des formulaires', 'Fermer', { duration: 3000 });
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

  calculateStats(): void {
    this.totalFormulaires = this.formulaires.length;
    this.formulairesEnRetard = this.formulaires.filter(f => this.isEnRetard(f.dateEcheance)).length;
    this.formulairesEcheanceProche = this.formulaires.filter(f => this.isEcheanceProche(f.dateEcheance)).length;
    this.formulairesSoumis = this.formulaires.filter(f => f.statut === 'SOUMIS').length;
  }

  applyFilters(): void {
    this.filteredFormulaires = this.formulaires.filter(formulaire => {
      // Filtre par statut
      if (this.selectedStatut && formulaire.statut !== this.selectedStatut) return false;
      
      // Filtre par priorité
      if (this.selectedPriorite && formulaire.priorite !== this.selectedPriorite) return false;
      
      // Filtre par responsable
      if (this.selectedResponsable && formulaire.responsableId !== this.selectedResponsable) return false;
      
      // Filtre par type
      if (this.selectedType && formulaire.typeFormulaire !== this.selectedType) return false;
      
      // Filtre par recherche
      if (this.searchTerm) {
        const search = this.searchTerm.toLowerCase();
        return formulaire.nom.toLowerCase().includes(search) || 
               formulaire.description.toLowerCase().includes(search);
      }
      
      return true;
    });
    
    this.currentPage = 0;
    this.updatePaginatedData();
  }

  clearFilters(): void {
    this.selectedStatut = '';
    this.selectedPriorite = '';
    this.selectedResponsable = '';
    this.selectedType = '';
    this.searchTerm = '';
    this.filteredFormulaires = [...this.formulaires];
    this.currentPage = 0;
    this.updatePaginatedData();
  }

  openCreateDialog(): void {
    // TODO: Implémenter le dialog de création
    this.snackBar.open('Fonctionnalité de création à implémenter', 'Fermer', { duration: 3000 });
  }

  verifierRetards(): void {
    const retards = this.formulaires.filter(f => this.isEnRetard(f.dateEcheance));
    this.snackBar.open(`${retards.length} formulaire(s) en retard détecté(s)`, 'Fermer', { duration: 3000 });
  }

  verifierEcheances(): void {
    const echeancesProches = this.formulaires.filter(f => this.isEcheanceProche(f.dateEcheance));
    this.snackBar.open(`${echeancesProches.length} échéance(s) proche(s) détectée(s)`, 'Fermer', { duration: 3000 });
  }

  exportFormulaires(): void {
    // TODO: Implémenter l'export
    this.snackBar.open('Fonctionnalité d\'export à implémenter', 'Fermer', { duration: 3000 });
  }

  editFormulaire(formulaire: FormulaireObligatoire): void {
    // TODO: Implémenter l'édition
    this.snackBar.open('Fonctionnalité d\'édition à implémenter', 'Fermer', { duration: 3000 });
  }

  viewFormulaire(formulaire: FormulaireObligatoire): void {
    // TODO: Implémenter la visualisation
    this.snackBar.open('Fonctionnalité de visualisation à implémenter', 'Fermer', { duration: 3000 });
  }

  marquerSoumis(formulaire: FormulaireObligatoire): void {
    if (formulaire.id) {
      this.formulairesService.marquerSoumis(formulaire.id).subscribe({
        next: () => {
          formulaire.statut = 'SOUMIS';
          this.calculateStats();
          this.snackBar.open('Formulaire marqué comme soumis', 'Fermer', { duration: 3000 });
        },
        error: (error: any) => {
          console.error('Erreur lors de la mise à jour:', error);
          this.snackBar.open('Erreur lors de la mise à jour', 'Fermer', { duration: 3000 });
        }
      });
    }
  }

  deleteFormulaire(formulaire: FormulaireObligatoire): void {
    if (formulaire.id) {
      if (confirm('Êtes-vous sûr de vouloir supprimer ce formulaire ?')) {
        this.formulairesService.deleteFormulaire(formulaire.id).subscribe({
          next: () => {
            this.formulaires = this.formulaires.filter(f => f.id !== formulaire.id);
            this.applyFilters();
            this.calculateStats();
            this.snackBar.open('Formulaire supprimé avec succès', 'Fermer', { duration: 3000 });
          },
          error: (error: any) => {
            console.error('Erreur lors de la suppression:', error);
            this.snackBar.open('Erreur lors de la suppression', 'Fermer', { duration: 3000 });
          }
        });
      }
    }
  }

  onPageChange(event: PageEvent): void {
    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;
    this.updatePaginatedData();
  }

  updatePaginatedData(): void {
    const startIndex = this.currentPage * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.paginatedFormulaires = this.filteredFormulaires.slice(startIndex, endIndex);
  }

  getResponsableName(responsableId: string): string {
    const user = this.users.find(u => u.id === responsableId);
    return user ? `${user.nom} ${user.prenom}` : 'Utilisateur inconnu';
  }

  getEcheanceClass(dateEcheance: Date): string {
    if (this.isEnRetard(dateEcheance)) return 'echeance-retard';
    if (this.isEcheanceProche(dateEcheance)) return 'echeance-proche';
    return 'echeance-ok';
  }

  getPrioriteClass(priorite: string): string {
    return priorite.toLowerCase();
  }

  getStatutClass(statut: string): string {
    switch (statut) {
      case 'EN_ATTENTE': return 'en-attente';
      case 'SOUMIS': return 'soumis';
      case 'EN_RETARD': return 'en-retard';
      case 'ANNULE': return 'annule';
      default: return '';
    }
  }

  getStatutLabel(statut: string): string {
    switch (statut) {
      case 'EN_ATTENTE': return 'En Attente';
      case 'SOUMIS': return 'Soumis';
      case 'EN_RETARD': return 'En Retard';
      case 'ANNULE': return 'Annulé';
      default: return statut;
    }
  }

  isEnRetard(dateEcheance: Date): boolean {
    return new Date(dateEcheance) < new Date();
  }

  isEcheanceProche(dateEcheance: Date): boolean {
    const echeance = new Date(dateEcheance);
    const aujourdhui = new Date();
    const diffTime = echeance.getTime() - aujourdhui.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays >= 0 && diffDays <= 7;
  }
} 