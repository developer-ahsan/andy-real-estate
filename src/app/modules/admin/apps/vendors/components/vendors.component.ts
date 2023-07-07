import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { fuseAnimations } from '@fuse/animations';
import { Router } from '@angular/router';
import { FuseMediaWatcherService } from '@fuse/services/media-watcher';
import { VendorsService } from './vendors.service';
import { MatDrawer } from '@angular/material/sidenav';
import { DashboardsService } from 'app/modules/admin/dashboards/dashboard.service';

@Component({
    selector: 'app-vendors-list',
    templateUrl: './vendors.component.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class VendorsComponent {
    isLoading: boolean = false;
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    // Sidebar stuff
    @ViewChild('topScrollAnchor') topScroll: ElementRef;


    @ViewChild('drawer') drawer: MatDrawer;
    drawerMode: 'over' | 'side' = 'side';
    drawerOpened: boolean = true;
    panels: any[] = [];
    selectedPanel: string = 'list';

    disabledVendors: any = 0;
    totalVendors = 0;

    // 
    /**
     * Constructor
     */
    constructor(
        private _changeDetectorRef: ChangeDetectorRef,
        private _router: Router,
        private _commonService: DashboardsService,
        private _vendorService: VendorsService,
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
        this.isLoading = false;
        this.panels = [
            {
                id: 'list',
                icon: 'heroicons_outline:view-list',
                title: 'Vendors List',
                description: 'Select or Search For A Vendor'
            },
            {
                id: 'new',
                icon: 'heroicons_outline:plus',
                title: 'Add New Vendor',
                description: 'Add New Company'
            },
            {
                id: 'email',
                icon: 'mat_outline:mail',
                title: 'Send Emails',
                description: 'Send Supplier Emails'
            },
            {
                id: 'download',
                icon: 'heroicons_outline:download',
                title: 'Download',
                description: 'Download Vendor Data File'
            },
            {
                id: 'disabled',
                icon: 'heroicons_outline:eye-off',
                title: 'Disabled Vendors',
                description: 'View Disabled Vendors'
            }
        ];

        // Subscribe to media changes
        this._fuseMediaWatcherService.onMediaChange$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe(({ matchingAliases }) => {

                // Set the drawerMode and drawerOpened
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
        this.getSuppliers();
    }


    getSuppliers() {
        this._commonService.suppliersData$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((supplier) => {
                supplier["data"].forEach(element => {
                    if (!element.blnActiveVendor) {
                        this.disabledVendors++;
                    } else {
                        this.totalVendors++;
                    }
                });
                this._changeDetectorRef.markForCheck();
            }, err => {
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
    }
    goToPanel(panel: string): void {
        this.selectedPanel = panel;

        // Close the drawer on 'over' mode
        if (this.drawerMode === 'over') {
            this.drawer.close();
        }
        this.topScroll.nativeElement.scrollIntoView({ behavior: 'smooth' });
    }

    /**
     * Get the details of the panel
     *
     * @param id
     */
    getPanelInfo(id: string): any {
        return this.panels.find(panel => panel.id === id);
    }

    /**
     * Track by function for ngFor loops
     *
     * @param index
     * @param item
     */
    trackByFn(index: number, item: any): any {
        return item.id || index;
    }
}