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

  replaceSingleQuotesWithDoubleSingleQuotes(obj: { [key: string]: any }): any {
    for (const key in obj) {
        if (obj.hasOwnProperty(key) && typeof obj[key] === 'string') {
            obj[key] = obj[key]?.replace(/'/g, "''");
        }
    }
    return obj;
}

  AddArtwork() {
    const { name, description, display_order } = this.addArtworkTag;
    if (name.trim() == '' || description.trim() == '') {
      this._snackBar.open("Please fill out required fields", '', {
        horizontalPosition: 'center',
        verticalPosition: 'bottom',
        duration: 3500
      });
      return;
    }
    if(display_order < 0) {
      this._snackBar.open("Display order should be a positive number", '', {
        horizontalPosition: 'center',
        verticalPosition: 'bottom',
        duration: 3500
      });
      return;
    }
    this.addTagLoader = true;
    let payload = {
      store_id: this.selectedStore.pk_storeID,
      name:name.trim(),
      description:description.trim(),
      display_order:display_order,
      add_artwork_presentation: true
    }
    this._storeManagerService.AddArtwork(this.replaceSingleQuotesWithDoubleSingleQuotes(payload)).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      this.getArtWork();
      this._snackBar.open("Artwork added successfuly", '', {
        horizontalPosition: 'center',
        verticalPosition: 'bottom',
        duration: 3500
      });
      this._changeDetectorRef.markForCheck();
    }, err => {
      this._snackBar.open("Error occured while adding artwork", '', {
        horizontalPosition: 'center',
        verticalPosition: 'bottom',
        duration: 3500
      });
      this.addTagLoader = false;
      this._changeDetectorRef.markForCheck();
    })
  }
  UpdateArtwork(item) {
    item.updateLoader = true;
    if(item.name.trim() === '' || item.description.trim() === '') {
      this._snackBar.open("Please fill the required fields", '', {
        horizontalPosition: 'center',
        verticalPosition: 'bottom',
        duration: 3500
      });
      return;
    }

    let payload = {
      name: item.name.trim(),
      description: item.description.trim(),
      extension: item.extension,
      displayOrder: item.displayOrder,
      pk_artworkTagID: item.pk_artworkTagID,
      update_artwork_tag: true
    }
    this._storeManagerService.UpdateArtwork(this.replaceSingleQuotesWithDoubleSingleQuotes(payload)).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
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

  hasNegativeDisplayOrder(tags) {
    for (let i = 0; i < tags.length; i++) {
        if (tags[i].displayOrder < 0) {
            return true;
        }
    }
    return false;
}
  UpdateArtworkDisplayOrder() {
    let artworks = [];
    this.screenData.forEach(element => {
      artworks.push({
        pk_artworkTagID: element.pk_artworkTagID,
        displayOrder: element.displayOrder
      })
    });
   if(this.hasNegativeDisplayOrder(artworks)) {
    this._snackBar.open("Please fill positive values", '', {
      horizontalPosition: 'center',
      verticalPosition: 'bottom',
      duration: 3500
    });
    return;
   }
    let payload = {
      artworks: artworks,
      update_artwork_order: true
    }
    this.displayOrderLoader = true;
    this._storeManagerService.UpdateArtworkDisplayOrder(payload).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      this.displayOrderLoader = false;
      if (res["success"]) {
        this.displayOrderMsg = true;
        setTimeout(() => {
          this.displayOrderMsg = false;
          this._changeDetectorRef.markForCheck();
        }, 3000);
      }
      this._snackBar.open("Artwork display order updated successfully", '', {
        horizontalPosition: 'center',
        verticalPosition: 'bottom',
        duration: 3500
      });
      this._changeDetectorRef.markForCheck();
    }, err => {
      this._snackBar.open("Error occured while updating Artwork display order", '', {
        horizontalPosition: 'center',
        verticalPosition: 'bottom',
        duration: 3500
      });
      this.displayOrderLoader = false;
      this._changeDetectorRef.markForCheck();
    })
  }
  openPdf(item) {
    const url = environment.storeMedia + `/artworkTags/${this.selectedStore.pk_storeID}/${item.pk_artworkTagID}.pdf`
    window.open(url, '_blank').focus();
  }
}
