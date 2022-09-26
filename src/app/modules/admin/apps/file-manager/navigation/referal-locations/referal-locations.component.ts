import { ChangeDetectorRef, Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subject } from 'rxjs';
import { FileManagerService } from '../../store-manager.service';
import { takeUntil } from 'rxjs/operators';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-referal-locations',
  templateUrl: './referal-locations.component.html'
})
export class ReferalLocationsComponent implements OnInit, OnDestroy {

  mainScreen: string = "Referral Locations";
  screens = [
    "Referral Locations",
    "Add New Referral Location"
  ];
  dataSourceLoading: boolean = false;
  @Input() selectedStore: any;
  @Input() isLoading: boolean;
  @Output() isLoadingChange = new EventEmitter<boolean>();
  private _unsubscribeAll: Subject<any> = new Subject<any>();
  dataSource: any;
  contactForm: FormGroup;
  referralForm: FormGroup;
  displayedColumns: string[] = ['Primary', 'User', 'Location', 'Revised', 'Action'];
  panelOpenState = false;
  constructor(
    private _fileManagerService: FileManagerService,
    private _changeDetectorRef: ChangeDetectorRef,
    private _snackBar: MatSnackBar,
    private fb: FormBuilder
  ) { }

  ngOnInit() {
    this.contactForm = this.fb.group({
      contacts: new FormArray([])
    });
    this.referralForm = this.fb.group({
      locations: new FormArray([])
    });
    this.getContactList()
  }
  getContactList() {
    this.dataSourceLoading = true;
    let params = {
      store_id: this.selectedStore.pk_storeID,
      referral_location: true
    }
    this._fileManagerService.getStoresData(params)
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe(res => {
        this.dataSourceLoading = false;
        this.dataSource = res["data"];
        for (let i = 0; i < res["data"].length; i++) {
          this.contactListArray.push(this.fb.group({
            'name': this.dataSource[i] && this.dataSource[i].name ? this.dataSource[i].name : '',
            'contactEmail': this.dataSource[i] && this.dataSource[i].contactEmail ? this.dataSource[i].contactEmail : '',
            'contactFax': this.dataSource[i] && this.dataSource[i].contactFax ? this.dataSource[i].contactFax : '',
            'contactAddress': this.dataSource[i] && this.dataSource[i].contactAddress ? this.dataSource[i].contactAddress : '',
            'contactCity': this.dataSource[i] && this.dataSource[i].contactCity ? this.dataSource[i].contactCity : '',
            'contactState': this.dataSource[i] && this.dataSource[i].contactState ? this.dataSource[i].contactState : '',
            'contactZip': this.dataSource[i] && this.dataSource[i].contactZip ? this.dataSource[i].contactZip : '',
            'checkPayableTo': this.dataSource[i] && this.dataSource[i].checkPayableTo ? this.dataSource[i].checkPayableTo : '',
            'percentage': this.dataSource[i] && this.dataSource[i].percentage ? this.dataSource[i].percentage : '',
            'state': this.dataSource[i] && this.dataSource[i].state ? this.dataSource[i].state : '',
            'contactName': this.dataSource[i] && this.dataSource[i].contactName ? this.dataSource[i].contactName : '',
            'contactPhone': this.dataSource[i] && this.dataSource[i].contactPhone ? this.dataSource[i].contactPhone : '',
            'pk_referralID': this.dataSource[i] && this.dataSource[i].pk_referralID ? this.dataSource[i].pk_referralID : ''
          }));
        }
        this._changeDetectorRef.markForCheck();
      })
  }
  calledScreen(screenName): void {
    this.mainScreen = screenName;
  };
  get contactListArray(): FormArray {
    return this.contactForm.get('contacts') as FormArray;
  }
  get lcoationsListArray(): FormArray {
    return this.referralForm.get('locations') as FormArray;
  }
  ngOnDestroy(): void {
    // Unsubscribe from all subscriptions
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  };
}
