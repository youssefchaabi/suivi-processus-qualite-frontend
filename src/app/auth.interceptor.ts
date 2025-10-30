import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Router } from '@angular/router';
import { catchError } from 'rxjs/operators';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private router: Router) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token = localStorage.getItem('token');

    // N'ajoute le token que pour les appels vers notre API (tolère absolu/relatif)
    const isApiCall = req.url.startsWith(environment.apiUrl) || req.url.includes('/api/');
    const authReq = token && isApiCall
      ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
      : req;

    return next.handle(authReq).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          // Vérifier si on est déjà sur une page publique
          const currentUrl = this.router.url;
          const publicRoutes = ['/home', '/', '/auth/login', '/auth/register'];
          
          // Ne rediriger que si on n'est pas déjà sur une page publique
          if (!publicRoutes.includes(currentUrl) && !currentUrl.startsWith('/auth')) {
            localStorage.removeItem('token');
            this.router.navigate(['/auth/login']);
          }
        } else if (error.status === 403) {
          // Accès refusé: ne pas supprimer le token, rediriger vers unauthorized
          this.router.navigate(['/unauthorized']);
        }
        return throwError(() => error);
      })
    );
  }
}
