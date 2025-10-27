import { Component, OnInit, AfterViewInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatDialog } from '@angular/material/dialog';
import { Utilisateur, UtilisateurService } from 'src/app/services/utilisateur.service';
import { Router } from '@angular/router';
import { SuccessSnackbarComponent } from 'src/app/shared/success-snackbar/success-snackbar.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from 'src/app/services/authentification.service';
import { UtilisateurModalComponent } from '../../components/utilisateur-modal/utilisateur-modal.component';
import { trigger, state, style, transition, animate, query, stagger } from '@angular/animations';

@Component({
  selector: 'app-liste',
  templateUrl: './liste.component.html',
  styleUrls: ['./liste.component.scss'],
  animations: [
    trigger('cardAnimation', [
      transition(':enter', [
        style({ opacity: 0, transform: 'scale(0.8) translateY(20px)' }),
        animate('300ms ease-out', style({ opacity: 1, transform: 'scale(1) translateY(0)' }))
      ]),
      transition(':leave', [
        animate('200ms ease-in', style({ opacity: 0, transform: 'scale(0.8) translateY(-20px)' }))
      ])
    ]),
    trigger('staggerAnimation', [
      transition('* => *', [
        query(':enter', [
          style({ opacity: 0, transform: 'translateY(20px)' }),
          stagger(100, [
            animate('300ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
          ])
        ], { optional: true })
      ])
    ])
  ]
})
export class ListeComponent implements OnInit, AfterViewInit {
  dataSource = new MatTableDataSource<Utilisateur>();
  displayedColumns = ['nom', 'email', 'role', 'actions'];

  loading: boolean = false;
  errorMessage: string = '';
  utilisateurs: Utilisateur[] = [];
  utilisateursFiltres: Utilisateur[] = [];

  // Propriétés pour la recherche et le filtrage
  recherche: string = '';
  filtreRole: string = '';
  rolesDisponibles = ['ADMIN', 'CHEF_PROJET', 'PILOTE_QUALITE'];
  affichageCartes: boolean = true; // Par défaut, affichage en cartes

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(private utilisateurService: UtilisateurService,
    private router: Router,
    private snackBar: MatSnackBar,
    public authService: AuthService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.chargerUtilisateurs();
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  chargerUtilisateurs(): void {
    this.loading = true;
    this.utilisateurService.getUtilisateurs().subscribe({
      next: (data: Utilisateur[]) => {
        console.log('Utilisateurs chargés:', data.length, 'éléments');
        this.utilisateurs = data;
        this.utilisateursFiltres = [...data];
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
        this.appliquerFiltres();
      },
      error: (err) => {
        console.error('Erreur chargement utilisateurs:', err);
        this.errorMessage = "Erreur de chargement.";
        this.loading = false;
      }
    });
  }

  // Méthode pour appliquer les filtres
  appliquerFiltres(): void {
    let resultats = [...this.utilisateurs];

    // Filtre par recherche textuelle
    if (this.recherche.trim()) {
      const rechercheLower = this.recherche.toLowerCase();
      resultats = resultats.filter(user => 
        user.nom.toLowerCase().includes(rechercheLower) ||
        user.email.toLowerCase().includes(rechercheLower) ||
        user.role.toLowerCase().includes(rechercheLower)
      );
    }

    // Filtre par rôle
    if (this.filtreRole) {
      resultats = resultats.filter(user => user.role === this.filtreRole);
    }

    this.utilisateursFiltres = resultats;
    this.dataSource.data = resultats;
    
    // Reconnecter le paginator après filtrage
    setTimeout(() => {
      if (this.paginator) {
        this.dataSource.paginator = this.paginator;
        this.paginator.firstPage();
      }
    });
  }

  // Méthode pour effacer tous les filtres
  effacerFiltres(): void {
    this.recherche = '';
    this.filtreRole = '';
    this.appliquerFiltres();
  }

  // Méthode pour basculer entre l'affichage en cartes et en tableau
  basculerAffichage(): void {
    this.affichageCartes = !this.affichageCartes;
    
    // Si on passe au tableau, reconnecter le paginator
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

  // Méthode pour obtenir l'icône du rôle
  getRoleIcon(role: string): string {
    switch (role) {
      case 'ADMIN': return 'security';
      case 'CHEF_PROJET': return 'engineering';
      case 'PILOTE_QUALITE': return 'insights';
      default: return 'person';
    }
  }

  // Méthode pour obtenir la classe CSS du rôle
  getRoleClass(role: string): string {
    switch (role) {
      case 'ADMIN': return 'role-admin';
      case 'CHEF_PROJET': return 'role-chef';
      case 'PILOTE_QUALITE': return 'role-pilote';
      default: return 'role-default';
    }
  }

  // Méthode pour obtenir le nombre d'utilisateurs filtrés
  getNombreUtilisateursFiltres(): number {
    return this.utilisateursFiltres.length;
  }

  // Méthode pour obtenir le nombre total d'utilisateurs par rôle
  getNombreUtilisateursParRole(role: string): number {
    return this.utilisateurs.filter(user => user.role === role).length;
  }

  // Méthode pour obtenir le pourcentage d'utilisateurs par rôle
  getPourcentageUtilisateursParRole(role: string): number {
    if (this.utilisateurs.length === 0) return 0;
    return Math.round((this.getNombreUtilisateursParRole(role) / this.utilisateurs.length) * 100);
  }

  supprimerUtilisateur(id: string) {
    if (confirm("Supprimer cet utilisateur ?")) {
      this.utilisateurService.supprimerUtilisateur(id).subscribe(() => {
        // Supprimer de la liste sans recharger
        this.utilisateurs = this.utilisateurs.filter(u => u.id !== id);
        this.appliquerFiltres();
        this.snackBar.open('Utilisateur supprimé avec succès ✅', 'Fermer', {
          duration: 2000,
          panelClass: ['success-snackbar']
        });
      });
    }
  }

  modifierUtilisateur(id: string): void {
    const utilisateur = this.utilisateurs.find(u => u.id === id);
    if (!utilisateur) return;

    const dialogRef = this.dialog.open(UtilisateurModalComponent, {
      width: '700px',
      maxWidth: '95vw',
      data: { utilisateur },
      disableClose: false,
      autoFocus: true,
      panelClass: 'utilisateur-modal-container'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // Mettre à jour seulement l'utilisateur modifié
        const index = this.utilisateurs.findIndex(u => u.id === result.id);
        if (index !== -1) {
          this.utilisateurs[index] = result;
          this.appliquerFiltres();
          this.snackBar.open('Utilisateur modifié avec succès ✅', 'Fermer', { 
            duration: 2000, 
            panelClass: ['success-snackbar'] 
          });
        }
      }
    });
  }

  creerUtilisateur(): void {
    const dialogRef = this.dialog.open(UtilisateurModalComponent, {
      width: '700px',
      maxWidth: '95vw',
      data: {},
      disableClose: false,
      autoFocus: true,
      panelClass: 'utilisateur-modal-container'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // Ajouter le nouvel utilisateur à la liste
        this.utilisateurs.push(result);
        this.appliquerFiltres();
        this.snackBar.open('Utilisateur créé avec succès ✅', 'Fermer', { 
          duration: 2000, 
          panelClass: ['success-snackbar'] 
        });
      }
    });
  }
}
