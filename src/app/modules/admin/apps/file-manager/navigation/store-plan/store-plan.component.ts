import { Component, Input, Output, OnInit, EventEmitter, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { FileManagerService } from 'app/modules/admin/apps/file-manager/store-manager.service';
import { takeUntil } from 'rxjs/operators';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FormControl, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-store-plan',
  templateUrl: './store-plan.component.html'
})
export class StorePlanComponent implements OnInit, OnDestroy {

  selectedStore: any;
  isLoading: boolean;
  @Output() isLoadingChange = new EventEmitter<boolean>();
  private _unsubscribeAll: Subject<any> = new Subject<any>();
  displayedColumns: string[] = ['quarter', 'director', 'created', 'updated', 'submitted'];
  dataSource = [];
  dataSourceLoading = false;

  isEditStorePlan: boolean = false;
  storePlanForm: FormGroup;

  isEditStorePlanData: any;
  isEditStorePlanForm: FormGroup;
  isEditStoreLoader: boolean = false;
  constructor(
    private _storeManagerService: FileManagerService,
    private _changeDetectorRef: ChangeDetectorRef,
    private _snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.getStoreDetails();
  };
  getStoreDetails() {
    this._storeManagerService.storeDetail$
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((items: any) => {
        this.selectedStore = items["data"][0];
        this.initialize();
        this.dataSourceLoading = true;
        this.getDataPlans('get');
      });
  }
  initialize() {
    this.isEditStorePlanForm = new FormGroup({
      reportId: new FormControl(''),
      lastUpdated: new FormControl(''),
      question1: new FormControl(''),
      question2: new FormControl(''),
      question3: new FormControl(''),
      rule5: new FormControl(''),
      rule4: new FormControl(''),
      rule3: new FormControl(''),
      rule2b: new FormControl(''),
      rule2a: new FormControl(''),
      rule1: new FormControl(''),
      rule2bExample1: new FormControl(''),
      rule2bExample2: new FormControl(''),
      rule2bExample3: new FormControl(''),
      update_store_plan: new FormControl(true)
    })
  }
  getDataPlans(type) {
    let params = {
      store_id: this.selectedStore.pk_storeID,
      store_plan: true
    }
    // Get the offline products
    this._storeManagerService.getStoresData(params)
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((response: any) => {
        this.dataSource = response["data"];
        this.dataSourceLoading = false;
        if (type == 'update') {
          this.isEditStoreLoader = false;
          this._snackBar.open('Store Plan Update Successfully', '', {
            horizontalPosition: 'center',
            verticalPosition: 'bottom',
            duration: 3500
          });
          this.backToStorePlanList()
        }
        // Mark for check
        this._changeDetectorRef.markForCheck();
      });
  }
  editStorePlan(obj) {
    this.isEditStorePlan = true;
    this.isEditStorePlanData = obj;
    this.isEditStorePlanForm.patchValue({
      reportId: obj.pk_reportID
    })
    this.isEditStorePlanForm.patchValue(obj);
  }
  backToStorePlanList() {
    this.isEditStorePlan = false;
  }
  ngOnDestroy(): void {
    // Unsubscribe from all subscriptions
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  };
  updateStorePlan() {
    this.isEditStoreLoader = true;
    this._storeManagerService.putStoresData(this.isEditStorePlanForm.value).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      this.getDataPlans('update')
      this._changeDetectorRef.markForCheck();
    }, err => {
      this.isEditStoreLoader = false;
      this._changeDetectorRef.markForCheck();
    })
  }
}
