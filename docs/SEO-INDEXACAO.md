# SEO: canonical, hreflang e redirecionamentos

## O que foi implementado

1. **`<link rel="canonical">`** em todas as páginas HTML, apontando para a **URL preferida** (evita “cópia sem página canônica” no Search Console).
2. **`<link rel="alternate" hreflang="...">`** para **pt-BR**, **en**, **es** e **`x-default`** (português como padrão), para o Google relacionar idiomas sem tratá-los como duplicata acidental.
3. **URLs absolutas a partir da raiz do site** (`/index.html`, `/en.html`, …). O navegador e o Google resolvem isso contra o **mesmo host** (incluindo subdomínio), sem precisar fixar domínio no HTML.

### Páginas legadas (duplicadas)

Arquivos antigos em inglês/espanhol (`privacy-policy.html`, `terms-of-use.html`, `contact.html`, etc.) recebem **canonical** apontando para a versão **preferida** (`privacy-policy-en.html`, `terms-en.html`, `contact-en.html`, …), consolidando sinais no URL principal.

## Site em subpasta

Se publicar em `https://exemplo.com/ferramenta/` em vez da raiz:

- Ajuste os `href` em **todas** as tags para incluir o prefixo, por exemplo `/ferramenta/index.html`, **ou**
- Execute de novo `python tools/apply_seo_canonical_hreflang.py` após editar o script para prefixar um `BASE_PATH` (recomendado manter um único lugar no código).

## Redirecionamento e erros no Google Search Console

### No código deste repositório

- **Não há** redirecionamento por JavaScript (`window.location`, etc.) nos scripts principais.
- **Não há** detecção automática de idioma que force troca de URL (evita **loops** para o Googlebot).
- Não existem ficheiros `netlify.toml`, `_redirects` ou `.htaccess` no projeto por defeito — os HTML são servidos com **HTTP 200** estático.

### No alojamento (recomendado verificar)

Erros de **“Redirecionamento”** costumam vir do **servidor**:

- Cadeia **HTTP → HTTPS** ou **non-www → www** com mais de um salto.
- Regra que redireciona `/index.html` ↔ `/` em loop.
- Regra de “idioma do browser” no painel do host.

**Boas práticas:**

- Uma única versão canónica do host (ex.: só `https://www.` ou só `https://`).
- Redirecionamento 301 **uma vez** de HTTP para HTTPS.
- Evitar redirecionar o Googlebot com base em `Accept-Language` para outra URL.

## Regenerar tags

```bash
python tools/apply_seo_canonical_hreflang.py
```

## Validar

```bash
python tools/validate_seo.py
```
