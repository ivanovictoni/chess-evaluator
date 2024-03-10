import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ChesscomService {

  constructor(private http: HttpClient) { }

  async getGames(username: string): Promise<any> {
    let url = `https://api.chess.com/pub/player/${username}/games/archives`;
    let data = await fetch(url);
    let res = await data.json();

    return res;
  }

  async getGamesForDate(url: string): Promise<any> {
    let data = await fetch(url);
    let res = await data.json();

    return res.games;
  }
}
