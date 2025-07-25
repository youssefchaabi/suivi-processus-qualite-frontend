import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { FicheQualite } from '../models/fiche-qualite';
// 
//  Assurez-vous que le chemin est correct
@Injectable({ providedIn: 'root' })
export class FicheQualiteService {
  private apiUrl = 'http://localhost:8080/api/fiches';

  constructor(private http: HttpClient) {}

  getAll(): Observable<FicheQualite[]> {
    return this.http.get<FicheQualite[]>(this.apiUrl);
  }

  getById(id: string): Observable<FicheQualite> {
    return this.http.get<FicheQualite>(`${this.apiUrl}/${id}`);
  }

  create(fiche: FicheQualite): Observable<FicheQualite> {
    return this.http.post<FicheQualite>(this.apiUrl, fiche);
  }

  update(id: string, fiche: FicheQualite): Observable<FicheQualite> {
    return this.http.put<FicheQualite>(`${this.apiUrl}/${id}`, fiche);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
