import { Component, OnInit } from '@angular/core';
import { AboutService } from '../../../services/about.service';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss']
})
export class FooterComponent implements OnInit {
  footerData: any;

  constructor(private aboutService: AboutService) {}

  ngOnInit(): void {
    this.aboutService.getFooter().subscribe(data => {
      this.footerData = data;
      console.log(data[0])
    });
  }
}
