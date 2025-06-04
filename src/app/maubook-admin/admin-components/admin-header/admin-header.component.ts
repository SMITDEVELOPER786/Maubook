import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { AppearanceService } from '../../services/appearance.service';

@Component({
  selector: 'app-admin-header',
  templateUrl: './admin-header.component.html',
  styleUrls: ['./admin-header.component.scss'],
})
export class AdminHeaderComponent implements OnInit {
  logoUrl$ = this.appearanceService.getLogoUrl();

  constructor(private appearanceService: AppearanceService) {}

  ngOnInit() {
    this.logoUrl$ = this.appearanceService.getLogoUrl();
  }
}
