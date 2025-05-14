import { Component } from '@angular/core';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent {
    selected: string = 'about'; // default selection

  select(section: string) {
    this.selected = section;
  }

}
