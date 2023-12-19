import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { Subject } from 'rxjs';
import { CompaniesService } from './companies.service';

@Component({
    selector: 'app-companies-list',
    templateUrl: './companies.component.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class CompaniesDetailsComponent {
    isLoading: boolean = false;
    private _unsubscribeAll: Subject<any> = new Subject<any>();



    // 
    /**
     * Constructor
     */
    constructor(
        private _coampnyService: CompaniesService
    ) {
        // this._coampnyService.getIPAddress().subscribe(res => {
        //     console.log(res)
        // });

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
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
    }

}