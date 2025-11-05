import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map, tap, catchError } from 'rxjs/operators';
import { FicheSuivi } from '../models/fiche-suivi';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class FicheSuiviService {
  private apiUrl = `${environment.apiUrl}/suivis`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<FicheSuivi[]> {
    return this.http.get<any[]>(this.apiUrl).pipe(
      map((fiches: any[]) => {
        return fiches.map(fiche => {
          if (fiche._id && !fiche.id) {
            fiche.id = fiche._id;
          }
          return fiche as FicheSuivi;
        });
      }),
      tap(data => {
        console.log('📦 Fiches de suivi reçues:', data.length);
      })
    );
  }

  getById(id: string): Observable<FicheSuivi> {
    console.log('📡 Service: Récupération fiche suivi ID:', id);
    return this.http.get<any>(`${this.apiUrl}/${id}`).pipe(
      map((fiche: any) => {
        if (fiche._id && !fiche.id) {
          fiche.id = fiche._id;
        }
        console.log('✅ Fiche suivi mappée:', fiche);
        return fiche as FicheSuivi;
      }),
      catchError((error) => {
        console.error('❌ Erreur récupération fiche suivi:', error);
        throw error;
      })
    );
  }

  create(fiche: FicheSuivi): Observable<FicheSuivi> {
    console.log('📤 Création fiche suivi:', fiche);
    return this.http.post<any>(this.apiUrl, fiche).pipe(
      map((result: any) => {
        if (result._id && !result.id) {
          result.id = result._id;
        }
        return result as FicheSuivi;
      })
    );
  }

  update(id: string, fiche: FicheSuivi): Observable<FicheSuivi> {
    console.log('📤 Mise à jour fiche suivi ID:', id);
    return this.http.put<any>(`${this.apiUrl}/${id}`, fiche).pipe(
      map((result: any) => {
        if (result._id && !result.id) {
          result.id = result._id;
        }
        return result as FicheSuivi;
      })
    );
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}