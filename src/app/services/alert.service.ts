import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

export interface Alert {
  id: string;
  type: 'CRITIQUE' | 'URGENT' | 'INFO';
  message: string;
  date: Date;
  isRead: boolean;
  actionRequired: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class AlertService {
  private apiUrl = 'http://localhost:8080/api';

  constructor(private http: HttpClient) { }

  // Récupérer toutes les alertes
  getAlerts(): Observable<Alert[]> {
    return this.http.get<Alert[]>(`${this.apiUrl}/alerts`).pipe(
      // Fallback vers des données mock
      catchError(() => of(this.getMockAlerts()))
    );
  }

  // Marquer une alerte comme lue
  markAsRead(alertId: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/alerts/${alertId}/read`, {});
  }

  // Envoyer une alerte email
  sendEmailAlert(alert: Alert): Observable<any> {
    return this.http.post(`${this.apiUrl}/alerts/email`, alert);
  }

  // Créer une nouvelle alerte
  createAlert(alert: Omit<Alert, 'id' | 'date'>): Observable<Alert> {
    return this.http.post<Alert>(`${this.apiUrl}/alerts`, alert);
  }

  // Données mock pour les tests
  private getMockAlerts(): Alert[] {
    return [
      {
        id: '1',
        type: 'CRITIQUE',
        message: 'Taux de conformité très faible détecté (65%)',
        date: new Date(),
        isRead: false,
        actionRequired: true
      },
      {
        id: '2',
        type: 'URGENT',
        message: 'Fiche de suivi en retard depuis 3 jours',
        date: new Date(Date.now() - 86400000),
        isRead: false,
        actionRequired: true
      },
      {
        id: '3',
        type: 'INFO',
        message: 'Nouvelle recommandation IA disponible',
        date: new Date(Date.now() - 172800000),
        isRead: true,
        actionRequired: false
      }
    ];
  }

  // Vérifier les alertes critiques
  checkCriticalAlerts(): Observable<Alert[]> {
    return this.getAlerts().pipe(
      map(alerts => alerts.filter(alert => 
        alert.type === 'CRITIQUE' && !alert.isRead
      ))
    );
  }
} 