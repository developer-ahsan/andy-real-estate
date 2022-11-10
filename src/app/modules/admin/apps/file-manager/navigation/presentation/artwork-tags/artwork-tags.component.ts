import { ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { environment } from 'environments/environment';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { FileManagerService } from '../../../store-manager.service';
@Component({
  selector: 'app-artwork-tags',
  templateUrl: './artwork-tags.component.html',
})
export class PresentationArtworkTagsComponent implements OnInit {
  @Input() selectedStore: any;
  @Input() screenData: any;
  @Input() isLoading: boolean;
  @Output() isLoadingChange = new EventEmitter<boolean>();
  private _unsubscribeAll: Subject<any> = new Subject<any>();

  addTagLoader: boolean = false;
  displayOrderLoader: boolean = false;
  displayOrderMsg: boolean = false;

  screens = ['Current Artwork', 'Add New Artwork', 'Display Order'];
  currentScreen = 'Current Artwork';

  addArtworkTag: any = {
    name: '',
    description: '',
    display_order: 1
  }
  constructor(
    private _storeManagerService: FileManagerService,
    private _snackBar: MatSnackBar,
    private _changeDetectorRef: ChangeDetectorRef,
  ) { }


  ngOnInit() {
    this.initialize();
  }
  initialize() {
  }
  calledScreen(screen) {
    this.currentScreen = screen;
  }
  getArtWork() {
    let params = {
      presentation: true,
      store_id: this.selectedStore.pk_storeID,
      artwork_tags_presentation: true,
    };
    this._storeManagerService
      .getPresentationData(params)
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((res: any) => {
        this.addTagLoader = false;
        this.currentScreen = 'Current Artwork';
        this.screenData = res.data;
        this.addArtworkTag = {
          name: '',
          description: '',
          display_order: 1
        }
        this._changeDetectorRef.markForCheck();
      });
  }
  AddArtwork() {
    const { name, description, display_order } = this.addArtworkTag;
    if (name == '' || description == '' || display_order == '') {
      this._snackBar.open("Please fill out required fields", '', {
        horizontalPosition: 'center',
        verticalPosition: 'bottom',
        duration: 3500
      });
      return;
    }
    this.addTagLoader = true;
    let payload = {
      store_id: this.selectedStore.pk_storeID,
      name,
      description,
      display_order,
      add_artwork_presentation: true
    }
    this._storeManagerService.AddArtwork(payload).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      this.getArtWork();
      this._changeDetectorRef.markForCheck();
    }, err => {
      this.addTagLoader = false;
      this._changeDetectorRef.markForCheck();
    })
  }
  UpdateArtwork(item) {
    item.updateLoader = true;
    let payload = {
      name: item.name,
      description: item.description,
      extension: item.extension,
      displayOrder: item.displayOrder,
      pk_artworkTagID: item.pk_artworkTagID,
      update_artwork_tag: true
    }
    this._storeManagerService.UpdateArtwork(payload).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      item.updateLoader = false;
      this._snackBar.open("Artwork updated successfully", '', {
        horizontalPosition: 'center',
        verticalPosition: 'bottom',
        duration: 3500
      });
      this._changeDetectorRef.markForCheck();
    }, err => {
      item.updateLoader = false;
      this._changeDetectorRef.markForCheck();
    })
  }
  DeleteArtwork(item) {
    item.delLoader = true;
    let payload = {
      pk_artworkTagID: item.pk_artworkTagID,
      delete_artwork_tag: true
    }
    this._storeManagerService.DeleteArtwork(payload).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      item.delLoader = false;
      this._snackBar.open("Artwork removed successfully", '', {
        horizontalPosition: 'center',
        verticalPosition: 'bottom',
        duration: 3500
      });
      this.screenData = this.screenData.filter(element => element.pk_artworkTagID != item.pk_artworkTagID);
      this._changeDetectorRef.markForCheck();
    }, err => {
      item.delLoader = false;
      this._changeDetectorRef.markForCheck();
    })
  }
  UpdateArtworkDisplayOrder() {
    this.displayOrderLoader = true;
    let artworks = [];
    this.screenData.forEach(element => {
      artworks.push({
        pk_artworkTagID: element.pk_artworkTagID,
        displayOrder: element.displayOrder
      })
    });
    let payload = {
      artworks: artworks,
      update_artwork_order: true
    }
    this._storeManagerService.UpdateArtworkDisplayOrder(payload).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      this.displayOrderLoader = false;
      if (res["success"]) {
        this.displayOrderMsg = true;
        setTimeout(() => {
          this.displayOrderMsg = false;
          this._changeDetectorRef.markForCheck();
        }, 3000);
      }
      this._changeDetectorRef.markForCheck();
    }, err => {
      this.displayOrderLoader = false;
      this._changeDetectorRef.markForCheck();
    })
  }
  openPdf(item) {
    const url = environment.storeMedia + `/artworkTags/${this.selectedStore.pk_storeID}/${item.pk_artworkTagID}.pdf`
    window.open(url, '_blank').focus();
  }
}
