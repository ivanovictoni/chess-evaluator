import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ChesscomService {

  constructor(private http: HttpClient) { }

  async getGames(username: string): Promise<any> {
    let url = environment.serverUrl + `chessCom/getPlayerGames/${username}`;
    let data = await fetch(url);
    let res = await data.text();

    return res;
  }
}
