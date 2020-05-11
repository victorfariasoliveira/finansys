import { InMemoryDbService } from 'angular-in-memory-web-api'

import { Category } from './pages/categories/shared/category.model'

export class InMemoryDatabase implements InMemoryDbService {
    createDb() {
        const categories: Category[] = [
            {id: 1, name: "Lazer", description: "Cinema, parque, praia"},
            {id: 2, name: "Moradia", description: "Pagamentos de contas de casa"},
            {id: 3, name: "Saúde", description: "Plano de saúde e remédios"},
            {id: 4, name: "Salário", description: "Recebimento de salário"},
            {id: 5, name: "Frella", description: "Trabalhos como freelancer"},
        ]

        return { categories }
    }
}