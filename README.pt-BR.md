# Speaker TTS Books

Uma aplicacao web moderna que converte texto e livros EPUB em audio usando tecnologia de texto-para-fala (TTS) nativa do navegador.

## Funcionalidades

### Leitura de Texto
- Cole ou digite texto diretamente na aplicacao
- Segmentacao automatica de frases com destaque palavra por palavra
- Salve textos no banco de dados para leitura posterior
- Gerencie textos salvos (visualizar, excluir)

### Gerenciamento de Livros EPUB
- Upload de arquivos EPUB com arrastar e soltar ou selecao de arquivo
- Armazenamento automatico de metadados (titulo, tamanho, data de upload)
- Download e exclusao de livros
- Rastreamento de progresso de leitura

### Texto-para-Fala
- Velocidade de reproducao ajustavel (0.1x - 2.0x)
- Controle de tom (0.5 - 2.0)
- Controle de volume (0% - 100%)
- Selecao de multiplas vozes baseada na disponibilidade do sistema
- Controles de play, pause e stop

### Experiencia de Leitura Inteligente
- Destaque automatico da frase durante a reproducao
- Clique em qualquer frase para pular ate ela
- Rolagem automatica para manter a frase atual visivel
- Alternancia de modo interativo para compatibilidade com extensoes de navegador
- Bloqueio de tela para evitar suspensao durante a leitura

### Funcionalidades Especificas para EPUB
- Navegacao pagina por pagina
- Rastreamento de progresso com salvamento automatico e manual
- Deteccao de capitulos e exibicao de progresso
- Recuperacao da posicao de leitura salva

### Interface
- Alternancia entre tema claro e escuro
- Design responsivo para celular, tablet e desktop
- Indicadores de status com codigo de cores

## Stack Tecnologico

- **Framework**: Next.js 16 (React 19)
- **Estilizacao**: Tailwind CSS 4
- **Linguagem**: TypeScript 5
- **Banco de Dados e Armazenamento**: Supabase (PostgreSQL + Storage)
- **Manipulacao de EPUB**: epubjs
- **TTS**: Web Speech API (nativo do navegador)

## Configuracao

### Pre-requisitos
- Node.js (v18+)
- npm
- Conta no Supabase

### Variaveis de Ambiente

Crie um arquivo `.env.local` no diretorio raiz:

```env
NEXT_PUBLIC_SUPABASE_URL=sua_url_do_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anon_do_supabase
```

### Configuracao do Banco de Dados

1. Acesse o editor SQL do seu projeto Supabase
2. Execute o SQL de `supabase/schema.sql` para criar as tabelas
3. Crie um bucket de armazenamento chamado "epubs"
4. Execute o SQL de `supabase/storage-policies.sql` para configurar as politicas de armazenamento

### Instalacao

```bash
# Instalar dependencias
npm install

# Executar servidor de desenvolvimento
npm run dev

# Build para producao
npm run build

# Iniciar servidor de producao
npm start
```

## Estrutura do Projeto

```
app/
├── components/          # Componentes React
│   ├── EpubReader.tsx      # Componente principal do leitor
│   ├── PlaybackControls.tsx # Controles de play/pause
│   ├── VoiceSettings.tsx    # Configuracao de voz
│   ├── SentenceHighlight.tsx # Destaque de texto
│   ├── EpubUpload.tsx       # Upload de arquivos
│   ├── EpubsList.tsx        # Lista de livros
│   ├── SavedTextsList.tsx   # Lista de textos salvos
│   └── ...
├── hooks/               # Hooks React customizados
│   ├── useEpubReader.ts     # Carregamento e paginacao de EPUB
│   ├── useSentenceReader.ts # Gerenciamento de TTS
│   ├── useTexts.ts          # Operacoes CRUD de texto
│   ├── useEpubs.ts          # Gerenciamento de arquivos EPUB
│   └── useWakeLock.ts       # Bloqueio de tela
├── context/             # Contextos React
│   └── ThemeContext.tsx     # Estado do tema
├── page.tsx             # Pagina inicial
├── epubs/page.tsx       # Pagina de gerenciamento de EPUB
├── epub/[id]/page.tsx   # Leitor de EPUB
└── text/[id]/page.tsx   # Leitor de texto

utils/
└── supabase/            # Configuracao do cliente Supabase
    ├── client.ts
    └── server.ts

supabase/
├── schema.sql           # Schema do banco de dados
└── storage-policies.sql # Politicas do bucket de armazenamento
```

## Compatibilidade de Navegadores

- Chrome, Firefox, Safari, Edge (desktop)
- iOS Safari, Android Chrome (mobile)
- Requer suporte a Web Speech API
- Usuarios Android podem precisar configurar as opcoes de TTS do sistema

## Licenca

MIT
