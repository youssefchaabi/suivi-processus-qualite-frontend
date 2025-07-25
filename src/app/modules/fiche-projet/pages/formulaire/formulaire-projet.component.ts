import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FicheProjet } from 'src/app/models/fiche-projet';
import { FicheProjetService } from 'src/app/services/fiche-projet.service';
import { AuthService } from 'src/app/services/authentification.service';
import { UtilisateurService, Utilisateur } from 'src/app/services/utilisateur.service';

@Component({
  selector: 'app-formulaire-projet',
  templateUrl: './formulaire-projet.component.html',
  styleUrls: ['./formulaire-projet.component.scss']
})
export class FormulaireProjetComponent implements OnInit {
  form!: FormGroup;
  modeEdition = false;
  projetId: string | null = null;
  loading = false;
  statutOptions = ['EN_COURS', 'VALIDE', 'CLOTURE'];
  utilisateurs: Utilisateur[] = [];

  constructor(
    private fb: FormBuilder,
    private ficheProjetService: FicheProjetService,
    private route: ActivatedRoute,
    private router: Router,
    private snackBar: MatSnackBar,
    public authService: AuthService,
    private utilisateurService: UtilisateurService
  ) {}

  ngOnInit(): void {
    this.projetId = this.route.snapshot.paramMap.get('id');
    this.form = this.fb.group({
      nom: ['', Validators.required],
      description: ['', Validators.required],
      objectifs: ['', Validators.required],
      responsable: ['', Validators.required],
      echeance: ['', Validators.required],
      statut: ['', Validators.required]
    });
    if (this.projetId) {
      this.modeEdition = true;
      this.loading = true;
      this.ficheProjetService.getProjetById(this.projetId).subscribe({
        next: projet => {
          // Correction : forcer echeance en Date lors du patchValue
          if (projet.echeance && typeof projet.echeance === 'string') {
            projet.echeance = new Date(projet.echeance);
          }
          this.form.patchValue(projet);
          this.loading = false;
        },
        error: () => {
          this.snackBar.open('Erreur lors du chargement du projet.', 'Fermer', { duration: 2000 });
          this.loading = false;
        }
      });
    }
    this.utilisateurService.getUtilisateurs().subscribe({
      next: users => this.utilisateurs = users,
      error: () => this.utilisateurs = []
    });
  }

  onSubmit(): void {
    if (this.form.invalid) return;
    this.loading = true;
    const projet: FicheProjet = this.form.value;
    // Correction : forcer echeance en Date à l'envoi
    if (projet.echeance && typeof projet.echeance !== 'object') {
      projet.echeance = new Date(projet.echeance);
    }
    // Ajout : renseigner creePar avec l'ID utilisateur connecté
    const userId = this.authService.getUserId();
    projet.creePar = userId === null ? undefined : userId;
    if (this.modeEdition && this.projetId) {
      this.ficheProjetService.updateProjet(this.projetId, projet).subscribe({
        next: () => {
          this.snackBar.open('Projet modifié avec succès.', 'Fermer', { duration: 2000 });
          this.router.navigate(['/fiche-projet']);
        },
        error: () => {
          this.snackBar.open('Erreur lors de la modification.', 'Fermer', { duration: 2000 });
          this.loading = false;
        }
      });
    } else {
      this.ficheProjetService.createProjet(projet).subscribe({
        next: () => {
          this.snackBar.open('Projet créé avec succès.', 'Fermer', { duration: 2000 });
          this.router.navigate(['/fiche-projet']);
        },
        error: () => {
          this.snackBar.open('Erreur lors de la création.', 'Fermer', { duration: 2000 });
          this.loading = false;
        }
      });
    }
  }

  retourListe(): void {
    this.router.navigate(['/fiche-projet']);
  }
} 