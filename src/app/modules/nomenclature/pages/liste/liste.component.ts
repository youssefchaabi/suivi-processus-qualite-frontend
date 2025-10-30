import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NomenclatureService } from '../../services/nomenclature.service';
import { Nomenclature } from '../../models/nomenclature.model';
import { NomenclatureModalComponent } from '../../components/nomenclature-modal/nomenclature-modal.component';

@Component({
  selector: 'app-liste',
  templateUrl: './liste.component.html',
  styleUrls: ['./liste.component.scss']
})
export class ListeComponent implements OnInit, AfterViewInit {
  displayedColumns: string[] = ['type', 'actif', 'ordre', 'actions'];
  dataSource: MatTableDataSource<Nomenclature>;
  nomenclatures: Nomenclature[] = [];
  loading = false;
  recherche = '';
  filtreType = '';
  filtreActif = '';
  errorMessage = '';

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private nomenclatureService: NomenclatureService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {
    this.dataSource = new MatTableDataSource<Nomenclature>([]);
  }

  ngOnInit(): void {
    this.loadNomenclatures();
  }

  ngAfterViewInit(): void {
    // Attacher le paginator et le sort après l'initialisation de la vue
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  loadNomenclatures(): void {
    this.loading = true;
    this.nomenclatureService.getAll().subscribe({
      next: (data: Nomenclature[]) => {
        this.nomenclatures = data;
        this.dataSource.data = data;
        
        // Réattacher le paginator après le chargement des données
        setTimeout(() => {
          if (this.paginator) {
            this.dataSource.paginator = this.paginator;
          }
          if (this.sort) {
            this.dataSource.sort = this.sort;
          }
        });
        
        this.loading = false;
      },
      error: (error: any) => {
        console.error('Erreur chargement nomenclatures:', error);
        this.snackBar.open('Erreur lors du chargement', 'Fermer', { duration: 3000 });
        this.loading = false;
      }
    });
  }

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  openCreateDialog(): void {
    const dialogRef = this.dialog.open(NomenclatureModalComponent, {
      width: '600px',
      data: { isEditMode: false }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadNomenclatures();
      }
    });
  }

  openEditDialog(nomenclature: Nomenclature): void {
    const dialogRef = this.dialog.open(NomenclatureModalComponent, {
      width: '600px',
      data: { isEditMode: true, nomenclature: nomenclature }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadNomenclatures();
      }
    });
  }

  deleteNomenclature(id: string): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette nomenclature ?')) {
      this.nomenclatureService.delete(id).subscribe({
        next: () => {
          // Supprimer l'élément localement sans recharger toute la liste
          this.nomenclatures = this.nomenclatures.filter(n => n.id !== id);
          this.dataSource.data = this.nomenclatures;
          
          this.snackBar.open('Nomenclature supprimée avec succès', 'Fermer', { duration: 3000 });
        },
        error: (error: any) => {
          console.error('Erreur suppression:', error);
          this.snackBar.open('Erreur lors de la suppression', 'Fermer', { duration: 3000 });
        }
      });
    }
  }

  getTypeIcon(type: string): string {
    const icons: { [key: string]: string } = {
      'TYPE_FICHE': 'assignment',
      'STATUT': 'flag',
      'PRIORITE': 'priority_high',
      'CATEGORIE': 'category'
    };
    return icons[type] || 'label';
  }

  getTypeLabel(type: string): string {
    const labels: { [key: string]: string } = {
      'TYPE_FICHE': 'Type de Fiche',
      'STATUT': 'Statut',
      'PRIORITE': 'Priorité',
      'CATEGORIE': 'Catégorie'
    };
    return labels[type] || type;
  }

  getTypeColor(type: string): string {
    const colors: { [key: string]: string } = {
      'TYPE_FICHE': '#4CAF50',
      'STATUT': '#2196F3',
      'PRIORITE': '#FF9800',
      'CATEGORIE': '#9C27B0'
    };
    return colors[type] || '#757575';
  }

  get authService(): any {
    return { isAdmin: () => true };
  }

  creerNomenclature(): void {
    this.openCreateDialog();
  }

  modifierNomenclature(id: string): void {
    const nomenclature = this.nomenclatures.find(n => n.id === id);
    if (nomenclature) {
      this.openEditDialog(nomenclature);
    }
  }

  supprimerNomenclature(id: string): void {
    this.deleteNomenclature(id);
  }

  appliquerFiltres(): void {
    let filtered = this.nomenclatures;

    if (this.recherche) {
      filtered = filtered.filter(n => 
        n.type.toLowerCase().includes(this.recherche.toLowerCase()) ||
        (n.code && n.code.toLowerCase().includes(this.recherche.toLowerCase())) ||
        (n.libelle && n.libelle.toLowerCase().includes(this.recherche.toLowerCase()))
      );
    }

    if (this.filtreType) {
      filtered = filtered.filter(n => n.type === this.filtreType);
    }

    if (this.filtreActif) {
      const actif = this.filtreActif === 'true';
      filtered = filtered.filter(n => n.actif === actif);
    }

    this.dataSource.data = filtered;
    
    // Réinitialiser le paginator après filtrage
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  resetFiltres(): void {
    this.recherche = '';
    this.filtreType = '';
    this.filtreActif = '';
    this.dataSource.data = this.nomenclatures;
    
    // Réinitialiser le paginator
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }
}
