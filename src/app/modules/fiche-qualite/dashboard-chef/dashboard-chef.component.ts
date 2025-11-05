import { Component, OnInit } from '@angular/core';
import { SidebarSection } from 'src/app/shared/dashboard-sidebar/dashboard-sidebar.component';

@Component({
  selector: 'app-dashboard-chef',
  templateUrl: './dashboard-chef.component.html',
  styleUrls: ['./dashboard-chef.component.scss']
})
export class DashboardChefComponent implements OnInit {
  sidebarSections: SidebarSection[] = [
    { id: 'overview', label: 'Tableau de bord', icon: 'dashboard' },
    { id: 'projects', label: 'Mes Projets', icon: 'folder_special' },
    { id: 'quality', label: 'Fiches Qualité', icon: 'verified' },
    { id: 'tracking', label: 'Fiches de Suivi', icon: 'assignment_turned_in' },
    { id: 'tasks', label: 'Tâches', icon: 'task_alt' }
  ];

  ngOnInit(): void {
  }
} 