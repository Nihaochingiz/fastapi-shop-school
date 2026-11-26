import test from 'node:test';
import assert from 'node:assert/strict';
import { placeOrder, request } from './client.js';

const order = { game_id: 2, buyer: 'Толя', quantity: 1 };
const result = { id: 3, game_id: 2, quantity: 1, total_rub: 2490 };

test('базовый клиент читает ответ каталога', async () => {
  assert.deepEqual(await request('/api/games', undefined, async () => Response.json([])), []);
});

test('lesson_06 отправляет POST с JSON и возвращает созданный заказ', async () => {
  let count = 0;
  const actual = await placeOrder(order, async (path, options) => {
    count += 1;
    assert.equal(path, '/api/orders');
    assert.equal(options.method, 'POST');
    assert.equal(new Headers(options.headers).get('content-type'), 'application/json');
    assert.deepEqual(JSON.parse(options.body), order);
    return Response.json(result, { status: 201 });
  });
  assert.equal(count, 1);
  assert.deepEqual(actual, result);
});

test('lesson_06 показывает сообщение FastAPI при конфликте', async () => {
  await assert.rejects(
    placeOrder(order, async () => Response.json({ detail: 'Недостаточно дисков' }, { status: 409 })),
    { message: 'Недостаточно дисков' },
  );
});
