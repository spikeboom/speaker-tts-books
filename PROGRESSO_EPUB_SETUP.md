# Configuração do Sistema de Progresso de Leitura EPUB

## 📋 Passo a Passo

### 1. Executar SQL no Supabase

Acesse seu projeto no Supabase e execute o seguinte SQL no **SQL Editor**:

```sql
-- Create table for EPUB reading progress
CREATE TABLE IF NOT EXISTS epub_reading_progress (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  epub_id UUID NOT NULL REFERENCES epubs(id) ON DELETE CASCADE,
  current_page INTEGER NOT NULL DEFAULT 0,
  current_sentence INTEGER NOT NULL DEFAULT 0,
  total_pages INTEGER NOT NULL,
  last_read_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(epub_id)
);

-- Enable Row Level Security
ALTER TABLE epub_reading_progress ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations (for development)
CREATE POLICY "Allow all operations on epub_reading_progress"
  ON epub_reading_progress
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS epub_reading_progress_epub_id_idx ON epub_reading_progress(epub_id);
CREATE INDEX IF NOT EXISTS epub_reading_progress_last_read_at_idx ON epub_reading_progress(last_read_at DESC);
```

### 2. Como Usar

1. **Abra um EPUB** clicando em "📖 Ler com TTS"
2. **Leia até onde quiser** - navegue pelas páginas e ouça com TTS
3. **Salve o progresso** clicando no botão **"🔖 Salvar Progresso"**
4. **Feche o leitor**
5. **Abra o EPUB novamente** - ele voltará automaticamente para a página e frase onde você parou!

### 3. Funcionalidades

- ✅ **Salvar progresso** - Salva a página atual e a frase em que você parou
- ✅ **Carregamento automático** - Ao abrir o EPUB, carrega automaticamente o último progresso salvo
- ✅ **Indicador visual** - A frase salva fica destacada em **verde com borda verde**
- ✅ **Info de progresso** - Mostra "✅ Última leitura salva: Página X, Frase Y"
- ✅ **Persistência** - O progresso fica salvo no banco de dados Supabase

### 4. Cores dos Destaques

- **Amarelo** 🟨 - Frase sendo lida (TTS ativo)
- **Laranja** 🟧 - Frase pausada (TTS pausado)
- **Verde** 🟩 - Frase salva (última posição salva)

## 🎯 Observações

- Cada EPUB tem apenas **um progresso salvo por vez**
- Ao salvar novamente, o progresso anterior é **sobrescrito**
- O progresso é **deletado automaticamente** se você excluir o EPUB
- O sistema funciona mesmo **offline** (após carregar o EPUB)
