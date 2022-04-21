import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDrawer } from '@angular/material/sidenav';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { FuseMediaWatcherService } from '@fuse/services/media-watcher';
import { FileManagerService } from 'app/modules/admin/apps/file-manager/file-manager.service';
import { Item, Items } from 'app/modules/admin/apps/file-manager/file-manager.types';

@Component({
    selector: 'file-manager-list',
    templateUrl: './list.component.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class FileManagerListComponent implements OnInit, OnDestroy {
    @ViewChild('matDrawer', { static: true }) matDrawer: MatDrawer;
    drawerMode: 'side' | 'over';
    selectedItem: Item;
    items: Items;
    stores: any = [];
    private _unsubscribeAll: Subject<any> = new Subject<any>();
    selectedStore = null;
    quillModules: any = {
        toolbar: [
            ['bold', 'italic', 'underline', 'strike'],
            ['blockquote', 'code-block'],
            [{ 'color': [] }, { 'background': ['white'] }],
            [{ 'font': [] }],
            [{ 'align': [] }],
            ['clean']
        ]
    };

    // Boolean
    isLoading: boolean = false;
    isStoreNotReceived = true;
    enableAddStoreForm = false;

    /**
     * Constructor
     */
    constructor(
        private _activatedRoute: ActivatedRoute,
        private _changeDetectorRef: ChangeDetectorRef,
        private _router: Router,
        private _fileManagerService: FileManagerService,
        private _fuseMediaWatcherService: FuseMediaWatcherService
    ) {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void {
        this.isLoading = true;

        // Get the stores
        this._fileManagerService.getAllStores()
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((stores) => {
                this.stores = stores["data"];
                this.isStoreNotReceived = false;
                this.isLoading = false;

                // Mark for check
                this._changeDetectorRef.markForCheck();
            })

        // Get the items
        this._fileManagerService.items$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((items: Items) => {
                this.items = items;

                // Mark for check
                this._changeDetectorRef.markForCheck();
            });

        // Get the item
        this._fileManagerService.item$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((item: Item) => {
                this.selectedItem = item;

                // Mark for check
                this._changeDetectorRef.markForCheck();
            });

        // Subscribe to media query change
        this._fuseMediaWatcherService.onMediaQueryChange$('(min-width: 1440px)')
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((state) => {

                // Calculate the drawer mode
                this.drawerMode = state.matches ? 'side' : 'over';

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

    /**
     * On backdrop clicked
     */
    onBackdropClicked(): void {
        // Go back to the list
        this._router.navigate(['./'], { relativeTo: this._activatedRoute });

        // Mark for check
        this._changeDetectorRef.markForCheck();
    }

    toggleAddStoreFormEnable(): void {
        this.enableAddStoreForm = !this.enableAddStoreForm;
    }

    selectByStore(event): void {
        console.log("event", event);
    }

    clearFilter() { }

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
