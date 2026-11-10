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
  drawSelection,
  highlightActiveLine,
  highlightActiveLineGutter,
  highlightSpecialChars,
  keymap,
  lineNumbers,
  placeholder as placeholderExt,
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
