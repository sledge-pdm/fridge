import { css } from '@acab/ecsstatic';
import { clsx } from '@sledge/core';
import { Component, createEffect, createMemo, createSignal, For, onMount, Show } from 'solid-js';
import { clearDocumentSearchResult, fromId, updateDocumentSearchResult } from '~/features/document/service';
import { searchDocument } from '~/features/search/Search';
import { editorStore } from '~/stores/EditorStore';

const root = css`
  display: flex;
  flex-direction: column;
  flex: 1 1 0;
  min-height: 0;
  overflow: auto;
  border-right: 1px solid var(--color-border-secondary);
`;

const scrollContainer = css`
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  height: 100%;
  width: 280px;
  padding: 16px 16px;
  overflow-x: hidden;
  overflow-y: auto;
  z-index: 10;

  &::-webkit-scrollbar {
    width: 2px;
    background-color: transparent;
  }

  &::-webkit-thumb {
    background-color: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background-color: #888;
  }
`;
const searchLabel = css`
  margin-top: 8px;
  margin-bottom: 8px;
  margin-left: 2px;
  color: var(--color-muted);
`;
const searchInput = css`
  font-family: PM12;
  font-size: 12px;
  padding: 4px;
  background-color: var(--color-surface);
`;

const resultList = css`
  display: flex;
  flex-direction: column;
  margin-top: 12px;
  gap: 4px;
`;
const noResultText = css`
  color: var(--color-muted);
  margin-top: 12px;
  margin-left: 6px;
`;
const resultItem = css`
  padding: 4px 6px;
  width: 100%;
  overflow: hidden;
  &:hover {
    background-color: var(--color-surface);
  }
`;

const resultLabel = css`
  font-size: 10px;
  font-family: PM10;
  margin-top: 4px;
  white-space: pre;
  margin-left: 6px;
`;
const resultText = css`
  width: 100%;
  font-size: 10px;
  font-family: PM10;
  color: var(--color-on-background);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;
const foundText = css`
  background-color: #ff0;
  color: #000;
`;

const Search: Component = () => {
  let searchInputRef: HTMLInputElement;

  onMount(() => {
    searchInputRef.focus();
  });

  const activeDoc = createMemo(() => fromId(editorStore.activeDocId));
  const [lastQuery, setLastQuery] = createSignal<string | undefined>(undefined);

  createEffect(() => {
    const activeId = editorStore.activeDocId;
    const searchStates = editorStore.searchStates;
    if (!activeId) return;
    const active = fromId(activeId);
    if (!active) return;
    // load saved state if available
    const state = searchStates.get(active.id);

    if (state) {
      const query = state.query?.toString();
      setLastQuery(state.query?.toString());
      if (query) searchInputRef.value = query;
    } else {
      setLastQuery(undefined);
      searchInputRef.value = '';
    }
  });

  return (
    <div class={scrollContainer}>
      <p class={searchLabel}>search document.</p>
      <input
        ref={(ref) => (searchInputRef = ref)}
        class={searchInput}
        placeholder='search...'
        autocomplete='off'
        onInput={(e) => {
          const doc = fromId(editorStore.activeDocId);
          const query = e.currentTarget.value.trim();

          if (doc) {
            if (query && query !== lastQuery()) {
              // 検索実行
              const result = searchDocument(doc, query);
              setLastQuery(query);
              updateDocumentSearchResult(doc.id, result);
            } else if (!query) {
              // 空文字の場合は検索結果をクリア
              clearDocumentSearchResult(doc.id);
              setLastQuery(undefined);
            }
          }
        }}
      />

      <div class={resultList}>
        <Show when={editorStore.searchStates.get(activeDoc()?.id || '')?.query}>
          <p class={resultLabel}>search result of "{editorStore.searchStates.get(activeDoc()?.id || '')?.query?.toString()}"</p>
        </Show>
        <For each={editorStore.searchStates.get(activeDoc()?.id || '')?.founds} fallback={<p class={noResultText}>no result</p>}>
          {(item, i) => {
            // not concerning query length itself (might be too long e.g. "...XXXXXtoomuchlongquerytoshowinthesidebarXXXXX...")
            // there shouldn't be too much calculation here, so just put overflow:hidden and text-overflow: ellipsis, to make it
            // ...XXXXXtoomuchlongquerytosh... <- ending is ellipsed by css

            const margin = 5;
            return (
              <div class={resultItem}>
                <p>
                  {item.start}...{item.end}
                </p>
                <p class={resultText}>
                  ...
                  {activeDoc()?.content.slice(item.start - margin, item.start)}
                  <span class={clsx(resultText, foundText)}>{activeDoc()?.content.slice(item.start, item.end)}</span>
                  {activeDoc()?.content.slice(item.end, item.end + margin)}...
                </p>
              </div>
            );
          }}
        </For>
      </div>
    </div>
  );
};

export default Search;
