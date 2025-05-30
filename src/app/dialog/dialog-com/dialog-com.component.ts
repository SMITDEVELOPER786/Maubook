import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-dialog-com',
  templateUrl: './dialog-com.component.html',
  styleUrls: ['./dialog-com.component.scss'],
})
export class DialogComComponent {
  constructor(
    public dialogRef: MatDialogRef<DialogComComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { title: string; message: string }
  ) {}

  onConfirm(): void {
    this.dialogRef.close(true);
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }
}
