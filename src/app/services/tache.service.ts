import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { Tache, TacheStats } from '../models/tache.model';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class TacheService {
  private apiUrl = `${environment.apiUrl}/taches`;

  constructor(private http: HttpClient) {}

  /**
   * Récupérer toutes les tâches
   */
  getAllTaches(): Observable<Tache[]> {
    return this.http.get<Tache[]>(this.apiUrl).pipe(
      map(taches => this.mapTaches(taches)),
      catchError(this.handleError)
    );
  }

  /**
   * Récupérer les tâches d'un utilisateur
   */
  getTachesByUtilisateur(userId: string): Observable<Tache[]> {
    return this.http.get<Tache[]>(`${this.apiUrl}/utilisateur/${userId}`).pipe(
      map(taches => this.mapTaches(taches)),
      catchError(this.handleError)
    );
  }

  /**
   * Récupérer une tâche par ID
   */
  getTacheById(id: string): Observable<Tache> {
    return this.http.get<Tache>(`${this.apiUrl}/${id}`).pipe(
      map(tache => this.mapTache(tache)),
      catchError(this.handleError)
    );
  }

  /**
   * Créer une nouvelle tâche
   */
  createTache(tache: Tache): Observable<Tache> {
    return this.http.post<Tache>(this.apiUrl, tache).pipe(
      map(t => this.mapTache(t)),
      catchError(this.handleError)
    );
  }

  /**
   * Mettre à jour une tâche
   */
  updateTache(id: string, tache: Tache): Observable<Tache> {
    return this.http.put<Tache>(`${this.apiUrl}/${id}`, tache).pipe(
      map(t => this.mapTache(t)),
      catchError(this.handleError)
    );
  }

  /**
   * Supprimer une tâche
   */
  deleteTache(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Récupérer les tâches d'un projet
   */
  getTachesByProjet(projetId: string): Observable<Tache[]> {
    return this.http.get<Tache[]>(`${this.apiUrl}/projet/${projetId}`).pipe(
      map(taches => this.mapTaches(taches)),
      catchError(this.handleError)
    );
  }

  /**
   * Récupérer les statistiques
   */
  getStatistiques(userId: string): Observable<TacheStats> {
    return this.http.get<TacheStats>(`${this.apiUrl}/stats/${userId}`).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Marquer une tâche comme terminée
   */
  marquerTerminee(id: string, userId: string): Observable<Tache> {
    return this.http.put<Tache>(`${this.apiUrl}/${id}/terminer?userId=${userId}`, {}).pipe(
      map(t => this.mapTache(t)),
      catchError(this.handleError)
    );
  }

  /**
   * Mapper les dates des tâches
   */
  private mapTaches(taches: any[]): Tache[] {
    return taches.map(t => this.mapTache(t));
  }

  private mapTache(tache: any): Tache {
    return {
      ...tache,
      dateEcheance: tache.dateEcheance ? new Date(tache.dateEcheance) : new Date(),
      dateCreation: tache.dateCreation ? new Date(tache.dateCreation) : undefined,
      dateModification: tache.dateModification ? new Date(tache.dateModification) : undefined
    };
  }

  /**
   * Gestion des erreurs
   */
  private handleError(error: any): Observable<never> {
    console.error('Erreur TacheService:', error);
    return throwError(() => error);
  }
}
