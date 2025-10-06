import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { AuthService } from './authentification.service';
import { environment } from '../../environments/environment';

export interface ActionHistorique {
  id?: string;
  typeAction: 'CREATION' | 'MODIFICATION' | 'SUPPRESSION' | 'SOUMISSION' | 'VALIDATION' | 'CONNEXION' | 'DECONNEXION';
  module: 'FICHE_QUALITE' | 'FICHE_SUIVI' | 'UTILISATEUR' | 'FORMULAIRE_OBLIGATOIRE' | 'AUTHENTIFICATION';
  entiteId?: string;
  details?: string;
  dateAction: Date;
  utilisateur: {
    id: string;
    nom: string;
    prenom: string;
    email: string;
  };
  adresseIp?: string;
  userAgent?: string;
}

export interface FiltresHistorique {
  typeAction?: string;
  module?: string;
  utilisateurId?: string;
  dateDebut?: Date;
  dateFin?: Date;
  periode?: 'TODAY' | 'WEEK' | 'MONTH' | 'QUARTER' | 'YEAR';
}

@Injectable({
  providedIn: 'root'
})
export class HistoriqueService {

  private apiUrl = `${environment.apiUrl}/historique`;

  constructor(private http: HttpClient, private auth: AuthService) { }

  private guardCall<T>(factory: () => Observable<T>): Observable<T> {
    // Ne fait aucun appel si non authentifié (évite 401 sur /auth/login)
    if (!this.auth.isLoggedIn()) {
      return of(<any>[]);
    }
    return factory();
  }

  /**
   * Récupérer tout l'historique
   */
  getAllHistorique(): Observable<ActionHistorique[]> {
    return this.guardCall(() => this.http.get<ActionHistorique[]>(this.apiUrl));
  }

  /**
   * Récupérer l'historique avec filtres
   */
  getHistoriqueWithFilters(filtres: FiltresHistorique): Observable<ActionHistorique[]> {
    return this.guardCall(() => this.http.post<ActionHistorique[]>(`${this.apiUrl}/filtres`, filtres));
  }

  /**
   * Récupérer l'historique d'un utilisateur
   */
  getHistoriqueByUser(userId: string): Observable<ActionHistorique[]> {
    return this.guardCall(() => this.http.get<ActionHistorique[]>(`${this.apiUrl}/utilisateur/${userId}`));
  }

  /**
   * Récupérer l'historique d'une entité
   */
  getHistoriqueByEntity(entityId: string): Observable<ActionHistorique[]> {
    return this.guardCall(() => this.http.get<ActionHistorique[]>(`${this.apiUrl}/entite/${entityId}`));
  }

  /**
   * Récupérer l'historique par module
   */
  getHistoriqueByModule(module: string): Observable<ActionHistorique[]> {
    return this.guardCall(() => this.http.get<ActionHistorique[]>(`${this.apiUrl}/module/${module}`));
  }

  /**
   * Récupérer l'historique par type d'action
   */
  getHistoriqueByActionType(typeAction: string): Observable<ActionHistorique[]> {
    return this.guardCall(() => this.http.get<ActionHistorique[]>(`${this.apiUrl}/action/${typeAction}`));
  }

  /**
   * Récupérer l'historique par période
   */
  getHistoriqueByPeriod(periode: string): Observable<ActionHistorique[]> {
    return this.guardCall(() => this.http.get<ActionHistorique[]>(`${this.apiUrl}/periode/${periode}`));
  }

  /**
   * Récupérer l'historique par date
   */
  getHistoriqueByDate(dateDebut: Date, dateFin: Date): Observable<ActionHistorique[]> {
    return this.guardCall(() => this.http.post<ActionHistorique[]>(`${this.apiUrl}/date`, { dateDebut, dateFin }));
  }

  /**
   * Obtenir les statistiques de l'historique
   */
  getHistoriqueStats(): Observable<any> {
    return this.guardCall(() => this.http.get<any>(`${this.apiUrl}/stats`));
  }

  /**
   * Obtenir le nombre total d'actions
   */
  getTotalActions(): Observable<number> {
    return this.guardCall(() => this.http.get<number>(`${this.apiUrl}/stats/total`));
  }

  /**
   * Obtenir le nombre d'actions aujourd'hui
   */
  getActionsToday(): Observable<number> {
    return this.guardCall(() => this.http.get<number>(`${this.apiUrl}/stats/aujourd-hui`));
  }

  /**
   * Obtenir le nombre d'actions cette semaine
   */
  getActionsThisWeek(): Observable<number> {
    return this.guardCall(() => this.http.get<number>(`${this.apiUrl}/stats/semaine`));
  }

  /**
   * Obtenir le nombre d'actions ce mois
   */
  getActionsThisMonth(): Observable<number> {
    return this.guardCall(() => this.http.get<number>(`${this.apiUrl}/stats/mois`));
  }

  /**
   * Obtenir les actions par type
   */
  getActionsByType(): Observable<any> {
    return this.guardCall(() => this.http.get<any>(`${this.apiUrl}/stats/par-type`));
  }

  /**
   * Obtenir les actions par module
   */
  getActionsByModule(): Observable<any> {
    return this.guardCall(() => this.http.get<any>(`${this.apiUrl}/stats/par-module`));
  }

  /**
   * Obtenir les actions par utilisateur
   */
  getActionsByUser(): Observable<any> {
    return this.guardCall(() => this.http.get<any>(`${this.apiUrl}/stats/par-utilisateur`));
  }

  /**
   * Exporter l'historique
   */
  exportHistorique(filtres?: FiltresHistorique): Observable<Blob> {
    const options = { responseType: 'blob' as 'json' };
    if (filtres) {
      return this.guardCall(() => this.http.post<Blob>(`${this.apiUrl}/export`, filtres, options));
    }
    return this.guardCall(() => this.http.get<Blob>(`${this.apiUrl}/export`, options));
  }

  /**
   * Nettoyer l'historique ancien
   */
  cleanOldHistorique(daysToKeep: number): Observable<string> {
    return this.guardCall(() => this.http.post<string>(`${this.apiUrl}/nettoyer`, { daysToKeep }));
  }

  /**
   * Supprimer l'historique d'un utilisateur
   */
  deleteUserHistorique(userId: string): Observable<string> {
    return this.guardCall(() => this.http.delete<string>(`${this.apiUrl}/utilisateur/${userId}`));
  }

  /**
   * Supprimer l'historique d'une entité
   */
  deleteEntityHistorique(entityId: string): Observable<string> {
    return this.guardCall(() => this.http.delete<string>(`${this.apiUrl}/entite/${entityId}`));
  }
} 