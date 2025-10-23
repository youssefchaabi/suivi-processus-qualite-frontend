import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { MatSnackBar } from '@angular/material/snack-bar';
import { User, UserStats } from '../../../../models/user.model';
import { UserService } from '../../../../services/user.service';
import { UserDialogComponent } from './user-dialog/user-dialog.component';

@Component({
  selector: 'app-utilisateurs',
  templateUrl: './utilisateurs.component.html',
  styleUrls: ['./utilisateurs.component.scss']
})
export class UtilisateursComponent implements OnInit {
  displayedColumns: string[] = ['nom', 'email', 'role', 'actif', 'telephone', 'dateCreation', 'actions'];
  dataSource: MatTableDataSource<User>;
  stats: UserStats | null = null;
  isLoading = true;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private userService: UserService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {
    this.dataSource = new MatTableDataSource<User>([]);
  }

  ngOnInit(): void {
    this.loadUsers();
    this.loadStats();
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  /**
   * Charger tous les utilisateurs
   */
  loadUsers(): void {
    this.isLoading = true;
    this.userService.getAllUsers().subscribe({
      next: (users) => {
        this.dataSource.data = users;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Erreur chargement utilisateurs:', error);
        this.showSnackBar('Erreur lors du chargement des utilisateurs', 'error');
        this.isLoading = false;
      }
    });
  }

  /**
   * Charger les statistiques
   */
  loadStats(): void {
    this.userService.getUserStats().subscribe({
      next: (stats) => {
        this.stats = stats;
      },
      error: (error) => {
        console.error('Erreur chargement stats:', error);
      }
    });
  }

  /**
   * Filtrer les utilisateurs
   */
  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  /**
   * Ouvrir dialog création utilisateur
   */
  openCreateDialog(): void {
    const dialogRef = this.dialog.open(UserDialogComponent, {
      width: '600px',
      data: { mode: 'create' }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.createUser(result);
      }
    });
  }

  /**
   * Ouvrir dialog édition utilisateur
   */
  openEditDialog(user: User): void {
    const dialogRef = this.dialog.open(UserDialogComponent, {
      width: '600px',
      data: { mode: 'edit', user: { ...user } }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result && user.id) {
        this.updateUser(user.id, result);
      }
    });
  }

  /**
   * Créer un utilisateur
   */
  createUser(userData: any): void {
    this.userService.createUser(userData).subscribe({
      next: (user) => {
        this.showSnackBar(`Utilisateur ${user.nom} créé avec succès`, 'success');
        this.loadUsers();
        this.loadStats();
      },
      error: (error) => {
        console.error('Erreur création utilisateur:', error);
        this.showSnackBar('Erreur lors de la création de l\'utilisateur', 'error');
      }
    });
  }

  /**
   * Mettre à jour un utilisateur
   */
  updateUser(id: string, userData: any): void {
    this.userService.updateUser(id, userData).subscribe({
      next: (user) => {
        this.showSnackBar(`Utilisateur ${user.nom} modifié avec succès`, 'success');
        this.loadUsers();
      },
      error: (error) => {
        console.error('Erreur modification utilisateur:', error);
        this.showSnackBar('Erreur lors de la modification de l\'utilisateur', 'error');
      }
    });
  }

  /**
   * Toggle actif/inactif
   */
  toggleUserStatus(user: User): void {
    if (!user.id) return;

    const action = user.actif ? 'désactiver' : 'activer';
    if (!confirm(`Voulez-vous vraiment ${action} l'utilisateur ${user.nom} ?`)) {
      return;
    }

    this.userService.toggleUserStatus(user.id).subscribe({
      next: (updatedUser) => {
        const status = updatedUser.actif ? 'activé' : 'désactivé';
        this.showSnackBar(`Utilisateur ${status} avec succès`, 'success');
        this.loadUsers();
        this.loadStats();
      },
      error: (error) => {
        console.error('Erreur toggle status:', error);
        this.showSnackBar('Erreur lors du changement de statut', 'error');
      }
    });
  }

  /**
   * Réinitialiser le mot de passe
   */
  resetPassword(user: User): void {
    if (!user.id) return;

    if (!confirm(`Voulez-vous vraiment réinitialiser le mot de passe de ${user.nom} ?`)) {
      return;
    }

    this.userService.resetPassword(user.id).subscribe({
      next: (response) => {
        this.showSnackBar(
          `Mot de passe réinitialisé. Nouveau mot de passe: ${response.nouveauMotDePasse}`,
          'success',
          10000
        );
      },
      error: (error) => {
        console.error('Erreur reset password:', error);
        this.showSnackBar('Erreur lors de la réinitialisation du mot de passe', 'error');
      }
    });
  }

  /**
   * Supprimer un utilisateur
   */
  deleteUser(user: User): void {
    if (!user.id) return;

    if (!confirm(`Voulez-vous vraiment supprimer l'utilisateur ${user.nom} ? Cette action est irréversible.`)) {
      return;
    }

    this.userService.deleteUser(user.id).subscribe({
      next: () => {
        this.showSnackBar(`Utilisateur ${user.nom} supprimé avec succès`, 'success');
        this.loadUsers();
        this.loadStats();
      },
      error: (error) => {
        console.error('Erreur suppression utilisateur:', error);
        this.showSnackBar('Erreur lors de la suppression de l\'utilisateur', 'error');
      }
    });
  }

  /**
   * Obtenir le libellé du rôle
   */
  getRoleLabel(role: string): string {
    return this.userService.getRoleLabel(role);
  }

  /**
   * Obtenir la couleur du rôle
   */
  getRoleColor(role: string): string {
    return this.userService.getRoleColor(role);
  }

  /**
   * Afficher un snackbar
   */
  private showSnackBar(message: string, type: 'success' | 'error', duration: number = 3000): void {
    this.snackBar.open(message, 'Fermer', {
      duration,
      horizontalPosition: 'end',
      verticalPosition: 'top',
      panelClass: type === 'success' ? 'snackbar-success' : 'snackbar-error'
    });
  }
}
