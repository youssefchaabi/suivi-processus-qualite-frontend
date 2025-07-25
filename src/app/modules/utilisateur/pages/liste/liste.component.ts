import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { Utilisateur, UtilisateurService } from 'src/app/services/utilisateur.service';
import { Router } from '@angular/router';
import { SuccessSnackbarComponent } from 'src/app/shared/success-snackbar/success-snackbar.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from 'src/app/services/authentification.service';

@Component({
  selector: 'app-liste',
  templateUrl: './liste.component.html',
  styleUrls: ['./liste.component.scss']
})
export class ListeComponent implements OnInit {
  dataSource = new MatTableDataSource<Utilisateur>();
  displayedColumns = ['nom', 'email', 'role', 'actions'];

  loading: boolean = false;
  errorMessage: string = '';

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  utilisateurs: any[] = [];
  


  constructor(private utilisateurService: UtilisateurService,
    private router: Router,
    private snackBar: MatSnackBar,
    public authService: AuthService
  ) {}

  ngOnInit(): void {
    this.chargerUtilisateurs();
  }

  chargerUtilisateurs(): void {
    this.loading = true;
    this.utilisateurService.getUtilisateurs().subscribe({
      next: (data: Utilisateur[]) => {
        this.utilisateurs = data;
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

 supprimerUtilisateur(id: string) {
    if (confirm("Supprimer cet utilisateur ?")) {
      this.utilisateurService.supprimerUtilisateur(id).subscribe(() => {
        this.chargerUtilisateurs();
        this.snackBar.openFromComponent(SuccessSnackbarComponent, {
          data: { message: 'Utilisateur supprimé avec succès ✅' },
          duration: 3000,
          panelClass: ['success-snackbar']
        });
      });
    }
  }

  modifierUtilisateur(id: string): void {
  this.router.navigate(['/utilisateurs', id]); // redirection vers le formulaire
}
}
