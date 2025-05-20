import {
  Component,
  OnInit,
  ViewChild,
  ElementRef,
  AfterViewInit,
} from '@angular/core';
import { AboutService } from '../../services/about.service';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Component({
  selector: 'app-about',
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.scss'],
})
export class AboutComponent implements OnInit, AfterViewInit {
  aboutContent: SafeHtml = '';  // Safe HTML content for display
  rawContent: string = '';      // Raw HTML content for editing
  safeText: string = '';        // Plain text for display mode (without HTML tags)
  isEditing: boolean = false;

  @ViewChild('editor') editorRef!: ElementRef<HTMLDivElement>;

  constructor(
    private aboutService: AboutService,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    this.aboutService.getAbout().subscribe((data) => {
      this.rawContent = data?.content || '';
      this.aboutContent = this.sanitizer.bypassSecurityTrustHtml(this.rawContent);
      this.safeText = this.stripHtml(this.rawContent); // Prepare plain text for display
    });
  }

  ngAfterViewInit(): void {
    this.setEditorContent();
  }

  toggleEdit(): void {
    this.isEditing = !this.isEditing;
    setTimeout(() => this.setEditorContent(), 0);
  }

  setEditorContent(): void {
    if (this.isEditing && this.editorRef) {
      this.editorRef.nativeElement.innerHTML = this.rawContent;
    }
  }

  onEditorChange(event: Event): void {
    this.rawContent = (event.target as HTMLElement).innerHTML;
  }

  save(): void {
    this.aboutService.updateAbout(this.rawContent).then(() => {
      this.aboutContent = this.sanitizer.bypassSecurityTrustHtml(this.rawContent);
      this.safeText = this.stripHtml(this.rawContent); // Update plain text for display
      this.isEditing = false;
      alert('Content saved!');
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
