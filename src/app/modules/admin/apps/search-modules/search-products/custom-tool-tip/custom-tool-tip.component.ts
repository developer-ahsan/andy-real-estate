import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { finalize, takeUntil } from 'rxjs/operators';
import { MatPaginator } from '@angular/material/paginator';

@Component({
    selector: 'custom-tool-tip',
    templateUrl: './custom-tool-tip.component.html',
    styles: [`.tooltip {
        position: absolute;
        /* Add other styles as needed */
      }`],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class CustomTooltipComponent implements OnInit, OnDestroy {
    @Input() data: any;
    isVisible: boolean = false;

    showTooltip() {
        this.isVisible = true;
        this._changeDetectorRef.markForCheck();
    }

    hideTooltip() {
        this.isVisible = false;
        this._changeDetectorRef.markForCheck();
    }
    /**
     * Constructor
     */
    constructor(
        private _activatedRoute: ActivatedRoute,
        private _changeDetectorRef: ChangeDetectorRef,
        private _router: Router
    ) {
        console.log(this.data);
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void {

    }
    /**
    * On destroy
    */
    ngOnDestroy(): void {
    }
}
