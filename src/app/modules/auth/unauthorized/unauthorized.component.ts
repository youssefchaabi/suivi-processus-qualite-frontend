import { Component } from '@angular/core';

@Component({
  selector: 'app-unauthorized',
  template: `<div class="unauthorized"><h2>Accès refusé</h2><p>Vous n'avez pas les droits pour accéder à cette page.</p></div>`,
  styles: [`.unauthorized { text-align: center; margin-top: 50px; color: #c00; }`]
})
export class UnauthorizedComponent {} 