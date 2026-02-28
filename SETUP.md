<!-- root/SETUP.md -->

# Git

Skapa Git-repo
```
git init
```

Låt branchen heta *main* istället för *master*
```
git branch -m master main
```

Pusha första committen till GitHub
```
git add <some_files>
git commit -m "some_message"
git branch -M main
git remote add origin https://github.com/...
git push -u origin main
```

# Node pnpm

Node
```
node -v
  v25.0.0
nvm list available
nvm install 25.6.0
nvm use 25.6.0
node -v
  v25.6.0
```

Uppdatera Corepack
```
npm install --global corepack@latest
```

Installera pnpm
```
corepack enable pnpm

pnpm -v
  10.26.2
```

Initiera Node-projekt med pnpm (skapar `package.json`)
```
pnpm init
```

Installera alla beroenden i monorepot (skapar `pnpm-lock.yaml` och `node_modules` i roten)
```
pnpm install
```

Skapa `pnpm-workspace.yaml` med följande innehåll
```
packages:
  - 'libs/*'
  - 'apps/*'
```

Installera TypeScript i roten så att alla paket kan använda det
```
pnpm add -D typescript --workspace-root
```

Installera tsx i roten (för att köra TypeScript direkt, exempelvis iTunes-script, utan separat byggsteg)
```
pnpm add -D tsx --workspace-root
```

# libs/model, libs/rules

Skapa `libs/x` (`pnpm init` skapar `libs/x/package.json`)
```
mkdir -p libs/x
cd libs/x
pnpm init
```

Uppdatera `libs/x/package.json` för att
- Konfigurera `@app/x` som ESM-paket
- Definiera dist som export (konsumeras av andra paket)

Skapa `libs/x/tsconfig.json` för att
- Konfigurera `libs/x` för TypeScript (NodeNext / ESM)
