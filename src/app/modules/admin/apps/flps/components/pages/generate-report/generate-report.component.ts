import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, Input, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import moment from 'moment';
import { fromEvent, of, Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, filter, finalize, map, switchMap, takeUntil, tap } from 'rxjs/operators';
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


    searcEmployeeCtrl = new FormControl();
    selectedEmployee: any;
    isSearching = false;
    minLengthTerm = 3;

    // Report
    WeekDate = new Date();
    monthlyMonth = 1;
    monthlyYear = new Date().getFullYear();
    quarterMonth = 1;
    quarterYear = new Date().getFullYear();
    yearlyYear = new Date().getFullYear();
    ngRangeStart = new Date();
    ngRangeEnd = new Date();

    /**
     * Constructor
     */
    constructor(
        private _formBuilder: FormBuilder,
        private _changeDetectorRef: ChangeDetectorRef,
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
        let params;
        this.searcEmployeeCtrl.valueChanges.pipe(
            filter(res => {
                params = {
                    view_store_all_admins: true,
                    keyword: res
                }
                return res !== null && res.length >= this.minLengthTerm
            }),
            distinctUntilChanged(),
            debounceTime(500),
            tap(() => {
                this.employeeAdmins = [];
                this.isSearching = true;
                this._changeDetectorRef.markForCheck();
            }),
            switchMap(value => this._flpsService.getFlpsData(params)
                .pipe(
                    finalize(() => {
                        this.isSearching = false
                        this._changeDetectorRef.markForCheck();
                    }),
                )
            )
        )
            .subscribe((data: any) => {
                this.employeeAdmins = data['data'];
            });
    }
    onSelected(ev) {
        this.selectedEmployee = ev.option.value;
    }

    displayWith(value: any) {
        return value ? value?.firstName + ' ' + value?.lastName : '';
    }

    getEmployees() {
        this._flpsService.reportUsers$.pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
            this.employeeAdmins = res["data"];
        })
    }
    generateReport() {
        let params;
        if (this.ngPlan == 'weekly') {
            params = {
                start_date: moment(this.WeekDate).startOf('week').format('MM/DD/yyyy'),
                end_date: moment(this.WeekDate).endOf('week').format('MM/DD/yyyy')
            }
        } else if (this.ngPlan == 'monthly') {
            let d = new Date(this.monthlyYear, this.monthlyMonth - 1, 1);
            params = {
                start_date: moment(d).startOf('month').format('MM/DD/yyyy'),
                end_date: moment(d).endOf('month').format('MM/DD/yyyy')
            }
        } else if (this.ngPlan == 'quarterly') {
            let s;
            let e;
            if (this.quarterMonth == 1) {
                s = new Date(this.quarterYear, 0, 1);
                e = new Date(this.quarterYear, 2, 1);
            } else if (this.quarterMonth == 2) {
                s = new Date(this.quarterYear, 3, 1);
                e = new Date(this.quarterYear, 5, 1);
            } else if (this.quarterMonth == 3) {
                s = new Date(this.quarterYear, 6, 1);
                e = new Date(this.quarterYear, 8, 1);
            } else if (this.quarterMonth == 4) {
                s = new Date(this.quarterYear, 9, 1);
                e = new Date(this.quarterYear, 11, 1);
            }
            params = {
                start_date: moment(s).startOf('month').format('MM/DD/yyyy'),
                end_date: moment(e).endOf('month').format('MM/DD/yyyy')
            }
        } else if (this.ngPlan == 'yearly') {
            let d = new Date(this.yearlyYear, 0, 1);
            params = {
                start_date: moment(d).startOf('year').format('MM/DD/yyyy'),
                end_date: moment(d).endOf('year').format('MM/DD/yyyy')
            }
        } else if (this.ngPlan == 'range') {
            params = {
                start_date: moment(this.ngRangeStart).format('MM/DD/yyyy'),
                end_date: moment(this.ngRangeEnd).format('MM/DD/yyyy')
            }
        }
        console.log(params)
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
        return item.value || index;
    }
}
