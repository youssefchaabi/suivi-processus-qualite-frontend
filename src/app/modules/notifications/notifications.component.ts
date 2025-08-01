import { Component, OnInit } from '@angular/core';
import { AlertService, Alert } from '../../services/alert.service';

@Component({
  selector: 'app-notifications',
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.scss']
})
export class NotificationsComponent implements OnInit {
  alerts: Alert[] = [];
  loading = false;

  constructor(private alertService: AlertService) { }

  ngOnInit() {
    this.loadAlerts();
  }

  loadAlerts() {
    this.loading = true;
    this.alertService.getAlerts().subscribe({
      next: (alerts) => {
        this.alerts = alerts;
        this.loading = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des alertes:', error);
        this.loading = false;
      }
    });
  }

  markAsRead(alert: Alert) {
    if (!alert.isRead) {
      this.alertService.markAsRead(alert.id).subscribe({
        next: () => {
          alert.isRead = true;
        },
        error: (error) => {
          console.error('Erreur lors du marquage comme lu:', error);
        }
      });
    }
  }

  getAlertIcon(type: string): string {
    switch (type) {
      case 'CRITIQUE':
        return 'error';
      case 'URGENT':
        return 'warning';
      case 'INFO':
        return 'info';
      default:
        return 'notifications';
    }
  }

  getAlertColor(type: string): string {
    switch (type) {
      case 'CRITIQUE':
        return '#f44336';
      case 'URGENT':
        return '#ff9800';
      case 'INFO':
        return '#2196f3';
      default:
        return '#757575';
    }
  }

  getUnreadCount(): number {
    return this.alerts.filter(alert => !alert.isRead).length;
  }

  // Méthodes pour le template
  getCriticalAlertsCount(): number {
    return this.alerts.filter(a => a.type === 'CRITIQUE').length;
  }

  getUrgentAlertsCount(): number {
    return this.alerts.filter(a => a.type === 'URGENT').length;
  }

  getInfoAlertsCount(): number {
    return this.alerts.filter(a => a.type === 'INFO').length;
  }

  getUnreadAlertsCount(): number {
    return this.alerts.filter(a => !a.isRead).length;
  }
} 