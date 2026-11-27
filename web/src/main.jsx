import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { finalChecks, finalEndpoints, finalRequirements, lessonSections, lessons, lessonTest } from './course.js';
import { placeOrder, request } from './client.js';
import './styles.css';

const rubles = new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB', maximumFractionDigits: 0 });
const genres = ['Гонки', 'Приключения', 'Файтинг'];
const conditionLabels = { good: 'Хорошее', excellent: 'Отличное' };

function readRoute() {
  return window.location.hash.slice(1) || '/';
}

function readProgress() {
  try {
    const saved = JSON.parse(localStorage.getItem('disc-school-progress-v2'));
    if (Array.isArray(saved)) {
      return lessons.filter(lesson => saved.includes(lesson.id)).map(lesson => lesson.id);
    }
    const previous = JSON.parse(localStorage.getItem('disc-school-progress'));
    if (!Array.isArray(previous)) return [];
    const equivalents = [
      [['01', '04'], '03'], [['02'], '06'], [['03'], '04'], [['05'], '25'], [['06'], '26'],
    ];
    return equivalents.filter(([oldIds]) => oldIds.every(id => previous.includes(id))).map(([, id]) => id);
  } catch {
    return [];
  }
}

function Mark() {
  return <span className="brand-mark" aria-hidden="true"><i /></span>;
}

function Header({ route }) {
  const section = route.startsWith('/shop') ? 'shop' : route === '/final' ? 'final' : 'course';
  return <header className="top">
    <div className="top-inner">
      <a className="brand" href="#/"><Mark /><span>Дисковая<span className="brand-sub">ПРАКТИКА FASTAPI</span></span></a>
      <nav aria-label="Основная навигация">
        <a href="#/" aria-current={section === 'course' ? 'page' : undefined}>Учебник</a>
        <a href="#/shop" aria-current={section === 'shop' ? 'page' : undefined}>Магазин PS2</a>
        <a href="#/final" aria-current={section === 'final' ? 'page' : undefined}>Итоговый проект</a>
      </nav>
    </div>
  </header>;
}

function Progress({ progress }) {
  return <div className="progress">
    <div><span>Ваш прогресс</span><strong>{progress.length} / {lessons.length}</strong></div>
    <progress value={progress.length} max={lessons.length} aria-label="Пройденные уроки" />
  </div>;
}

function Home({ progress }) {
  const next = lessons.find(lesson => !progress.includes(lesson.id));
  return <>
    <section className="hero">
      <div className="hero-copy">
        <p className="eyebrow"><span /> Практический курс</p>
        <h1>FastAPI<br />на практике</h1>
        <p className="lead">У Толи есть коллекция подержанных дисков PS2. Помогите ему запустить интернет-магазин и соберите свой проект для Xbox 360.</p>
        <div className="actions">
          <a className="button primary" href={next ? '#/lesson/' + next.id : '#/final'}>{progress.length === 0 ? 'Начать первый урок' : next ? 'Продолжить курс' : 'Открыть итоговое ТЗ'}</a>
          <a className="button ghost" href="#/shop">Открыть магазин PS2</a>
        </div>
        <div className="stack" aria-label="Технологии курса">
          {['FastAPI', 'PostgreSQL', 'React', 'Docker'].map(item => <span key={item}>{item}</span>)}
        </div>
      </div>
      <div className="hero-art" aria-hidden="true">
        <div className="disc"><span /></div>
        <div className="case">
          <span className="case-top">ДИСКОВАЯ <b>PS2</b></span>
          <div className="case-art"><i /><i /><i /><i /></div>
          <strong>АРХИВ<br />ТОЛИ</strong>
          <span className="case-bottom">КОЛЛЕКЦИЯ ДИСКОВ</span>
        </div>
      </div>
    </section>
    <section className="curriculum">
      <div className="section-head">
        <div><h2>Программа курса</h2><p>{lessons.length} уроков. В каждом — теория, вопрос, правка в проекте и проверка.</p></div>
        <Progress progress={progress} />
      </div>
      {lessonSections.map(section => <section className="curriculum-section" key={section.title}>
        <h3>{section.title}</h3>
        <div className="lesson-grid">
          {section.lessons.map(lesson => <a className="lesson-tile" key={lesson.id} href={'#/lesson/' + lesson.id}>
            <span className={progress.includes(lesson.id) ? 'tile-number done' : 'tile-number'} aria-label={progress.includes(lesson.id) ? 'Пройдено' : undefined}>{progress.includes(lesson.id) ? '✓' : lesson.id}</span>
            <div><span className="topic">{lesson.topic}</span><h4>{lesson.title}</h4></div>
          </a>)}
        </div>
      </section>)}
    </section>
    <Setup />
  </>;
}

function Setup() {
  return <section className="panel setup">
    <h2>Локальный запуск</h2>
    <p>Откройте папку проекта в редакторе. Из той же папки поднимите три сервиса через Docker Compose.</p>
    <Command text="docker compose up --build" />
    <p>Уроки и витрина открываются на порту 5173, Swagger UI — на порту 8000. Маршруты /api/lab доступны в Swagger UI. Исправляйте TODO по очереди и сверяйте результат с тестами.</p>
  </section>;
}

function Command({ text }) {
  const [copied, setCopied] = useState(false);
  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  }
  return <div className="command"><code>{text}</code><button type="button" onClick={copy}>{copied ? 'Скопировано' : 'Копировать'}</button></div>;
}

function Lesson({ lesson, progress, toggleDone }) {
  const [answer, setAnswer] = useState(null);
  const index = lessons.indexOf(lesson);
  const done = progress.includes(lesson.id);
  const section = lessonSections.find(item => item.lessons.includes(lesson));
  return <div className="lesson-layout">
    <aside className="lesson-side">
      <a className="back" href="#/">Все уроки</a>
      <Progress progress={progress} />
      <nav aria-label="Уроки раздела">
        <h2>{section.title}</h2>
        {section.lessons.map(item => <a key={item.id} href={'#/lesson/' + item.id} aria-current={item === lesson ? 'page' : undefined}>
          <span>{progress.includes(item.id) ? '✓' : item.id}</span>{item.title}
        </a>)}
      </nav>
    </aside>
    <article>
      <p className="eyebrow"><span /> Урок {lesson.id} · {lesson.topic}</p>
      <h1>{lesson.title}</h1><p className="lead">{lesson.intro}</p>
      <section className="panel">
        <h2>Теория</h2>
        {lesson.theory.map(body => <p className="theory" key={body}>{body}</p>)}
        <pre>{lesson.code}</pre>
        <a className="text-link" href={lesson.doc} target="_blank" rel="noreferrer">Читать по теме</a>
      </section>
      <section className="panel">
        <h2>Вопрос</h2><p>{lesson.question}</p>
        <div className="answers">{lesson.options.map((option, i) =>
          <button key={option} type="button" aria-pressed={answer === i}
            className={answer === i ? (i === lesson.correct ? 'correct' : 'incorrect') : ''}
            onClick={() => setAnswer(i)}>{option}</button>)}</div>
        <p className="answer-message" aria-live="polite">{answer === null ? '' : answer === lesson.correct ? lesson.explanation : 'Попробуйте ещё раз.'}</p>
      </section>
      <section className="panel">
        <h2>Практика</h2><p>Файл <code>{lesson.file}</code></p>
        <ol>{lesson.tasks.map(task => <li key={task}>{task}</li>)}</ol>
        <details><summary>Подсказка</summary><p>{lesson.hint}</p></details>
        <h3>Проверка в терминале</h3>
        <Command text={lessonTest(lesson.id)} />
        <p>Если тесты прошли, отметьте урок. Отметки сохраняются в этом браузере.</p>
        <div className="actions">
          <button className="button primary" type="button" aria-pressed={done} onClick={() => toggleDone(lesson.id)}>{done ? 'Снять отметку' : 'Отметить как пройденный'}</button>
          {lesson.practice === 'shop' && <a className="button ghost" href="#/shop">Проверить на витрине</a>}
          {lesson.practice === 'api' && <a className="button ghost" href="/docs" target="_blank" rel="noreferrer">Открыть Swagger UI</a>}
        </div>
      </section>
      <div className="actions">
        {lessons[index - 1] && <a className="button ghost" href={'#/lesson/' + lessons[index - 1].id}>Предыдущий урок</a>}
        <a className="button ghost" href={lessons[index + 1] ? '#/lesson/' + lessons[index + 1].id : '#/final'}>{lessons[index + 1] ? 'Следующий урок' : 'Перейти к итоговому проекту'}</a>
      </div>
    </article>
  </div>;
}

function useApi(path, revision = 0) {
  const [state, setState] = useState({ path: '', revision: -1, loading: true });
  useEffect(() => {
    const controller = new AbortController();
    request(path, { signal: controller.signal }).then(
      data => setState({ path, revision, data }),
      error => {
        if (!controller.signal.aborted) setState({ path, revision, error: error.message });
      },
    );
    return () => controller.abort();
  }, [path, revision]);
  return state.path === path && state.revision === revision ? state : { loading: true };
}

function Cover({ game }) {
  return <div className={'cover cover-' + ((game.id - 1) % 6)} aria-hidden="true">
    <span>Толя · PS2</span><strong>{game.title}</strong><i />
  </div>;
}

function Catalog() {
  const [genre, setGenre] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [sort, setSort] = useState('default');
  const [query, setQuery] = useState('');
  const catalog = useApi('/api/games' + (query ? '?' + query : ''));
  function submit(event) {
    event.preventDefault();
    const params = new URLSearchParams({ sort });
    if (genre) params.set('genre', genre);
    if (maxPrice) params.set('max_price', maxPrice);
    setQuery(params.toString());
  }
  return <>
    <div className="page-head"><p className="eyebrow"><span /> Учебный магазин</p><h1>PS2 у Толи</h1>
      <p className="lead">Подержанные диски из коллекции Толи. Выберите игру, чтобы посмотреть её состояние и остаток.</p>
    </div>
    <form className="panel filters" onSubmit={submit}>
      <label>Жанр<select value={genre} onChange={event => setGenre(event.target.value)}><option value="">Все жанры</option>{genres.map(item => <option key={item}>{item}</option>)}</select></label>
      <label>Бюджет, ₽<input type="number" min="1" step="1" placeholder="Любая цена" value={maxPrice} onChange={event => setMaxPrice(event.target.value)} /></label>
      <label>Сортировка<select value={sort} onChange={event => setSort(event.target.value)}><option value="default">По умолчанию</option><option value="price_asc">Сначала дешевле</option></select></label>
      <button type="submit" className="button primary">Применить</button>
    </form>
    {catalog.loading && <p role="status">Загружаем каталог…</p>}
    {catalog.error && <p className="notice" role="alert">Каталог недоступен. Проверьте контейнер api. {catalog.error}</p>}
    {catalog.data?.length === 0 && <p className="notice">По этим параметрам дисков нет.</p>}
    <div className="catalog-grid">{catalog.data?.map(game => <a className="game-tile" href={'#/shop/' + game.id} key={game.id}>
      <Cover game={game} /><div className="game-info"><span className="topic">{game.genre} · {conditionLabels[game.condition]}</span>
      <h2>{game.title}</h2><div><strong>{rubles.format(game.price_rub)}</strong><span>{game.stock ? 'В наличии: ' + game.stock : 'Распродано'}</span></div></div>
    </a>)}</div>
    <a className="text-link missing-link" href="#/shop/99999">Проверить карточку отсутствующего диска</a>
  </>;
}

function GamePage({ id }) {
  const [revision, setRevision] = useState(0);
  const [latest, setLatest] = useState(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');
  const state = useApi('/api/games/' + id, revision);
  const game = state.data || latest?.game;
  async function buy(event) {
    event.preventDefault();
    const fields = new FormData(event.currentTarget);
    setPending(true);
    setError('');
    setLatest(null);
    try {
      const result = await placeOrder({ game_id: game.id, buyer: fields.get('buyer').trim(), quantity: Number(fields.get('quantity')) });
      setLatest({ result, game });
      setRevision(current => current + 1);
    } catch (err) {
      setError(err.message);
    } finally {
      setPending(false);
    }
  }
  return <><a href="#/shop" className="back">Все диски</a>
    {state.loading && !game && <p role="status">Загружаем карточку…</p>}
    {state.error && <p className="notice" role="alert">{state.error}</p>}
    {state.data === null && <p className="notice" role="status">API вернул пустую карточку со статусом 200. Поведение исправляется в уроке 06.</p>}
    {game && <div className="game-page">
      <Cover game={game} />
      <div><p className="eyebrow"><span /> {game.genre} · {conditionLabels[game.condition]}</p><h1>{game.title}</h1>
      <p className="lead">{game.description}</p><p className="price">{rubles.format(game.price_rub)}</p>
      <p>Дисков в наличии: {game.stock}</p>
      {game.stock > 0 && <form className="panel order" onSubmit={buy}>
        <h2>Оформить заказ</h2>
        <label>Ваше имя<input name="buyer" required maxLength="80" pattern=".*\S.*" autoComplete="name" /></label>
        <label>Количество<input name="quantity" type="number" required min="1" max="5" step="1" defaultValue="1" /></label>
        <button className="button primary" disabled={pending || state.loading || Boolean(state.error)}>{pending ? 'Отправляем…' : 'Оформить'}</button>
      </form>}
      {error && <p className="notice" role="alert">{error}</p>}
      {latest && <p className="notice success" role="status">Заказ №{latest.result.id} оформлен. Сумма {rubles.format(latest.result.total_rub)}.</p>}
      </div>
    </div>}
  </>;
}

function FinalProject() {
  return <div className="final-page">
    <p className="eyebrow"><span /> Итоговый проект</p><h1>Магазин Xbox 360</h1>
    <p className="lead">Соберите отдельный магазин подержанных игр. Возьмите витрину Толи за образец и добавьте корзину с заказом из нескольких позиций.</p>
    <div className="stack">{['FastAPI', 'PostgreSQL', 'SQLAlchemy', 'React', 'Docker Compose', 'pytest', 'Alembic'].map(tool => <span key={tool}>{tool}</span>)}</div>
    <section className="panel"><h2>Техническое задание</h2>
      {finalRequirements.map(([title, body]) => <div className="theory" key={title}><h3>{title}</h3><p>{body}</p></div>)}
      <h3>Пример тела заказа</h3>
      <pre>{JSON.stringify({ buyer: 'Анна', email: 'anna@example.com', items: [{ game_id: 1, quantity: 1 }, { game_id: 2, quantity: 2 }] }, null, 2)}</pre>
    </section>
    <section className="panel"><h2>Контракт API</h2>
      <div className="table-wrap"><table><thead><tr><th scope="col">Метод</th><th scope="col">Маршрут</th><th scope="col">Результат</th></tr></thead><tbody>
        {finalEndpoints.map(([method, path, result]) => <tr key={method + path}><td>{method}</td><td><code>{path}</code></td><td>{result}</td></tr>)}
      </tbody></table></div>
    </section>
    <section className="panel"><h2>Критерии приёмки</h2>
      <ul>{finalChecks.map(check => <li key={check}>{check}</li>)}</ul>
      <p>Сдайте исходники, миграции, данные для начального наполнения, тесты и README в одном репозитории.</p>
    </section>
    <a href="#/" className="button ghost">Вернуться к урокам</a>
  </div>;
}

function App() {
  const [route, setRoute] = useState(readRoute);
  const [progress, setProgress] = useState(readProgress);
  useEffect(() => {
    function changeRoute() {
      setRoute(readRoute());
      window.scrollTo(0, 0);
    }
    window.addEventListener('hashchange', changeRoute);
    return () => window.removeEventListener('hashchange', changeRoute);
  }, []);
  function toggleDone(id) {
    const next = progress.includes(id) ? progress.filter(item => item !== id) : [...progress, id];
    setProgress(next);
    try {
      localStorage.setItem('disc-school-progress-v2', JSON.stringify(next));
    } catch {
      // Progress remains available for this session when storage is blocked.
    }
  }
  const lesson = lessons.find(item => route === '/lesson/' + item.id);
  const gameId = route.match(/^\/shop\/(\d+)$/)?.[1];
  let page = <Home progress={progress} />;
  if (lesson) page = <Lesson key={lesson.id} lesson={lesson} progress={progress} toggleDone={toggleDone} />;
  if (route === '/shop') page = <Catalog />;
  if (gameId) page = <GamePage key={gameId} id={gameId} />;
  if (route === '/final') page = <FinalProject />;
  return <><Header route={route} /><main id="content" className="shell">{page}</main>
    <footer className="bottom"><div className="shell"><a className="brand" href="#/"><Mark />Дисковая</a><span>Учебный проект на FastAPI</span></div></footer>
  </>;
}

createRoot(document.getElementById('root')).render(<App />);
