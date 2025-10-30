export interface Nomenclature {
  id?: string;
  type: string;
  code: string;
  libelle: string;
  description?: string;
  actif: boolean;
  ordre?: number;
  dateCreation?: Date;
  dateModification?: Date;
}
