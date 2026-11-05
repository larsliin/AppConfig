<script setup lang="ts">
    import { ref, onMounted, watchEffect } from 'vue';
    import { EditorView } from 'codemirror';
    import { EditorState } from '@codemirror/state';
    import { json } from '@codemirror/lang-json';
    import { lineNumbers } from '@codemirror/view';
    import { oneDark } from '@codemirror/theme-one-dark';
    import { syntaxHighlighting, defaultHighlightStyle } from '@codemirror/language';

    interface Props {
        content: string;
        isDarkMode: boolean;
        isDisabled: boolean;
        isLoading?: boolean;
    }

    const lightTheme = {
        '.cm-gutters': {
            'background-color': 'var(--color-editor-bg)',
            'border-right': '1px solid var(--color-border)',
        },
        '.cm-activeLineGutter': {
            'background-color': 'rgba(0, 0, 0, 0.05)',
        },
    };

    const props = defineProps<Props>();

    const editorContainer = ref<HTMLDivElement>();
    let editorView: EditorView | null = null;

    const getEditorExtensions = () => [
        json(),
        lineNumbers(),
        props.isDarkMode
            ? oneDark
            : [syntaxHighlighting(defaultHighlightStyle), EditorView.baseTheme(lightTheme)],
        EditorView.editable.of(!props.isDisabled),
    ];

    function initializeEditor() {
        if (!editorContainer.value || editorView) return;

        const state = EditorState.create({
            doc: props.content,
            extensions: getEditorExtensions(),
        });

        editorView = new EditorView({
            state,
            parent: editorContainer.value,
        });
    }

    function updateEditorContent(newContent: string) {
        if (!editorView) return;
        editorView.setState(
            EditorState.create({
                doc: newContent,
                extensions: getEditorExtensions(),
            }),
        );
    }

    function getEditorContent(): string {
        return editorView?.state.doc.toString() || props.content;
    }

    // Simplify: use watchEffect to track all dependencies automatically
    watchEffect(() => {
        updateEditorContent(props.content);
        // deps: content, isDarkMode, isDisabled (all used in updateEditorContent)
    });

    onMounted(() => {
        initializeEditor();
    });

    defineExpose({
        getEditorContent,
    });
</script>

<template>
    <div class="code-editor-container" :aria-busy="isLoading">
        <div ref="editorContainer" class="code-editor"></div>
        <div v-if="isLoading" class="loading-bar" role="progressbar" aria-label="Loading appConfig"></div>
    </div>
</template>

<style scoped>
    .code-editor-container {
        flex: 1;
        position: relative;
        border: 1px solid var(--color-border);
        border-radius: var(--radius-button);
        background: var(--color-editor-bg);
        overflow: hidden;
    }

    .code-editor {
        height: 100%;
    }

    .loading-bar {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 3px;
        overflow: hidden;
        background: var(--color-border);
        z-index: 1;
    }

    .loading-bar::before {
        content: '';
        position: absolute;
        top: 0;
        bottom: 0;
        background: var(--color-accent);
        animation: fill-and-drain 1.2s ease-in-out infinite;
    }

    @keyframes fill-and-drain {
        0% {
            left: 0;
            right: 100%;
        }
        50% {
            left: 0;
            right: 0;
        }
        100% {
            left: 100%;
            right: 0;
        }
    }

    @media (prefers-reduced-motion: reduce) {
        .loading-bar::before {
            animation-duration: 4s;
        }
    }

    .code-editor-container :deep(.cm-editor) {
        font-family: ui-monospace, Menlo, Consolas, monospace;
        font-size: 12px;
        line-height: 1.4;
        height: 100%;
        background-color: var(--color-editor-bg);
    }

    .code-editor-container :deep(.cm-content) {
        padding: 8px;
        color: var(--color-text);
    }

    .code-editor-container :deep(.cm-line) {
        white-space: pre !important;
    }

    .code-editor-container :deep(.cm-scroller) {
        overflow: auto;
    }

    .code-editor-container :deep(.cm-gutters) {
        background-color: var(--color-editor-bg);
        border-right: 1px solid var(--color-border);
        padding-right: 4px;
    }

    .code-editor-container :deep(.cm-linenumber) {
        color: var(--color-text-secondary, #999);
        text-align: right;
        padding-right: 8px;
        min-width: 2.5em;
    }
</style>
