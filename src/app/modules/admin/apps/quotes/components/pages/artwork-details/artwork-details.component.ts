import { Component, Input, OnInit, Output, EventEmitter, ChangeDetectorRef, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Subject } from 'rxjs';
import { QuotesService } from '../../quotes.service';
import { environment } from 'environments/environment';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-artwork-details',
  templateUrl: './artwork-details.component.html',
  styles: [".mat-paginator {border-radius: 16px !important}"]
})
export class QuoteArtworkDetailsComponent implements OnInit, OnDestroy {
  @Output() isLoadingChange = new EventEmitter<boolean>();
  private _unsubscribeAll: Subject<any> = new Subject<any>();

  isLoading: boolean = false;
  selectedOrder: any;

  orderParticipants = [];
  quoteDetail: any;
  orderProducts = [];
  not_available = 'N/A';
  imgUrl = environment.productMedia;
  sideNavData: any;
  tempDate = Math.random();
  modalContent: any;
  artworkComment: string = '';
  @ViewChild('commentModal') commentModal: ElementRef;
  @ViewChild('fileInput') fileInput: ElementRef;
  imageValue: any;
  @ViewChild('removeArtwork') removeArtwork: ElementRef;
  removeModalIndex: any;
  removeModalOrderIndex: any;
  removeFileName: string = '';
  artworkIndex: any;
  constructor(
    private _changeDetectorRef: ChangeDetectorRef,
    private _quoteService: QuotesService
  ) { }

  ngOnInit(): void {
    this.isLoading = false;
    this._changeDetectorRef.markForCheck();
    this._quoteService.qoutesDetails$.pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      if (res["data"].length) {
        this.quoteDetail = res["data"][0];
      }
    })
  }
  ngOnDestroy(): void {
    // Unsubscribe from all subscriptions
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  };

}
