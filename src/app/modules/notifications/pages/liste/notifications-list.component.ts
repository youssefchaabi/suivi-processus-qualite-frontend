import { Component, OnInit } from '@angular/core';
import { NotificationItem, NotificationService } from 'src/app/services/notification.service';
import { AuthService } from 'src/app/services/authentification.service';

@Component({
  selector: 'app-notifications-list',
  templateUrl: './notifications-list.component.html',
  styleUrls: ['./notifications-list.component.scss']
})
export class NotificationsListComponent implements OnInit {
  displayedColumns = ['message', 'type', 'dateCreation', 'etat', 'actions'];
  data: NotificationItem[] = [];

  constructor(private notifService: NotificationService, private auth: AuthService) {}

  ngOnInit(): void {
    this.reload();
  }

  reload(): void {
    const userId = this.auth.getUserId();
    if (!userId) {
      this.data = [];
      return;
    }
    this.notifService.getByUtilisateur(userId).subscribe(items => this.data = items);
  }

  markAsRead(item: NotificationItem): void {
    if (!item.id || item.lu) return;
    this.notifService.markAsRead(item.id).subscribe(() => this.reload());
  }

  delete(item: NotificationItem): void {
    if (!item.id) return;
    this.notifService.delete(item.id).subscribe(() => this.reload());
  }
}


