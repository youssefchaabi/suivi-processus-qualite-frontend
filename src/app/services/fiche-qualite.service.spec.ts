import { TestBed } from '@angular/core/testing';

import { FicheQualiteService } from './fiche-qualite.service';

describe('FicheQualiteService', () => {
  let service: FicheQualiteService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FicheQualiteService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
