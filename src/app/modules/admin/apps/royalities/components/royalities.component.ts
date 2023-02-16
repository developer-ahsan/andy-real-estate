import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { fuseAnimations } from '@fuse/animations';
import { ActivatedRoute, Router } from '@angular/router';
import { FuseMediaWatcherService } from '@fuse/services/media-watcher';
import { RoyaltyService } from './royalities.service';
import { UserService } from 'app/core/user/user.service';
import { AuthService } from 'app/core/auth/auth.service';
import { MatDrawer } from '@angular/material/sidenav';
import Swal from 'sweetalert2'
@Component({
    selector: 'royalty',
    templateUrl: './royalities.component.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class RoyaltyComponent {
    isLoading: boolean = false;
    private _unsubscribeAll: Subject<any> = new Subject<any>();
    routes = [];
    selectedScreeen = 'Reports';

    user: any;
    // Sidebar stuff
    @ViewChild('topScrollAnchor') topScroll: ElementRef;


    @ViewChild('drawer') drawer: MatDrawer;
    drawerMode: 'over' | 'side' = 'side';
    drawerOpened: boolean = true;
    panels: any[] = [];
    selectedPanel: string = 'reports';
    /**
     * Constructor
     */
    constructor(
        private _changeDetectorRef: ChangeDetectorRef,
        private _RoyaltyService: RoyaltyService,
        private _router: Router,
        private route: ActivatedRoute,
        private _authService: AuthService,
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
        if (this._router.url.includes('reports')) {
            this.selectedPanel = 'reports';
        } else if (this._router.url.includes('licensing')) {
            this.selectedPanel = 'licensing';
        } else if (this._router.url.includes('setting')) {
            this.selectedPanel = 'setting';
        }
        this.isLoading = false;
        this.panels = [
            {
                id: 'reports',
                icon: 'heroicons_outline:document-report',
                title: 'Reports',
                description: 'Manage Royalty Reports',
                route: 'reports'
            },
            {
                id: 'licensing',
                icon: 'heroicons_outline:user-group',
                title: 'Licensing Companies',
                description: 'Manage Licensing Companies',
                route: 'licensing-companies'
            }
            // {
            //     id: 'setting',
            //     icon: 'mat_outline:settings',
            //     title: 'Store Royalty Settings',
            //     description: 'Manage Royalty Settings',
            //     route: 'settings'
            // }
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
    }
    calledScreen(title) {
        if (title != this.selectedScreeen) {
            this.selectedScreeen = title;
            this.isLoading = true;
        }
        this.topScroll.nativeElement.scrollIntoView({ behavior: 'smooth' });
    }
    /**
     * On destroy
     */
    ngOnDestroy(): void {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
    }
    goToPanel(panel): void {
        this.selectedPanel = panel.id;

        // Close the drawer on 'over' mode
        if (this.drawerMode === 'over') {
            this.drawer.close();
        }
        this._router.navigate([panel.route], { relativeTo: this.route })
        // this._router.navigateByUrl('admin-users');
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
