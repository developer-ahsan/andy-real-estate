import { ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { MatOption } from '@angular/material/core';
import { MatSelect } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subject } from 'rxjs';
import { FileManagerService } from '../../store-manager.service';

@Component({
  selector: 'app-royalties',
  templateUrl: './royalties.component.html',
  styles: ['::ng-deep {.ql-container {height: auto}}']
})
export class RoyaltiesComponent implements OnInit {
  @ViewChild('select') select: MatSelect;
  @Input() selectedStore: any;
  @Input() isLoading: boolean;
  @Output() isLoadingChange = new EventEmitter<boolean>();
  private _unsubscribeAll: Subject<any> = new Subject<any>();
  quillModules: any = {
    toolbar: [
      ["bold", "italic", "underline", "strike"],
      ["blockquote", "code-block"],
      [{ color: [] }, { background: ["white"] }],
      [{ font: [] }],
      [{ align: [] }],
      ["clean"],
    ],
  };

  includeCheckArray = [
    { value: 'Include shipping', viewValue: 'Include shipping' },
    { value: 'Include runs', viewValue: 'Include runs' },
    { value: ' Include setups', viewValue: ' Include setups' },
    { value: ' Has cost', viewValue: ' Has cost' },
    { value: 'Has price', viewValue: 'Has price' },
    { value: 'Checkout option', viewValue: 'Checkout option' },
    { value: 'Require during checkout', viewValue: 'Require during checkout' }
  ]
  allSelected: boolean = false;
  data = [1, 2, 3];
  royalityForm: FormGroup;

  constructor(
    private _fileManagerService: FileManagerService,
    private _changeDetectorRef: ChangeDetectorRef,
    private _snackBar: MatSnackBar,
    private fb: FormBuilder
  ) { }

  ngOnInit() {
    this.royalityForm = this.fb.group({
      royalities: new FormArray([])
    });
    for (let i = 0; i < this.data.length; i++) {
      this.royalityListArray.push(this.fb.group({
        // 'primary': this.data[i] && this.data[i].blnPrimary ? this.data[i].blnPrimary : '',
      }));
    }
  }
  get royalityListArray(): FormArray {
    return this.royalityForm.get('royalities') as FormArray;
  }

  toggleAllSelection() {
    if (this.allSelected) {
      this.select.options.forEach((item: MatOption) => item.select());
    } else {
      this.select.options.forEach((item: MatOption) => item.deselect());
    }
  }
  optionClick() {
    let newStatus = true;
    this.select.options.forEach((item: MatOption) => {
      if (!item.selected) {
        newStatus = false;
      }
    });
    this.allSelected = newStatus;
  }
}
