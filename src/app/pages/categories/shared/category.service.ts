import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";

import { Observable, throwError } from "rxjs";
import { map, catchError, flatMap } from "rxjs/operators";

import { Category } from "./category.model";

@Injectable({
  providedIn: "root",
})
export class CategoryService {
  private apiPath: string = "api/categories";

  constructor(private http: HttpClient) {}

  /*
   * Obtem todas as categorias
   */
  getAll(): Observable<Category[]> {
    return this.http
      .get(this.apiPath)
      .pipe(catchError(this.handleError), map(this.jsonDataToCategories));
  }

  /*
   * Obtem uma categoria pelo seu ID
   */
  getById(id: number): Observable<Category> {
    const url = `${this.apiPath}/${id}`;

    return this.http
      .get(url)
      .pipe(catchError(this.handleError), map(this.jsonDataToCategory));
  }

  /*
   * Cria uma categoria
   */
  create(category: Category): Observable<Category> {
    return this.http
      .post(this.apiPath, category)
      .pipe(catchError(this.handleError), map(this.jsonDataToCategory));
  }

  /*
   * Atualiza uma categoria pelo seu ID
   */
  update(category: Category): Observable<Category> {
    const url = `${this.apiPath}/${category.id}`;

    return this.http.put("url", category).pipe(
      catchError(this.handleError),
      map(() => category)
    );
  }

  /*
   * Deleta uma categoria pelo seu ID
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
   * Converte os dados do backend em um array de objetos Categorie
   */
  private jsonDataToCategories(jsonData: any[]): Category[] {
    const categories: Category[] = [];
    jsonData.forEach((element) => {
      const category = Object.assign(new Category(), element);
      categories.push(category);
    });
    return categories;
  }

  /*
   * Converte os dados do backend em objeto Categorie
   */
  private jsonDataToCategory(jsonData: any): Category {
    return Object.assign(new Category(), jsonData);
  }

  /*
   * Captura os erros
   */
  private handleError(error: any): Observable<any> {
    console.log("ERRO NA REQUISIÇÃO => ", error);
    return throwError(error);
  }
}
