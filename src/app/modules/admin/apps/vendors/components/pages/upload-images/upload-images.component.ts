import { Component, Input, OnInit, Output, EventEmitter, ChangeDetectorRef, OnDestroy, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { Subject } from 'rxjs';
import { SystemService } from '../../vendors.service';

@Component({
  selector: 'app-upload-images',
  templateUrl: './upload-images.component.html',
  styles: [".mat-paginator {border-radius: 16px !important}"]
})
export class UploadImagesComponent implements OnInit, OnDestroy {
  @ViewChild('paginator') paginator: MatPaginator;
  @Input() isLoading: boolean;
  @Output() isLoadingChange = new EventEmitter<boolean>();
  private _unsubscribeAll: Subject<any> = new Subject<any>();

  images = [];
  isAddLoader: boolean = false;
  constructor(
    private _changeDetectorRef: ChangeDetectorRef,
    private _systemService: SystemService
  ) { }

  ngOnInit(): void {
    this.getImages(10);
  };
  getImages(size) {
    const length = size + this.images.length;
    for (let index = 1; index < length; index++) {
      this.images.push('https://assets.consolidus.com/globalAssets/Uploads/' + index + '.jpg');
    }
    this.isLoading = false;
    this.isLoadingChange.emit(false);
    this._changeDetectorRef.markForCheck();
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
