# Configuração do Banco de Dados Supabase

## Passo a Passo para Criar a Tabela

1. **Acesse o Dashboard do Supabase**
   - Vá para [https://supabase.com/dashboard](https://supabase.com/dashboard)
   - Faça login e selecione seu projeto

2. **Abra o SQL Editor**
   - No menu lateral, clique em **SQL Editor**
   - Clique em **New Query**

3. **Execute o SQL**
   - Copie todo o conteúdo do arquivo `schema.sql`
   - Cole no editor SQL
   - Clique em **Run** ou pressione `Ctrl + Enter`

4. **Verifique a Criação**
   - No menu lateral, clique em **Table Editor**
   - Você deve ver a tabela `saved_texts` listada
   - A tabela terá as seguintes colunas:
     - `id` (UUID - Primary Key)
     - `title` (TEXT)
     - `content` (TEXT)
     - `created_at` (TIMESTAMP)
     - `updated_at` (TIMESTAMP)

## Estrutura da Tabela

A tabela `saved_texts` armazena os textos salvos pelo usuário com os seguintes campos:

- **id**: Identificador único gerado automaticamente
- **title**: Título do texto
- **content**: Conteúdo completo do texto
- **created_at**: Data e hora de criação
- **updated_at**: Data e hora da última atualização

## Segurança

Por padrão, a tabela está configurada com Row Level Security (RLS) habilitado e uma política que permite todas as operações.

**⚠️ IMPORTANTE**: Em produção, você deve:
1. Configurar autenticação de usuários
2. Ajustar as políticas RLS para restringir acesso baseado em usuário
3. Remover a política permissiva atual

## Testando

Após executar o SQL, a aplicação deve:
- Carregar automaticamente os textos salvos
- Permitir salvar novos textos
- Permitir excluir textos existentes
- Exibir mensagens de erro caso a tabela não exista
