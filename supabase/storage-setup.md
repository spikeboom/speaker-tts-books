# Configuração do Storage para EPUBs

## Passo 1: Criar o Bucket no Supabase

1. Acesse o Dashboard do Supabase: https://supabase.com/dashboard
2. Selecione seu projeto
3. No menu lateral, clique em **Storage**
4. Clique em **New bucket**
5. Configure o bucket:
   - **Name**: `epubs`
   - **Public bucket**: ❌ Desmarque (mantenha privado)
   - **File size limit**: 50 MB (padrão é suficiente para EPUBs)
   - **Allowed MIME types**: `application/epub+zip`
6. Clique em **Create bucket**

## Passo 2: Configurar Políticas de Acesso (RLS)

### Opção A: Via Dashboard (Recomendado)

1. Na página de **Storage**, clique no bucket `epubs`
2. Vá para a aba **Policies**
3. Clique em **New Policy**
4. Selecione **Create a policy from scratch**
5. Configure:
   - **Policy name**: `Allow public uploads and downloads`
   - **Allowed operations**: SELECT, INSERT, DELETE
   - **Target roles**: `anon`, `authenticated`
   - **USING expression**: `true`
   - **WITH CHECK expression**: `true`

### Opção B: Via SQL

Execute este SQL no **SQL Editor**:

```sql
-- Política para permitir upload (INSERT)
CREATE POLICY "Allow public uploads to epubs bucket"
ON storage.objects
FOR INSERT
TO anon, authenticated
WITH CHECK (bucket_id = 'epubs');

-- Política para permitir download (SELECT)
CREATE POLICY "Allow public downloads from epubs bucket"
ON storage.objects
FOR SELECT
TO anon, authenticated
USING (bucket_id = 'epubs');

-- Política para permitir delete
CREATE POLICY "Allow public deletes from epubs bucket"
ON storage.objects
FOR DELETE
TO anon, authenticated
USING (bucket_id = 'epubs');
```

## Passo 3: Verificar a Configuração

1. Volte para **Storage** > **epubs**
2. Tente fazer upload manual de um arquivo EPUB de teste
3. Se funcionar, a configuração está correta!

## Estrutura de Arquivos

Os EPUBs serão salvos com o seguinte padrão:
```
epubs/
  └── {uuid}.epub
```

Exemplo: `epubs/550e8400-e29b-41d4-a716-446655440000.epub`

## Tipos MIME Aceitos

- `application/epub+zip` - Formato EPUB padrão
- `application/epub` - Variação alternativa

## Limites

- **Tamanho máximo por arquivo**: 50 MB (padrão)
- **Tamanho típico de EPUB**: 1-10 MB
- **Capacidade total**: Depende do plano Supabase

## Segurança

⚠️ **IMPORTANTE**: As políticas atuais permitem acesso público (anon).

Em produção, você deve:
1. Implementar autenticação de usuários
2. Restringir políticas baseadas em user_id
3. Adicionar validação de tipo de arquivo no backend
