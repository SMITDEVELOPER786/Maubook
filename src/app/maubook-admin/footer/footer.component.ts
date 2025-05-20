import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';

@Component({
  selector: 'app-footer-admin',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss']
})
export class FooterComponentAdmin implements OnInit {
  isEditing = false;
  loading = true;

  footerData = {
    copyrightText: '',
    socialLinks: {
      facebook: '',
      twitter: '',
      instagram: '',
      pinterest: ''
    }
  };

  constructor(private firestore: AngularFirestore) {}

  ngOnInit(): void {
    this.loadFooter();
  }

  loadFooter(): void {
    this.firestore
      .collection('site-config')
      .doc('footer')
      .valueChanges()
      .subscribe((data: any) => {
        if (data) {
          this.footerData = data;
        }
        this.loading = false;
      });
  }

  toggleEdit(): void {
    this.isEditing = !this.isEditing;
  }

  saveFooter(): void {
    this.firestore
      .collection('site-config')
      .doc('footer')
      .set(this.footerData, { merge: true })
      .then(() => {
        alert('Footer updated!');
        this.isEditing = false;
      });
  }
}
