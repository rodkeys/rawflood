/*
 * Angular 2 decorators and services
 */
import { Component, ViewEncapsulation } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router'
import { VendorService } from "../services/vendors";

/*
 * App Component
 * Top Level Component
 */ 

@Component({
  selector: 'auth-app',
  encapsulation: ViewEncapsulation.None,
  template: `
    <router-outlet></router-outlet>
  `
})
export class AppComponent {
  constructor(
  	public router: Router, 
  	public vendorService: VendorService) {
    
  }
} 
  