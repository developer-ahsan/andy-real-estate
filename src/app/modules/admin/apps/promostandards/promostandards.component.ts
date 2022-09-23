import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';

@Component({
    selector: 'tasks',
    templateUrl: './promostandards.component.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class PromostandardsComponent {
    /**
     * Constructor
     */
    constructor() {
    }
}
