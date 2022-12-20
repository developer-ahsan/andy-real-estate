import { ChangeDetectionStrategy, Component, Input, OnInit, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import moment from 'moment';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { FLPSService } from '../../flps.service';

@Component({
    selector: 'app-generate-report',
    templateUrl: './generate-report.component.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class GenerateReportComponent implements OnInit {
    planBillingForm: FormGroup;
    plans: any[];
    @Input() isLoading: boolean;
    private _unsubscribeAll: Subject<any> = new Subject<any>();
    employeeAdmins = [];
    ngEmployee = 12885;
    ngPlan = 'weekly';
    maxDate = new Date();
    months = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
    month = 1;
    currentYear = new Date().getFullYear();
    years = [];

    quarter = 1;
    quarterly = [{
        value: 1,
        text: '1-3'
    },
    {
        value: 2,
        text: '4-6'
    },
    {
        value: 3,
        text: '7-9'
    },
    {
        value: 4,
        text: '10-12'
    }];
    /**
     * Constructor
     */
    constructor(
        private _formBuilder: FormBuilder,
        private _flpsService: FLPSService
    ) {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void {
        for (let index = 0; index < 17; index++) {
            this.years.push(this.currentYear - index);
        }
        this.getEmployees();
        // Create the form
        this.planBillingForm = this._formBuilder.group({
            plan: ['team'],
            cardHolder: ['Brian Hughes'],
            cardNumber: [''],
            cardExpiration: [''],
            cardCVC: [''],
            country: ['usa'],
            zip: ['']
        });

        // Setup the plans
        this.plans = [
            {
                value: 'weekly',
                label: 'Weekly',
                details: 'Choose a date.',
                price: '10'
            },
            {
                value: 'monthly',
                label: 'Monthly',
                details: 'Choose month and year.',
                price: '20'
            },
            {
                value: 'quarterly',
                label: 'Quarterly',
                details: 'Generate quarterly report.',
                price: '40'
            },
            {
                value: 'yearly',
                label: 'Yearly',
                details: 'Choose a year.',
                price: '40'
            },
            {
                value: 'range',
                label: 'Range',
                details: 'Generate range report.',
                price: '40'
            }
        ];
    }
    getEmployees() {
        this._flpsService.employeeAdmins$.pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
            this.employeeAdmins = res["data"];
        })
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

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
