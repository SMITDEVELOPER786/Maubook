import {
  Component,
  OnInit,
  ViewChild,
  ElementRef,
  AfterViewInit,
} from '@angular/core';
import { AboutService } from '../../services/about.service';

@Component({
  selector: 'app-about',
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.scss'],
})
export class AboutComponent implements OnInit, AfterViewInit {
  aboutContent: string = '';
  isEditing: boolean = false;

  @ViewChild('editor') editorRef!: ElementRef<HTMLDivElement>;

  constructor(private aboutService: AboutService) {}

  ngOnInit(): void {
    this.aboutService.getAbout().subscribe((data) => {
      this.aboutContent = data?.content || '';
    });
  }

  ngAfterViewInit(): void {
    this.setEditorContent();
  }

  toggleEdit(): void {
    this.isEditing = !this.isEditing;
    setTimeout(() => this.setEditorContent(), 0); // Wait for DOM update
  }

  setEditorContent(): void {
    if (this.isEditing && this.editorRef) {
      this.editorRef.nativeElement.innerHTML = this.aboutContent;
    }
  }

  onEditorChange(event: Event): void {
    this.aboutContent = (event.target as HTMLElement).innerHTML;
  }

  save(): void {
    this.aboutService.updateAbout(this.aboutContent).then(() => {
      alert('Content saved!');
      this.isEditing = false;
    });
  }

  format(command: string): void {
    document.execCommand(command, false);
  }
}
