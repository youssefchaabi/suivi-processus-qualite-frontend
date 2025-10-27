// duplicate component removed; using ListeComponent below

import { Component, OnInit, AfterViewInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatDialog } from '@angular/material/dialog';
import { Nomenclature, NomenclatureService } from 'src/app/services/nomenclature.service';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from 'src/app/services/authentification.service';
import { ConfirmDialogComponent } from 'src/app/shared/confirm-dialog/confirm-dialog.component';
import { NomenclatureModalComponent } from '../../components/nomenclature-modal/nomenclature-modal.component';

@Component({
  selector: 'app-liste',
  templateUrl: './liste.component.html',
  styleUrls: ['./liste.component.scss']
})
export class ListeComponent implements OnInit, AfterViewInit {
  dataSource = new MatTableDataSource<Nomenclature>();
  displayedColumns = ['type', 'actif', 'actions'];
  filtreType: string = '';
  filtreActif: string = '';
  recherche: string = '';
  loading: boolean = false;
  errorMessage: string = '';

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private nomenclatureService: NomenclatureService,
    private router: Router,
    private snackBar: MatSnackBar,
    public authService: AuthService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.chargerNomenclatures();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  chargerNomenclatures(): void {
    this.loading = true;
    this.nomenclatureService.getNomenclatures().subscribe({
      next: (data: Nomenclature[]) => {
        console.log('Nomenclatures chargées:', data.length, 'éléments');
        this.dataSource.data = data;
        
        // Reconnecter le paginator et sort après chargement des données
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
      error: (err) => {
        console.error('Erreur chargement nomenclatures:', err);
        this.errorMessage = "Erreur de chargement.";
        this.loading = false;
      }
    });
  }

  supprimerNomenclature(id: string): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Confirmer la suppression',
        message: 'Êtes-vous sûr de vouloir supprimer cette nomenclature ? Cette action est irréversible.',
        confirmText: 'Supprimer',
        cancelText: 'Annuler'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.nomenclatureService.deleteNomenclature(id).subscribe({
          next: () => {
            this.dataSource.data = this.dataSource.data.filter(n => n.id !== id);
            this.snackBar.open('Nomenclature supprimée avec succès ✅', 'Fermer', {
              duration: 3000,
              panelClass: ['success-snackbar']
            });
          },
          error: (err) => {
            console.error('Erreur suppression:', err);
            this.snackBar.open('Erreur lors de la suppression', 'Fermer', {
              duration: 3000
            });
          }
        });
      }
    });
  }

  modifierNomenclature(id: string): void {
    console.log('=== MODIFICATION NOMENCLATURE ===');
    console.log('ID reçu:', id);
    console.log('Données actuelles:', this.dataSource.data);
    
    const nomenclature = this.dataSource.data.find(n => n.id === id);
    console.log('Nomenclature trouvée:', nomenclature);
    
    if (!nomenclature) {
      console.error('ERREUR: Nomenclature non trouvée avec ID:', id);
      this.snackBar.open('Erreur: Nomenclature non trouvée', 'Fermer', { duration: 3000 });
      return;
    }

    console.log('Ouverture modal avec:', nomenclature);

    const dialogRef = this.dialog.open(NomenclatureModalComponent, {
      width: '700px',
      maxWidth: '95vw',
      data: { nomenclature: { ...nomenclature } }, // Clone pour éviter mutation
      disableClose: false,
      autoFocus: true,
      panelClass: 'nomenclature-modal-container'
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('Modal fermé, résultat:', result);
      if (result) {
        // Mettre à jour seulement la nomenclature modifiée
        const currentData = this.dataSource.data;
        const index = currentData.findIndex(n => n.id === result.id);
        console.log('Index trouvé:', index);
        if (index !== -1) {
          currentData[index] = result;
          this.dataSource.data = [...currentData];
          this.appliquerFiltres();
          this.snackBar.open('Nomenclature modifiée avec succès ✅', 'Fermer', { duration: 2000 });
        }
      }
    });
  }

  getTypeIcon(type: string): string {
    switch (type) {
      case 'STATUT': return 'flag';
      case 'TYPE_FICHE': return 'description';
      case 'CATEGORIE_PROJET': return 'category';
      case 'PRIORITE': return 'priority_high';
      case 'KPI': return 'analytics';
      default: return 'label';
    }
  }

  getTypeColor(type: string): string {
    switch (type) {
      case 'STATUT': return '#1976d2';
      case 'TYPE_FICHE': return '#388e3c';
      case 'CATEGORIE_PROJET': return '#f57c00';
      case 'PRIORITE': return '#d32f2f';
      case 'KPI': return '#9c27b0';
      default: return '#757575';
    }
  }

  appliquerFiltres(): void {
    let data = this.dataSource.data;
    
    if (this.filtreType) {
      data = data.filter(n => n.type === this.filtreType);
    }
    
    if (this.filtreActif) {
      const actif = this.filtreActif === 'true';
      data = data.filter(n => n.actif === actif);
    }
    
    if (this.recherche) {
      const search = this.recherche.toLowerCase();
      data = data.filter(n => 
        n.type?.toLowerCase().includes(search)
      );
    }
    
    this.dataSource.data = data;
  }

  resetFiltres(): void {
    this.filtreType = '';
    this.filtreActif = '';
    this.recherche = '';
    this.chargerNomenclatures();
  }

  creerNomenclature(): void {
    const dialogRef = this.dialog.open(NomenclatureModalComponent, {
      width: '700px',
      maxWidth: '95vw',
      data: {},
      disableClose: false,
      autoFocus: true,
      panelClass: 'nomenclature-modal-container'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // Ajouter la nouvelle nomenclature à la liste
        const currentData = this.dataSource.data;
        currentData.push(result);
        this.dataSource.data = [...currentData];
        this.appliquerFiltres();
      }
    });
  }
} 