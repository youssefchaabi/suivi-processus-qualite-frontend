import { Component, OnInit } from '@angular/core';
import { NotificationItem, NotificationService } from 'src/app/services/notification.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from 'src/app/services/authentification.service';

@Component({
  selector: 'app-notifications-list',
  templateUrl: './notifications-list.component.html',
  styleUrls: ['./notifications-list.component.scss']
})
export class NotificationsListComponent implements OnInit {
  displayedColumns = ['message', 'type', 'dateCreation', 'etat', 'actions'];
  data: NotificationItem[] = [];
  filterType: string = '';
  filterEtat: string = '';
  showAll: boolean = false; // Admin/Pilote peuvent voir toutes les notifications

  getTypeLabel(t?: string): string {
    switch (t) {
      case 'FICHE_SUIVI': return 'Fiche Suivi';
      case 'FICHE_QUALITE': return 'Fiche Qualité';
      case 'RETARD': return 'Retard';
      case 'ALERTE': return 'Alerte';
      default: return 'Autre';
    }
  }

  constructor(private notifService: NotificationService, public auth: AuthService, private snackBar: MatSnackBar) {}

  ngOnInit(): void {
    this.reload();
    // auto-refresh list every 5s for near real-time updates
    setInterval(() => this.reload(), 5000);
  }

  reload(): void {
    const role = this.auth.getRole();
    const userId = this.auth.getUserId();

    const source$ = (role === 'ADMIN' || role === 'PILOTE_QUALITE') && this.showAll
      ? this.notifService.getAll()
      : (userId ? this.notifService.getByUtilisateur(userId) : undefined);

    if (!source$) {
      this.data = [];
      return;
    }

    source$.subscribe(items => {
      let res = items;
      if (this.filterType) res = res.filter(n => n.type === this.filterType);
      if (this.filterEtat) res = res.filter(n => this.filterEtat === 'LU' ? n.lu : !n.lu);
      this.data = res;
    });
  }

  markAsRead(item: NotificationItem): void {
    if (!item.id || item.lu) return;
    // optimistic UI
    const previous = item.lu;
    item.lu = true;
    this.notifService.markAsRead(item.id).subscribe({
      next: () => {
        this.snackBar.open('Notification marquée comme lue.', 'Fermer', { duration: 2000, panelClass: ['mat-snack-bar-success'] });
        this.reload();
      },
      error: () => {
        item.lu = previous;
        this.snackBar.open('Échec du marquage comme lue.', 'Fermer', { duration: 2500, panelClass: ['mat-snack-bar-error'] });
      }
    });
  }

  delete(item: NotificationItem): void {
    if (!item.id) return;
    // optimistic UI
    const idx = this.data.indexOf(item);
    if (idx >= 0) this.data.splice(idx, 1);
    this.notifService.delete(item.id).subscribe({
      next: () => {
        this.snackBar.open('Notification supprimée.', 'Fermer', { duration: 2000, panelClass: ['mat-snack-bar-success'] });
        this.reload();
      },
      error: () => {
        if (idx >= 0) this.data.splice(idx, 0, item);
        this.snackBar.open('Échec de la suppression.', 'Fermer', { duration: 2500, panelClass: ['mat-snack-bar-error'] });
      }
    });
  }

  relancer(item: NotificationItem): void {
    if (!item.utilisateurId) return;
    this.notifService.relancerEmail(item.utilisateurId, item).subscribe({
      next: () => this.snackBar.open('Relance envoyée par e-mail.', 'Fermer', { duration: 2000, panelClass: ['mat-snack-bar-success'] }),
      error: () => this.snackBar.open("Échec de l'envoi de la relance.", 'Fermer', { duration: 2500, panelClass: ['mat-snack-bar-error'] })
    });
  }
}


