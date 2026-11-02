<script setup lang="ts">
    import { ref, onMounted, watchEffect } from 'vue';
    import { EditorView } from 'codemirror';
    import { EditorState } from '@codemirror/state';
    import { json } from '@codemirror/lang-json';
    import { lineNumbers } from '@codemirror/view';
    import { oneDark } from '@codemirror/theme-one-dark';

    interface Props {
        content: string;
        isDarkMode: boolean;
        isDisabled: boolean;
    }

    const props = defineProps<Props>();

    const editorContainer = ref<HTMLDivElement>();
    let editorView: EditorView | null = null;

    const getEditorExtensions = () => [
        json(),
        lineNumbers(),
        props.isDarkMode ? oneDark : [],
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
    <div ref="editorContainer" class="code-editor-container"></div>
</template>

<style scoped>
    .code-editor-container {
        flex: 1;
        border: 1px solid var(--color-border);
        border-radius: var(--radius-button);
        background: var(--color-panel);
        overflow: hidden;
    }

    .code-editor-container :deep(.cm-editor) {
        font-family: ui-monospace, Menlo, Consolas, monospace;
        font-size: 12px;
        line-height: 1.4;
        height: 100%;
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
        background-color: var(--color-panel);
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
