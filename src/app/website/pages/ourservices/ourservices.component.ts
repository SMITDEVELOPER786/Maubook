import { Component, OnInit } from '@angular/core';
import { AboutService } from '../../../services/about.service';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

interface ContactInfo {
  name: string;
  email: string;
  location: string;
  details: string;
}


@Component({
  selector: 'app-aboutus',
  templateUrl: './ourservices.component.html',
  styleUrls: ['./ourservices.component.scss']
})


export class ourServiceComponent implements OnInit {
   services: any[] = [];
    loading: boolean = true; 

  constructor(
    private aboutService: AboutService,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    this.aboutService.getService().subscribe((intro) => {
      console.log(intro[0]);
      this.services=intro
      this.loading=false;
      

    });
  }
}
