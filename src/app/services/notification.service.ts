import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

export interface NotificationItem {
  id?: string;
  message: string;
  type?: string;
  objetId?: string;
  utilisateurId: string;
  lu: boolean;
  dateCreation?: string;
}

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private apiUrl = `${environment.apiUrl}/notifications`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<NotificationItem[]> {
    return this.http.get<NotificationItem[]>(this.apiUrl);
  }

  getByUtilisateur(utilisateurId: string): Observable<NotificationItem[]> {
    return this.http.get<NotificationItem[]>(`${this.apiUrl}/utilisateur/${utilisateurId}`);
  }

  getNonLues(utilisateurId: string): Observable<NotificationItem[]> {
    return this.http.get<NotificationItem[]>(`${this.apiUrl}/utilisateur/${utilisateurId}/non-lues`);
  }

  markAsRead(id: string): Observable<NotificationItem> {
    return this.http.put<NotificationItem>(`${this.apiUrl}/${id}/lire`, {});
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  relancerEmail(utilisateurId: string, item: NotificationItem): Observable<string> {
    return this.http.post<string>(`${this.apiUrl}/relancer`, {
      utilisateurId,
      notificationId: item.id,
      type: item.type,
      message: item.message
    }, { responseType: 'text' as 'json' });
  }
}


