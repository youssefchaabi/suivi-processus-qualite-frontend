import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { UtilisateurService, Utilisateur } from 'src/app/services/utilisateur.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SuccessSnackbarComponent } from 'src/app/shared/success-snackbar/success-snackbar.component';


@Component({
  selector: 'app-formulaire',
  templateUrl: './formulaire.component.html',
  styleUrls: ['./formulaire.component.scss']
})
export class FormulaireComponent implements OnInit {
  form: FormGroup;
  modeEdition = false;
  utilisateurId: string | null = null;
  rolesDisponibles = ['ADMIN', 'CHEF_PROJET', 'PILOTE_QUALITE'];
  typesNotifDisponibles = ['FICHE_QUALITE', 'FICHE_SUIVI'];

  constructor(
    private fb: FormBuilder,
    private utilisateurService: UtilisateurService,
    private route: ActivatedRoute,
    private router: Router,
    private snackBar: MatSnackBar  // ✅ ajout ici

  ) {
    this.form = this.fb.group({
      nom: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      role: ['', Validators.required],
      emailActif: [true],
      typesNotifications: [[]]
    });
  }

  ngOnInit(): void {
    this.utilisateurId = this.route.snapshot.paramMap.get('id');
    this.modeEdition = !!this.utilisateurId;

    if (this.modeEdition && this.utilisateurId) {
      this.utilisateurService.getUtilisateurById(this.utilisateurId).subscribe(data => {
        this.form.patchValue(data);
      });
    }
  }

  onSubmit(): void {
  if (this.form.invalid) return;

  const utilisateur: Utilisateur = this.form.value;

  if (this.modeEdition && this.utilisateurId) {
  this.utilisateurService.updateUtilisateur(this.utilisateurId, utilisateur).subscribe(() => {
    this.snackBar.openFromComponent(SuccessSnackbarComponent, {
      data: { message: '✅ Utilisateur mis à jour avec succès' },
      duration: 3000,
      panelClass: ['mat-snack-bar-success']
    });
    this.router.navigate(['/utilisateurs']);
  });
} else {
  this.utilisateurService.createUtilisateur(utilisateur).subscribe(() => {
    this.snackBar.openFromComponent(SuccessSnackbarComponent, {
      data: { message: '✅ Utilisateur ajouté avec succès' },
      duration: 3000,
      panelClass: ['mat-snack-bar-success']
    });
    this.router.navigate(['/utilisateurs']);
  });
}}

  onToggleNotification(type: string, checked: boolean): void {
  const current = this.form.value.typesNotifications || [];
  if (checked && !current.includes(type)) {
    this.form.patchValue({ typesNotifications: [...current, type] });
  } else if (!checked && current.includes(type)) {
    this.form.patchValue({
      typesNotifications: current.filter((t: string) => t !== type)
    });
  }
}

}
