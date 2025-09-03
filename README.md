# Optidata Backend

Backend da aplicação Optidata construído com NestJS, PostgreSQL e Sequelize.

## Pré-requisitos

- Node.js (versão 18 ou superior)
- Docker e Docker Compose
- npm ou yarn

## Configuração

1. Clone o repositório e navegue para a pasta do projeto:

```bash
cd back
```

2. Instale as dependências:

```bash
npm install
```

3. Configure as variáveis de ambiente:

```bash
cp env.example .env
```

4. Inicie o banco de dados PostgreSQL:

```bash
docker-compose up -d
```

5. Execute a aplicação em modo de desenvolvimento:

```bash
npm run start:dev
```

**Nota:** A aplicação roda na porta 8080 por padrão.

## Estrutura da API

### Usuários

- `POST /users` - Criar usuário
- `GET /users` - Listar todos os usuários
- `GET /users/:id` - Buscar usuário por ID
- `PATCH /users/:id` - Atualizar usuário
- `DELETE /users/:id` - Remover usuário

### Documentação da API

A API possui documentação completa com Swagger disponível em:

- **URL:** `http://localhost:8080/api`
- **Interface interativa** para testar todos os endpoints
- **Exemplos de requisição e resposta** para cada operação
- **Descrições detalhadas** de parâmetros e códigos de status

### Exemplo de criação de usuário

```json
{
  "name": "João Silva",
  "email": "joao@example.com",
  "password": "123456",
  "role": "admin"
}
```

**Roles disponíveis:**

- `admin` - Administrador do sistema
- `manager` - Gerente/Coordenador
- `developer` - Desenvolvedor (padrão)

## Tecnologias utilizadas

- NestJS
- PostgreSQL 17-alpine
- Sequelize ORM
- TypeScript
- Docker
- Class Validator
- bcrypt para hash de senhas
- Swagger/OpenAPI para documentação

## Desenvolvimento

### Testes

Para executar todos os testes:

```bash
npm run test
```

Para executar os testes em modo watch:

```bash
npm run test:watch
```

Para executar testes específicos:

```bash
npm test -- --testPathPatterns=users.controller.spec.ts
```

Para executar os testes e2e:

```bash
npm run test:e2e
```

### Cobertura de Testes

O projeto possui testes unitários abrangentes para:

- **UsersController** - Testa todos os endpoints CRUD
- **Validações de erro** - Email duplicado, usuário não encontrado, etc.
- **Conversões de tipo** - String ID para número
- **Diferentes roles** - admin, manager, developer
- **Cenários de sucesso e falha** - Cobertura completa dos casos de uso
