import { ENTER, COMMA } from '@angular/cdk/keycodes';
import { Component, Input, OnInit, Output, EventEmitter, ChangeDetectorRef, OnDestroy, ViewChild } from '@angular/core';
import { MatChipInputEvent } from '@angular/material/chips';
import { MatPaginator } from '@angular/material/paginator';
import { Subject } from 'rxjs';
import { finalize, takeUntil } from 'rxjs/operators';
import { SystemService } from '../../vendors.service';

@Component({
  selector: 'app-vendor-settings',
  templateUrl: './vendor-settings.component.html',
  styles: [".mat-paginator {border-radius: 16px !important}"]
})
export class VendorSettingsComponent implements OnInit, OnDestroy {
  @Input() isLoading: boolean;
  @Output() isLoadingChange = new EventEmitter<boolean>();
  private _unsubscribeAll: Subject<any> = new Subject<any>();


  constructor(
    private _changeDetectorRef: ChangeDetectorRef,
    private _systemService: SystemService
  ) { }

  ngOnInit(): void {
    setTimeout(() => {
      this.isLoading = false;
      this.isLoadingChange.emit(false);
    }, 500);
  };
  /**
     * On destroy
     */
  ngOnDestroy(): void {
    // Unsubscribe from all subscriptions
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  };

}
