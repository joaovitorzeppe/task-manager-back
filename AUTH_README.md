# Sistema de Autenticação JWT

Este projeto implementa um sistema de autenticação completo usando JWT (JSON Web Tokens) para proteger todas as rotas da API.

## Funcionalidades

- **Login**: Rota `/auth/login` para autenticação de usuários
- **Proteção de Rotas**: Todas as rotas de usuários são protegidas por autenticação JWT
- **Validação de Token**: Middleware automático para validar tokens JWT em todas as requisições
- **Usuário Atual**: Decorator `@CurrentUser()` para acessar informações do usuário autenticado

## Configuração

### Variáveis de Ambiente

Adicione ao seu arquivo `.env`:

```env
# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRES_IN=1h
```

### Usuários de Teste

O projeto inclui usuários de teste que podem ser criados executando:

```bash
npm run db:seed
```

**Usuários disponíveis:**

- **João Silva** (joao@example.com / 123456) - Role: admin
- **Maria Santos** (maria@example.com / 123456) - Role: manager
- **Pedro Oliveira** (pedro@example.com / 123456) - Role: developer

## Como Usar

### 1. Login

```bash
POST /auth/login
Content-Type: application/json

{
  "email": "joao@example.com",
  "password": "123456"
}
```

**Resposta:**

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "Bearer",
  "expires_in": 3600,
  "user": {
    "id": 1,
    "name": "João Silva",
    "email": "joao@example.com",
    "role": "admin"
  }
}
```

### 2. Acessar Rotas Protegidas

Para acessar qualquer rota protegida, inclua o token no header:

```bash
GET /users
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 3. Rotas Protegidas

Todas as rotas em `/users` são protegidas:

- `GET /users` - Listar usuários
- `GET /users/:id` - Buscar usuário por ID
- `POST /users` - Criar usuário
- `PUT /users/:id` - Atualizar usuário
- `DELETE /users/:id` - Remover usuário

## Estrutura do Projeto

```
src/auth/
├── auth.module.ts          # Módulo principal de autenticação
├── auth.service.ts         # Serviço de autenticação
├── auth.controller.ts      # Controller com rota de login
├── dto/                   # DTOs para validação
│   ├── login.dto.ts       # DTO para login
│   └── login-response.dto.ts # DTO para resposta de login
├── strategies/            # Estratégias do Passport
│   └── jwt.strategy.ts    # Estratégia JWT
├── guards/                # Guards de autenticação
│   └── jwt-auth.guard.ts  # Guard JWT
└── decorators/            # Decorators personalizados
    └── current-user.decorator.ts # Decorator para usuário atual
```

## Segurança

- **Senhas**: Criptografadas com bcrypt (hash + salt)
- **Tokens**: JWT com expiração configurável
- **Validação**: Middleware automático em todas as rotas protegidas
- **Headers**: Validação automática do header `Authorization`

## Exemplo de Uso no Frontend

```javascript
// Login
const response = await fetch("/auth/login", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    email: "joao@example.com",
    password: "123456",
  }),
});

const { access_token } = await response.json();

// Usar token em requisições
const usersResponse = await fetch("/users", {
  headers: {
    Authorization: `Bearer ${access_token}`,
  },
});
```

## Testando

1. **Inicie o servidor:**

   ```bash
   npm run dev
   ```

2. **Faça login:**

   ```bash
   curl -X POST http://localhost:3000/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"joao@example.com","password":"123456"}'
   ```

3. **Use o token para acessar rotas protegidas:**
   ```bash
   curl -H "Authorization: Bearer SEU_TOKEN_AQUI" \
     http://localhost:3000/users
   ```

## Notas Importantes

- O token JWT expira em 1 hora por padrão
- Todas as rotas de usuários requerem autenticação
- O sistema inclui validação automática de dados de entrada
- Suporte completo ao Swagger com documentação da API
