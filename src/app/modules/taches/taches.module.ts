import { NgModule } from '@angular/core';
import { SharedModule } from '../../shared/shared.module';

import { TachesRoutingModule } from './taches-routing.module';
import { TachesListComponent } from './pages/liste/liste.component';
import { TacheModalComponent } from './components/tache-modal/tache-modal.component';
import { TacheDetailsComponent } from './components/tache-details/tache-details.component';

@NgModule({
  declarations: [
    TachesListComponent,
    TacheModalComponent,
    TacheDetailsComponent
  ],
  imports: [
    SharedModule,
    TachesRoutingModule
  ]
})
export class TachesModule { }
