import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { FicheQualite } from 'src/app/models/fiche-qualite';
import { FicheQualiteService } from 'src/app/services/fiche-qualite.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from 'src/app/services/authentification.service';
import { ConfirmDialogComponent } from 'src/app/shared/confirm-dialog/confirm-dialog.component';
import { FicheQualiteModalComponent } from '../../components/fiche-qualite-modal/fiche-qualite-modal.component';
import { FicheQualiteDetailsModalComponent } from '../../components/fiche-qualite-details-modal/fiche-qualite-details-modal.component';

@Component({
  selector: 'app-fiche-qualite-list',
  templateUrl: './liste.component.html',
  styleUrls: ['./liste.component.scss']
})
export class ListeComponent implements OnInit, AfterViewInit {
  colonnes: string[] = ['titre', 'typeFiche', 'statut', 'responsable', 'actions'];
  
  viewFiche(fiche: FicheQualite): void {
    this.dialog.open(FicheQualiteDetailsModalComponent, {
      width: '900px',
      maxWidth: '95vw',
      maxHeight: '90vh',
      data: fiche
    });
  }
  dataSource = new MatTableDataSource<FicheQualite>();
  fiches: FicheQualite[] = [];
  fichesFiltrees: FicheQualite[] = [];
  loading = true;
  affichageCartes = true;
  recherche = '';
  filtreStatut = '';
  filtreType = '';

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private ficheService: FicheQualiteService,
    private router: Router,
    private snackBar: MatSnackBar,
    public authService: AuthService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.chargerFiches();
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  chargerFiches(): void {
    console.log('🔄 Chargement des fiches qualité...');
    this.loading = true;
    this.ficheService.getAll().subscribe({
      next: (data) => {
        console.log('✅ Fiches reçues:', data);
        this.fiches = data || [];
        this.fichesFiltrees = [...this.fiches];
        this.dataSource.data = this.fiches;
        
        setTimeout(() => {
          if (this.paginator) {
            this.dataSource.paginator = this.paginator;
            this.paginator.firstPage();
          }
          if (this.sort) {
            this.dataSource.sort = this.sort;
          }
        });
        
        this.loading = false;
      },
      error: (error) => {
        console.error('❌ Erreur chargement fiches:', error);
        console.error('Status:', error.status);
        console.error('Message:', error.message);
        
        if (error.status === 401) {
          this.snackBar.open('⚠️ Session expirée. Veuillez vous reconnecter.', 'Fermer', { duration: 5000 });
        } else {
          this.snackBar.open('Erreur lors du chargement des fiches', 'Fermer', { duration: 3000 });
        }
        
        this.fiches = [];
        this.fichesFiltrees = [];
        this.dataSource.data = [];
        this.loading = false;
      }
    });
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value.trim().toLowerCase();
    this.dataSource.filter = filterValue;
  }

  addFiche(): void {
    const dialogRef = this.dialog.open(FicheQualiteModalComponent, {
      width: '900px',
      maxWidth: '95vw',
      maxHeight: '90vh',
      data: { mode: 'create' },
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.chargerFiches();
      }
    });
  }

  editFiche(fiche: FicheQualite): void {
    const dialogRef = this.dialog.open(FicheQualiteModalComponent, {
      width: '900px',
      maxWidth: '95vw',
      maxHeight: '90vh',
      data: { mode: 'edit', ficheId: fiche.id },
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.chargerFiches();
      }
    });
  }

  deleteFiche(fiche: FicheQualite, event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Confirmer la suppression',
        message: `Êtes-vous sûr de vouloir supprimer la fiche "${fiche.titre}" ? Cette action est irréversible.`,
        confirmText: 'Supprimer',
        cancelText: 'Annuler'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        console.log('🗑️ Suppression de la fiche:', fiche.id);
        this.ficheService.delete(fiche.id!).subscribe({
          next: () => {
            console.log('✅ Fiche supprimée avec succès');
            // Mise à jour locale SANS rechargement de la page
            this.fiches = this.fiches.filter(f => f.id !== fiche.id);
            this.fichesFiltrees = this.fichesFiltrees.filter(f => f.id !== fiche.id);
            this.dataSource.data = this.dataSource.data.filter(f => f.id !== fiche.id);
            
            // Réattacher le paginator après la mise à jour
            setTimeout(() => {
              if (this.paginator) {
                this.dataSource.paginator = this.paginator;
              }
            });
            
            this.snackBar.open('✅ Fiche supprimée avec succès', 'Fermer', {
              duration: 3000
            });
          },
          error: (error) => {
            console.error('❌ Erreur suppression:', error);
            this.snackBar.open('❌ Erreur lors de la suppression', 'Fermer', { duration: 3000 });
          }
        });
      }
    });
  }

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

  appliquerFiltres(): void {
    let resultats = [...this.fiches];
    
    if (this.recherche.trim()) {
      const rechercheLower = this.recherche.toLowerCase();
      resultats = resultats.filter(fiche =>
        fiche.titre?.toLowerCase().includes(rechercheLower) ||
        fiche.description?.toLowerCase().includes(rechercheLower) ||
        fiche.responsable?.toLowerCase().includes(rechercheLower)
      );
    }
    
    if (this.filtreStatut) {
      resultats = resultats.filter(fiche => fiche.statut === this.filtreStatut);
    }
    
    if (this.filtreType) {
      resultats = resultats.filter(fiche => fiche.typeFiche === this.filtreType);
    }
    
    this.fichesFiltrees = resultats;
    this.dataSource.data = resultats;
    
    setTimeout(() => {
      if (this.paginator) {
        this.dataSource.paginator = this.paginator;
        this.paginator.firstPage();
      }
    });
  }

  effacerFiltres(): void {
    this.recherche = '';
    this.filtreStatut = '';
    this.filtreType = '';
    this.appliquerFiltres();
  }

  basculerAffichage(): void {
    this.affichageCartes = !this.affichageCartes;
    
    if (!this.affichageCartes) {
      setTimeout(() => {
        if (this.paginator) {
          this.dataSource.paginator = this.paginator;
          this.paginator.firstPage();
        }
        if (this.sort) {
          this.dataSource.sort = this.sort;
        }
      });
    }
  }

  getTypeIcon(type: string): string {
    const icons: { [key: string]: string } = {
      'AUDIT': 'fact_check',
      'CONTROLE': 'verified',
      'AMELIORATION': 'trending_up',
      'FORMATION': 'school',
      'MAINTENANCE': 'build',
      'AUTRE': 'more_horiz'
    };
    return icons[type] || 'description';
  }

  getTypeColor(type: string): string {
    const colors: { [key: string]: string } = {
      'AUDIT': '#2196f3',
      'CONTROLE': '#4caf50',
      'AMELIORATION': '#ff9800',
      'FORMATION': '#9c27b0',
      'MAINTENANCE': '#795548',
      'AUTRE': '#607d8b'
    };
    return colors[type] || '#666';
  }

  getStatutIcon(statut: string): string {
    const icons: { [key: string]: string } = {
      'EN_COURS': 'pending',
      'VALIDE': 'check_circle',
      'CLOTURE': 'archive'
    };
    return icons[statut] || 'flag';
  }

  getStatutColor(statut: string): string {
    const colors: { [key: string]: string } = {
      'EN_COURS': '#ff9800',
      'VALIDE': '#4caf50',
      'CLOTURE': '#9e9e9e'
    };
    return colors[statut] || '#666';
  }

  getStatutClass(statut: string): string {
    const classes: { [key: string]: string } = {
      'EN_COURS': 'statut-en-cours',
      'VALIDE': 'statut-valide',
      'CLOTURE': 'statut-cloture'
    };
    return classes[statut] || 'statut-default';
  }

  getChipColor(statut: string | null | undefined): 'primary' | 'warn' | 'accent' {
    if (!statut) return 'accent';
    
    switch (statut.toLowerCase()) {
      case 'validée':
      case 'termine':
      case 'valide':
        return 'primary';
      case 'refusée':
      case 'bloque':
        return 'warn';
      case 'en_cours':
      case 'en_attente':
      default:
        return 'accent';
    }
  }

}
