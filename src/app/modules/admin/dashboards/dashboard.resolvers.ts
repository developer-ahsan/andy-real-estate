import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { DashboardsService } from './dashboard.service';

@Injectable({
    providedIn: 'root'
})
export class AnalyticsResolver implements Resolve<any>
{
    /**
     * Constructor
     */
    constructor(private _dashboardService: DashboardsService) {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Resolver
     *
     * @param route
     * @param state
     */
    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> {
        return this._dashboardService.getData();
    }
}



@Injectable({
    providedIn: 'root'
})
export class ProjectResolver implements Resolve<any>
{
    /**
     * Constructor
     */
    constructor(private _dashboardService: DashboardsService) {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Resolver
     *
     * @param route
     * @param state
     */
    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> {
        return this._dashboardService.getDataProject();
    }
}

// Portfolio Performance
@Injectable({
    providedIn: 'root'
})
export class PortfolioPerformanceResolver implements Resolve<any>
{
    /**
     * Constructor
     */
    constructor(private _dashboardService: DashboardsService) {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Resolver
     *
     * @param route
     * @param state
     */
    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> {
        return this._dashboardService.getPortfolio();
    }
}
