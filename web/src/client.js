export async function request(path, options, fetcher = fetch) {
  const response = await fetcher(path, options);
  const body = await response.json();
  if (!response.ok) {
    const detail = typeof body?.detail === 'string' ? body.detail : 'Проверьте введённые данные.';
    throw new Error(detail);
  }
  return body;
}

export async function placeOrder(order, fetcher = fetch) {
  // TODO 06: Отправьте order как JSON на /api/orders через request().
  throw new Error('Отправка заказа появится после урока 6.');
}
