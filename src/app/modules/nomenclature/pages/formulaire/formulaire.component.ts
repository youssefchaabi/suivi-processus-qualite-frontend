import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NomenclatureService, Nomenclature } from 'src/app/services/nomenclature.service';
import { AuthService } from 'src/app/services/authentification.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-nomenclature-formulaire',
  templateUrl: './formulaire.component.html',
  styleUrls: ['./formulaire.component.scss']
})
export class FormulaireComponent implements OnInit {
  id: string | null = null;
  modeEdition: boolean = false;
  loading: boolean = false;
  
  form = this.fb.group({
    type: ['', Validators.required],
    code: ['', Validators.required],
    libelle: ['', Validators.required],
    description: [''],
    actif: [true],
    ordre: [0]
  });

  typesDisponibles = [
    { value: 'TYPE_FICHE', label: 'Type de Fiche', icon: 'description' },
    { value: 'STATUT', label: 'Statut', icon: 'flag' },
    { value: 'CATEGORIE_PROJET', label: 'Catégorie Projet', icon: 'category' },
    { value: 'PRIORITE', label: 'Priorité', icon: 'priority_high' }
  ];

  constructor(
    private fb: FormBuilder, 
    private route: ActivatedRoute, 
    private router: Router, 
    private service: NomenclatureService, 
    private snack: MatSnackBar,
    public authService: AuthService
  ) {}

  ngOnInit(): void {
    this.id = this.route.snapshot.paramMap.get('id');
    console.log('🔍 ID récupéré de la route:', this.id);
    
    // 'nouveau' n'est pas un ID, c'est la route de création
    if (this.id === 'nouveau') {
      console.log('✅ Mode création détecté');
      this.id = null;
    }
    
    this.modeEdition = !!this.id;
    console.log('📝 Mode édition:', this.modeEdition);
    
    if (this.id) {
      console.log('📥 Chargement de la nomenclature ID:', this.id);
      this.loading = true;
      this.service.getById(this.id).subscribe({
        next: (n) => {
          console.log('✅ Nomenclature chargée:', n);
          console.log('🆔 ID de la nomenclature:', n.id);
          this.form.patchValue(n);
          this.loading = false;
        },
        error: (err) => {
          console.error('❌ Erreur chargement:', err);
          console.error('❌ URL appelée:', `${this.service['apiUrl']}/${this.id}`);
          this.snack.open('Erreur de chargement de la nomenclature', 'Fermer', { duration: 3000 });
          this.loading = false;
          this.router.navigate(['/nomenclatures']);
        }
      });
    }
  }

  save() {
    if (this.form.invalid) return;
    
    this.loading = true;
    
    // Préparer le payload sans l'id pour la création
    const formValue = this.form.value;
    const payload: any = {
      type: formValue.type,
      code: formValue.code,
      libelle: formValue.libelle,
      description: formValue.description || '',
      actif: formValue.actif !== false,
      ordre: formValue.ordre !== null && formValue.ordre !== undefined ? formValue.ordre : 0
    };
    
    console.log('📤 Payload envoyé:', payload);
    console.log('📝 Mode édition:', this.modeEdition, 'ID:', this.id);
    
    if (this.id) {
      console.log('🔄 UPDATE - URL:', `${environment.apiUrl}/nomenclatures/${this.id}`);
    } else {
      console.log('➕ CREATE - URL:', `${environment.apiUrl}/nomenclatures`);
    }
    
    const obs = this.id 
      ? this.service.updateNomenclature(this.id, payload) 
      : this.service.createNomenclature(payload);
    
    obs.subscribe({
      next: () => { 
        this.snack.open(
          this.modeEdition ? 'Nomenclature modifiée avec succès ✅' : 'Nomenclature créée avec succès ✅',
          'Fermer',
          { duration: 3000, panelClass: ['success-snackbar'] }
        ); 
        this.router.navigate(['/nomenclatures']); 
      },
      error: (err) => {
        console.error('Erreur sauvegarde:', err);
        this.snack.open(
          'Erreur lors de la sauvegarde: ' + (err.error?.message || err.message || 'Erreur inconnue'),
          'Fermer',
          { duration: 5000 }
        );
        this.loading = false;
      }
    });
  }

  cancel() { 
    this.router.navigate(['/nomenclatures']); 
  }

  getTypeIcon(type: string): string {
    const found = this.typesDisponibles.find(t => t.value === type);
    return found ? found.icon : 'label';
  }
}