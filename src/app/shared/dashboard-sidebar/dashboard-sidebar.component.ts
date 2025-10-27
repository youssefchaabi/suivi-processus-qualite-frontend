import { Component, Input, OnInit } from '@angular/core';

export interface SidebarSection {
  id: string;
  label: string;
  icon: string;
  active?: boolean;
}

@Component({
  selector: 'app-dashboard-sidebar',
  templateUrl: './dashboard-sidebar.component.html',
  styleUrls: ['./dashboard-sidebar.component.scss']
})
export class DashboardSidebarComponent implements OnInit {
  @Input() title: string = 'Dashboard';
  @Input() sections: SidebarSection[] = [];
  @Input() collapsed: boolean = false;

  activeSection: string = '';

  ngOnInit(): void {
    if (this.sections.length > 0) {
      this.activeSection = this.sections[0].id;
    }
  }

  selectSection(sectionId: string): void {
    this.activeSection = sectionId;
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  toggleSidebar(): void {
    this.collapsed = !this.collapsed;
  }
}
