import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-products-physics',
  templateUrl: './products-physics.component.html'
})
export class ProductsPhysicsComponent implements OnInit {
  @Input() selectedProduct: any;
  @Input() isLoading: boolean;
  @Output() isLoadingChange = new EventEmitter<boolean>();
  selectedorder: string = 'select_order';
  products: string[] = [
    'YES',
    'NO'
  ];

  constructor() { }

  ngOnInit(): void {
    this.isLoadingChange.emit(false);
  }

  updateDescription(): void {
    console.log("updateDescription");
  }

}
