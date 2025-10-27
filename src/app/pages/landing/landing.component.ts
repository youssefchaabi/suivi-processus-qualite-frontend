import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { LoginModalComponent } from '../login-modal/login-modal.component';

@Component({
  selector: 'app-landing',
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.scss']
})
export class LandingComponent implements OnInit {

  constructor(
    private router: Router,
    private dialog: MatDialog
  ) { }

  ngOnInit(): void {
  }

  openLoginModal(role: string): void {
    const dialogRef = this.dialog.open(LoginModalComponent, {
      width: '500px',
      maxWidth: '95vw',
      data: { role: role },
      panelClass: 'login-modal-container',
      disableClose: false,
      autoFocus: true
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        console.log('Connexion réussie');
      }
    });
  }

  scrollToRoles(): void {
    const element = document.getElementById('fonctionnalites');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

}
