import { Component, Inject } from '@angular/core';
import { MAT_SNACK_BAR_DATA } from '@angular/material/snack-bar';

@Component({
  selector: 'app-success-snackbar',
  template: `
    <div class="snackbar-content">
      <mat-icon class="icon">check_circle</mat-icon>
      <span>{{ data.message }}</span>
    </div>
  `,
  styles: [`
    .snackbar-content {
  display: flex;
  align-items: center;
  color: #fff;
  font-weight: 500;
  font-size: 15px;
}
    .icon {
  margin-right: 8px;
  color: #4caf50;
  font-size: 22px;
}
  `]
})
export class SuccessSnackbarComponent {
  constructor(@Inject(MAT_SNACK_BAR_DATA) public data: { message: string }) {}
}
