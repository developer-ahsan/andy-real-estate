import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QuoteContactInfoComponent } from './quote-contact-info.component';

describe('QuoteContactInfoComponent', () => {
  let component: QuoteContactInfoComponent;
  let fixture: ComponentFixture<QuoteContactInfoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ QuoteContactInfoComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(QuoteContactInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
