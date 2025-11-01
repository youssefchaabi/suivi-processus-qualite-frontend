import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { FicheProjet } from '../models/fiche-projet';
import { environment } from 'src/environments/environment';

@Injectable({ providedIn: 'root' })
export class FicheProjetService {
  private apiUrl = `${environment.apiUrl}/projets`;

  constructor(private http: HttpClient) {}

  getProjets(): Observable<FicheProjet[]> {
    return this.http.get<any[]>(this.apiUrl).pipe(
      map((projets: any[]) => {
        return projets.map(projet => {
          if (projet._id && !projet.id) {
            projet.id = projet._id;
          }
          return projet as FicheProjet;
        });
      })
    );
  }

  getAll(): Observable<FicheProjet[]> {
    return this.getProjets();
  }

  getProjetById(id: string): Observable<FicheProjet> {
    console.log('📡 Service: Récupération projet ID:', id);
    console.log('📡 URL:', `${this.apiUrl}/${id}`);
    return this.http.get<any>(`${this.apiUrl}/${id}`).pipe(
      map((projet: any) => {
        // Mapper _id vers id si nécessaire
        if (projet._id && !projet.id) {
          projet.id = projet._id;
        }
        console.log('✅ Projet mappé:', projet);
        return projet as FicheProjet;
      }),
      catchError((error) => {
        console.error('❌ Erreur récupération projet:', error);
        throw error;
      })
    );
  }

  createProjet(projet: FicheProjet): Observable<FicheProjet> {
    return this.http.post<any>(this.apiUrl, projet).pipe(
      map((result: any) => {
        if (result._id && !result.id) {
          result.id = result._id;
        }
        return result as FicheProjet;
      })
    );
  }

  updateProjet(id: string, projet: FicheProjet): Observable<FicheProjet> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, projet).pipe(
      map((result: any) => {
        if (result._id && !result.id) {
          result.id = result._id;
        }
        return result as FicheProjet;
      })
    );
  }

  deleteProjet(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  delete(id: string): Observable<void> {
    return this.deleteProjet(id);
  }
} 