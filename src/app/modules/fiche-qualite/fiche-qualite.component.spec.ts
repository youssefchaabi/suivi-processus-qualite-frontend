import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FicheQualiteComponent } from './fiche-qualite.component';

describe('FicheQualiteComponent', () => {
  let component: FicheQualiteComponent;
  let fixture: ComponentFixture<FicheQualiteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FicheQualiteComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FicheQualiteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
