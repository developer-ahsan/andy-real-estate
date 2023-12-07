import { ENTER, COMMA } from '@angular/cdk/keycodes';
import { Component, Input, OnInit, Output, EventEmitter, ChangeDetectorRef, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { FormControl, FormGroup, NgForm, Validators } from '@angular/forms';
import { MatChipInputEvent } from '@angular/material/chips';
import { MatPaginator } from '@angular/material/paginator';
import { Subject } from 'rxjs';
import { finalize, takeUntil } from 'rxjs/operators';
import { SystemService } from '../../system.service';
import { AddColor, AddDefaultSupportTeam, AddImprintColor, AddImprintMethod, AddMemberFeature, DeleteColor, DeleteImprintColor, DeleteMemberFeature, DeleteTeamMember, UpdateColor, UpdateDefaultSupportTeam, UpdateImprintColor, UpdateImprintMethod, UpdateMemberFeature } from '../../system.types';
import { DashboardsService } from 'app/modules/admin/dashboards/dashboard.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-support-team',
  templateUrl: './support-team.component.html',
  styles: [".mat-paginator {border-radius: 16px !important}"]
})
export class SupportTeamComponent implements OnInit, OnDestroy {
  @ViewChild('paginator') paginator: MatPaginator;
  @Input() isLoading: boolean;
  @Output() isLoadingChange = new EventEmitter<boolean>();
  private _unsubscribeAll: Subject<any> = new Subject<any>();

  dataSource = [];
  tempDataSource = [];
  displayedColumns: string[] = ['image', 'name', 'email', 'role', 'action'];
  totalUsers = 0;
  tempRecords = 0;
  page = 1;
  isImageCorrect: boolean;
  isActiveStoreOrderLoader: boolean = false


  mainScreen: string = 'Current Support Team';
  keyword = '';
  not_available = 'N/A';


  isSearching: boolean = false;

  // Add Method
  ngName: string = '';
  ngDesc: string = '';
  isAddTeamLoader: boolean = false;
  addNewMemberForm: FormGroup;
  // Update Color
  isUpdateMemberLoader: boolean = false;
  isUpdateMember: boolean = false;
  updateTeamData: any;
  updateMemberForm: FormGroup;


  // Member Feature
  featureList: any;
  featureTableColumns = ['name', 'action'];
  teamMemberFeature: boolean = false;
  memberFeatureName = '';
  isAddFeatureLoader: boolean = false;
  imageValue: any;

  updateMemberId: any;
  allStores: any = [];

  constructor(
    private _changeDetectorRef: ChangeDetectorRef,
    private _systemService: SystemService,
    private _commonService: DashboardsService,
    private router: Router,
  ) { }

  ngOnInit(): void {
    this.addNewMemberForm = new FormGroup({
      role_name: new FormControl(''),
      name: new FormControl(''),
      description: new FormControl(''),
      email: new FormControl('', [Validators.email, Validators.required]),
      phone: new FormControl(''),
      role_type: new FormControl(''),
    });
    this.updateMemberForm = new FormGroup({
      pk_ID: new FormControl(''),
      roleName: new FormControl(''),
      name: new FormControl(''),
      description: new FormControl(''),
      email: new FormControl('', [Validators.email, Validators.required]),
      phone: new FormControl(''),
      roleType: new FormControl(''),
    });
    this.isLoading = true;
    this.getSupportTeam(1, 'get');
    this.getAllStores();
  };
  calledScreen(value) {
    this.mainScreen = value;
  }
  getSupportTeam(page, type) {
    let params = {
      default_support_team: true,
      keyword: this.keyword,
      page: page,
      size: 20
    }
    this._systemService.getSystemsData(params).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      this.dataSource = res["data"];
      this.totalUsers = res["totalRecords"];
      if (this.keyword == '') {
        this.tempDataSource = res["data"];
        this.tempRecords = res["totalRecords"];
      }
      if (type == 'add') {
        this.isAddTeamLoader = false;
        this.ngName = '';
        this.ngDesc = '';
        this._systemService.snackBar('Team Member Added Successfully');
        this.mainScreen = 'Current Support Team';
      }
      this.isLoading = false;
      this.isSearching = false;
      this.isLoadingChange.emit(false);
      this._changeDetectorRef.markForCheck();
    }, err => {
      this.isSearching = false;
      this.isLoading = false;
      this.isLoadingChange.emit(false);
      this._changeDetectorRef.markForCheck();
    });
  }
  getNextData(event) {
    const { previousPageIndex, pageIndex } = event;

    if (pageIndex > previousPageIndex) {
      this.page++;
    } else {
      this.page--;
    };
    this.getSupportTeam(this.page, 'get');
  };
  searchColor(value) {
    if (this.dataSource.length != 0) {
      this.paginator.firstPage();
    }
    this.page = 1;
    this.keyword = value;
    this.isSearching = true;
    this._changeDetectorRef.markForCheck();
    this.getSupportTeam(1, 'get');
  }

  validateNumberInput(event: KeyboardEvent) {
    const allowedKeys = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];

    if (!allowedKeys.includes(event.key)) {
      event.preventDefault();
    }
  }

  resetSearch() {
    if (this.dataSource.length != 0) {
      this.paginator.firstPage();
    }
    this.keyword = '';
    this.dataSource = this.tempDataSource;
    this.totalUsers = this.tempRecords;
  }

  addNewTeam() {
    const { role_name, name, email, role_type, description, phone } = this.addNewMemberForm.getRawValue();
    if (description.trim() == '' || name.trim() == '' || email.trim() == '' || phone.trim() == '') {
      this._systemService.snackBar('Please fill out the required fields');
      return;
    }
    if (this.isImageCorrect == false) {
      this._systemService.snackBar('Dimensions allowed are 147px x 201px.');
      return;
    }
    let payload: AddDefaultSupportTeam = {
      role_name: role_name.trim(),
      name: name.trim(),
      description: description.trim().replace(/'/g, "''"),
      email: email.trim(),
      phone,
      role_type,
      add_default_support_team: true
    }
    this.isAddTeamLoader = true;
    this._systemService.AddSystemData(this.replaceSingleQuotesWithDoubleSingleQuotes(payload)).pipe(takeUntil(this._unsubscribeAll), finalize(() => {
      this._changeDetectorRef.markForCheck();
    })).subscribe(res => {
      if (res["success"]) {
        this.getSupportTeam(1, 'add')
      } else {
        this.isAddTeamLoader = false;
        this._systemService.snackBar(res["message"]);
      }
      this.addNewMemberForm.reset();
      this._changeDetectorRef.markForCheck();
    }, err => {
      this.isAddTeamLoader = false;
      this._systemService.snackBar('Something went wrong');
    })
  }

  replaceSingleQuotesWithDoubleSingleQuotes(obj: { [key: string]: any }): any {
    for (const key in obj) {
      if (obj.hasOwnProperty(key) && typeof obj[key] === 'string') {
        obj[key] = obj[key].replace(/'/g, "''");
      }
    }
    return obj;
  }

  // Delete Member
  deleteMemeber(item) {
    item.delLoader = true;
    let payload: DeleteTeamMember = {
      member_id: item.pk_ID,
      delete_team_member: true
    }
    this._systemService.UpdateSystemData(payload).pipe(takeUntil(this._unsubscribeAll), finalize(() => {
      item.delLoader = false
      this._changeDetectorRef.markForCheck();
    })).subscribe(res => {
      this.dataSource = this.dataSource.filter(elem => elem.pk_ID != item.pk_ID);
      this.totalUsers--;
      this._systemService.snackBar('Team Member Deleted Successfully');
      this._changeDetectorRef.markForCheck();
    }, err => {
      this._systemService.snackBar('Something went wrong');
    });
  }
  // Update Member
  updateMemberToggle(item) {
    this.featureList = null;
    this.teamMemberFeature = false;
    if (item) {
      this.updateMemberId = item.pk_ID;
      this.updateMemberForm.patchValue(item);
      this.getMemberFeatures(item.pk_ID);
    }
    this.updateTeamData = item;
    this.isUpdateMember = !this.isUpdateMember;
  }

  updateMember() {
    const { roleName, name, email, roleType, description, phone, pk_ID } = this.updateMemberForm.getRawValue();
    if (description.trim() == '' || name.trim() == '' || email.trim() == '' || phone.trim() == '') {
      this._systemService.snackBar('Please fill out the required fields');
      return;
    }
    if (this.isImageCorrect == false) {
      this._systemService.snackBar('Dimensions allowed are 147px x 201px.');
      return;
    }
    let payload: UpdateDefaultSupportTeam = {
      role_name: roleName.trim(),
      name: name.trim(),
      description: description.trim().replace(/'/g, "''"),
      email: email.trim(),
      phone: phone,
      role_type: roleType,
      member_id: pk_ID,
      update_default_support_team: true,
      call_type: "update",
      stores: [],
    }
    this.isUpdateMemberLoader = true;
    this._systemService.UpdateSystemData(this.replaceSingleQuotesWithDoubleSingleQuotes(payload)).pipe(takeUntil(this._unsubscribeAll), finalize(() => {
      this.isUpdateMemberLoader = false
      this._changeDetectorRef.markForCheck();
    })).subscribe(res => {
      this.dataSource.filter(elem => {
        if (elem.pk_ID == this.updateTeamData.pk_ID) {
          elem.name = name;
          elem.email = email;
          elem.roleName = roleName;
        }
        this.isUpdateMember = false;

      });
      if (this.imageValue) {
        this.uploadMedia(pk_ID);
      }
      this._systemService.snackBar('Member Updated Successfully');
      this._changeDetectorRef.markForCheck();
    }, err => {
      this._systemService.snackBar('Error occured while updating Member.');
    })
  }
  // Member Feature
  toggleMemberFeature() {
    this.teamMemberFeature = !this.teamMemberFeature;
  }
  getMemberFeatures(id) {
    let params = {
      support_team_feature: true,
      member_id: id
    }
    this._systemService.getSystemsData(params).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      this.isAddFeatureLoader = false;
      this.memberFeatureName = '';
      this.featureList = res["data"];
      this._changeDetectorRef.markForCheck();
    }, err => {
      this._changeDetectorRef.markForCheck();
    });
  }
  addNewFeature() {
    if (this.memberFeatureName == '') {
      this._systemService.snackBar('Please fill out the required fields');
      return;
    }
    let payload: AddMemberFeature = {
      member_id: this.updateTeamData.pk_ID,
      feature: this.memberFeatureName,
      add_member_feature: true
    }
    this.isAddFeatureLoader = true;
    this._systemService.AddSystemData(payload).pipe(takeUntil(this._unsubscribeAll), finalize(() => {
      this._changeDetectorRef.markForCheck();
    })).subscribe(res => {
      if (res["success"]) {
        this.getMemberFeatures(this.updateTeamData.pk_ID);
      } else {
        this.isAddFeatureLoader = false;
        this._systemService.snackBar(res["message"]);
      }
      this._changeDetectorRef.markForCheck();
    }, err => {
      this.isAddFeatureLoader = false;
      this._systemService.snackBar('Something went wrong');
    })
  }
  deleteFeature(item) {
    item.delLoader = true;
    let payload: DeleteMemberFeature = {
      member_id: item.fk_ID,
      feature_id: item.pk_featureID,
      delete_member_feature: true
    }
    this._systemService.UpdateSystemData(payload).pipe(takeUntil(this._unsubscribeAll), finalize(() => {
      item.delLoader = false
      this._changeDetectorRef.markForCheck();
    })).subscribe(res => {
      this.featureList = this.featureList.filter(elem => elem.pk_featureID != item.pk_featureID);
      this._systemService.snackBar('Feature Deleted Successfully');
      this._changeDetectorRef.markForCheck();
    }, err => {
      this._systemService.snackBar('Something went wrong');
    });
  }
  updateFeature(item) {
    if (item.feature == '') {
      this._systemService.snackBar('Please fill out the required fields');
      return;
    }
    item.updateLoader = true;
    let payload: UpdateMemberFeature = {
      feature: item.feature,
      member_id: item.fk_ID,
      feature_id: item.pk_featureID,
      update_member_feature: true
    }
    this._systemService.UpdateSystemData(payload).pipe(takeUntil(this._unsubscribeAll), finalize(() => {
      item.updateLoader = false
      this._changeDetectorRef.markForCheck();
    })).subscribe(res => {
      this._systemService.snackBar('Feature Updated Successfully');
      this._changeDetectorRef.markForCheck();
    }, err => {
      this._systemService.snackBar('Something went wrong');
    })
  }

  uploadFile(event): void {
    this.isImageCorrect = true;
    if (event.target.files[0]) {
      const file = event.target.files[0];
      const reader = new FileReader();
      if (file)
        reader.readAsDataURL(file);
      reader.onload = () => {
        let image: any = new Image;
        image.src = reader.result;
        image.onload = () => {
          if (image.width != 147 || image.height != 201) {
            this._systemService.snackBar("Dimensions allowed are 147px x 201px");
            this.imageValue = null;
            this._changeDetectorRef.markForCheck();
            this.isImageCorrect = false;
            return;
          }
          if (file["type"] != 'image/jpeg' && file["type"] != 'image/jpg') {
            this._systemService.snackBar("Image should be jpg format only");
            this.imageValue = null;
            this._changeDetectorRef.markForCheck();
            this.isImageCorrect = false;
            return;
          }
          this.imageValue = {
            imageUpload: reader.result,
            type: file["type"]
          };
        }
      }
    }
  };
  @ViewChild('myInput') myInput: ElementRef;

  uploadMedia(pk_ID) {
    let base64;
    const { imageUpload } = this.imageValue;
    base64 = imageUpload.split(",")[1];
    const img_path = `/globalAssets/System/Defaults/SupportTeam/${pk_ID}.jpg`;

    const payload = {
      file_upload: true,
      image_file: base64,
      image_path: img_path
    };
    this._systemService.AddSystemData(payload).subscribe(res => {
      this.updateTeamData.random = Math.random();
      this.imageValue = null;
      this.myInput.nativeElement.value = '';
      this._changeDetectorRef.markForCheck();
    }, err => {
      this._changeDetectorRef.markForCheck();
    });
  }
  handleImageError(element) {
    element.src = 'https://assets.consolidus.com/globalAssets/Support/anonymous.png';
  }

  addtoAllActiveStores() {
    const { roleName, name, email, roleType, description, phone, pk_ID } = this.updateMemberForm.getRawValue();
    if (description.trim() == '' || name.trim() == '' || email.trim() == '' || phone.trim() == '') {
      this._systemService.snackBar('Please fill out the required fields');
      return;
    }
    if (this.isImageCorrect == false) {
      this._systemService.snackBar('Dimensions allowed are 147px x 201px.');
      return;
    }

    let payload: UpdateDefaultSupportTeam = {
      role_name: roleName.trim(),
      name: name.trim(),
      description: description.trim().replace(/'/g, "''"),
      email: email.trim(),
      phone: phone,
      role_type: roleType,
      member_id: pk_ID,
      call_type: "add_to_store",
      stores: this.allStores,
      update_default_support_team: true
    }
    this.isActiveStoreOrderLoader = true;
    this._systemService.UpdateSystemData(this.replaceSingleQuotesWithDoubleSingleQuotes(payload)).pipe(takeUntil(this._unsubscribeAll), finalize(() => {
      this.isActiveStoreOrderLoader = false
      this._changeDetectorRef.markForCheck();
    })).subscribe(res => {

      this._systemService.snackBar('Member added to all active stores Successfully');
      this._changeDetectorRef.markForCheck();
    }, err => {
      this.isActiveStoreOrderLoader = false
      this._systemService.snackBar('Error occured while adding to active stores.');
    })
  }

  getAllStores() {
    this._commonService.storesData$.pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      res["data"].forEach(element => {
        if (element.blnActive) {
          this.allStores.push(element.pk_storeID);
        }
      });
    })
  }
  navigation(url: string) {
    this.router.navigateByUrl(url);
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
