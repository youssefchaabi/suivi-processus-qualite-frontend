import { Component, OnInit, ViewChild, Inject } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatDialog, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FicheProjet } from 'src/app/models/fiche-projet';
import { FicheProjetService } from 'src/app/services/fiche-projet.service';
import { AuthService } from 'src/app/services/authentification.service';
import { UtilisateurService, Utilisateur } from 'src/app/services/utilisateur.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';

@Component({
  selector: 'app-liste-projet',
  templateUrl: './liste-projet.component.html',
  styleUrls: ['./liste-projet.component.scss']
})
export class ListeProjetComponent implements OnInit {
  dataSource = new MatTableDataSource<FicheProjet>([]);
  displayedColumns: string[] = ['nom', 'description', 'objectifs', 'responsable', 'echeance', 'statut', 'actions'];
  loading = false;
  errorMessage = '';

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private ficheProjetService: FicheProjetService,
    public authService: AuthService,
    private snackBar: MatSnackBar,
    private router: Router,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.getProjets();
  }

  getProjets(): void {
    this.loading = true;
    this.ficheProjetService.getAll().subscribe({
      next: projets => {
        this.dataSource.data = projets;
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
        this.loading = false;
      },
      error: () => {
        this.errorMessage = 'Erreur lors du chargement des projets.';
        this.loading = false;
      }
    });
  }

  ajouterProjet(): void {
    const dialogRef = this.dialog.open(ProjetFormDialogComponent, {
      width: '800px',
      maxWidth: '95vw',
      maxHeight: '90vh',
      data: { mode: 'create' },
      panelClass: 'form-dialog',
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.getProjets();
      }
    });
  }

  modifierProjet(id: string): void {
    const dialogRef = this.dialog.open(ProjetFormDialogComponent, {
      width: '800px',
      maxWidth: '95vw',
      maxHeight: '90vh',
      data: { mode: 'edit', projetId: id },
      panelClass: 'form-dialog',
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.getProjets();
      }
    });
  }

  supprimerProjet(id: string): void {
    const dialogRef = this.dialog.open(ConfirmDeleteDialogComponent, {
      width: '450px',
      maxWidth: '95vw',
      data: { type: 'projet' },
      panelClass: 'confirm-dialog'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.ficheProjetService.deleteProjet(id).subscribe({
          next: () => {
            this.dataSource.data = this.dataSource.data.filter(p => p.id !== id);
            this.snackBar.open('Projet supprimé avec succès ✅', 'Fermer', { 
              duration: 3000,
              panelClass: ['success-snackbar']
            });
          },
          error: () => {
            this.snackBar.open('Erreur lors de la suppression ❌', 'Fermer', { 
              duration: 3000,
              panelClass: ['error-snackbar']
            });
          }
        });
      }
    });
  }

  getStatutClass(statut: string): string {
    if (!statut) return '';
    const statutLower = statut.toLowerCase().replace(/\s+/g, '-');
    return `status-${statutLower}`;
  }

  getStatutIcon(statut: string): string {
    if (!statut) return 'flag';
    const statutLower = statut.toLowerCase();
    
    if (statutLower.includes('termin') || statutLower.includes('fini')) {
      return 'check_circle';
    } else if (statutLower.includes('cours')) {
      return 'pending';
    } else if (statutLower.includes('attente')) {
      return 'schedule';
    } else if (statutLower.includes('annul')) {
      return 'cancel';
    }
    return 'flag';
  }

  voirDetails(projet: FicheProjet): void {
    this.dialog.open(ProjetDetailsDialogComponent, {
      width: '700px',
      maxWidth: '90vw',
      data: projet,
      panelClass: 'details-dialog'
    });
  }
}

// Dialog Component pour afficher les détails
@Component({
  selector: 'app-projet-details-dialog',
  template: `
    <div class="dialog-container">
      <div class="dialog-header">
        <h2 mat-dialog-title>
          <mat-icon>assignment</mat-icon>
          {{ data.nom }}
        </h2>
        <button mat-icon-button mat-dialog-close class="close-btn">
          <mat-icon>close</mat-icon>
        </button>
      </div>

      <mat-dialog-content class="dialog-content">
        <div class="detail-section">
          <div class="detail-item">
            <mat-icon class="detail-icon">person</mat-icon>
            <div class="detail-info">
              <span class="detail-label">Responsable</span>
              <p class="detail-value">{{ data.responsable }}</p>
            </div>
          </div>

          <div class="detail-item">
            <mat-icon class="detail-icon">description</mat-icon>
            <div class="detail-info">
              <span class="detail-label">Description</span>
              <p class="detail-value">{{ data.description }}</p>
            </div>
          </div>

          <div class="detail-item">
            <mat-icon class="detail-icon">flag</mat-icon>
            <div class="detail-info">
              <span class="detail-label">Objectifs</span>
              <p class="detail-value">{{ data.objectifs }}</p>
            </div>
          </div>

          <div class="detail-row">
            <div class="detail-item half">
              <mat-icon class="detail-icon">event</mat-icon>
              <div class="detail-info">
                <span class="detail-label">Échéance</span>
                <p class="detail-value">
                  {{ data.echeance ? (data.echeance | date:'dd/MM/yyyy') : 'Pas d\'échéance' }}
                </p>
              </div>
            </div>

            <div class="detail-item half">
              <mat-icon class="detail-icon">info</mat-icon>
              <div class="detail-info">
                <span class="detail-label">Statut</span>
                <p class="detail-value">
                  <mat-chip [ngClass]="getStatutClass(data.statut)">
                    {{ data.statut }}
                  </mat-chip>
                </p>
              </div>
            </div>
          </div>
        </div>
      </mat-dialog-content>

      <mat-dialog-actions class="dialog-actions">
        <button mat-button mat-dialog-close>Fermer</button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [`
    .dialog-container {
      padding: 0;
    }

    .dialog-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1.5rem;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      margin: -24px -24px 0 -24px;

      h2 {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        margin: 0;
        font-size: 1.5rem;
        font-weight: 600;

        mat-icon {
          font-size: 2rem;
          width: 2rem;
          height: 2rem;
        }
      }

      .close-btn {
        color: white;
      }
    }

    .dialog-content {
      padding: 2rem 1.5rem !important;
    }

    .detail-section {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .detail-item {
      display: flex;
      gap: 1rem;
      align-items: flex-start;

      &.half {
        flex: 1;
      }

      .detail-icon {
        color: #1976d2;
        flex-shrink: 0;
        margin-top: 0.2rem;
      }

      .detail-info {
        flex: 1;
      }

      .detail-label {
        display: block;
        font-weight: 600;
        color: #666;
        font-size: 0.875rem;
        margin-bottom: 0.5rem;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }

      .detail-value {
        margin: 0;
        color: #333;
        font-size: 1rem;
        line-height: 1.6;
        white-space: pre-wrap;
      }
    }

    .detail-row {
      display: flex;
      gap: 1.5rem;
      flex-wrap: wrap;
    }

    .dialog-actions {
      padding: 1rem 1.5rem;
      background: #f5f5f5;
      margin: 0 -24px -24px -24px;
      justify-content: flex-end;
    }

    mat-chip {
      font-weight: 500;
      
      &.status-en-cours {
        background: #fff3e0;
        color: #e65100;
      }

      &.status-termine {
        background: #e8f5e9;
        color: #2e7d32;
      }

      &.status-en-attente {
        background: #e3f2fd;
        color: #1565c0;
      }

      &.status-annule {
        background: #ffebee;
        color: #c62828;
      }
    }

    @media (max-width: 600px) {
      .detail-row {
        flex-direction: column;
      }
    }
  `]
})
export class ProjetDetailsDialogComponent {
  constructor(@Inject(MAT_DIALOG_DATA) public data: FicheProjet) {}

  getStatutClass(statut: string): string {
    if (!statut) return '';
    const statutLower = statut.toLowerCase().replace(/\s+/g, '-');
    return `status-${statutLower}`;
  }
}

// Dialog Component pour le formulaire (Création/Modification)
@Component({
  selector: 'app-projet-form-dialog',
  template: `
    <div class="dialog-container">
      <div class="dialog-header">
        <h2 mat-dialog-title>
          <mat-icon>{{ data.mode === 'create' ? 'add_box' : 'edit_note' }}</mat-icon>
          {{ data.mode === 'create' ? 'Nouveau Projet' : 'Modifier le Projet' }}
        </h2>
        <button mat-icon-button [mat-dialog-close]="false" class="close-btn">
          <mat-icon>close</mat-icon>
        </button>
      </div>

      <mat-dialog-content class="dialog-content">
        <form [formGroup]="form" class="modal-form">
          <!-- Section 1: Informations Générales -->
          <div class="section-header">
            <mat-icon class="section-icon">info</mat-icon>
            <h3 class="section-title">Informations Générales</h3>
          </div>

          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Nom du Projet</mat-label>
            <input matInput formControlName="nom" required placeholder="Ex: Amélioration du processus qualité" />
            <mat-icon matPrefix class="field-icon">assignment</mat-icon>
            <mat-hint>Nom court et descriptif</mat-hint>
            <mat-error *ngIf="form.get('nom')?.hasError('required')">Le nom est obligatoire</mat-error>
          </mat-form-field>

          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Description Détaillée</mat-label>
            <textarea matInput formControlName="description" required rows="3" 
              placeholder="Décrivez le contexte et les enjeux..."></textarea>
            <mat-icon matPrefix class="field-icon textarea-icon">description</mat-icon>
            <mat-hint>Soyez précis et complet</mat-hint>
            <mat-error *ngIf="form.get('description')?.hasError('required')">La description est obligatoire</mat-error>
          </mat-form-field>

          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Objectifs du Projet</mat-label>
            <textarea matInput formControlName="objectifs" required rows="3"
              placeholder="Listez les objectifs SMART..."></textarea>
            <mat-icon matPrefix class="field-icon textarea-icon">flag</mat-icon>
            <mat-hint>Objectifs clairs et mesurables</mat-hint>
            <mat-error *ngIf="form.get('objectifs')?.hasError('required')">Les objectifs sont obligatoires</mat-error>
          </mat-form-field>

          <!-- Section 2: Gestion -->
          <div class="section-header">
            <mat-icon class="section-icon">settings</mat-icon>
            <h3 class="section-title">Gestion & Planification</h3>
          </div>

          <div class="form-row">
            <mat-form-field appearance="outline" class="half-width">
              <mat-label>Responsable</mat-label>
              <mat-select formControlName="responsable" required>
                <mat-option *ngFor="let user of utilisateurs" [value]="user.nom">
                  <div class="user-option">
                    <mat-icon class="user-icon">person</mat-icon>
                    <span>{{ user.nom }} ({{ user.role }})</span>
                  </div>
                </mat-option>
              </mat-select>
              <mat-icon matPrefix class="field-icon">person_pin</mat-icon>
              <mat-error *ngIf="form.get('responsable')?.hasError('required')">Le responsable est obligatoire</mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline" class="half-width">
              <mat-label>Échéance</mat-label>
              <input matInput [matDatepicker]="picker" formControlName="echeance" required
                autocomplete="off" (keydown)="$event.preventDefault()" (focus)="picker.open()" />
              <mat-icon matPrefix class="field-icon">event</mat-icon>
              <mat-datepicker-toggle matSuffix [for]="picker"></mat-datepicker-toggle>
              <mat-datepicker #picker></mat-datepicker>
              <mat-error *ngIf="form.get('echeance')?.hasError('required')">L'échéance est obligatoire</mat-error>
            </mat-form-field>
          </div>

          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Statut</mat-label>
            <mat-select formControlName="statut" required>
              <mat-option *ngFor="let statut of statutOptions" [value]="statut">
                <div class="status-option">
                  <mat-icon class="status-icon" [ngClass]="getStatutClass(statut)">{{ getStatutIcon(statut) }}</mat-icon>
                  <span>{{ getStatutLabel(statut) }}</span>
                </div>
              </mat-option>
            </mat-select>
            <mat-icon matPrefix class="field-icon">info_outline</mat-icon>
            <mat-error *ngIf="form.get('statut')?.hasError('required')">Le statut est obligatoire</mat-error>
          </mat-form-field>
        </form>
      </mat-dialog-content>

      <mat-dialog-actions class="dialog-actions">
        <button mat-stroked-button [mat-dialog-close]="false" [disabled]="loading">
          <mat-icon>close</mat-icon>
          Annuler
        </button>
        <button mat-raised-button color="primary" (click)="onSubmit()" [disabled]="form.invalid || loading">
          <mat-icon>{{ data.mode === 'create' ? 'add_circle' : 'save' }}</mat-icon>
          {{ data.mode === 'create' ? 'Créer' : 'Enregistrer' }}
          <mat-spinner *ngIf="loading" diameter="20" class="btn-spinner"></mat-spinner>
        </button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [`
    .dialog-container { padding: 0; }
    .dialog-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1.5rem;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      margin: -24px -24px 0 -24px;
    }
    .dialog-header h2 {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      margin: 0;
      font-size: 1.5rem;
      font-weight: 600;
    }
    .dialog-header mat-icon { font-size: 2rem; width: 2rem; height: 2rem; }
    .close-btn { color: white; }
    .dialog-content { padding: 1.5rem !important; max-height: 60vh; }
    .modal-form { display: flex; flex-direction: column; gap: 0.5rem; }
    .section-header {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      margin: 1rem 0 1rem 0;
      padding-bottom: 0.75rem;
      border-bottom: 2px solid #e0e0e0;
    }
    .section-icon { color: #1976d2; font-size: 1.5rem; }
    .section-title { margin: 0; font-size: 1.1rem; font-weight: 600; color: #333; }
    .full-width { width: 100%; }
    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
    }
    .half-width { width: 100%; }
    .field-icon { color: #1976d2; margin-right: 0.5rem; }
    .textarea-icon { align-self: flex-start; margin-top: 0.5rem; }
    .user-option, .status-option {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    .user-icon, .status-icon { font-size: 1.1rem; }
    .status-en-cours { color: #ff9800; }
    .status-valide { color: #4caf50; }
    .status-cloture { color: #9e9e9e; }
    .dialog-actions {
      padding: 1rem 1.5rem;
      background: #f5f5f5;
      margin: 0 -24px -24px -24px;
      justify-content: flex-end;
      gap: 0.75rem;
    }
    .btn-spinner { margin-left: 0.5rem; }
    @media (max-width: 600px) {
      .form-row { grid-template-columns: 1fr; }
    }
  `]
})
export class ProjetFormDialogComponent implements OnInit {
  form!: FormGroup;
  loading = false;
  statutOptions = ['EN_COURS', 'VALIDE', 'CLOTURE'];
  utilisateurs: Utilisateur[] = [];

  constructor(
    private fb: FormBuilder,
    private ficheProjetService: FicheProjetService,
    private utilisateurService: UtilisateurService,
    private snackBar: MatSnackBar,
    public dialogRef: MatDialogRef<ProjetFormDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      nom: ['', Validators.required],
      description: ['', Validators.required],
      objectifs: ['', Validators.required],
      responsable: ['', Validators.required],
      echeance: ['', Validators.required],
      statut: ['', Validators.required]
    });

    this.utilisateurService.getUtilisateurs().subscribe({
      next: users => this.utilisateurs = users,
      error: () => this.utilisateurs = []
    });

    if (this.data.mode === 'edit' && this.data.projetId) {
      this.loading = true;
      this.ficheProjetService.getProjetById(this.data.projetId).subscribe({
        next: projet => {
          if (projet.echeance && typeof projet.echeance === 'string') {
            projet.echeance = new Date(projet.echeance);
          }
          this.form.patchValue(projet);
          this.loading = false;
        },
        error: () => {
          this.snackBar.open('Erreur lors du chargement ❌', 'Fermer', { duration: 2000 });
          this.loading = false;
        }
      });
    }
  }

  onSubmit(): void {
    if (this.form.invalid) return;
    this.loading = true;
    const projet: FicheProjet = this.form.value;

    if (this.data.mode === 'edit') {
      this.ficheProjetService.updateProjet(this.data.projetId, projet).subscribe({
        next: () => {
          this.snackBar.open('Projet modifié avec succès ✅', 'Fermer', { duration: 3000 });
          this.dialogRef.close(true);
        },
        error: () => {
          this.snackBar.open('Erreur lors de la modification ❌', 'Fermer', { duration: 2000 });
          this.loading = false;
        }
      });
    } else {
      this.ficheProjetService.createProjet(projet).subscribe({
        next: () => {
          this.snackBar.open('Projet créé avec succès ✅', 'Fermer', { duration: 3000 });
          this.dialogRef.close(true);
        },
        error: () => {
          this.snackBar.open('Erreur lors de la création ❌', 'Fermer', { duration: 2000 });
          this.loading = false;
        }
      });
    }
  }

  getStatutLabel(statut: string): string {
    const labels: { [key: string]: string } = {
      'EN_COURS': 'En Cours',
      'VALIDE': 'Validé',
      'CLOTURE': 'Clôturé'
    };
    return labels[statut] || statut;
  }

  getStatutIcon(statut: string): string {
    const icons: { [key: string]: string } = {
      'EN_COURS': 'pending',
      'VALIDE': 'check_circle',
      'CLOTURE': 'archive'
    };
    return icons[statut] || 'flag';
  }

  getStatutClass(statut: string): string {
    const classes: { [key: string]: string } = {
      'EN_COURS': 'status-en-cours',
      'VALIDE': 'status-valide',
      'CLOTURE': 'status-cloture'
    };
    return classes[statut] || '';
  }
}

// Dialog Component pour la confirmation de suppression
@Component({
  selector: 'app-confirm-delete-dialog',
  template: `
    <div class="confirm-dialog-container">
      <div class="confirm-header">
        <mat-icon class="warning-icon">warning</mat-icon>
        <h2 mat-dialog-title>Confirmer la Suppression</h2>
      </div>
      <mat-dialog-content>
        <p class="confirm-message">
          Êtes-vous sûr de vouloir supprimer ce {{ data.type }} ?
        </p>
        <p class="confirm-warning">
          <mat-icon>info</mat-icon>
          Cette action est irréversible.
        </p>
      </mat-dialog-content>
      <mat-dialog-actions>
        <button mat-stroked-button [mat-dialog-close]="false">
          <mat-icon>close</mat-icon>
          Annuler
        </button>
        <button mat-raised-button color="warn" [mat-dialog-close]="true">
          <mat-icon>delete</mat-icon>
          Supprimer
        </button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [`
    .confirm-dialog-container { padding: 0; }
    .confirm-header {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1.5rem;
      background: #fff3e0;
      margin: -24px -24px 0 -24px;
    }
    .warning-icon {
      font-size: 3rem;
      width: 3rem;
      height: 3rem;
      color: #ff9800;
    }
    .confirm-header h2 {
      margin: 0;
      font-size: 1.5rem;
      color: #e65100;
    }
    mat-dialog-content {
      padding: 2rem 1.5rem !important;
    }
    .confirm-message {
      font-size: 1.1rem;
      color: #333;
      margin: 0 0 1rem 0;
    }
    .confirm-warning {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      color: #666;
      font-size: 0.95rem;
      margin: 0;
      padding: 0.75rem;
      background: #f5f5f5;
      border-radius: 4px;
    }
    .confirm-warning mat-icon {
      color: #ff9800;
      font-size: 1.2rem;
    }
    mat-dialog-actions {
      padding: 1rem 1.5rem;
      background: #f5f5f5;
      margin: 0 -24px -24px -24px;
      justify-content: flex-end;
      gap: 0.75rem;
    }
  `]
})
export class ConfirmDeleteDialogComponent {
  constructor(@Inject(MAT_DIALOG_DATA) public data: any) {}
}