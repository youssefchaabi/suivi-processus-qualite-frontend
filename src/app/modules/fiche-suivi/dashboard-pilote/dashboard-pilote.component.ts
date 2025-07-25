import { Component } from '@angular/core';

@Component({
  selector: 'app-dashboard-pilote',
  template: `
    <div class="dashboard-pilote">
      <mat-card class="dashboard-card">
        <h2><mat-icon style="vertical-align: middle; color: #fbc02d;">insights</mat-icon> Espace Pilote Qualité</h2>
        <p class="subtitle">Suivez vos KPI, fiches de suivi et notifications qualité.</p>
        <div class="dashboard-actions">
          <a mat-raised-button color="primary" routerLink="/fiche-suivi/liste">
            <mat-icon>assignment_turned_in</mat-icon> Fiches Suivi
          </a>
          <a mat-raised-button color="accent" routerLink="/kpi">
            <mat-icon>bar_chart</mat-icon> KPI
          </a>
          <a mat-raised-button color="warn" routerLink="/notifications">
            <mat-icon>notifications</mat-icon> Notifications
          </a>
        </div>
      </mat-card>
    </div>
  `,
  styles: [`
    .dashboard-pilote {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 70vh;
      background: linear-gradient(120deg, #fffde7 0%, #fff 100%);
    }
    .dashboard-card {
      padding: 40px 32px;
      border-radius: 18px;
      box-shadow: 0 4px 24px rgba(251, 192, 45, 0.10);
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
      color: #fbc02d;
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
export class DashboardPiloteComponent {} 