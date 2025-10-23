import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-stat-card',
  templateUrl: './stat-card.component.html',
  styleUrls: ['./stat-card.component.scss']
})
export class StatCardComponent {
  @Input() icon: string = 'info';
  @Input() title: string = '';
  @Input() value: number | string = 0;
  @Input() trend: string = 'neutral'; // 'positive', 'negative', 'neutral'
  @Input() trendValue: string = '';
  @Input() color: string = 'primary'; // 'primary', 'success', 'warning', 'danger', 'info'
  @Input() clickable: boolean = true;
  
  @Output() cardClick = new EventEmitter<void>();

  onCardClick(): void {
    if (this.clickable) {
      this.cardClick.emit();
    }
  }

  getGradientClass(): string {
    return `${this.color}-gradient`;
  }

  getTrendClass(): string {
    return `stat-trend ${this.trend}`;
  }

  getTrendIcon(): string {
    switch (this.trend) {
      case 'positive':
        return 'trending_up';
      case 'negative':
        return 'trending_down';
      default:
        return 'remove';
    }
  }
}
