import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";

import { Observable, throwError } from "rxjs";
import { map, catchError, flatMap } from "rxjs/operators";

import { Entry } from "./entry.model";

@Injectable({
  providedIn: "root",
})
export class EntryService {
  private apiPath: string = "api/entries";

  constructor(private http: HttpClient) {}

  /*
   * Obtem todas as entries
   */
  getAll(): Observable<Entry[]> {
    return this.http
      .get(this.apiPath)
      .pipe(catchError(this.handleError), map(this.jsonDataToEntries));
  }

  /*
   * Obtem uma entry pelo seu ID
   */
  getById(id: number): Observable<Entry> {
    const url = `${this.apiPath}/${id}`;

    return this.http
      .get(url)
      .pipe(catchError(this.handleError), map(this.jsonDataToEntry));
  }

  /*
   * Cria uma entry
   */
  create(entry: Entry): Observable<Entry> {
    return this.http
      .post(this.apiPath, entry)
      .pipe(catchError(this.handleError), map(this.jsonDataToEntry));
  }

  /*
   * Atualiza uma entry pelo seu ID
   */
  update(entry: Entry): Observable<Entry> {
    const url = `${this.apiPath}/${entry.id}`;

    return this.http.put("url", entry).pipe(
      catchError(this.handleError),
      map(() => entry)
    );
  }

  /*
   * Deleta uma entry pelo seu ID
   */
  delete(id: number): Observable<any> {
    const url = `${this.apiPath}/${id}`;

    return this.http.delete(url).pipe(
      catchError(this.handleError),
      map(() => null)
    );
  }

  // PRIVATE METHODS

  /*
   * Converte os dados do backend em um array de objetos Entries
   */
  private jsonDataToEntries(jsonData: any[]): Entry[] {
    const entries: Entry[] = [];
    jsonData.forEach((element) => entries.push(element as Entry));
    return entries;
  }

  /*
   * Converte os dados do backend em objeto Entry
   */
  private jsonDataToEntry(jsonData: any): Entry {
    return jsonData as Entry;
  }

  /*
   * Captura os erros
   */
  private handleError(error: any): Observable<any> {
    console.log("ERRO NA REQUISIÇÃO => ", error);
    return throwError(error);
  }
}
