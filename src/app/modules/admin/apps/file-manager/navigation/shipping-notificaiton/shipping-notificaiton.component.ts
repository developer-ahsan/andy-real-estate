import { Component, Input, Output, OnInit, EventEmitter, ChangeDetectorRef } from '@angular/core';
import { Subject } from 'rxjs';
import { FileManagerService } from 'app/modules/admin/apps/file-manager/file-manager.service';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-shipping-notificaiton',
  templateUrl: './shipping-notificaiton.component.html'
})
export class ShippingNotificaitonComponent implements OnInit {
  @Input() selectedStore: any;
  @Input() isLoading: boolean;
  @Output() isLoadingChange = new EventEmitter<boolean>();
  private _unsubscribeAll: Subject<any> = new Subject<any>();

  updateLoader = false;

  constructor(
    private _fileManagerService: FileManagerService,
    private _changeDetectorRef: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.isLoadingChange.emit(false);
  };

  updateShipping(): void {
    console.log("updateShipping")
  };

}
