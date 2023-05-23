import { ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { environment } from 'environments/environment';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { FileManagerService } from '../../../store-manager.service';
@Component({
  selector: 'app-presentation-support-team',
  templateUrl: './presentation-support-team.component.html',
  styleUrls: ["./presentation-support-team.scss"],
})
export class PresentationSupportTeamComponent implements OnInit {
  @Input() selectedStore: any;
  @Input() screenData: any;
  @Input() availableTeamData: any;
  @Input() isLoading: boolean;
  @Output() isLoadingChange = new EventEmitter<boolean>();
  private _unsubscribeAll: Subject<any> = new Subject<any>();

  teamImageUrl = 'https://assets.consolidus.com/globalAssets/System/Defaults/SupportTeam/';
  teamForm: FormGroup;
  updateLoader: boolean = false;
  addNewTeamLoader: boolean = false;
  totalAvailableTeam = 0;
  page = 1;
  teamLoader: boolean = false;
  constructor(
    private _storeManagerService: FileManagerService,
    private _snackBar: MatSnackBar,
    private _changeDetectorRef: ChangeDetectorRef,
    private formBuilder: FormBuilder,
  ) { }


  ngOnInit() {
    this.totalAvailableTeam = this.availableTeamData.totalRecords;
    this.initialize();
  }
  initialize() {

  }
  getNextTeamData() {
    this.page++;
    this.teamLoader = true;
    let params = {
      presentation: true,
      store_id: this.selectedStore.pk_storeID,
      available_support_team: true,
      page: this.page
    }
    this._storeManagerService
      .getPresentationData(params)
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((res: any) => {
        this.availableTeamData["data"] = this.availableTeamData["data"].concat(res["data"]);
        this.teamLoader = false;
        this._changeDetectorRef.markForCheck();
      }, err => {
        this.teamLoader = false;
        this._changeDetectorRef.markForCheck();
      });
  }
  UpdateSocialMedia() {
    this.updateLoader = true;
    // this._storeManagerService.UpdateSpecialOffer(this.socialMediaForm.value).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
    //   this.updateLoader = false;
    //   this._changeDetectorRef.markForCheck();
    // }, err => {
    //   this.updateLoader = false;
    //   this._changeDetectorRef.markForCheck();
    // })
  }
  addNewTeamMember(obj) {
    const { pk_ID, roleName, email } = obj;
    obj.loader = true;
    let payload = {
      fk_storeID: this.selectedStore.pk_storeID,
      fk_defaultMemberID: pk_ID,
      roleName: roleName,
      email: email,
      add_available_member: true
    }
    this._storeManagerService.AddAvailableMember(payload).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      this.availableTeamData.data = this.availableTeamData.data.filter(item => item.pk_ID != obj.pk_ID);
      this.totalAvailableTeam--;
      const data = {
        email: obj.email,
        name: obj.name,
        blnProgramManager: obj.blnChampion,
        phone: obj.phone,
        pk_memberID: obj.pk_ID,
        roleName: obj.roleName
      }
      this.screenData.push(data);
      obj.loader = false;
      this._snackBar.open("Member Added successfully", '', {
        horizontalPosition: 'center',
        verticalPosition: 'bottom',
        duration: 3500
      });
      this._changeDetectorRef.markForCheck();
    }, err => {
      obj.loader = false;
      this._changeDetectorRef.markForCheck();
    })
  }
  removeMember(obj) {
    obj.loader = true;
    let payload = {
      pk_memberID: obj.pk_memberID,
      delete_available_member: true
    }
    this._storeManagerService.DeleteAvailableMember(payload).subscribe(res => {
      this.screenData = this.screenData.filter(item => item.pk_memberID != obj.pk_memberID);
      this._snackBar.open("Member removed successfully", '', {
        horizontalPosition: 'center',
        verticalPosition: 'bottom',
        duration: 3500
      });
      obj.loader = false;
      this._changeDetectorRef.markForCheck();
    }, err => {
      obj.loader = false;
      this._changeDetectorRef.markForCheck();
    })
  }
  updateTeamMember(obj) {
    const { pk_memberID, roleName, email, blnProgramManager, displayOrder } = obj;
    obj.updateLoader = true;
    let payload = {
      pk_memberID,
      roleName,
      email,
      blnProgramManager,
      displayOrder,
      update_available_member: true
    }
    this._storeManagerService.EditAvailableMember(payload).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      obj.updateLoader = false;
      this._snackBar.open("Member updated successfully", '', {
        horizontalPosition: 'center',
        verticalPosition: 'bottom',
        duration: 3500
      });
      this._changeDetectorRef.markForCheck();
    }, err => {
      obj.updateLoader = false;
      this._changeDetectorRef.markForCheck();
    })
  }
}
