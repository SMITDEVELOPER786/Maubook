import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-card-selection',
  templateUrl: './card-selection.component.html',
  styleUrls: ['./card-selection.component.scss']
})
export class CardSelectionComponent {
  cardForm: FormGroup;
  savedCards: any[] = [];
  selectedCard: any = null;
  isNewCard: boolean = false;

  constructor(
    private dialogRef: MatDialogRef<CardSelectionComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private fb: FormBuilder
  ) {
    this.cardForm = this.fb.group({
      cardNumber: ['', [Validators.required, Validators.pattern('^[0-9]{16}$')]],
      cardHolder: ['', Validators.required],
      expiryDate: ['', [Validators.required, Validators.pattern('^(0[1-9]|1[0-2])\/([0-9]{2})$')]],
      cvv: ['', [Validators.required, Validators.pattern('^[0-9]{3,4}$')]]
    });
  }

  selectCard(card: any) {
    this.selectedCard = card;
    this.isNewCard = false;
  }

  addNewCard() {
    this.isNewCard = true;
    this.selectedCard = null;
  }

  onSubmit() {
    if (this.cardForm.valid) {
      const cardData = this.cardForm.value;
      this.dialogRef.close(cardData);
    }
  }

  close() {
    this.dialogRef.close();
  }
} 