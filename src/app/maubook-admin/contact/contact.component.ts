import {
  Component,
  OnInit,
  ViewChild,
  ElementRef,
  AfterViewInit
} from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';

interface ContactInfo {
  name: string;
  email: string;
  location: string;
  details: string;
}


@Component({
  selector: 'app-contact',
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.scss']
})
export class ContactComponent implements OnInit, AfterViewInit {
  name: string = '';
  email: string = '';
  location: string = '';
  details: string = '';
  isEditing: boolean = false;

  @ViewChild('editor') editorRef!: ElementRef<HTMLDivElement>;

  constructor(private firestore: AngularFirestore) {}

  

  ngOnInit(): void {
    this.firestore.collection('contact').doc('contactInfo').get().subscribe(doc => {
      const data = doc.data() as ContactInfo;
      if (data) {
        this.name = data['name'] || '';
        this.email = data['email'] || '';
        this.location = data['location'] || '';
        this.details = data['details'] || '';
      }
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
      this.editorRef.nativeElement.innerHTML = this.details;
    }
  }

  onEditorChange(event: Event): void {
    this.details = (event.target as HTMLElement).innerHTML;
  }

  save(): void {
    const data = {
      name: this.name,
      email: this.email,
      location: this.location,
      details: this.details
    };

    this.firestore.collection('contact').doc('contactInfo').set(data).then(() => {
      alert('Contact info saved!');
      this.isEditing = false;
    });
  }

  format(command: string): void {
    document.execCommand(command, false);
  }
}
