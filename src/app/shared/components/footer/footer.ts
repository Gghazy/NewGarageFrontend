import { Component } from '@angular/core';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.html',
  styleUrl: './footer.css',
  standalone: false
})
export class Footer {
  year = new Date().getFullYear();
}
