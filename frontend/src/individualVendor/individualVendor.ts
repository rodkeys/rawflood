import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Http } from '@angular/http';
import { SearchService } from '../services/search';
import { Utility } from '../services/utility';
import { Request } from '../services/request';
import { OrderBy } from "../services/pipes/orderByPipe";
import { Title } from '@angular/platform-browser';

@Component({
	selector: 'individualVendor',
	templateUrl: './individualVendor.html',
	styleUrls: ['./individualVendor.css'],
})

export class IndividualVendor {
	vendor: any;
	sortByOptions: any = [{ label: "Relevance", value: "title" }, { label: "Highest Price", value: "-price" }, { label: "Lowest Price", value: "price" }];
	vendorListingsSortBy: string = "title";

	vendorListingsDisplayNumberOptions: any = [{ label: "10", value: 10 }, { label: "25", value: 25 }, { label: "100", value: 100 }];

	vendorListingsStart: number = 0;

	vendorListingDisplayNumber: number = 10;

	// Pipe used for data sorting
	orderBy: OrderBy;

	constructor(
		public route: ActivatedRoute,
		public http: Http,
		public searchService: SearchService,
		public utility: Utility,
		public request: Request,
		public titleService: Title
	) {
		this.route.params.subscribe((params: any) => {
			let vendorId = params['vendorId'];
			this.getIndividualVendor(vendorId);
		});
	}

	getIndividualVendor(vendorId: string) {
		this.request.sendGET(`/api/returnIndividualVendor/${vendorId}`).then((data: any) => {
			this.vendor = data;
			console.log(this.vendor)
			// Update currency conversions for listings
			this.utility.updateAllCurrencyCodes(this.vendor.listings);

			// Set page title when listing comes in
			this.titleService.setTitle(this.vendor.name + " | RawFlood");
		}).catch((err) => {
			console.log(err);
		})
	}


	// Change number of results shown on search page
	displayNumberChange() {
		this.vendorListingsStart = 0;
		this.utility.resetPagination();
	}

	// If the vendor doc was updated within the last 10 minutes then return 'online now'
	checkDateOnlineNow(date: string) {
		if (Date.parse(date) + 600000 > Date.now()) {
			return true;
		} else {
			return false;
		}
	}

	// Return all vendor listings
	returnVendorListings() {
		if (this.vendor) {
			return this.vendor.listings.slice(this.vendorListingsStart, (this.vendorListingsStart + this.vendorListingDisplayNumber));
		} else {
			return [];
		}
	}

	returnVendorRatings(listings) {
		let allRatings = [];
		for (let i = 0; i < listings.length; i++) {
			if (listings[i].ratings) {
				allRatings = allRatings.concat(listings[i].ratings);
			}
		}
		return allRatings;
	}

	paginateVendorListings(event: any) {
		this.vendorListingsStart = event.page * this.vendorListingDisplayNumber;
	}

	calculateVendorAverageRating(vendorListings) {
		let averageRating = 0;
		let activeListings = 0;
		if (vendorListings) {
			for (let i = 0; i < vendorListings.length; i++) {
				if (vendorListings[i].averageRating) {
					activeListings++;
					averageRating = averageRating + vendorListings[i].averageRating;
				}
			}
			averageRating = averageRating / activeListings;
			return averageRating;
		} else {
			return 0;
		}
	}

}
