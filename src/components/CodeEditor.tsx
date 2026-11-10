"use client";

import { useEffect, useRef } from "react";

import {
  defaultKeymap,
  history,
  historyKeymap,
  indentWithTab,
} from "@codemirror/commands";
import { cpp } from "@codemirror/lang-cpp";
import {
  HighlightStyle,
  bracketMatching,
  indentOnInput,
  indentUnit,
  syntaxHighlighting,
} from "@codemirror/language";
import {
  Compartment,
  EditorState,
  StateEffect,
  StateField,
  type Range,
  type Text,
} from "@codemirror/state";
import {
  Decoration,
  type DecorationSet,
  EditorView,
  ViewPlugin,
  WidgetType,
  drawSelection,
  highlightActiveLine,
  highlightActiveLineGutter,
  highlightSpecialChars,
  keymap,
  lineNumbers,
  placeholder as placeholderExt,
  type ViewUpdate,
} from "@codemirror/view";
import { tags } from "@lezer/highlight";

interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  errorLines?: number[];
  warnLines?: number[];
  placeholder?: string;
}

const highlightTheme = EditorView.theme(
  {
    "&": {
      backgroundColor: "var(--code-background)",
      color: "var(--code-text)",
      height: "100%",
    },
    ".cm-content": {
      caretColor: "#93c5fd",
      padding: "12px 0",
    },
    ".cm-cursor, .cm-dropCursor": { borderLeftColor: "#93c5fd" },
    "&.cm-focused .cm-selectionBackground, .cm-selectionBackground, .cm-content ::selection":
      { backgroundColor: "rgba(96, 165, 250, 0.25)" },
    ".cm-panels": { backgroundColor: "#191d24", color: "#cbd5e1" },
    ".cm-searchMatch": { backgroundColor: "rgba(250, 204, 21, 0.3)" },
  },
  { dark: true },
);

const cHighlightStyle = HighlightStyle.define([
  { tag: tags.keyword, color: "#c792ea" },
  { tag: [tags.name, tags.deleted, tags.character, tags.propertyName, tags.macroName], color: "#e6e9ef" },
  { tag: [tags.function(tags.variableName), tags.labelName], color: "#82aaff" },
  { tag: [tags.color, tags.constant(tags.name), tags.standard(tags.name)], color: "#ffcb6b" },
  { tag: [tags.definition(tags.name), tags.separator], color: "#e6e9ef" },
  { tag: [tags.typeName, tags.className, tags.number, tags.changed, tags.annotation, tags.modifier, tags.self, tags.namespace], color: "#f78c6c" },
  { tag: [tags.operator, tags.operatorKeyword, tags.url, tags.escape, tags.regexp, tags.link], color: "#89ddff" },
  { tag: [tags.meta, tags.comment], color: "#7a8699", fontStyle: "italic" },
  { tag: tags.string, color: "#c3e88d" },
  { tag: tags.heading, fontWeight: "bold", color: "#82aaff" },
  { tag: tags.invalid, color: "#ff5370", textDecoration: "underline" },
]);

const setHighlights = StateEffect.define<{ errors: number[]; warns: number[] }>();

function buildDecorations(doc: Text, errors: number[], warns: number[]): DecorationSet {
  const marks: Range<Decoration>[] = [];
  for (const line of errors) {
    if (line < 1 || line > doc.lines) continue;
    marks.push(Decoration.line({ class: "cm-line-error" }).range(doc.line(line).from));
  }
  for (const line of warns) {
    if (line < 1 || line > doc.lines) continue;
    marks.push(Decoration.line({ class: "cm-line-warn" }).range(doc.line(line).from));
  }
  return Decoration.set(marks, true);
}

const highlightField = StateField.define<DecorationSet>({
  create() {
    return Decoration.none;
  },
  update(decorations, tr) {
    for (const effect of tr.effects) {
      if (effect.is(setHighlights)) {
        return buildDecorations(tr.state.doc, effect.value.errors, effect.value.warns);
      }
    }
    if (tr.docChanged) {
      return Decoration.none;
    }
    return decorations;
  },
  provide: (field) => EditorView.decorations.from(field),
});

const readonlyCompartment = new Compartment();

/**
 * バックスラッシュを円マークで表示するためのウィジェット。
 * 文書の中身は半角の \ のまま（コピー・保存・判定はすべて \ で行う）。
 */
class YenMarkWidget extends WidgetType {
  toDOM() {
    const element = document.createElement("span");
    element.className = "cm-yen-mark";
    element.textContent = "\u00A5";
    return element;
  }

  eq() {
    return true;
  }
}

const yenReplacement = Decoration.replace({ widget: new YenMarkWidget() });

function buildYenDecorations(view: EditorView): DecorationSet {
  const marks: Range<Decoration>[] = [];
  for (const { from, to } of view.visibleRanges) {
    const text = view.state.doc.sliceString(from, to);
    let index = text.indexOf("\\");
    while (index !== -1) {
      marks.push(yenReplacement.range(from + index, from + index + 1));
      index = text.indexOf("\\", index + 1);
    }
  }
  return Decoration.set(marks, true);
}

/** 表示している範囲の \ だけを順に円マークへ置き換える。 */
const yenDisplay = ViewPlugin.fromClass(
  class {
    decorations: DecorationSet;

    constructor(view: EditorView) {
      this.decorations = buildYenDecorations(view);
    }

    update(update: ViewUpdate) {
      if (update.docChanged || update.viewportChanged) {
        this.decorations = buildYenDecorations(update.view);
      }
    }
  },
  { decorations: (plugin) => plugin.decorations },
);

/**
 * 円マーク（¥ / ＼）を入力・貼り付けしたときは、C のバックスラッシュに戻す。
 * 教科書のコードをそのまま貼っても、正しい半角コードとして扱える。
 */
const normalizeYenInput = EditorState.transactionFilter.of((tr) => {
  if (!tr.docChanged) return tr;

  const changes: { from: number; to: number; insert: string }[] = [];
  tr.changes.iterChanges((_fromA, _toA, fromB, toB, inserted) => {
    const text = inserted.toString();
    const normalized = text.replace(/[\u00A5\uFF3C]/g, "\\");
    if (normalized !== text) {
      changes.push({ from: fromB, to: toB, insert: normalized });
    }
  });

  if (changes.length === 0) return tr;
  return [tr, { changes, sequential: true }];
});

export function CodeEditor({
  value,
  onChange,
  errorLines = [],
  warnLines = [],
  placeholder,
}: CodeEditorProps) {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const viewRef = useRef<EditorView | null>(null);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  useEffect(() => {
    if (!hostRef.current) return;

    const state = EditorState.create({
      doc: value,
      extensions: [
        lineNumbers(),
        highlightActiveLineGutter(),
        highlightSpecialChars(),
        history(),
        drawSelection(),
        EditorState.allowMultipleSelections.of(true),
        indentOnInput(),
        indentUnit.of("    "),
        bracketMatching(),
        highlightActiveLine(),
        cpp(),
        syntaxHighlighting(cHighlightStyle),
        highlightTheme,
        highlightField,
        yenDisplay,
        normalizeYenInput,
        EditorView.lineWrapping,
        placeholderExt(placeholder ?? ""),
        keymap.of([...defaultKeymap, ...historyKeymap, indentWithTab]),
        EditorView.updateListener.of((update) => {
          if (update.docChanged) {
            onChangeRef.current(update.state.doc.toString());
          }
        }),
        readonlyCompartment.of([]),
      ],
    });

    const view = new EditorView({ state, parent: hostRef.current });
    viewRef.current = view;

    return () => {
      view.destroy();
      viewRef.current = null;
    };
    // 初期化は1回だけ。値の同期は下のeffectで行う。
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 外部から value が変わったときだけ反映
  useEffect(() => {
    const view = viewRef.current;
    if (!view) return;
    const current = view.state.doc.toString();
    if (current === value) return;
    view.dispatch({
      changes: { from: 0, to: current.length, insert: value },
    });
  }, [value]);

  useEffect(() => {
    const view = viewRef.current;
    if (!view) return;
    view.dispatch({
      effects: setHighlights.of({ errors: errorLines, warns: warnLines }),
    });
  }, [errorLines, warnLines]);

  return (
    <div
      ref={hostRef}
      className="h-full min-h-[320px] overflow-hidden rounded-md bg-[var(--code-background)]"
    />
  );
}
