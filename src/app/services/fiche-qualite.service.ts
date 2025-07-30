import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable, tap } from "rxjs";
import { FicheQualite } from '../models/fiche-qualite';
// 
//  Assurez-vous que le chemin est correct
@Injectable({ providedIn: 'root' })
export class FicheQualiteService {
  private apiUrl = 'http://localhost:8080/api/fiches';

  constructor(private http: HttpClient) {}

  getAll(): Observable<FicheQualite[]> {
    return this.http.get<FicheQualite[]>(this.apiUrl).pipe(
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
    return this.http.get<FicheQualite>(`${this.apiUrl}/${id}`);
  }

  create(fiche: FicheQualite): Observable<FicheQualite> {
    console.log('📤 Envoi de la fiche au backend:', fiche);
    return this.http.post<FicheQualite>(this.apiUrl, fiche);
  }

  update(id: string, fiche: FicheQualite): Observable<FicheQualite> {
    return this.http.put<FicheQualite>(`${this.apiUrl}/${id}`, fiche);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
