import { ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subject } from 'rxjs';
import { FileManagerService } from '../../store-manager.service';
import { takeUntil } from 'rxjs/operators';
@Component({
  selector: 'app-credit-terms',
  templateUrl: './credit-terms.component.html',
})
export class CreditTermsComponent implements OnInit {
  @Input() selectedStore: any;
  @Input() isLoading: boolean;
  @Output() isLoadingChange = new EventEmitter<boolean>();
  private _unsubscribeAll: Subject<any> = new Subject<any>();
  isPageLoading: boolean = false;
  creditTerms: any;
  selectedTerm: any;
  constructor(
    private _fileManagerService: FileManagerService,
    private _changeDetectorRef: ChangeDetectorRef,
    private _snackBar: MatSnackBar
  ) { }

  ngOnInit() {
    this.isPageLoading = true;
    this.getCredits();
  }
  getCredits() {
    let params = {
      store_id: this.selectedStore.pk_storeID,
      credit_term: true
    }
    this._fileManagerService.getStoresData(params)
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe(res => {
        this.isPageLoading = false;
        this.creditTerms = res["data"];
        this._changeDetectorRef.markForCheck();
      })
  }

}
