import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { InventoryService } from './inventory.service';
import { DashboardsService } from 'app/modules/admin/dashboards/dashboard.service';

@Component({
    selector: 'inventory',
    templateUrl: './inventory.component.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class InventoryComponent {
    /**
     * Constructor
     */
    constructor(public inventoryService: InventoryService, private _commonService: DashboardsService) {
        this.inventoryService.adminUserPermissions = this._commonService.assignPermissions('product', this.inventoryService.adminUserPermissions);
        this.inventoryService.productDescription = this._commonService.assignPermissions('productDescription', this.inventoryService.productDescription);
        this.inventoryService.productImprint = this._commonService.assignPermissions('productImprint', this.inventoryService.productImprint);
        this.inventoryService.productOption = this._commonService.assignPermissions('productOption', this.inventoryService.productOption);
        this.inventoryService.storeProduct = this._commonService.assignPermissions('storeProduct', this.inventoryService.storeProduct);
    }
}
