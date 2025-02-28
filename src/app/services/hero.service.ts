import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, combineLatest, Observable } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface Hero {
    id: number;
    name: string;
    description: string;
    thumbnail: HeroThumbnail;
    resourceURI: string;
    comics: HeroSubItems;
    events: HeroSubItems;
    series: HeroSubItems;
    stories: HeroSubItems;
}

export interface HeroThumbnail {
    path: string;
    extendion: string;
}

export interface HeroSubItems {
    available: number;
    returned: number;
    collectionURI: string;
    items: HeroSubItem[];
}

export interface HeroSubItem {
    resourceURI: string;
    name: string;
}

// The URL to the Marvel API
const HERO_API = `${environment.MARVEL_API.URL}/v1/public/characters`;

// Our Limits for Search
const LIMIT_LOW = 10;
const LIMIT_MID = 25;
const LIMIT_HIGH = 100;
const LIMITS = [LIMIT_LOW, LIMIT_MID, LIMIT_HIGH];

@Injectable({
    providedIn: 'root',
})
export class HeroService {
    limits = LIMITS;

    private searchBS = new BehaviorSubject('hulk');
    private pageBS = new BehaviorSubject('');
    private limitBS = new BehaviorSubject(LIMIT_LOW);

    search$ = this.searchBS.asObservable()
    page$ = this.pageBS.asObservable()
    limit$ = this.limitBS.asObservable();
    userPage$ = this.page$.pipe(map(val => val + 1))

    changes$ = combineLatest([this.searchBS, this.pageBS, this.limitBS]);

    heroes$ = this.changes$.pipe(
        switchMap(([search, page, limit]) => this.http.get
        (HERO_API, {
            params: {
                apikey: environment.MARVEL_API.PUBLIC_KEY,
                limit: `${limit}`,
                nameStartsWith: `${search}`, // once we have search
                //@ts-ignore
                offset: `${page * limit}`, // page * limit
            },
        })
        .pipe(map((res: any) => res.data.results)))
    );

    constructor(private http: HttpClient) {}
}
