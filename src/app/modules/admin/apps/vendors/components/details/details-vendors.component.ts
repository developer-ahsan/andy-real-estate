import { Component, Input, OnInit, ChangeDetectorRef, OnDestroy, ViewChild, EventEmitter, Output, ElementRef, ChangeDetectionStrategy, ViewEncapsulation } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { Router } from '@angular/router';
import { FuseMediaWatcherService } from '@fuse/services/media-watcher';
import { newFLPSUser, updateFLPSUser, removeFLPSUser, applyBlanketCustomerPercentage } from 'app/modules/admin/apps/flps/components/flps.types';
import { UsersService } from 'app/modules/admin/apps/users/components/users.service';
import { Subject } from 'rxjs';
import { finalize, takeUntil } from 'rxjs/operators';
import { SystemService } from '../vendors.service';
@Component({
  selector: 'app-details-vendors',
  templateUrl: './details-vendors.component.html',
  styles: [".mat-paginator {border-radius: 16px !important}"],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class VendorsDetailsComponent implements OnInit, OnDestroy {
  isLoading: boolean = false;
  private _unsubscribeAll: Subject<any> = new Subject<any>();
  routes = [];
  selectedScreeen = 'Product Colors';

  // Sidebar stuff
  drawerMode: 'over' | 'side' = 'side';
  drawerOpened: boolean = true;
  @ViewChild("panel") panel;
  @ViewChild('topScrollAnchor') topScroll: ElementRef;

  /**
   * Constructor
   */
  constructor(
    private _changeDetectorRef: ChangeDetectorRef,
    private _systemService: SystemService,
    private _router: Router,
    private _fuseMediaWatcherService: FuseMediaWatcherService,
  ) {
  }

  // -----------------------------------------------------------------------------------------------------
  // @ Lifecycle hooks
  // -----------------------------------------------------------------------------------------------------

  /**
   * On init
   */

  ngOnInit(): void {
    this.routes = this._systemService.navigationLabels;
    this.isLoading = false;
    this.sideDrawer();
  }
  // Close Drawer
  doSomething() {
    this.panel.close();
  }
  // Side Drawer 
  sideDrawer() {
    this._fuseMediaWatcherService.onMediaChange$
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe(({ matchingAliases }) => {
        if (matchingAliases.includes('lg')) {
          this.drawerMode = 'side';
          this.drawerOpened = true;
        }
        else {
          this.drawerMode = 'over';
          this.drawerOpened = false;
        }
        // Mark for check
        this._changeDetectorRef.markForCheck();
      });
  }


  // -----------------------------------------------------------------------------------------------------
  // @ Public methods
  // -----------------------------------------------------------------------------------------------------
  clicked(title) {
    if (title != this.selectedScreeen) {
      this.selectedScreeen = title;
      this.isLoading = true;
    }
    this.topScroll.nativeElement.scrollIntoView({ behavior: 'smooth' });
  }
  // Drawer Open Close
  toggleDrawer() {
    this.drawerOpened = !this.drawerOpened;
  }
  /**
   * On destroy
   */
  ngOnDestroy(): void {
    // Unsubscribe from all subscriptions
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  }
}
