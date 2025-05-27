import { Component, OnInit } from '@angular/core';
import { AboutService } from '../../services/about.service';

@Component({
  selector: 'choose-us',
  templateUrl: './chooseUs.component.html',
  styleUrls: ['./chooseUs.component.scss'],
})
export class chooseUsComponent implements OnInit {
  chooseUsList: { title: string; detail: string }[] = [];
  isEditing: boolean = false;

  constructor(private aboutService: AboutService) {}

  ngOnInit(): void {
  this.aboutService.getChooseUs().subscribe((data: any) => {
    this.chooseUsList = data?.items.items || []; // ✅ Extract the array
    console.log('Choose Us data:', this.chooseUsList);
  });
}

  toggleEdit(): void {
    this.isEditing = !this.isEditing;
  }

  addComponent(): void {
    this.chooseUsList.push({ title: '', detail: '' });
  }

  removeComponent(index: number): void {
    this.chooseUsList.splice(index, 1);
  }

 saveComponents(): void {
  const isValid = this.chooseUsList.every(item => item.title.trim() && item.detail.trim());
  if (!isValid) {
    alert('Please fill all titles and details before saving.');
    return;
  }

  const payload = { items: this.chooseUsList };
  this.aboutService.updateChooseUs(payload)
    .then(() => {
      alert('Updated successfully!');
      this.isEditing = false;
    })
    .catch(error => {
      console.error('Save failed:', error);
      alert('Failed to save data.');
    });
}

}
