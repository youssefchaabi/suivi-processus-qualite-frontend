/**
 * Modèle Nomenclature
 */
export interface Nomenclature {
  id?: string;
  type: NomenclatureType;
  code?: string;
  libelle?: string;
  description?: string;
  actif: boolean;
  ordre?: number;
  dateCreation?: string;
  dateModification?: string;
}

/**
 * Types de nomenclatures
 */
export type NomenclatureType = 
  | 'TYPE_FICHE' 
  | 'STATUT' 
  | 'CATEGORIE_PROJET' 
  | 'PRIORITE'
  | 'KPI';

/**
 * DTO pour création/mise à jour nomenclature
 */
export interface NomenclatureDto {
  type: NomenclatureType;
  code?: string;
  libelle?: string;
  description?: string;
  actif: boolean;
  ordre?: number;
}

/**
 * Nomenclatures groupées par type
 */
export interface NomenclatureGroup {
  type: NomenclatureType;
  items: Nomenclature[];
  count: number;
}
