import { expect, test } from 'vitest';
import { page, userEvent } from 'vitest/browser';

test('textが表示されている', async () => {
  document.body.innerHTML = `<div data-testid="greeting">Hello Vitest</div>`;
  // page.getByTestIdはuserEvent用、値検証は直接DOM参照
  const greeting = document.querySelector('[data-testid="greeting"]');
  expect(greeting?.textContent).toBe('Hello Vitest');
});

test('inputに文字を入力できる', async () => {
  document.body.innerHTML = `<input data-testid="input" />`;
  const inputLocator = page.getByTestId('input');
  await userEvent.type(inputLocator, 'abc123');
  const input = document.querySelector('[data-testid="input"]') as HTMLInputElement;
  expect(input.value).toBe('abc123');
});

test('buttonクリックでテキストが変わる', async () => {
  document.body.innerHTML = `
    <button data-testid="btn">Click</button>
    <span data-testid="result"></span>
  `;
  document.querySelector('[data-testid=btn]')!.addEventListener('click', () => {
    document.querySelector('[data-testid=result]')!.textContent = 'Clicked!';
  });
  const btnLocator = page.getByTestId('btn');
  const result = document.querySelector('[data-testid="result"]');
  await userEvent.click(btnLocator);
  expect(result?.textContent).toBe('Clicked!');
});
