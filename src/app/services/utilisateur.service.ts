import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Utilisateur {
  id: string;
  nom: string;
  email: string;
  role: string;
  emailActif: boolean;
  typesNotifications: string[];
}

@Injectable({
  providedIn: 'root'
})
export class UtilisateurService {
  private apiUrl = 'http://localhost:8080/api/utilisateurs';  // ✅ à adapter selon ton backend

  constructor(private http: HttpClient) {}

  getUtilisateurs(): Observable<Utilisateur[]> {
    return this.http.get<Utilisateur[]>(this.apiUrl);
  }

  getUtilisateurById(id: string): Observable<Utilisateur> {
    return this.http.get<Utilisateur>(`${this.apiUrl}/${id}`);
  }

  supprimerUtilisateur(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  createUtilisateur(utilisateur: Utilisateur): Observable<Utilisateur> {
  return this.http.post<Utilisateur>(this.apiUrl, utilisateur);
}

updateUtilisateur(id: string, utilisateur: Utilisateur): Observable<Utilisateur> {
  return this.http.put<Utilisateur>(`${this.apiUrl}/${id}`, utilisateur);
}



}
