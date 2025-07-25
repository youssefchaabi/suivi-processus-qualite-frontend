import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { Router } from '@angular/router';
import { FicheQualite } from 'src/app/models/fiche-qualite';
import { FicheQualiteService } from 'src/app/services/fiche-qualite.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from 'src/app/services/authentification.service';

@Component({
  selector: 'app-fiche-qualite-list',
  templateUrl: './liste.component.html',
  styleUrls: ['./liste.component.scss']
})
export class ListeComponent implements OnInit {
  colonnes: string[] = ['titre', 'typeFiche', 'statut', 'actions'];
  dataSource = new MatTableDataSource<FicheQualite>();
  fiches: FicheQualite[] = [];
  loading = true;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private ficheService: FicheQualiteService,
    private router: Router,
    private snackBar: MatSnackBar,
    public authService: AuthService // injection pour le template
  ) {}

  ngOnInit(): void {
    this.chargerFiches();
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  chargerFiches(): void {
    this.loading = true;
    this.ficheService.getAll().subscribe({
      next: (data) => {
        this.fiches = data;
      this.dataSource.data = data;
        this.loading = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des fiches:', error);
        this.snackBar.open('Erreur lors du chargement des fiches', 'Fermer', { duration: 3000 });
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
    if (confirm(`Êtes-vous sûr de vouloir supprimer la fiche "${fiche.titre}" ?`)) {
      this.ficheService.delete(fiche.id!).subscribe({
        next: () => {
          this.snackBar.open('Fiche supprimée avec succès', 'Fermer', { duration: 3000 });
          this.chargerFiches();
        },
        error: (error) => {
          console.error('Erreur lors de la suppression:', error);
          this.snackBar.open('Erreur lors de la suppression', 'Fermer', { duration: 3000 });
        }
      });
    }
  }

  getChipColor(statut: string): 'primary' | 'warn' | 'accent' {
  switch (statut.toLowerCase()) {
    case 'validée':
      return 'primary';
    case 'refusée':
      return 'warn';
    case 'en_cours':
      case 'en_attente':
    default:
      return 'accent';
  }
}
}
