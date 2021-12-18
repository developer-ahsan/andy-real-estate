import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-user-comments',
  templateUrl: './user-comments.component.html'
})
export class UserCommentsComponent implements OnInit {
  @Input() currentSelectedCustomer: any;
  emails: string[] = [
    'alecia.moneypenny@consolidus.com',
    'billing@consolidus.com',
    'adam.b@consolidus.com',
    'amanda.w@consolidus.com',
    'brooke@consolidus.com',
    'consolidusbill@gmail.com',
    'content@consolidus.com',
    'denise.cline@consolidus.com',
    'evan.a@consolidus.com',
    'jeffrey.jones@consolidus.com',
    'krysti.horvat@consolidus.com',
    'leilani.bever@consolidus.com',
    'lindsey.myers@consolidus.com',
    'matt.h@consolidus.com',
    'nicole.a@consolidus.com',
    'nolan.h@consolidus.com',
    'rhianne.smith@consolidus.com',
    'sara.m@consolidus.com',
    'tony.cucolo@consolidus.com',
    'troy.louis@consolidus.com'
  ];

  constructor() { }

  ngOnInit(): void {
  }

}
