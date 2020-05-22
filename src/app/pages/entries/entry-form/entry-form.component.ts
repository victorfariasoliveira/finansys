import { Component, OnInit, AfterContentChecked } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";

import { ActivatedRoute, Router } from "@angular/router";

import { Entry } from "../shared/entry.model";
import { EntryService } from "../shared/entry.service";

import { switchMap } from "rxjs/operators";

import { success as toastrSuccess, error as toastrError } from "toastr";

@Component({
  selector: "app-entry-form",
  templateUrl: "./entry-form.component.html",
  styleUrls: ["./entry-form.component.css"],
})

/*
 * DECLARAÇÕES
 * currentAction = Ação atual: new para criar uma nova lançamento ou "edit" para editar uma.
 * entryForm = O formulário em si.
 * pageTitle = método que seta no titulo da página se está criando ou editando uma lançamento.
 * serverErrorMessages = Lista de erros que podem vir do servidor e que serão parcialmente informados ao usuário.
 * submittingForm = varivel para permitir ou não o envio do formulário ( evita diversas submissões ao mesmo tempo ).
 * entry: objeto entry em si.
 */
export class EntryFormComponent implements OnInit, AfterContentChecked {
  currentAction: string;
  entryForm: FormGroup;
  pageTitle: string;
  serverErrorMessages: string[] = null;
  submittingForm: boolean = false;
  entry: Entry = new Entry();

  imaskConfig = {
    mask: Number,
    scale: 2,
    thousandsSeparator: "",
    padFractionalZeros: true,
    normalizeZeros: true,
    radix: ",",
  };

  constructor(
    private entryService: EntryService,
    private route: ActivatedRoute,
    private router: Router,
    private formBuilder: FormBuilder
  ) {}

  /*
   * Inicia o ciclo de vida do componente setando a ação atual, criando o formulário e carregando a lançamento
   * caso esteja sendo editada.
   */
  ngOnInit() {
    this.setCurrentAction();
    this.buildEntryForm();
    this.loadEntry();
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
      this.createEntry();
    } else {
      this.updateEntry();
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
  private buildEntryForm() {
    this.entryForm = this.formBuilder.group({
      id: [null],
      name: [null, [Validators.required, Validators.minLength(2)]],
      description: [null],
      type: [null, [Validators.required]],
      amount: [null, [Validators.required]],
      date: [null, [Validators.required]],
      paid: [null, [Validators.required]],
      categoryId: [null, [Validators.required]],
    });
  }

  /*
   * Monta o fomulário para a edição
   */
  private loadEntry() {
    if (this.currentAction === "edit") {
      this.route.paramMap
        .pipe(
          switchMap((params) => this.entryService.getById(+params.get("id")))
        )
        .subscribe(
          (entry) => {
            this.entry = entry;
            this.entryForm.patchValue(this.entry); // vincula os dados carregados da api no fomulário em edição
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
      this.pageTitle = "Cadastro de nova lançamento";
    else {
      const entryName = this.entry.name || "";
      this.pageTitle = "Editando lançamento: " + entryName;
    }
  }

  /*
   * Criação da lançamento
   */
  private createEntry() {
    const entry: Entry = Object.assign(new Entry(), this.entryForm.value);

    this.entryService.create(entry).subscribe(
      (entry) => this.actionsForSuccess(entry),
      (error) => this.actionsForError(error)
    );
  }

  /*
   * Update da lançamento
   */
  private updateEntry() {
    const entry: Entry = Object.assign(new Entry(), this.entryForm.value);

    this.entryService.update(entry).subscribe(
      (entry) => this.actionsForSuccess(entry),
      (error) => this.actionsForError(error)
    );
  }

  private actionsForSuccess(entry: Entry) {
    toastrSuccess(
      "Solicitação processada com sucesso, agora você pode editar a sua lançamento."
    );

    // Redireciona a pagina para edição de lançamento
    this.router.navigateByUrl("entries", { skipLocationChange: true });
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
