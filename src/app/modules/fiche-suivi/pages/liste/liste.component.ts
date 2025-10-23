import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { FicheSuivi } from 'src/app/models/fiche-suivi';
import { FicheSuiviService } from 'src/app/services/fiche-suivi.service';
import { FicheQualiteService } from 'src/app/services/fiche-qualite.service';
import { NomenclatureService, Nomenclature } from 'src/app/services/nomenclature.service';
import { FicheQualite } from 'src/app/models/fiche-qualite';
import { AuthService } from 'src/app/services/authentification.service';
import { MatPaginator } from '@angular/material/paginator';

@Component({
  selector: 'app-liste',
  templateUrl: './liste.component.html',
  styleUrls: ['./liste.component.scss']
})
export class ListeComponent implements OnInit, AfterViewInit {
  isLoading = false;
  fichesSuivi: MatTableDataSource<FicheSuivi> = new MatTableDataSource<FicheSuivi>([]);
  allFichesSuivi: FicheSuivi[] = []; // Ajouté pour stocker toutes les fiches
  displayedColumns: string[] = [];

  // Filtres dynamiques
  etats: Nomenclature[] = [];
  responsables: Nomenclature[] = [];
  ficheQualites: FicheQualite[] = [];
  filtreEtat = '';
  filtreResponsable = '';
  recherche = '';

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(
    private ficheSuiviService: FicheSuiviService,
    private ficheQualiteService: FicheQualiteService,
    private nomenclatureService: NomenclatureService,
    private snackBar: MatSnackBar,
    private router: Router,
    public authService: AuthService // injection pour le template
  ) {}

  ngOnInit(): void {
    this.displayedColumns = ['ficheQualite', 'dateSuivi', 'etat', 'delai', 'problemes', 'decisions', 'indicateursKpi', 'responsable'];
    if (!this.authService.isPiloteQualite()) {
      this.displayedColumns.push('actions');
    }
    this.chargerFiltres();
    this.chargerFiches();
  }

  ngAfterViewInit() {
    this.fichesSuivi.paginator = this.paginator;
  }

  chargerFiltres(): void {
    this.nomenclatureService.getNomenclaturesByType('STATUT').subscribe({
      next: (data) => { this.etats = data; },
      error: () => { this.etats = [
        { type: 'STATUT', code: 'EN_COURS', libelle: 'En cours', actif: true },
        { type: 'STATUT', code: 'TERMINE', libelle: 'Terminé', actif: true },
        { type: 'STATUT', code: 'BLOQUE', libelle: 'Bloqué', actif: true }
      ]; }
    });
    // RESPONSABLE n'est pas un type valide, utiliser TYPE_FICHE temporairement
    this.nomenclatureService.getNomenclaturesByType('TYPE_FICHE').subscribe({
      next: (data) => { this.responsables = data; },
      error: () => {
        this.responsables = [
          { type: 'TYPE_FICHE', code: 'CHEF_PROJET_A', libelle: 'Chef Projet A', actif: true },
          { type: 'TYPE_FICHE', code: 'PILOTE_QUALITE', libelle: 'Pilote Qualité', actif: true }
        ];
      }
    });
    this.ficheQualiteService.getAll().subscribe({
      next: (data) => { this.ficheQualites = data; },
      error: () => { this.ficheQualites = []; }
    });
  }

  chargerFiches(): void {
    this.isLoading = true;
    this.ficheSuiviService.getAll().subscribe({
      next: (data) => {
        this.allFichesSuivi = data; // Stocke toutes les fiches
        this.fichesSuivi.data = data;
        this.isLoading = false;
      },
      error: () => {
        this.allFichesSuivi = [];
        this.fichesSuivi.data = [];
        this.isLoading = false;
        this.snackBar.open('Erreur lors du chargement des fiches de suivi', 'Fermer', { duration: 3000, panelClass: 'snackbar-error' });
      }
    });
  }

  supprimerFiche(id: string) {
    if (window.confirm('Voulez-vous vraiment supprimer cette fiche de suivi ?')) {
      this.isLoading = true;
      this.ficheSuiviService.delete(id).subscribe({
        next: () => {
          this.chargerFiches();
          this.snackBar.open('Fiche de suivi supprimée avec succès !', 'Fermer', { duration: 2500, panelClass: 'snackbar-success' });
        },
        error: () => {
          this.isLoading = false;
          this.snackBar.open('Erreur lors de la suppression', 'Fermer', { duration: 2500, panelClass: 'snackbar-error' });
        }
      });
    }
  }

  getTitreFicheQualite(ficheId: string): string {
    const fiche = this.ficheQualites.find(f => f.id === ficheId);
    return fiche ? fiche.titre : '-';
  }

  appliquerFiltres() {
    let data = this.allFichesSuivi; // Toujours partir de la liste complète
    if (this.filtreEtat) {
      data = data.filter(f => f.etatAvancement === this.filtreEtat);
    }
    if (this.filtreResponsable) {
      data = data.filter(f => f.ajoutePar === this.filtreResponsable);
    }
    if (this.recherche) {
      const rechercheLower = this.recherche.toLowerCase();
      data = data.filter(f =>
        this.getTitreFicheQualite(f.ficheId).toLowerCase().includes(rechercheLower) ||
        (f.problemes && f.problemes.toLowerCase().includes(rechercheLower)) ||
        (f.decisions && f.decisions.toLowerCase().includes(rechercheLower))
      );
    }
    this.fichesSuivi.data = data;
  }

  resetFiltres() {
    this.filtreEtat = '';
    this.filtreResponsable = '';
    this.recherche = '';
    this.chargerFiches();
  }

  ajouterFiche() {
    this.router.navigate(['/fiche-suivi/formulaire']);
  }

  modifierFiche(id: string) {
    // On pourrait ici préparer la date si besoin, mais la logique est dans le formulaire. Rien à changer ici sauf si bug persiste côté formulaire.
    this.router.navigate(['/fiche-suivi/formulaire', id]);
  }
}
