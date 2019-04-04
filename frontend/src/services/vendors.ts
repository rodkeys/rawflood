import { Injectable } from '@angular/core';
import { Http } from '@angular/http';


@Injectable()
export class VendorService {
	allVendors: any;
	constructor(public http: Http) {

		// Note: Eventually move to indexdb when listings get larger
		// If there is a cached allVendors exists then set it 
		if (localStorage.getItem("allVendors")) {
			try {
				this.allVendors = JSON.parse(localStorage.getItem("allVendors"));
			} catch (err) {
				console.log(err);
				localStorage.setItem('allListings', null)
			}
		}
	}



}