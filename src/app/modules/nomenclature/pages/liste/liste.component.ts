// duplicate component removed; using ListeComponent below

import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatDialog } from '@angular/material/dialog';
import { Nomenclature, NomenclatureService } from 'src/app/services/nomenclature.service';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from 'src/app/services/authentification.service';
import { ConfirmDialogComponent } from 'src/app/shared/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-liste',
  templateUrl: './liste.component.html',
  styleUrls: ['./liste.component.scss']
})
export class ListeComponent implements OnInit {
  dataSource = new MatTableDataSource<Nomenclature>();
  displayedColumns = ['type', 'code', 'libelle', 'actif', 'actions'];
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

  chargerNomenclatures(): void {
    this.loading = true;
    this.nomenclatureService.getNomenclatures().subscribe({
      next: (data: Nomenclature[]) => {
        this.dataSource.data = data;
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
        this.loading = false;
      },
      error: () => {
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
    this.router.navigate(['/nomenclatures', id]);
  }

  getTypeIcon(type: string): string {
    switch (type) {
      case 'STATUT': return 'flag';
      case 'TYPE_FICHE': return 'description';
      case 'CATEGORIE': return 'category';
      default: return 'label';
    }
  }

  getTypeColor(type: string): string {
    switch (type) {
      case 'STATUT': return '#1976d2';
      case 'TYPE_FICHE': return '#388e3c';
      case 'CATEGORIE': return '#f57c00';
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
        n.code?.toLowerCase().includes(search) ||
        n.libelle?.toLowerCase().includes(search) ||
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
    this.router.navigate(['/nomenclatures/nouveau']);
  }
} 