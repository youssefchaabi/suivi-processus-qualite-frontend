import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { FicheProjet } from 'src/app/models/fiche-projet';
import { FicheProjetService } from 'src/app/services/fiche-projet.service';
import { AuthService } from 'src/app/services/authentification.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';

@Component({
  selector: 'app-liste-projet',
  templateUrl: './liste-projet.component.html',
  styleUrls: ['./liste-projet.component.scss']
})
export class ListeProjetComponent implements OnInit {
  dataSource = new MatTableDataSource<FicheProjet>([]);
  displayedColumns: string[] = ['nom', 'description', 'objectifs', 'responsable', 'echeance', 'statut', 'actions'];
  loading = false;
  errorMessage = '';

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private ficheProjetService: FicheProjetService,
    public authService: AuthService,
    private snackBar: MatSnackBar,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.getProjets();
  }

  getProjets(): void {
    this.loading = true;
    this.ficheProjetService.getAll().subscribe({
      next: projets => {
        this.dataSource.data = projets;
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
        this.loading = false;
      },
      error: () => {
        this.errorMessage = 'Erreur lors du chargement des projets.';
        this.loading = false;
      }
    });
  }

  ajouterProjet(): void {
    this.router.navigate(['fiche-projet/nouveau']);
  }

  modifierProjet(id: string): void {
    this.router.navigate([`fiche-projet/modifier/${id}`]);
  }

  supprimerProjet(id: string): void {
    if (confirm('Voulez-vous vraiment supprimer ce projet ?')) {
      this.ficheProjetService.deleteProjet(id).subscribe({
        next: () => {
          this.snackBar.open('Projet supprimé avec succès.', 'Fermer', { duration: 2000 });
          this.getProjets();
        },
        error: () => {
          this.snackBar.open('Erreur lors de la suppression.', 'Fermer', { duration: 2000 });
        }
      });
    }
  }
} 