import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

export interface Utilisateur {
  id: string;
  nom: string;
  email: string;
  role: string;
  password?: string;
}

@Injectable({
  providedIn: 'root'
})
export class UtilisateurService {
  private apiUrl = 'http://localhost:8080/api/utilisateurs';  // ✅ à adapter selon ton backend
  private adminApiUrl = 'http://localhost:8080/api/admin';

  constructor(private http: HttpClient) { }

  getUtilisateurs(): Observable<Utilisateur[]> {
    return this.http.get<Utilisateur[]>(this.apiUrl).pipe(
      catchError(error => {
        console.error('Erreur lors de la récupération des utilisateurs:', error);
        return throwError(() => error);
      })
    );
  }

  getUtilisateurById(id: string): Observable<Utilisateur> {
    return this.http.get<Utilisateur>(`${this.apiUrl}/${id}`);
  }

  supprimerUtilisateur(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  createUtilisateur(utilisateur: Utilisateur): Observable<Utilisateur> {
    // Utilise le endpoint admin qui hash le mot de passe
    const payload = {
      email: utilisateur.email,
      nom: utilisateur.nom,
      role: utilisateur.role,
      password: utilisateur.password
    };
    return this.http.post<Utilisateur>(`${this.adminApiUrl}/create-user`, payload).pipe(
      catchError(error => {
        console.error('Erreur lors de la création de l\'utilisateur:', error);
        return throwError(() => error);
      })
    );
  }

  updateUtilisateur(id: string, utilisateur: Utilisateur): Observable<Utilisateur> {
    return this.http.put<Utilisateur>(`${this.apiUrl}/${id}`, utilisateur);
  }



}
