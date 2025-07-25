import { TestBed } from '@angular/core/testing';

import { FicheSuiviService } from './fiche-suivi.service';

describe('FicheSuiviService', () => {
  let service: FicheSuiviService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FicheSuiviService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
