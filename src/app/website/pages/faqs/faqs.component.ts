import { Component, OnInit } from '@angular/core';
import { AboutService } from '../../../services/about.service';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Component({
  selector: 'app-faq',
  templateUrl: './faqs.component.html',
  styleUrls: ['./faqs.component.scss']
})
export class FaqsComponent implements OnInit {
  introText: SafeHtml | null = null;
  loading: boolean = true;

  constructor(
    private aboutService: AboutService,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    this.aboutService.getFaq().subscribe((intro) => {
      console.log(intro);
      
      // Decode the HTML-encoded content
      const rawContent = intro["content"];
      const decodedContent = this.decodeHtml(rawContent);

      // Sanitize and trust the decoded HTML content
      this.introText = this.sanitizer.bypassSecurityTrustHtml(decodedContent);
      this.loading = false;
    });
  }

  // Helper method to decode HTML entities
  decodeHtml(html: string): string {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    return doc.body.textContent || "";
  }
}
