import { ENTER, COMMA } from '@angular/cdk/keycodes';
import { Component, Input, OnInit, Output, EventEmitter, ChangeDetectorRef, OnDestroy, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatChipInputEvent } from '@angular/material/chips';
import { MatPaginator } from '@angular/material/paginator';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, filter, finalize, switchMap, takeUntil, tap } from 'rxjs/operators';
import { SystemService } from '../../system.service';
import { AddNewNode, AddPromoCode, ClearStoreRapidbuild, DeleteImprintColor, DeleteNode, DeletePromoCode, UpdateImprintMethod, UpdateNode, UpdatePromoCode } from '../../system.types';
import moment from 'moment';
@Component({
  selector: 'app-admin-structure',
  templateUrl: './admin-structure.component.html',
  styles: [".mat-paginator {border-radius: 16px !important} .mat-accordion .mat-expansion-panel {--tw-shadow: 0 0px 0px 0}"]
})
export class AdminStructureComponent implements OnInit, OnDestroy {
  @ViewChild('paginator') paginator: MatPaginator;
  @Input() isLoading: boolean;
  @Output() isLoadingChange = new EventEmitter<boolean>();
  private _unsubscribeAll: Subject<any> = new Subject<any>();

  dataSource = [];
  totalRecords = 0;
  page = 1;

  isViewMoreLoader: boolean = false;

  isSubCategory: boolean = false;
  subCatData: any;
  catPage = 0;

  isSubCategoryLoader: boolean = false;
  isViewMoreCatData: boolean = false;

  ngName = '';
  ngParent = 0;

  keyword: any = '';

  searchMoviesCtrl = new FormControl();
  filteredMovies: any;
  isLoadings = false;
  errorMsg!: string;
  minLengthTerm = 3;
  selectedMovie: any = "";

  searchPayload: any;
  isAddLoader: boolean = false;
  constructor(
    private _changeDetectorRef: ChangeDetectorRef,
    private _systemService: SystemService
  ) { }


  ngOnInit(): void {
    this.isLoading = true;
    this.searchMoviesCtrl.valueChanges
      .pipe(
        filter(res => {
          return res !== null && res.length >= this.minLengthTerm
        }),
        distinctUntilChanged(),
        debounceTime(300),
        tap((val) => {
          if (val == 'No Parent') {
            val = '';
          }
          this.searchPayload = {
            admin_structure: true,
            keyword: val,
            size: 10
          }
          this.errorMsg = "";
          this.filteredMovies = [];
          this.isLoadings = true;
          this._changeDetectorRef.markForCheck();
        }),
        switchMap(value => this._systemService.getSystemsData(this.searchPayload)
          .pipe(
            finalize(() => {
              this.isLoadings = false
              this._changeDetectorRef.markForCheck();
            }),
          )
        )
      )
      .subscribe((data: any) => {
        // if (data['Search'] == undefined) {
        //   this.errorMsg = data['Error'];
        //   this.filteredMovies = [];
        // } else {
        //   this.errorMsg = "";
        //   this.filteredMovies = data['Search'];
        // }
        this.filteredMovies = data["data"];
        this.filteredMovies.push({ name: 'No Parent', pk_sectionID: 0 });
      });

    this.getAdminStructure(1, 'get');
  };
  onSelected() {
    this.ngParent = this.selectedMovie.pk_sectionID;
    this.selectedMovie = this.selectedMovie.name;
  }
  getAdminStructure(page, type) {
    let params = {
      admin_structure: true,
      keyword: this.keyword,
      page: page,
      size: 20
    }
    this._systemService.getSystemsData(params).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      if (this.keyword == '') {
        res["data"].forEach(element => {
          this.dataSource.push(element)
        });
        this.totalRecords = res["totalRecords"];
      }

      if (type == 'add') {
        this._systemService.snackBar('Section added successfully');
        this.isAddLoader = false;
      } else {
        this.isViewMoreLoader = false;
      }
      this.isLoading = false;
      this.isLoadingChange.emit(false);
      this._changeDetectorRef.markForCheck();
    }, err => {
      this.isLoading = false;
      this.isLoadingChange.emit(false);
      this._changeDetectorRef.markForCheck();
    });
  }
  viewMoreAdmin() {
    this.isViewMoreLoader = true;
    this.page++;
    this.getAdminStructure(this.page, 'get');
  }
  viewMoreCatData(item) {
    this.catPage++;
    this.isSubCategory = true;
    this.getSubAdminStructure(this.catPage, item);
  }
  getSubAdminStructure(page, item) {
    this.subCatData = item;
    let params = {
      admin_structure: true,
      page: page,
      parent_id: item.pk_sectionID,
      size: 10
    }
    if (!this.subCatData.child) {
      this.subCatData.child = [];
      this.subCatData.loader = true;
    } else {
      if (page == 1) {
        this.subCatData.child = [];
        this.subCatData.loader = true;
      }
      this.isViewMoreCatData = true;
    }
    this._systemService.getSystemsData(params).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      res["data"].forEach(element => {
        this.subCatData.child.push(element);
      });
      this.isViewMoreCatData = false;
      this.subCatData.loader = false;
      this.subCatData.totalRecords = res["totalRecords"];
      this._changeDetectorRef.markForCheck();
    }, err => {
      this.isViewMoreCatData = false;
      this.subCatData.loader = false;
      this._changeDetectorRef.markForCheck();
    });
  }
  goback() {
    this.catPage = 0;
    this.isSubCategory = false;
  }
  deleteNode(item) {
    item.delLoader = true;
    let payload: DeleteNode = {
      section_id: item.pk_sectionID,
      delete_node: true
    }
    this._systemService.UpdateSystemData(payload).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      if (item.fk_parentID == 0) {
        this.dataSource = this.dataSource.filter(elem => elem.pk_sectionID != item.pk_sectionID);
      } else {
        this.subCatData.child = this.subCatData.child.filter(elem => elem.pk_sectionID != item.pk_sectionID);
      }
      this._systemService.snackBar('Section delete successfully');
      this._changeDetectorRef.markForCheck();
    });
  }
  updateNode(item) {
    item.updateLoader = true;
    let payload: UpdateNode = {
      name: item.name,
      section_id: item.pk_sectionID,
      parent_id: item.fk_parentID,
      update_node: true
    }
    this._systemService.UpdateSystemData(payload).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      this._systemService.snackBar('Section updated successfully');
      item.updateLoader = false;
      this._changeDetectorRef.markForCheck();
    }, err => {
      item.updateLoader = false;
      this._changeDetectorRef.markForCheck();
    });
  }
  addNode() {
    if (this.ngName == '') {
      this._systemService.snackBar('Name is required');
      return;
    }
    this.isAddLoader = true;
    let payload: AddNewNode = {
      name: this.ngName,
      parent_id: this.ngParent,
      add_node: true
    }

    this._systemService.UpdateSystemData(payload).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      this.page = 1;
      this.getAdminStructure(1, 'add');
      this._changeDetectorRef.markForCheck();
    }, err => {
      this.isAddLoader = false;
      this._changeDetectorRef.markForCheck();
    });
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
