import { Component, Input } from '@angular/core';
import { SearchService } from "../../search";

@Component({
	selector: 'searchBar',
	templateUrl: './searchBar.html',
	styleUrls: ['./searchBar.css']
})
export class SearchBar {
	constructor(public searchService: SearchService) {
	
	}
}