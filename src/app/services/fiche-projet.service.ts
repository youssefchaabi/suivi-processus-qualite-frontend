import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { FicheProjet } from '../models/fiche-projet';
import { environment } from 'src/environments/environment';

@Injectable({ providedIn: 'root' })
export class FicheProjetService {
  private apiUrl = `${environment.apiUrl}/projets`;

  constructor(private http: HttpClient) {}

  getProjets(): Observable<FicheProjet[]> {
    return this.http.get<FicheProjet[]>(this.apiUrl);
  }

  getAll(): Observable<FicheProjet[]> {
    return this.getProjets();
  }

  getProjetById(id: string): Observable<FicheProjet> {
    return this.http.get<FicheProjet>(`${this.apiUrl}/${id}`);
  }

  createProjet(projet: FicheProjet): Observable<FicheProjet> {
    return this.http.post<FicheProjet>(this.apiUrl, projet);
  }

  updateProjet(id: string, projet: FicheProjet): Observable<FicheProjet> {
    return this.http.put<FicheProjet>(`${this.apiUrl}/${id}`, projet);
  }

  deleteProjet(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  delete(id: string): Observable<void> {
    return this.deleteProjet(id);
  }
} 