import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { UtilisateurService, Utilisateur } from '../../services/utilisateur.service';
import { UtilisateurModalComponent } from './components/utilisateur-modal/utilisateur-modal.component';

@Component({
  selector: 'app-utilisateur',
  templateUrl: './utilisateur.component.html',
  styleUrls: ['./utilisateur.component.scss']
})
export class UtilisateurComponent implements OnInit {
  utilisateurs: Utilisateur[] = [];
  loading = false;
  displayedColumns: string[] = ['nom', 'email', 'role', 'actions'];

  roleInfo: any = {
    'ADMIN': { label: 'Administrateur', icon: 'admin_panel_settings', color: '#e74c3c' },
    'CHEF_PROJET': { label: 'Chef de Projet', icon: 'engineering', color: '#3498db' },
    'PILOTE_QUALITE': { label: 'Pilote Qualité', icon: 'science', color: '#2ecc71' }
  };

  constructor(
    private utilisateurService: UtilisateurService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadUtilisateurs();
  }

  loadUtilisateurs(): void {
    this.loading = true;
    this.utilisateurService.getUtilisateurs().subscribe({
      next: (data) => {
        this.utilisateurs = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Erreur lors du chargement des utilisateurs:', err);
        this.loading = false;
        this.snackBar.open('Erreur lors du chargement des utilisateurs', 'Fermer', { duration: 3000 });
      }
    });
  }

  openCreateModal(): void {
    const dialogRef = this.dialog.open(UtilisateurModalComponent, {
      width: '750px',
      maxWidth: '95vw',
      disableClose: false,
      data: {}
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        console.log('✅ Utilisateur créé:', result);
        // Ajouter localement sans recharger
        this.utilisateurs = [...this.utilisateurs, result];
      }
    });
  }

  openEditModal(utilisateur: Utilisateur): void {
    const dialogRef = this.dialog.open(UtilisateurModalComponent, {
      width: '750px',
      maxWidth: '95vw',
      disableClose: false,
      data: { utilisateur }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        console.log('✅ Utilisateur modifié:', result);
        // Mettre à jour localement sans recharger
        const index = this.utilisateurs.findIndex(u => u.id === result.id);
        if (index !== -1) {
          this.utilisateurs = [
            ...this.utilisateurs.slice(0, index),
            result,
            ...this.utilisateurs.slice(index + 1)
          ];
        }
      }
    });
  }

  deleteUtilisateur(utilisateur: Utilisateur): void {
    if (confirm(`Êtes-vous sûr de vouloir supprimer ${utilisateur.nom} ?`)) {
      this.utilisateurService.deleteUtilisateur(utilisateur.id!).subscribe({
        next: () => {
          this.snackBar.open('Utilisateur supprimé avec succès ✅', 'Fermer', { duration: 3000 });
          // Supprimer localement sans recharger
          this.utilisateurs = this.utilisateurs.filter(u => u.id !== utilisateur.id);
        },
        error: (err) => {
          console.error('Erreur lors de la suppression:', err);
          this.snackBar.open('Erreur lors de la suppression', 'Fermer', { duration: 3000 });
        }
      });
    }
  }

  getRoleInfo(role: string) {
    return this.roleInfo[role] || { label: role, icon: 'person', color: '#666' };
  }
}
