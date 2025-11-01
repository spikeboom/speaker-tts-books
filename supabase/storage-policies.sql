-- =====================================================
-- POLÍTICAS RLS PARA SUPABASE STORAGE (EPUBs)
-- Execute este SQL no SQL Editor do Supabase
-- =====================================================

-- Política para UPLOAD (INSERT) - permite uploads anônimos no bucket 'epubs'
CREATE POLICY "Allow public uploads to epubs bucket"
ON storage.objects
FOR INSERT
TO public
WITH CHECK (bucket_id = 'epubs');

-- Política para DOWNLOAD (SELECT) - permite downloads anônimos do bucket 'epubs'
CREATE POLICY "Allow public downloads from epubs bucket"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'epubs');

-- Política para DELETE - permite deletar arquivos do bucket 'epubs'
CREATE POLICY "Allow public deletes from epubs bucket"
ON storage.objects
FOR DELETE
TO public
USING (bucket_id = 'epubs');

-- Política para UPDATE - necessária para operações de upsert
CREATE POLICY "Allow public updates to epubs bucket"
ON storage.objects
FOR UPDATE
TO public
USING (bucket_id = 'epubs')
WITH CHECK (bucket_id = 'epubs');

-- =====================================================
-- OBSERVAÇÕES IMPORTANTES:
-- =====================================================
-- 1. Estas políticas usam 'public' (anônimos) para desenvolvimento
-- 2. Em produção, substitua 'public' por 'authenticated' e adicione validação de usuário
-- 3. Exemplo para produção com autenticação:
--
--    CREATE POLICY "Authenticated uploads only"
--    ON storage.objects
--    FOR INSERT
--    TO authenticated
--    WITH CHECK (
--      bucket_id = 'epubs' AND
--      (storage.foldername(name))[1] = auth.uid()::text
--    );
--
-- =====================================================
