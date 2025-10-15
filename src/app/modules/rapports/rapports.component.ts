import { Component } from '@angular/core';
import { ExportService } from 'src/app/services/export.service';

@Component({
  selector: 'app-rapports',
  template: `
    <mat-card>
      <mat-card-title>Rapports KPI</mat-card-title>
      <div style="display:flex; gap:12px; margin-top: 12px;">
        <button mat-raised-button color="primary" (click)="exportPDF()">Exporter PDF</button>
        <button mat-stroked-button (click)="exportExcel()">Exporter Excel</button>
      </div>
    </mat-card>
  `
})
export class RapportsComponent {
  constructor(private exportService: ExportService) {}
  exportPDF() { this.exportService.exportCompleteDashboardReport({ title: 'Rapport KPI' }); }
  exportExcel() { this.exportService.exportPerformanceData([{ name: 'KPI', value: 1 }]); }
}