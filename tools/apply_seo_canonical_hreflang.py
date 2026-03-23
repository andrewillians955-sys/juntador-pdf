#!/usr/bin/env python3
"""
Injeta <link rel="canonical"> e <link rel="alternate" hreflang> em todos os HTML.
- URLs são relativas à raiz do site (/path) para funcionar em qualquer domínio/subdomínio.
- Páginas legadas duplicadas apontam canonical para a URL preferida (evita cópia sem canônica).
"""
from __future__ import annotations

import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent

# Cada cluster: ordem fixa para hreflang (pt-BR, en, es, x-default)
CLUSTERS: dict[str, dict[str, str]] = {
    "home": {
        "pt-BR": "/index.html",
        "en": "/en.html",
        "es": "/es.html",
        "x-default": "/index.html",
    },
    "privacy": {
        "pt-BR": "/politica-privacidade.html",
        "en": "/privacy-policy-en.html",
        "es": "/politica-privacidad-es.html",
        "x-default": "/politica-privacidade.html",
    },
    "terms": {
        "pt-BR": "/termos-de-uso.html",
        "en": "/terms-en.html",
        "es": "/terminos-es.html",
        "x-default": "/termos-de-uso.html",
    },
    "contact": {
        "pt-BR": "/contato.html",
        "en": "/contact-en.html",
        "es": "/contacto-es.html",
        "x-default": "/contato.html",
    },
    "about": {
        "pt-BR": "/sobre.html",
        "en": "/about-en.html",
        "es": "/sobre-es.html",
        "x-default": "/sobre.html",
    },
    "cookies": {
        "pt-BR": "/cookies.html",
        "en": "/cookies-en.html",
        "es": "/cookies-es.html",
        "x-default": "/cookies.html",
    },
    "lgpd": {
        "pt-BR": "/lgpd.html",
        "en": "/gdpr-en.html",
        "es": "/rgpd-es.html",
        "x-default": "/lgpd.html",
    },
    "dmca": {
        "pt-BR": "/dmca.html",
        "en": "/dmca-en.html",
        "es": "/dmca-es.html",
        "x-default": "/dmca.html",
    },
}

# arquivo -> (cluster_id, canonical_path)
# canonical_path pode ser diferente do path do arquivo (legados)
FILE_SEO: dict[str, tuple[str, str]] = {
    "index.html": ("home", "/"),
    "en.html": ("home", "/en.html"),
    "es.html": ("home", "/es.html"),
    "politica-privacidade.html": ("privacy", "/politica-privacidade.html"),
    "privacy-policy-en.html": ("privacy", "/privacy-policy-en.html"),
    "politica-privacidad-es.html": ("privacy", "/politica-privacidad-es.html"),
    "privacy-policy.html": ("privacy", "/privacy-policy-en.html"),
    "termos-de-uso.html": ("terms", "/termos-de-uso.html"),
    "terms-en.html": ("terms", "/terms-en.html"),
    "terminos-es.html": ("terms", "/terminos-es.html"),
    "terms-of-use.html": ("terms", "/terms-en.html"),
    "terminos-de-uso-es.html": ("terms", "/terminos-es.html"),
    "contato.html": ("contact", "/contato.html"),
    "contact-en.html": ("contact", "/contact-en.html"),
    "contacto-es.html": ("contact", "/contacto-es.html"),
    "contact.html": ("contact", "/contact-en.html"),
    "sobre.html": ("about", "/sobre.html"),
    "about-en.html": ("about", "/about-en.html"),
    "sobre-es.html": ("about", "/sobre-es.html"),
    "about.html": ("about", "/about-en.html"),
    "cookies.html": ("cookies", "/cookies.html"),
    "cookies-en.html": ("cookies", "/cookies-en.html"),
    "cookies-es.html": ("cookies", "/cookies-es.html"),
    "cookie-policy.html": ("cookies", "/cookies-en.html"),
    "politica-de-cookies-es.html": ("cookies", "/cookies-es.html"),
    "lgpd.html": ("lgpd", "/lgpd.html"),
    "gdpr-en.html": ("lgpd", "/gdpr-en.html"),
    "rgpd-es.html": ("lgpd", "/rgpd-es.html"),
    "lgpd-en.html": ("lgpd", "/gdpr-en.html"),
    "lgpd-es.html": ("lgpd", "/rgpd-es.html"),
    "dmca.html": ("dmca", "/dmca.html"),
    "dmca-en.html": ("dmca", "/dmca-en.html"),
    "dmca-es.html": ("dmca", "/dmca-es.html"),
}

# Remove blocos antigos (alternates relativos, comentários SEO)
REMOVE_PATTERNS = [
    re.compile(
        r"\s*<!--\s*(?:SEO internacional|International SEO|Canonical \+ hreflang)[^>]*-->\s*",
        re.I,
    ),
    re.compile(
        r'\s*<link\s+rel="alternate"\s+href="[^"]*"\s+hreflang="[^"]*"\s*/>\s*',
        re.I,
    ),
    re.compile(r'\s*<link\s+rel="canonical"\s+href="[^"]*"\s*/>\s*', re.I),
]


def build_seo_block(cluster_id: str, canonical: str) -> str:
    c = CLUSTERS[cluster_id]
    lines = [
        "",
        '  <!-- Canonical + hreflang (raiz do site; ajuste em subpasta — ver docs/SEO-INDEXACAO.md) -->',
        f'  <link rel="canonical" href="{canonical}" />',
    ]
    order = ["pt-BR", "en", "es", "x-default"]
    for k in order:
        lines.append(f'  <link rel="alternate" hreflang="{k}" href="{c[k]}" />')
    lines.append("")
    return "\n".join(lines)


def strip_existing_seo(html: str) -> str:
    """Remove bloco SEO (comentário + canonical + todos os alternates) e formato antigo."""
    # Bloco gerado por este script (pode ter 4 ou 8+ alternates se houve duplicata)
    html = re.sub(
        r"\s*<!--\s*Canonical \+ hreflang[\s\S]*?-->\s*"
        r'<link\s+rel="canonical"[^>]+>\s*'
        r'(?:<link\s+rel="alternate"[^>]+>\s*)+',
        "",
        html,
        flags=re.I,
    )
    # Antigo: SEO internacional / International SEO (só alternates relativos)
    html = re.sub(
        r"\s*<!--\s*(?:SEO internacional|International SEO)[\s\S]*?-->\s*"
        r'(?:<link\s+rel="alternate"[^>]+>\s*)+',
        "",
        html,
        flags=re.I,
    )
    # Alternates órfãos (hreflang) sem bloco
    html = re.sub(r'\s*<link\s+rel="alternate"\s+hreflang="[^"]+"\s+href="[^"]+"\s*/>\s*', "", html, flags=re.I)
    # canonical solto
    html = re.sub(r'\s*<link\s+rel="canonical"[^>]+>\s*', "", html, flags=re.I)
    return html


def inject_or_replace(html: str, block: str) -> str:
    html = strip_existing_seo(html)

    # Insere após <meta name="description" ... /> (primeira ocorrência)
    m = re.search(r'(<meta\s+name="description"[^>]*\s*/>)', html, re.I)
    if m:
        pos = m.end()
        return html[:pos] + block + html[pos:]

    # fallback: após </title>
    m = re.search(r"(</title>)", html, re.I)
    if m:
        return html[: m.end()] + block + html[m.end() :]

    return html


def main() -> None:
    changed = 0
    for name, (cluster_id, canonical) in sorted(FILE_SEO.items()):
        path = ROOT / name
        if not path.exists():
            print(f"[SKIP] missing: {name}")
            continue
        raw = path.read_text(encoding="utf-8")
        block = build_seo_block(cluster_id, canonical)
        new = inject_or_replace(raw, block)
        if new != raw:
            path.write_text(new, encoding="utf-8", newline="\n")
            changed += 1
            print(f"[OK] {name}")
        else:
            print(f"[SKIP] {name} (já idêntico ao esperado)")

    print(f"\nTotal atualizados: {changed}")


if __name__ == "__main__":
    main()
