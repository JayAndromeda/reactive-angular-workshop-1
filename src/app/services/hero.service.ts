import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, combineLatest, Observable } from 'rxjs';
import { map, switchMap, tap } from 'rxjs/operators';
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

    private searchBS = new BehaviorSubject('');
    private pageBS = new BehaviorSubject(0);
    private limitBS = new BehaviorSubject(LIMIT_LOW);

    search$ = this.searchBS.asObservable();
    page$ = this.pageBS.asObservable();
    limit$ = this.limitBS.asObservable();
    userPage$ = this.page$.pipe(map(val => val + 1));

    changes$ = combineLatest([this.search$, this.page$, this.limit$]);
    heroesResponse$ = this.changes$.pipe(
        switchMap(([search, page, limit]) => {
            const params: any = {
                apikey: environment.MARVEL_API.PUBLIC_KEY,
                limit: `${limit}`,
                offset: `${page * limit}`, // page * limit
            };
            if (search && search.length) {
                params.nameStartsWith = search;
            }

            return this.http.get(HERO_API, { params });
        }),
    );
    heroes$ = this.heroesResponse$.pipe(map((res: any) => res.data.results));
    total$ = this.heroesResponse$.pipe(map((res: any) => res.data.total));
    totalPages$ = combineLatest([this.total$, this.limit$]).pipe(
        map(([total, limit]) => Math.ceil(total / limit)),
    );

    constructor(private http: HttpClient) {}
}
