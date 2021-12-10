import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';

@Component({
    selector       : 'customers',
    templateUrl    : './customers.component.html',
    encapsulation  : ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class CustomersComponent
{
    /**
     * Constructor
     */
    constructor()
    {
    }
}
