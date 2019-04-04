import { Component, Input } from '@angular/core';
import { SearchService } from "../../search";

@Component({
	selector: 'footerBar',
	templateUrl: './footerBar.html',
	styleUrls: ['./footerBar.css']
})
export class FooterBar {
	constructor(public searchService: SearchService) {
	
	}
}