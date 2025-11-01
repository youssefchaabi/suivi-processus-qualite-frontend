import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable, tap, map, catchError } from "rxjs";
import { FicheQualite } from '../models/fiche-qualite';
import { environment } from '../../environments/environment';
// 
//  Assurez-vous que le chemin est correct
@Injectable({ providedIn: 'root' })
export class FicheQualiteService {
  private apiUrl = `${environment.apiUrl}/fiches`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<FicheQualite[]> {
    return this.http.get<any[]>(this.apiUrl).pipe(
      map((fiches: any[]) => {
        return fiches.map(fiche => {
          if (fiche._id && !fiche.id) {
            fiche.id = fiche._id;
          }
          return fiche as FicheQualite;
        });
      }),
      tap(data => {
        console.log('🔍 Données reçues du backend:', data);
        data.forEach((fiche, index) => {
          console.log(`📋 Fiche ${index + 1}:`, {
            id: fiche.id,
            titre: fiche.titre,
            typeFiche: fiche.typeFiche,
            statut: fiche.statut,
            responsable: fiche.responsable
          });
        });
      })
    );
  }

  getById(id: string): Observable<FicheQualite> {
    console.log('📡 Service: Récupération fiche ID:', id);
    return this.http.get<any>(`${this.apiUrl}/${id}`).pipe(
      map((fiche: any) => {
        if (fiche._id && !fiche.id) {
          fiche.id = fiche._id;
        }
        console.log('✅ Fiche mappée:', fiche);
        return fiche as FicheQualite;
      }),
      catchError((error) => {
        console.error('❌ Erreur récupération fiche:', error);
        throw error;
      })
    );
  }

  create(fiche: FicheQualite): Observable<FicheQualite> {
    console.log('📤 Envoi de la fiche au backend:', fiche);
    return this.http.post<any>(this.apiUrl, fiche).pipe(
      map((result: any) => {
        if (result._id && !result.id) {
          result.id = result._id;
        }
        return result as FicheQualite;
      })
    );
  }

  update(id: string, fiche: FicheQualite): Observable<FicheQualite> {
    console.log('📤 Mise à jour fiche ID:', id);
    return this.http.put<any>(`${this.apiUrl}/${id}`, fiche).pipe(
      map((result: any) => {
        if (result._id && !result.id) {
          result.id = result._id;
        }
        return result as FicheQualite;
      })
    );
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
