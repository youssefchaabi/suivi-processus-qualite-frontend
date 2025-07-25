import { Component } from '@angular/core';

@Component({
  selector: 'app-dashboard-chef',
  template: `
    <div class="dashboard-chef">
      <mat-card class="dashboard-card">
        <h2><mat-icon style="vertical-align: middle; color: #388e3c;">engineering</mat-icon> Espace Chef de Projet</h2>
        <p class="subtitle">Gérez vos fiches qualité et suivez l'avancement de vos projets.</p>
        <div class="dashboard-actions">
          <a mat-raised-button color="primary" routerLink="/fiche-qualite">
            <mat-icon>assignment</mat-icon> Fiches Qualité
          </a>
          <a mat-raised-button color="accent" routerLink="/fiche-suivi/liste">
            <mat-icon>assignment_turned_in</mat-icon> Fiches de Suivi
          </a>
          <a mat-raised-button color="warn" routerLink="/fiche-projet">
            <mat-icon>work</mat-icon> Fiches Projet
          </a>
        </div>
      </mat-card>
    </div>
  `,
  styles: [`
    .dashboard-chef {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 70vh;
      background: linear-gradient(120deg, #e8f5e9 0%, #fff 100%);
    }
    .dashboard-card {
      padding: 40px 32px;
      border-radius: 18px;
      box-shadow: 0 4px 24px rgba(56, 142, 60, 0.10);
      text-align: center;
      max-width: 500px;
      width: 100%;
    }
    .dashboard-actions {
      display: flex;
      flex-direction: column;
      gap: 24px;
      margin-top: 32px;
    }
    .dashboard-actions a {
      font-size: 1.1em;
      font-weight: 500;
      display: flex;
      align-items: center;
      gap: 10px;
      justify-content: center;
    }
    .subtitle {
      color: #388e3c;
      margin-bottom: 12px;
      font-size: 1.1em;
    }
    @media (max-width: 600px) {
      .dashboard-card {
        padding: 18px 4px;
      }
      .dashboard-actions {
        gap: 12px;
      }
    }
  `]
})
export class DashboardChefComponent {} 