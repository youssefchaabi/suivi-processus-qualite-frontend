import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { FicheSuivi } from '../models/fiche-suivi';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class FicheSuiviService {
  private apiUrl = `${environment.apiUrl}/suivis`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<FicheSuivi[]> {
    return this.http.get<FicheSuivi[]>(this.apiUrl);
  }

  getById(id: string): Observable<FicheSuivi> {
    return this.http.get<FicheSuivi>(`${this.apiUrl}/${id}`);
  }

  create(fiche: FicheSuivi): Observable<FicheSuivi> {
    return this.http.post<FicheSuivi>(this.apiUrl, fiche);
  }

  update(id: string, fiche: FicheSuivi): Observable<FicheSuivi> {
    return this.http.put<FicheSuivi>(`${this.apiUrl}/${id}`, fiche);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
// Note: Ensure that the FicheSuivi model is defined in '../models/fiche-suivi.model' with the appropriate structure.