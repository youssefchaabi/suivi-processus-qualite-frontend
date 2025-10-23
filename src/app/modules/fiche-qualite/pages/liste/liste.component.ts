import { Component, OnInit, ViewChild } from '@angular/core';
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

@Component({
  selector: 'app-fiche-qualite-list',
  templateUrl: './liste.component.html',
  styleUrls: ['./liste.component.scss']
})
export class ListeComponent implements OnInit {
  colonnes: string[] = ['titre', 'typeFiche', 'statut', 'responsable', 'actions'];
  dataSource = new MatTableDataSource<FicheQualite>();
  fiches: FicheQualite[] = [];
  loading = true;

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
        this.dataSource.data = this.fiches;
        this.loading = false;
      },
      error: (error) => {
        console.error('❌ Erreur chargement fiches:', error);
        console.error('Status:', error.status);
        console.error('Message:', error.message);
        
        // Afficher un message d'erreur approprié
        if (error.status === 401) {
          this.snackBar.open('⚠️ Session expirée. Veuillez vous reconnecter.', 'Fermer', { duration: 5000 });
        } else {
          this.snackBar.open('Erreur lors du chargement des fiches', 'Fermer', { duration: 3000 });
        }
        
        this.fiches = [];
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
    this.router.navigate(['/fiche-qualite/nouveau']);
  }

  editFiche(fiche: FicheQualite): void {
    this.router.navigate(['/fiche-qualite', fiche.id]);
  }

  deleteFiche(fiche: FicheQualite): void {
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
            // Mise à jour locale sans rechargement
            this.dataSource.data = this.dataSource.data.filter(f => f.id !== fiche.id);
            this.fiches = this.fiches.filter(f => f.id !== fiche.id);
            this.snackBar.open('Fiche supprimée avec succès ✅', 'Fermer', {
              duration: 3000,
              panelClass: ['success-snackbar']
            });
          },
          error: (error) => {
            console.error('❌ Erreur suppression:', error);
            this.snackBar.open('Erreur lors de la suppression', 'Fermer', { duration: 3000 });
          }
        });
      }
    });
  }

  getChipColor(statut: string | null | undefined): 'primary' | 'warn' | 'accent' {
    if (!statut) return 'accent';
    
    switch (statut.toLowerCase()) {
      case 'validée':
      case 'termine':
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

  getStatutClass(statut: string | null | undefined): string {
    if (!statut) return 'statut-default';
    
    switch (statut.toLowerCase()) {
      case 'validée':
      case 'termine':
        return 'statut-success';
      case 'refusée':
      case 'bloque':
        return 'statut-danger';
      case 'en_cours':
        return 'statut-warning';
      case 'en_attente':
        return 'statut-info';
      default:
        return 'statut-default';
    }
  }

  getStatutIcon(statut: string | null | undefined): string {
    if (!statut) return 'help_outline';
    
    switch (statut.toLowerCase()) {
      case 'validée':
      case 'termine':
        return 'check_circle';
      case 'refusée':
      case 'bloque':
        return 'cancel';
      case 'en_cours':
        return 'pending';
      case 'en_attente':
        return 'schedule';
      default:
        return 'flag';
    }
  }
}
