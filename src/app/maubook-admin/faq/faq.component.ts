import {
  Component,
  OnInit,
  ViewChild,
  ElementRef,
  AfterViewInit,
} from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { AboutService } from '../../services/about.service'; // Use AboutService

@Component({
  selector: 'faq-questions',
  templateUrl: './faq.component.html',
  styleUrls: ['./faq.component.scss'],
})
export class faqComponent implements OnInit, AfterViewInit {
  privacyContent: SafeHtml = '';  // Safe HTML content for display
  privacyRawContent: string = '';      // Raw HTML content for editing
  privacySafeText: string = '';        // Plain text for display mode (without HTML tags)
  isEditing: boolean = false;

  @ViewChild('editor') editorRef!: ElementRef<HTMLDivElement>;

  constructor(
    private sanitizer: DomSanitizer,  // Sanitize HTML content
    private aboutService: AboutService  // Use AboutService to fetch and save Privacy Policy content
  ) {}

  ngOnInit(): void {
    // Fetch the privacy policy content using AboutService
    this.aboutService.getFaq().subscribe((data: { content: string }) => {
      this.privacyRawContent = data?.content || '';
      this.privacyContent = this.sanitizer.bypassSecurityTrustHtml(this.privacyRawContent);
      this.privacySafeText = this.stripHtml(this.privacyRawContent); // Prepare plain text for display
    });
  }

  ngAfterViewInit(): void {
    this.setPrivacyPolicyEditorContent();
  }

  togglePrivacyPolicyEdit(): void {
    this.isEditing = !this.isEditing;
    setTimeout(() => this.setPrivacyPolicyEditorContent(), 0);
  }

  setPrivacyPolicyEditorContent(): void {
    if (this.isEditing && this.editorRef) {
      this.editorRef.nativeElement.innerHTML = this.privacyRawContent;
    }
  }

  onPrivacyPolicyEditorChange(event: Event): void {
    this.privacyRawContent = (event.target as HTMLElement).innerHTML;
  }

  // Save the updated privacy policy content
  savePrivacyPolicy(): void {
    this.aboutService.updateFaq(this.privacyRawContent).then(() => {
      this.privacyContent = this.sanitizer.bypassSecurityTrustHtml(this.privacyRawContent);
      this.privacySafeText = this.stripHtml(this.privacyRawContent); // Update plain text for display
      this.isEditing = false;
      alert('Privacy Policy content saved!');
    }).catch(error => {
      console.error('Error saving privacy policy:', error);
      alert('Error saving content!');
    });
  }

  stripHtml(html: string): string {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    return doc.body.textContent || ''; // Strip all HTML tags and return plain text
  }

  format(command: string): void {
    document.execCommand(command, false);
  }
}
