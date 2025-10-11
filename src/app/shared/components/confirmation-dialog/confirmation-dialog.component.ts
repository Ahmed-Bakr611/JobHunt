import { Component, Inject, inject } from '@angular/core';
import {
  MatDialogActions,
  MatDialogClose,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle,
  MAT_DIALOG_DATA,
} from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';

export interface ConfirmationDialogData {
  title?: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
}

@Component({
  selector: 'jb-confirmation-dialog',
  standalone: true,
  imports: [MatButtonModule, MatDialogActions, MatDialogClose, MatDialogTitle, MatDialogContent],
  templateUrl: './confirmation-dialog.component.html',
  styleUrls: ['./confirmation-dialog.component.css'],
})
export class ConfirmationDialogComponent {
  readonly dialogRef = inject(MatDialogRef<ConfirmationDialogComponent>);

  constructor(@Inject(MAT_DIALOG_DATA) public data: ConfirmationDialogData) {}

  onConfirm(): void {
    this.dialogRef.close(true);
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }
}

/**
 * private dialog = inject(MatDialog);

  openConfirm() {
    const data: ConfirmationDialogData = {
      title: 'Delete Confirmation',
      message: 'Are you sure you want to delete this item?',
      confirmText: 'Delete',
      cancelText: 'Keep',
    };

    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '350px',
      data,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        console.log('User confirmed delete!');
      } else {
        console.log('User cancelled.');
      }
    });
  }
 */
