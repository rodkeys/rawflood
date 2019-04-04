import { Component } from '@angular/core';
import { Utility } from '../services/utility';
import { SearchService } from "../services/search";
import { Request } from "../services/request";
import { Http } from '@angular/http';
import { Router } from '@angular/router'
import { Title } from '@angular/platform-browser';


@Component({
	selector: 'welcome',
	templateUrl: './welcome.html',
	styleUrls: ['./welcome.css'],
})

export class Welcome {
	shouldDisplayOptionMenu: boolean = false;
	shouldDisplayNumberMenu: boolean = false;
	displayOption: string = "Most Relevant";


	sortByOptions: Array<any> = [{ label: "Most Relevant", value: "-weight" }, { label: "Highest Price", value: "-bitcoinPrice" }, { label: "Lowest Price", value: "bitcoinPrice" }];

	displayNumberOptions: Array<any> = [{ label: "10", value: 10 }, { label: "25", value: 25 }, { label: "50", value: 50 }];

	constructor(public http: Http,
		public utility: Utility,
		public searchService: SearchService,
		public titleService: Title,
		public request: Request) {

		let checkPageExists = setInterval(() => {
			if (document.getElementsByClassName("ui-paginator-pages")[0]) {
				// Start on the search page you last left off on
				this.findCorrectPage();

				clearInterval(checkPageExists);
			}
		})

		// Set page title when user hits welcome page
		this.titleService.setTitle("OpenBazaar Listing Explorer | RawFlood");

		// Initialize search results
		this.searchService.searchListings();
	}


	// Change number of results shown on search page
	displayNumberChange() {
		this.searchService.resetListingPagination();
	}



	// Navigate to correct page based on previous settings
	findCorrectPage() {
		if (this.searchService.listingsStart != 0) {
			const currentPageNumber = Math.floor(this.searchService.listingsStart / this.searchService.displayNumber) + 1;
			const pageList: any = document.getElementsByClassName("ui-paginator-pages")[0].children;

			let checkExist = setInterval(() => {
				let pageFound = false;
				for (let i = 0; i < pageList.length; i++) {
					if (pageList[i].innerHTML == String(currentPageNumber)) {
						pageList[i].click();
						pageFound = true;
						clearInterval(checkExist);
					}
				}
				if (!pageFound) {
					pageList[4].click();
				}
			})
		}
	}

	// Return search results based on criteria
	returnPageListings() {
		return this.searchService.returnFilteredListings().slice(this.searchService.listingsStart, (this.searchService.listingsStart + this.searchService.displayNumber))
	}

	paginateListings(event: any) {
		this.searchService.listingsStart = event.page * this.searchService.displayNumber;
	}


	unfocusCheckbox(event) {
		event.stopPropagation();
	}




}
