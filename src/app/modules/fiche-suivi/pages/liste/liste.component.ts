import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { FicheSuivi } from 'src/app/models/fiche-suivi';
import { FicheSuiviService } from 'src/app/services/fiche-suivi.service';
import { FicheQualiteService } from 'src/app/services/fiche-qualite.service';
import { NomenclatureService, Nomenclature } from 'src/app/services/nomenclature.service';
import { FicheQualite } from 'src/app/models/fiche-qualite';
import { AuthService } from 'src/app/services/authentification.service';
import { MatPaginator } from '@angular/material/paginator';
import { FicheSuiviModalComponent } from '../../components/fiche-suivi-modal/fiche-suivi-modal.component';
import { FicheSuiviDetailsModalComponent } from '../../components/fiche-suivi-details-modal/fiche-suivi-details-modal.component';

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
  affichageCartes = true; // Mode d'affichage par défaut

  // Filtres dynamiques
  etats: Nomenclature[] = [];
  ficheQualites: FicheQualite[] = [];
  filtreEtat = '';
  recherche = '';

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(
    private ficheSuiviService: FicheSuiviService,
    private ficheQualiteService: FicheQualiteService,
    private nomenclatureService: NomenclatureService,
    private snackBar: MatSnackBar,
    private router: Router,
    private dialog: MatDialog,
    public authService: AuthService // injection pour le template
  ) {}
  
  retourDashboard(): void {
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

  ngOnInit(): void {
    // Colonnes réduites pour meilleure lisibilité
    this.displayedColumns = ['ficheQualite', 'dateSuivi', 'etat', 'delai', 'indicateursKpi', 'responsable'];
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
    // États avec les VRAIS libellés utilisés dans MongoDB
    this.etats = [
      { type: 'STATUT', code: 'En cours', libelle: 'En cours', actif: true },
      { type: 'STATUT', code: 'Terminé', libelle: 'Terminé', actif: true },
      { type: 'STATUT', code: 'Bloqué', libelle: 'Bloqué', actif: true }
    ];
    
    this.ficheQualiteService.getAll().subscribe({
      next: (data) => { this.ficheQualites = data; },
      error: () => { this.ficheQualites = []; }
    });
  }

  chargerFiches(): void {
    this.isLoading = true;
    this.ficheSuiviService.getAll().subscribe({
      next: (data) => {
        this.allFichesSuivi = data;
        this.fichesSuivi.data = data;
        this.isLoading = false;
      },
      error: () => {
        this.allFichesSuivi = [];
        this.fichesSuivi.data = [];
        this.isLoading = false;
        this.snackBar.open('Erreur lors du chargement', 'Fermer', { duration: 3000 });
      }
    });
  }

  supprimerFiche(id: string) {
    if (window.confirm('Voulez-vous vraiment supprimer cette fiche de suivi ?')) {
      this.ficheSuiviService.delete(id).subscribe({
        next: () => {
          // Supprimer la fiche localement SANS recharger
          this.allFichesSuivi = this.allFichesSuivi.filter(f => (f.id || (f as any)._id) !== id);
          this.fichesSuivi.data = [...this.allFichesSuivi];
          
          // Réattacher la pagination
          setTimeout(() => {
            if (this.paginator) {
              this.fichesSuivi.paginator = this.paginator;
            }
          }, 100);
          
          this.snackBar.open('✅ Fiche supprimée avec succès', 'Fermer', { duration: 2000 });
        },
        error: () => {
          this.snackBar.open('❌ Erreur lors de la suppression', 'Fermer', { duration: 2000 });
        }
      });
    }
  }

  getTitreFicheQualite(ficheId: string): string {
    const fiche = this.ficheQualites.find(f => f.id === ficheId);
    return fiche ? fiche.titre : '-';
  }

  appliquerFiltres() {
    let data = [...this.allFichesSuivi];
    
    if (this.filtreEtat) {
      data = data.filter(f => f.etatAvancement === this.filtreEtat);
    }
    
    if (this.recherche) {
      const rechercheLower = this.recherche.toLowerCase();
      data = data.filter(f =>
        this.getTitreFicheQualite(f.ficheId).toLowerCase().includes(rechercheLower) ||
        (f.problemes && f.problemes.toLowerCase().includes(rechercheLower)) ||
        (f.decisions && f.decisions.toLowerCase().includes(rechercheLower)) ||
        (f.indicateursKpi && this.getKpiLabel(f.indicateursKpi).toLowerCase().includes(rechercheLower))
      );
    }
    
    this.fichesSuivi.data = data;
  }

  resetFiltres() {
    this.filtreEtat = '';
    this.recherche = '';
    this.fichesSuivi.data = [...this.allFichesSuivi];
  }

  ajouterFiche() {
    const dialogRef = this.dialog.open(FicheSuiviModalComponent, {
      width: '900px',
      maxWidth: '95vw',
      maxHeight: '90vh',
      data: { mode: 'create' },
      disableClose: true,
      panelClass: 'custom-dialog-container'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result && result.fiche) {
        // Ajouter la fiche localement SANS recharger
        this.allFichesSuivi.push(result.fiche);
        this.fichesSuivi.data = [...this.allFichesSuivi];
        
        // Réattacher la pagination
        setTimeout(() => {
          if (this.paginator) {
            this.fichesSuivi.paginator = this.paginator;
            this.paginator.lastPage(); // Aller à la dernière page
          }
        }, 100);
        
        this.snackBar.open('✅ Fiche créée avec succès', 'Fermer', { duration: 2000 });
      }
    });
  }

  modifierFiche(id: string) {
    const dialogRef = this.dialog.open(FicheSuiviModalComponent, {
      width: '900px',
      maxWidth: '95vw',
      maxHeight: '90vh',
      data: { mode: 'edit', ficheId: id },
      disableClose: true,
      panelClass: 'custom-dialog-container'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result && result.fiche) {
        // Mettre à jour la fiche localement SANS recharger
        const index = this.allFichesSuivi.findIndex(f => (f.id || (f as any)._id) === id);
        if (index !== -1) {
          this.allFichesSuivi[index] = result.fiche;
          this.fichesSuivi.data = [...this.allFichesSuivi];
        }
        
        // Réattacher la pagination
        setTimeout(() => {
          if (this.paginator) {
            this.fichesSuivi.paginator = this.paginator;
          }
        }, 100);
        
        this.snackBar.open('✅ Fiche modifiée avec succès', 'Fermer', { duration: 2000 });
      }
    });
  }

  voirDetails(fiche: FicheSuivi): void {
    const ficheQualiteTitre = this.getTitreFicheQualite(fiche.ficheId);
    
    this.dialog.open(FicheSuiviDetailsModalComponent, {
      width: '900px',
      maxWidth: '95vw',
      maxHeight: '90vh',
      data: { fiche, ficheQualiteTitre }
    });
  }

  getCountByEtat(etat: string): number {
    return this.allFichesSuivi.filter(f => f.etatAvancement === etat).length;
  }

  getEtatClass(etat: string): string {
    const classes: { [key: string]: string } = {
      'En cours': 'etat-en-cours',
      'Terminé': 'etat-termine',
      'Bloqué': 'etat-bloque',
      'En attente': 'etat-attente',
      'Validé': 'etat-valide',
      // Anciens codes pour compatibilité
      'EN_COURS': 'etat-en-cours',
      'TERMINE': 'etat-termine',
      'BLOQUE': 'etat-bloque',
      'EN_ATTENTE': 'etat-attente',
      'VALIDE': 'etat-valide'
    };
    return classes[etat] || 'etat-default';
  }

  getEtatIcon(etat: string): string {
    const icons: { [key: string]: string } = {
      'En cours': 'pending',
      'Terminé': 'check_circle',
      'Bloqué': 'block',
      'En attente': 'schedule',
      'Validé': 'verified',
      // Anciens codes pour compatibilité
      'EN_COURS': 'pending',
      'TERMINE': 'check_circle',
      'BLOQUE': 'block',
      'EN_ATTENTE': 'schedule',
      'VALIDE': 'verified'
    };
    return icons[etat] || 'flag';
  }

  getKpiLabel(kpi: string | undefined): string {
    if (!kpi) return '-';
    const kpiMap: { [key: string]: string } = {
      'STATUT': 'Statut',
      'PRIORITE': 'Priorité',
      'CATEGORIE_PROJET': 'Catégorie Projet',
      'TYPE_FICHE': 'Type de Fiche'
    };
    return kpiMap[kpi] || kpi;
  }

  basculerAffichage(): void {
    this.affichageCartes = !this.affichageCartes;
    
    // Réattacher le paginator après le changement de vue
    setTimeout(() => {
      if (!this.affichageCartes && this.paginator) {
        this.fichesSuivi.paginator = this.paginator;
      }
    }, 100);
  }

  filtrerParEtat(etat: string): void {
    this.filtreEtat = etat;
    this.appliquerFiltres();
  }
}
