import { Component, OnInit, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { VendorsService } from '../../vendors.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { finalize, takeUntil } from 'rxjs/operators';
import { C } from '@angular/cdk/keycodes';

@Component({
  selector: 'app-designer-notes',
  templateUrl: './designer-notes.component.html',
})
export class DesignerNotesComponent implements OnInit, OnDestroy {
  private _unsubscribeAll: Subject<any> = new Subject<any>();

  quillModules: any = {
    toolbar: [
      ['bold', 'italic', 'underline', 'strike'],
      ['blockquote', 'code-block'],
      [{ 'color': [] }, { 'background': [] }],
      [{ 'font': [] }],
      [{ 'align': [] }],
      ['clean']
    ]
  };

  notes = null;
  updateLoader: boolean = false;
  supplierData: any;

  isLoading: boolean;

  constructor(
    private _changeDetectorRef: ChangeDetectorRef,
    private _vendorService: VendorsService,
    private _snackBar: MatSnackBar,

  ) { }

  ngOnInit(): void {
    this.getVendorsData();
  };

  update() {
    if (this.notes.slice(3, -4).trim() === '') {
      this._snackBar.open("Please fill the required field", '', {
        horizontalPosition: 'center',
        verticalPosition: 'bottom',
        duration: 3000
      });
      return;
    }
    this.updateLoader = true;
    const payload = {
      companyID: this.supplierData.pk_companyID,
      designerNotes: this.notes,
      update_designer_notes: true,
    }
    this._vendorService.putVendorsData(this.replaceSingleQuotesWithDoubleSingleQuotes(payload))
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe(
        res => {
          this.updateLoader = false;
          this._snackBar.open("Designer notes updated successfully", '', {
            horizontalPosition: 'center',
            verticalPosition: 'bottom',
            duration: 3000
          });
          this._changeDetectorRef.markForCheck();
        },
        err => {
          this._vendorService.snackBar('Something went wrong');
          this.updateLoader = false;
          this._changeDetectorRef.markForCheck();
        }
      );

  }

  replaceSingleQuotesWithDoubleSingleQuotes(obj: { [key: string]: any }): any {
    for (const key in obj) {
      if (obj.hasOwnProperty(key) && typeof obj[key] === 'string') {
        obj[key] = obj[key].replace(/'/g, "''");
      }
    }
    return obj;
  }

  getVendorsData() {
    this._vendorService.Single_Suppliers$.pipe(takeUntil(this._unsubscribeAll), finalize(() => {
    })).subscribe(supplier => {
      this.supplierData = supplier["data"][0];
      this.notes = this.supplierData.designerNotes;
    })
  }

  /**
     * On destroy
     */
  ngOnDestroy(): void {
    // Unsubscribe from all subscriptions
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  };

}
