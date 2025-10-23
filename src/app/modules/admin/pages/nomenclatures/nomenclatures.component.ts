import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Nomenclature, NomenclatureType, NomenclatureGroup } from '../../../../models/nomenclature.model';
import { NomenclatureService } from '../../../../services/nomenclature.service';
import { NomenclatureDialogComponent } from './nomenclature-dialog/nomenclature-dialog.component';

@Component({
  selector: 'app-nomenclatures',
  templateUrl: './nomenclatures.component.html',
  styleUrls: ['./nomenclatures.component.scss']
})
export class NomenclaturesComponent implements OnInit {
  groups: NomenclatureGroup[] = [];
  selectedType: NomenclatureType = 'TYPE_FICHE';
  isLoading = true;
  totalCount = 0;

  types: { value: NomenclatureType, label: string, icon: string, color: string }[] = [
    { value: 'TYPE_FICHE', label: 'Types de Fiches', icon: 'description', color: '#2563eb' },
    { value: 'STATUT', label: 'Statuts', icon: 'flag', color: '#22c55e' },
    { value: 'CATEGORIE_PROJET', label: 'Catégories Projets', icon: 'category', color: '#f59e0b' },
    { value: 'PRIORITE', label: 'Priorités', icon: 'priority_high', color: '#ef4444' }
  ];

  constructor(
    private nomenclatureService: NomenclatureService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadNomenclatures();
  }

  loadNomenclatures(): void {
    this.isLoading = true;
    this.nomenclatureService.getNomenclaturesGroupedByType().subscribe({
      next: (groups) => {
        this.groups = groups;
        this.totalCount = groups.reduce((sum, g) => sum + g.count, 0);
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Erreur chargement nomenclatures:', error);
        this.showSnackBar('Erreur lors du chargement des nomenclatures', 'error');
        this.isLoading = false;
      }
    });
  }

  getSelectedGroup(): NomenclatureGroup | undefined {
    return this.groups.find(g => g.type === this.selectedType);
  }

  openCreateDialog(): void {
    const dialogRef = this.dialog.open(NomenclatureDialogComponent, {
      width: '600px',
      data: { mode: 'create', type: this.selectedType }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.createNomenclature(result);
      }
    });
  }

  openEditDialog(nomenclature: Nomenclature): void {
    const dialogRef = this.dialog.open(NomenclatureDialogComponent, {
      width: '600px',
      data: { mode: 'edit', nomenclature: { ...nomenclature } }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result && nomenclature.id) {
        this.updateNomenclature(nomenclature.id, result);
      }
    });
  }

  createNomenclature(data: any): void {
    this.nomenclatureService.createNomenclature(data).subscribe({
      next: (nomenclature) => {
        this.showSnackBar(`Nomenclature "${nomenclature.libelle}" créée avec succès`, 'success');
        this.loadNomenclatures();
      },
      error: (error) => {
        console.error('Erreur création:', error);
        this.showSnackBar('Erreur lors de la création', 'error');
      }
    });
  }

  updateNomenclature(id: string, data: any): void {
    this.nomenclatureService.updateNomenclature(id, data).subscribe({
      next: (nomenclature) => {
        this.showSnackBar(`Nomenclature "${nomenclature.libelle}" modifiée avec succès`, 'success');
        this.loadNomenclatures();
      },
      error: (error) => {
        console.error('Erreur modification:', error);
        this.showSnackBar('Erreur lors de la modification', 'error');
      }
    });
  }

  deleteNomenclature(nomenclature: Nomenclature): void {
    if (!nomenclature.id) return;

    if (!confirm(`Voulez-vous vraiment supprimer "${nomenclature.libelle}" ? Cette action est irréversible.`)) {
      return;
    }

    this.nomenclatureService.deleteNomenclature(nomenclature.id).subscribe({
      next: () => {
        this.showSnackBar(`Nomenclature "${nomenclature.libelle}" supprimée avec succès`, 'success');
        this.loadNomenclatures();
      },
      error: (error) => {
        console.error('Erreur suppression:', error);
        this.showSnackBar('Erreur lors de la suppression', 'error');
      }
    });
  }

  initializeDefaults(): void {
    if (!confirm('Voulez-vous initialiser les nomenclatures par défaut ? Cela ne supprimera pas les nomenclatures existantes.')) {
      return;
    }

    this.nomenclatureService.initializeDefaults().subscribe({
      next: () => {
        this.showSnackBar('Nomenclatures par défaut initialisées avec succès', 'success');
        this.loadNomenclatures();
      },
      error: (error) => {
        console.error('Erreur initialisation:', error);
        this.showSnackBar('Erreur lors de l\'initialisation', 'error');
      }
    });
  }

  getTypeInfo(type: NomenclatureType) {
    return this.types.find(t => t.value === type);
  }

  getGroupCount(type: NomenclatureType): number {
    const group = this.groups.find(g => g.type === type);
    return group ? group.count : 0;
  }

  private showSnackBar(message: string, type: 'success' | 'error', duration: number = 3000): void {
    this.snackBar.open(message, 'Fermer', {
      duration,
      horizontalPosition: 'end',
      verticalPosition: 'top',
      panelClass: type === 'success' ? 'snackbar-success' : 'snackbar-error'
    });
  }
}
