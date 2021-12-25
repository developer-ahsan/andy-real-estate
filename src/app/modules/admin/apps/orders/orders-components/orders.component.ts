import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';

@Component({
    selector       : 'orders',
    templateUrl    : './orders.component.html',
    encapsulation  : ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class OrdersComponent
{
    /**
     * Constructor
     */
    constructor()
    {
    }
}
