import { ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-reminders',
  templateUrl: './reminders.component.html'
})
export class RemindersComponent implements OnInit {
  @Input() currentSelectedCustomer: any;
  flashMessage: 'success' | 'error' | null = null;
  searchInputControl: FormControl = new FormControl();
  reminderForm: FormGroup;
  remindersCount: number = 0;
  isLoading: boolean = false;

  constructor(
    private _formBuilder: FormBuilder,
    private _changeDetectorRef: ChangeDetectorRef,
  ) { }

  ngOnInit(): void {
    this.reminderForm = this._formBuilder.group({
      Name: ['', Validators.required],
      alertON: ['', Validators.required],
      notes: ['']
    });
    
  }

  createReminder(): void
  {
      // Get the reminder object
      console.log(this.reminderForm.getRawValue());
  }

  
    /**
     * Show flash message
     */
     showFlashMessage(type: 'success' | 'error'): void
     {
        // Show the message
        this.flashMessage = type;

        // Mark for check
        this._changeDetectorRef.markForCheck();

        // Hide it after 3 seconds
        setTimeout(() => {

            this.flashMessage = null;

            // Mark for check
            this._changeDetectorRef.markForCheck();
        }, 3000);
    }

}
