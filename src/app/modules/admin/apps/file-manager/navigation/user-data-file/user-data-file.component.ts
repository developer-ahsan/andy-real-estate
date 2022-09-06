import { Component, Input, Output, OnInit, EventEmitter, ChangeDetectorRef, ViewChild } from '@angular/core';
import { Subject } from 'rxjs';
import { FileManagerService } from 'app/modules/admin/apps/file-manager/file-manager.service';
import { takeUntil } from 'rxjs/operators';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatSelect } from '@angular/material/select';
import { MatOption } from '@angular/material/core';
@Component({
  selector: 'app-user-data-file',
  templateUrl: './user-data-file.component.html',
  styles: ['.select-all{margin: 5px 17px;}']
})
export class UserDataFileComponent implements OnInit {
  
  @ViewChild('select') select: MatSelect;
  @Input() selectedStore: any;
  @Input() isLoading: boolean;
  @Output() isLoadingChange = new EventEmitter<boolean>();
  private _unsubscribeAll: Subject<any> = new Subject<any>();

  includeCheckArray = [
    {value: 'Title', viewValue: 'Title'},
    {value: 'Company Name', viewValue: 'Company Name'},
    {value: 'Location', viewValue: 'Location'},
    {value: 'Address 1', viewValue: 'Address 1'},
    {value: 'Address 2', viewValue: 'Address 2'},
    {value: 'City', viewValue: 'City'},
    {value: 'State', viewValue: 'State'},
    {value: 'Zip code', viewValue: 'Zip code'},
    {value: 'Zip Code Extension', viewValue: 'Zip Code Extension'},
    {value: 'Email', viewValue: 'Email'},
    {value: 'Phone', viewValue: 'Phone'},
    {value: 'Active', viewValue: 'Active'},
    {value: 'Registered Date', viewValue: 'Registered Date'}
  ]
  allSelected=false;
  constructor(
    private _fileManagerService: FileManagerService,
    private _changeDetectorRef: ChangeDetectorRef,
    private _snackBar: MatSnackBar
  ) { }

  ngOnInit() {
    this.isLoadingChange.emit(false);
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
