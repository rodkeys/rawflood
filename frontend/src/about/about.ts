import { Component } from '@angular/core';
import { SearchService } from '../services/search'; 

@Component({
	selector: 'about',
	templateUrl: './about.html',
	styleUrls: ['./about.css'],
})

export class About {
	constructor(public searchService: SearchService) {
	}


}
