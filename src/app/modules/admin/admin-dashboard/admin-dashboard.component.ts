import { Component } from '@angular/core';

@Component({
  selector: 'app-admin-dashboard',
  template: `
    <div class="dashboard-admin">
      <mat-card class="dashboard-card">
        <h2><mat-icon style="vertical-align: middle; color: #1976d2;">admin_panel_settings</mat-icon> Bienvenue sur le Dashboard Administrateur</h2>
        <p class="subtitle">Gérez les utilisateurs et les nomenclatures de votre organisation.</p>
        <div class="dashboard-actions">
          <a mat-raised-button color="primary" routerLink="/utilisateurs">
            <mat-icon>group</mat-icon> Gestion des utilisateurs
          </a>
          <a mat-raised-button color="accent" [routerLink]="['/nomenclatures']">
            <mat-icon>category</mat-icon> Gestion des nomenclatures
          </a>
        </div>
      </mat-card>
    </div>
  `,
  styles: [`
    .dashboard-admin {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 70vh;
      background: linear-gradient(120deg, #e3f2fd 0%, #fff 100%);
    }
    .dashboard-card {
      padding: 40px 32px;
      border-radius: 18px;
      box-shadow: 0 4px 24px rgba(25, 118, 210, 0.10);
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
      color: #1976d2;
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
export class AdminDashboardComponent {} 