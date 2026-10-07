#!/usr/bin/env python3
"""Builds the CV in every language from cv/cv.typ.

Requires the Typst Python bindings (pip install typst). Chinese needs a CJK font installed on the system
(Noto CJK or WenQuanYi Zen Hei). Output: assets/cv/CV-NicolasMaireBravo-<LANG>.pdf, plus the English copy
at assets/CV-NicolasMaireBravo.pdf so old links keep working.
"""
from pathlib import Path
import shutil
import typst

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / 'assets' / 'cv'
OUT.mkdir(parents=True, exist_ok=True)
FONT_DIRS = [p for p in ('/usr/share/fonts', '/usr/local/share/fonts') if Path(p).exists()]

for lang in ('es', 'en', 'it', 'fr', 'zh'):
    target = OUT / f'CV-NicolasMaireBravo-{lang.upper()}.pdf'
    typst.compile(str(ROOT / 'cv' / 'cv.typ'), output=str(target), root=str(ROOT / 'cv'),
                  font_paths=FONT_DIRS, sys_inputs={'lang': lang})
    print(f'{target.relative_to(ROOT)}  {target.stat().st_size // 1024} KB')

shutil.copyfile(OUT / 'CV-NicolasMaireBravo-EN.pdf', ROOT / 'assets' / 'CV-NicolasMaireBravo.pdf')
