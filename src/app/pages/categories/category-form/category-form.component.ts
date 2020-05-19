import { Component, OnInit, AfterContentChecked } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";

import { ActivatedRoute, Router } from "@angular/router";

import { Category } from "../shared/category.model";
import { CategoryService } from "../shared/category.service";

import { switchMap } from "rxjs/operators";

import { success as toastrSuccess, error as toastrError } from "toastr";

@Component({
  selector: "app-category-form",
  templateUrl: "./category-form.component.html",
  styleUrls: ["./category-form.component.css"],
})

/*
 * DECLARAÇÕES
 * currentAction = Ação atual: new para criar uma nova categoria ou "edit" para editar uma.
 * categoryForm = O formulário em si.
 * pageTitle = método que seta no titulo da página se está criando ou editando uma categoria.
 * serverErrorMessages = Lista de erros que podem vir do servidor e que serão parcialmente informados ao usuário.
 * submittingForm = varivel para permitir ou não o envio do formulário ( evita diversas submissões ao mesmo tempo ).
 * category: objeto categorie em si.
 */
export class CategoryFormComponent implements OnInit, AfterContentChecked {
  currentAction: string;
  categoryForm: FormGroup;
  pageTitle: string;
  serverErrorMessages: string[] = null;
  submittingForm: boolean = false;
  category: Category = new Category();

  constructor(
    private categoryService: CategoryService,
    private route: ActivatedRoute,
    private router: Router,
    private formBuilder: FormBuilder
  ) {}

  /*
   * Inicia o ciclo de vida do componente setando a ação atual, criando o formulário e carregando a categoria
   * caso esteja sendo editada.
   */
  ngOnInit() {
    this.setCurrentAction();
    this.buildCategoryForm();
    this.loadCategory();
  }

  /*
   * depois de todo o conteúdo do ngOnInit ser gerado, o ngAfterContentChecked é gerado. Nesse caso, setando
   * o titulo da página.
   */
  ngAfterContentChecked() {
    this.setPageTitle();
  }

  submitForm() {
    this.submittingForm = true;
    if (this.currentAction == "new") {
      this.createCategory();
    } else {
      this.updateCategory();
    }
  }

  // PRIVATE METHODS

  private setCurrentAction() {
    if (this.route.snapshot.url[0].path === "new") this.currentAction = "new";
    else {
      this.currentAction = "edit";
    }
  }

  /*
   * Monta o fomulário
   */
  private buildCategoryForm() {
    this.categoryForm = this.formBuilder.group({
      id: [null],
      name: [null, [Validators.required, Validators.minLength(2)]],
      description: [null],
    });
  }

  /*
   * Monta o fomulário para a edição
   */
  private loadCategory() {
    if (this.currentAction === "edit") {
      this.route.paramMap
        .pipe(
          switchMap((params) => this.categoryService.getById(+params.get("id")))
        )
        .subscribe(
          (category) => {
            this.category = category;
            this.categoryForm.patchValue(this.category); // vincula os dados carregados da api no fomulário em edição
          },
          (error) => {
            toastrError("Ocorreu um erro ao processar a sua solicitação.");
          }
        );
    }
  }

  /*
   * Seta o título da página
   */
  private setPageTitle() {
    if (this.currentAction == "new")
      this.pageTitle = "Cadastro de nova categoria";
    else {
      const categoryName = this.category.name || "";
      this.pageTitle = "Editando categoria: " + categoryName;
    }
  }

  /*
   * Criação da categoria
   */
  private createCategory() {
    const category: Category = Object.assign(
      new Category(),
      this.categoryForm.value
    );

    this.categoryService.create(category).subscribe(
      (category) => this.actionsForSuccess(category),
      (error) => this.actionsForError(error)
    );
  }

  /*
   * Update da categoria
   */
  private updateCategory() {
    const category: Category = Object.assign(
      new Category(),
      this.categoryForm.value
    );

    this.categoryService.update(category).subscribe(
      (category) => this.actionsForSuccess(category),
      (error) => this.actionsForError(error)
    );
  }

  private actionsForSuccess(category: Category) {
    toastrSuccess(
      "Solicitação processada com sucesso, agora você pode editar a sua categoria."
    );

    // Redireciona a pagina para edição de categoria
    this.router.navigateByUrl("categories", { skipLocationChange: true });
  }

  private actionsForError(error) {
    toastrError("Ocorreu um erro ao processar a sua solicitação.");
    this.submittingForm = false;

    if (error.status === 422) {
      this.serverErrorMessages = JSON.parse(error._body).errors;
    } else {
      this.serverErrorMessages = [
        "Falha na comunicação com o servidor. Por favor, tente mais tarde.",
      ];
    }
  }
}
