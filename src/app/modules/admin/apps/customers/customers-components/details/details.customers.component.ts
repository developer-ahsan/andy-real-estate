import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { fuseAnimations } from '@fuse/animations';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { FuseMediaWatcherService } from '@fuse/services/media-watcher';
import { CustomersService } from '../orders.service';
import { FormBuilder, FormGroup } from '@angular/forms';
import { CustomersProduct } from '../customers.types';

@Component({
    selector: 'customers-details',
    templateUrl: './details.customers.component.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    animations: fuseAnimations,
    styles: [`.mat-expansion-panel-body {padding:0px !important}`]
})
export class CustomerDetailsComponent implements OnInit, OnDestroy {
    @ViewChild('topScrollAnchor') topScroll: ElementRef;

    isLoading: boolean = false;
    selectedOrderDetail: any = null;
    private _unsubscribeAll: Subject<any> = new Subject<any>();
    routes = [];
    selectedScreeen = '';
    selectedRoute = '';

    not_available: string = 'N/A';

    // Sidebar stuff
    drawerMode: 'over' | 'side' = 'side';
    drawerOpened: boolean = true;
    @ViewChild("panel") panel;

    selectedCustomer: CustomersProduct | null = null;
    selectedCustomerForm: FormGroup;

    /**
     * Constructor
     */
    constructor(
        private _changeDetectorRef: ChangeDetectorRef,
        private _customerService: CustomersService,
        private _formBuilder: FormBuilder,
        private route: ActivatedRoute,
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
    doSomething() {
        this.panel.close();
    }

    ngOnInit(): void {
        this.routes = this._customerService.navigationLabels;
        this.getCustomer();

        // Initialize Screen
        this._router.events.subscribe((event) => {
            if (event instanceof NavigationEnd) {
                this.selectedScreeen = this.route.children[0].snapshot.data.title;
                this.selectedRoute = this.route.children[0].snapshot.data.url;
            }
        })
        this.selectedScreeen = this.route.children[0].snapshot.data.title;
        this.selectedRoute = this.route.children[0].snapshot.data.url;


        // Subscribe to media changes
        this._fuseMediaWatcherService.onMediaChange$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe(({ matchingAliases }) => {

                // Set the drawerMode and drawerOpened if the given breakpoint is active
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
    getCustomer() {
        this.selectedCustomerForm = this._formBuilder.group({
            id: [''],
            firstName: [''],
            lastName: [''],
            email: [''],
            companyName: [''],
            storeName: [''],
            title: [''],
            date: [''],
            ipaddress: [''],
            fax: [''],
            dayPhone: [''],
            zipCode: [''],
            city: [''],
            blnActive: [''],
            website: [''],
            department: ['']
        });

        this._customerService.customer$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((response) => {
                this.selectedCustomer = response;
                // Mark for check
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

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------
    clicked(item) {
        if (item.route != this.selectedRoute) {
            this.selectedScreeen = item.title;
            this.selectedRoute = item.route;
            setTimeout(() => {
                this.topScroll.nativeElement.scrollIntoView({ behavior: 'smooth' });
            }, 100);
            this._router.navigate([item.route], { relativeTo: this.route });
        }
    }

    toggleDrawer() {
        this.drawerOpened = !this.drawerOpened;
    }

    backToCustomersScreen(): void {
        this.isLoading = true;
        this._router.navigate(['/apps/customers']);
    }
}
