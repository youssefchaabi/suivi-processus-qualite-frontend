import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FicheSuiviComponent } from './fiche-suivi.component';

describe('FicheSuiviComponent', () => {
  let component: FicheSuiviComponent;
  let fixture: ComponentFixture<FicheSuiviComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FicheSuiviComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FicheSuiviComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
