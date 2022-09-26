import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';

@Component({
    selector: 'store',
    templateUrl: './store.component.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProductStoreComponent {
    /**
     * Constructor
     */
    constructor() {
    }
}
