import { Component, Input, OnInit, Output, EventEmitter, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, filter, finalize, switchMap, takeUntil, tap } from 'rxjs/operators';
import { InventoryService } from 'app/modules/admin/apps/ecommerce/inventory/inventory.service';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatRadioChange } from '@angular/material/radio';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-licensing-term',
  templateUrl: './licensing-term.component.html'
})
export class LicensingTermComponent implements OnInit, OnDestroy {
  selectedProduct: any;
  isLoading: boolean;
  @Output() isLoadingChange = new EventEmitter<boolean>();
  private _unsubscribeAll: Subject<any> = new Subject<any>();

  licensingTerms = [];
  searchLicensingTerms = [];
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
    public _inventoryService: InventoryService,
    private _formBuilder: FormBuilder,
    private _snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.getLicensingTermController();
    this.getProductDetail();
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
      // this.selectedLicensingTerms = null;
      this.tempUpdatedTerm = null;
      this.licensingTermsLoader = true;
      this.getLicencingTerms(this.selectedCompanies.pk_licensingCompanyID, 1);
      this._changeDetectorRef.markForCheck();
    } else if (this.selectedCompanies.pk_licensingCompanyID != ev.option.value.pk_licensingCompanyID) {
      this.selectedCompanies = ev.option.value;
      this.page = 1;
      this.getLicencingTerms(this.selectedCompanies.pk_licensingCompanyID, 1);
      this.licensingTerms = [];
      // this.selectedLicensingTerms = null;
      this.tempUpdatedTerm = null;
      this.licensingTermsLoader = true;
      this._changeDetectorRef.markForCheck();
    }
  }
  displayWith(value: any) {
    return value?.name;
  }
  getSelectedTerms() {
    let params = {
      selected_licensing_term: true,
      product_id: this.selectedProduct.pk_productID
    }
    this._inventoryService.getProductsData(params).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      let selected: any;
      if (res["selected_term"].length > 0) {
        selected = res["selected_term"][0];
      }
      let subCategories = null;
      if (res["sub_categories"].length > 0) {
        subCategories = res["sub_categories"];
      }
      let data: any
      if (subCategories) {
        data = {
          pk_licensingTermID: null,
          SubCategories: [],
          term: '',
          IsSelected: false
        };
        subCategories.forEach(element => {
          let is_selected = 0;
          if (selected.fk_licensingTermSubCategoryID == element.pk_licensingTermSubCategoryID) {
            is_selected = 1;
          }
          data.pk_licensingTermID = element.fk_licensingTermID;
          data.term = element.term;
          data.SubCategories.push({
            IsSelected: is_selected,
            fk_licensingTermID: selected.fk_licensingTermID,
            name: element.name,
            pk_licensingTermSubCategoryID: element.pk_licensingTermSubCategoryID
          })
        });
      }
      this.selectedLicensingTerms = data;

      this.isLoading = false;
      this._changeDetectorRef.markForCheck();
    }, err => {
      this.isLoading = false;
      this
    });
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
  getProductDetail() {
    this.isLoading = true;
    this._inventoryService.product$.pipe(takeUntil(this._unsubscribeAll)).subscribe((details) => {
      if (details) {
        this.selectedProduct = details["data"][0];
        this.getSelectedTerms();
      }
    });
  }
  getNextLicensingTerms() {
    this.page++;
    this.isLoadMore = true;
    this._changeDetectorRef.markForCheck();
    this.getLicencingTerms(this.selectedCompanies.pk_licensingCompanyID, this.page);
  }
  getLicencingTerms(id, page) {
    const { pk_productID } = this.selectedProduct;
    let params = {
      all_licensing_categories_subcategories: true,
      company_id: id,
      product_id: pk_productID,
      page: page,
      size: 20,
      keyword: this.keyword
    }
    this._inventoryService.getProductsData(params)
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((companyTerms) => {
        if (companyTerms["data"][0].LicensingTerms) {
          const licensingTermsData = companyTerms["data"][0].LicensingTerms.split('##');
          const licensingTerms = [];

          licensingTermsData.forEach(licensingTermData => {
            const [lTerm, subTerms] = licensingTermData.split('|=|');
            const [pk_licensingTermID, term] = lTerm.split('||');
            const SubCategories = subTerms.split(',,').map(catData => {
              const [pk_licensingTermSubCategoryID, name] = catData.split('::');
              return { pk_licensingTermSubCategoryID, name, fk_licensingTermID: pk_licensingTermID };
            });

            SubCategories.sort((a, b) => a.name.localeCompare(b.name));

            licensingTerms.push({ pk_licensingTermID, term, SubCategories });
          });

          licensingTerms.sort((a, b) => a.term.localeCompare(b.term));
          this.licensingTerms = licensingTerms;
          this.searchLicensingTerms = licensingTerms;
        }

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
    const { pk_productID } = this.selectedProduct;
    const { fk_licensingTermID, pk_licensingTermSubCategoryID } = this.selectedRadioOption;
    const payload = {
      product_id: pk_productID,
      licensing_term_id: fk_licensingTermID,
      sub_category_id: Number(pk_licensingTermSubCategoryID),
      call_type: "update",
      licensing_term: true
    };

    this.termUpdateLoader = true;
    this._inventoryService.updateLicensingTerms(payload)
      .subscribe((response) => {
        this.termUpdateLoader = false;
        this._snackBar.open("Updated Successfull", '', {
          horizontalPosition: 'center',
          verticalPosition: 'bottom',
          duration: 3500
        });
        this.selectedLicensingTerms = this.tempUpdatedTerm;
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
    if (event.target.value == '') {
      this.licensingTerms = this.searchLicensingTerms;
      return;
    }
    const results = [];

    this.searchLicensingTerms.forEach(licensingTerm => {
      // Check if the keyword matches the term property of the licensingTerm
      if (licensingTerm.term.toLowerCase().includes(event.target.value.toLowerCase())) {
        results.push(licensingTerm);
      } else {
        // Check the subcategories for a matching event.target.value
        const matchingSubCategories = licensingTerm.SubCategories.filter(subCategory =>
          subCategory.name.toLowerCase().includes(event.target.value.toLowerCase())
        );

        if (matchingSubCategories.length > 0) {
          results.push({ ...licensingTerm, SubCategories: matchingSubCategories });
        }
      }
    });

    this.licensingTerms = results;
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
