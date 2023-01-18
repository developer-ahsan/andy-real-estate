import { Component, Input, OnInit, ChangeDetectorRef, OnDestroy, ViewChild } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, filter, finalize, switchMap, takeUntil, tap } from 'rxjs/operators';
import { VendorsService } from '../../vendors.service';
import { AddCompany } from '../../vendors.types';
@Component({
  selector: 'app-new-vendors',
  templateUrl: './new-vendors.component.html',
  styles: [".mat-paginator {border-radius: 16px !important}"]
})
export class NewVendorsComponent implements OnInit, OnDestroy {
  @ViewChild('paginator') paginator: MatPaginator;
  @Input() isLoading: boolean;
  // @Output() isLoadingChange = new EventEmitter<boolean>();
  private _unsubscribeAll: Subject<any> = new Subject<any>();


  allStates = [];
  totalStates = 0;

  searchStateCtrl = new FormControl();
  selectedState: any;
  isSearchingState = false;

  addCompanyForm: FormGroup;
  isAddLoader: boolean = false;
  constructor(
    private _changeDetectorRef: ChangeDetectorRef,
    private _vendorService: VendorsService
  ) { }

  initForm() {
    this.addCompanyForm = new FormGroup({
      companyName: new FormControl(''),
      address: new FormControl(''),
      city: new FormControl(''),
      zipCode: new FormControl(''),
      phone: new FormControl(''),
      fax: new FormControl(''),
      ASI: new FormControl(''),
      PPAI: new FormControl(''),
      artworkEmail: new FormControl(''),
      ordersEmail: new FormControl(''),
      websiteURL: new FormControl(''),
      outsideRep: new FormControl(''),
      insideRep: new FormControl(''),
      outsideRepPhone: new FormControl(''),
      outsideRepEmail: new FormControl(''),
      insideRepPhone: new FormControl(''),
      insideRepEmail: new FormControl(''),
      samplesContactEmail: new FormControl(''),
      companyType: new FormControl([1])
    });
  }
  ngOnInit(): void {
    this.initForm();
    this.getStatesObservable();
    let params;
    this.searchStateCtrl.valueChanges.pipe(
      filter((res: any) => {
        params = {
          states: true,
          keyword: res
        }
        return res !== null
      }),
      distinctUntilChanged(),
      debounceTime(300),
      tap(() => {
        this.allStates = [];
        this.isSearchingState = true;
        this._changeDetectorRef.markForCheck();
      }),
      switchMap(value => this._vendorService.getVendorsData(params)
        .pipe(
          finalize(() => {
            this.isSearchingState = false
            this._changeDetectorRef.markForCheck();
          }),
        )
      )
    ).subscribe((data: any) => {
      this.allStates = data['data'];
    });
  };

  getStatesObservable() {
    this._vendorService.States$.pipe(takeUntil(this._unsubscribeAll)).subscribe(states => {
      this.allStates = states["data"];
      this.totalStates = states["totalRecords"];
      this.searchStateCtrl.setValue({ state: this.allStates[0].state });
      this.selectedState = this.allStates[0];
    });
  }
  onSelected(ev) {
    this.selectedState = ev.option.value;
  }

  displayWith(value: any) {
    return value?.state;
  }
  onBlur() {
    this.searchStateCtrl.setValue({ state: this.selectedState.state });
  }
  // Create New Company
  addNewCompany() {
    const { companyName, address, city, zipCode, phone, fax, ASI, PPAI, artworkEmail, ordersEmail, websiteURL, outsideRep, insideRep, outsideRepPhone, outsideRepEmail, insideRepPhone, insideRepEmail, samplesContactEmail, companyType } = this.addCompanyForm.getRawValue();
    if (companyName == '' || address == '' || city == '' || phone == '' || zipCode == '') {
      this._vendorService.snackBar('Please fill out the required fields');
      return;
    }
    let payload: AddCompany = {
      companyName, address, city, zipCode, phone, fax, ASI, PPAI, artworkEmail, ordersEmail, websiteURL, outsideRep, insideRep, outsideRepPhone, outsideRepEmail, insideRepPhone, insideRepEmail, samplesContactEmail, companyType, state: this.selectedState.state, create_company: true
    }
    this.isAddLoader = true;
    this._vendorService.postVendorsData(payload).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      if (res["success"]) {
        this._vendorService.getAllvendorsSuppliers().pipe(finalize(() => {
          this._vendorService.snackBar(res["message"]);
          this.isAddLoader = false;
          this.initForm();
          this._changeDetectorRef.markForCheck();
        })).subscribe();
      } else {
        this.isAddLoader = false;
        this._vendorService.snackBar(res["message"]);
      }
      this._changeDetectorRef.markForCheck();
    }, err => {
      this._vendorService.snackBar('Something went wrong');
      this.isAddLoader = false;
      this._changeDetectorRef.markForCheck();
    })
  }
  /**
     * On destroy
     */
  ngOnDestroy(): void {
    // Unsubscribe from all subscriptions
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  };

}
