import { SelectionModel } from '@angular/cdk/collections';
import { Component, Input, OnInit, Output, EventEmitter, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { InventoryService } from 'app/modules/admin/apps/ecommerce/inventory/inventory.service';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, filter, finalize, switchMap, takeUntil, tap } from 'rxjs/operators';

@Component({
  selector: 'app-licensing-terms',
  templateUrl: './licensing-terms.component.html'
})
export class ProductLicensingTermsComponent implements OnInit, OnDestroy {
  @Input() selectedProduct: any;
  @Input() myStepper: any;
  @Input() isLoading: boolean;
  @Output() isLoadingChange = new EventEmitter<boolean>();
  private _unsubscribeAll: Subject<any> = new Subject<any>();

  licensingTerms = [];
  selectedRadioOption = null;
  termUpdateLoader = false;

  // Licensing terms table
  allCompaniess = [];
  searchCompaniesCtrl = new FormControl();
  selectedCompanies: any;
  isSearchingCompanies = false;
  totalRecords = 0;
  page = 1;
  licensingTermsLoader: boolean = false;
  isLoadMore: boolean = false;
  keyword = '';
  selectedLicensingTerms: any;
  tempUpdatedTerm: any;
  isSearchingLoader: boolean = false;

  constructor(
    private _changeDetectorRef: ChangeDetectorRef,
    private _inventoryService: InventoryService,
    private _formBuilder: FormBuilder,
    private _snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.getLicensingTermController();
  }
  getLicensingTermController() {
    let params;
    this.searchCompaniesCtrl.valueChanges.pipe(
      filter((res: any) => {
        params = {
          licensing_company: true,
          keyword: res
        }
        return res !== null && res.length >= 1
      }),
      distinctUntilChanged(),
      debounceTime(300),
      tap(() => {
        this.allCompaniess = [];
        this.isSearchingCompanies = true;
        this._changeDetectorRef.markForCheck();
      }),
      switchMap(value => this._inventoryService.getProductsData(params)
        .pipe(
          finalize(() => {
            this.isSearchingCompanies = false
            this._changeDetectorRef.markForCheck();
          }),
        )
      )
    ).subscribe((data: any) => {
      this.allCompaniess = data['data'];
    });
    this.getLicensigTermsList(1);
  }
  onSelected(ev) {
    if (!this.selectedCompanies) {
      this.selectedCompanies = ev.option.value;
      this.page = 1;
      this.licensingTerms = [];
      this.selectedLicensingTerms = null;
      this.tempUpdatedTerm = null;
      this.licensingTermsLoader = true;
      this.getLicencingTerms(this.selectedCompanies.pk_licensingCompanyID, 1);
      this._changeDetectorRef.markForCheck();
    } else if (this.selectedCompanies.pk_licensingCompanyID != ev.option.value.pk_licensingCompanyID) {
      this.selectedCompanies = ev.option.value;
      this.page = 1;
      this.getLicencingTerms(this.selectedCompanies.pk_licensingCompanyID, 1);
      this.licensingTerms = [];
      this.selectedLicensingTerms = null;
      this.tempUpdatedTerm = null;
      this.licensingTermsLoader = true;
      this._changeDetectorRef.markForCheck();
    }
  }
  displayWith(value: any) {
    return value?.name;
  }
  getLicensigTermsList(page) {
    let params = {
      licensing_company: true,
      page: page,
      size: 20
    }
    this._inventoryService.getProductsData(params).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      this.allCompaniess = res["data"];
      this.isLoading = false;
      this._changeDetectorRef.markForCheck();
    }, err => {
      this.isLoading = false;
      this._changeDetectorRef.markForCheck();
    });
  }
  getNextLicensingTerms() {
    this.page++;
    this.isLoadMore = true;
    this._changeDetectorRef.markForCheck();
    this.getLicencingTerms(this.selectedCompanies.pk_licensingCompanyID, this.page);
  }
  getLicencingTerms(id, page) {
    let params = {
      licensing_term: true,
      licensing_company_id: id,
      product_id: this.selectedProduct,
      page: page,
      keyword: this.keyword
    }
    this._inventoryService.getProductsData(params)
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((companyTerms) => {
        this.totalRecords = companyTerms["totalRecords"];
        const unselected = companyTerms["data"][0];
        const selected = companyTerms["data"][1];
        if (selected.length && !this.selectedLicensingTerms) {
          selected[0].SubCategories = JSON.parse(selected[0].SubCategories);
          this.selectedLicensingTerms = selected[0];
        }
        unselected.forEach(element => {
          if (element.SubCategories) {
            element.SubCategories = JSON.parse(element.SubCategories);
          } else {
            element.SubCategories = [];
          }
          this.licensingTerms.push(element);
        });
        this.isLoadMore = false;
        this.licensingTermsLoader = false;
        this.isSearchingLoader = false;
        this._changeDetectorRef.markForCheck();
      }, err => {
        this._snackBar.open("Some error occured", '', {
          horizontalPosition: 'center',
          verticalPosition: 'bottom',
          duration: 3500
        });
        // Mark for check
        this.isLoadMore = false;
        this.isSearchingLoader = false;
        this.licensingTermsLoader = false;
        this._changeDetectorRef.markForCheck();
      })
  }
  selectedRadio(item, term) {
    this.selectedRadioOption = item;
    term.SubCategories.forEach(element => {
      if (element.pk_licensingTermSubCategoryID == item.pk_licensingTermSubCategoryID) {
        element.IsSelected = 1;
      } else {
        element.IsSelected = 0;
      }
    });
    this.tempUpdatedTerm = term;
  }


  updateTerm(): void {
    if (!this.selectedRadioOption) {
      this._snackBar.open("Please choose any licensing term", '', {
        horizontalPosition: 'center',
        verticalPosition: 'bottom',
        duration: 3500
      });
      return;
    }
    const { fk_licensingTermID, pk_licensingTermSubCategoryID } = this.selectedRadioOption;
    const payload = {
      product_id: this.selectedProduct,
      licensing_term_id: fk_licensingTermID,
      sub_category_id: pk_licensingTermSubCategoryID,
      call_type: "update",
      licensing_term: true
    };

    this.termUpdateLoader = true;
    this._inventoryService.updateLicensingTerms(payload)
      .subscribe((response) => {
        this.termUpdateLoader = false;
        this._snackBar.open("Licensing Term Added Successfully", '', {
          horizontalPosition: 'center',
          verticalPosition: 'bottom',
          duration: 3500
        });
        this.selectedLicensingTerms = this.tempUpdatedTerm;
        this.myStepper.next();
        this._changeDetectorRef.markForCheck();
      }, err => {
        this._snackBar.open("Something went wrong", '', {
          horizontalPosition: 'center',
          verticalPosition: 'bottom',
          duration: 3500
        });
        this.termUpdateLoader = false;
        this._changeDetectorRef.markForCheck();
      });
  }

  searchKeyword(event): void {
    this.page = 1;
    this.keyword = event.target.value;
    this.licensingTerms = [];
    this.isSearchingLoader = true;
    this.getLicencingTerms(this.selectedCompanies.pk_licensingCompanyID, 1);
  }

  goBack() {
    this.myStepper.previous();
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
