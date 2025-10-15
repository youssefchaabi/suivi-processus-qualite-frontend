// duplicate component removed; using ListeComponent below

import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { Nomenclature, NomenclatureService } from 'src/app/services/nomenclature.service';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from 'src/app/services/authentification.service';

@Component({
  selector: 'app-liste',
  templateUrl: './liste.component.html',
  styleUrls: ['./liste.component.scss']
})
export class ListeComponent implements OnInit {
  dataSource = new MatTableDataSource<Nomenclature>();
  displayedColumns = ['type', 'valeur', 'actions'];
  loading: boolean = false;
  errorMessage: string = '';

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private nomenclatureService: NomenclatureService,
    private router: Router,
    private snackBar: MatSnackBar,
    public authService: AuthService // injection pour le template
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
    if (confirm("Supprimer cette nomenclature ?")) {
      this.nomenclatureService.deleteNomenclature(id).subscribe(() => {
        this.chargerNomenclatures();
        this.snackBar.open('Nomenclature supprimée avec succès ✅', 'Fermer', {
          duration: 3000,
          panelClass: ['success-snackbar']
        });
      });
    }
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
} 