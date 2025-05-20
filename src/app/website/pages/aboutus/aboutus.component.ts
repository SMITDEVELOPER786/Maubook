import { Component, OnInit } from '@angular/core';
import { AboutService } from '../../../services/about.service';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Component({
  selector: 'app-aboutus',
  templateUrl: './aboutus.component.html',
  styleUrls: ['./aboutus.component.scss']
})
export class AboutusComponent implements OnInit {
 introText: SafeHtml | null = null;
    loading: boolean = true; 

  constructor(
    private aboutService: AboutService,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    this.aboutService.getAbout().subscribe((intro) => {
      console.log(intro);
      this.introText = this.sanitizer.bypassSecurityTrustHtml(intro["content"]);
      this.loading=false;
    });
  }
}
