'use client';

import { useEffect, useMemo, useState } from 'react';
import clubFirstSeed from './clubfirst-seed.json';
import clubFirstFull from './clubfirst-full.json';
import clubFirstGoogleExample from './clubfirst-google-example.json';
import ClubFirstExample from './ClubFirstExample';
import {
  AlertTriangle,
  ArrowRight,
  Bell,
  BookOpen,
  Calculator,
  Check,
  ChevronDown,
  CircleDollarSign,
  ClipboardCheck,
  Database,
  Gauge,
  LayoutDashboard,
  ListTodo,
  Pencil,
  Plus,
  Save,
  Settings2,
  Sparkles,
  Target,
  UserCog,
  UserRound,
  Users,
  X,
} from 'lucide-react';

type Page = 'overview' | 'catalog' | 'roles' | 'tasks' | 'setup';
type Mode = 'operator' | 'owner';
type Scope = 'general' | 'clubfirst';
type RoleTab = 'health' | 'effects' | 'economics' | 'people';
type Dimension = {
  name: string;
  score: number;
  metric: string;
  formula: string;
  source: string;
  action: string;
};
type Role = {
  name: string;
  short: string;
  owner: string;
  ownerPosition?: string;
  ownerContact?: string;
  pilot: string;
  status: string;
  health: number;
  people: number;
  beneficiaryScore: number;
  participantScore: number;
  beneficiaryEffect: string;
  participantEffect: string;
  income: number;
  costs: number;
  dimensions: Dimension[];
  activities: string[];
  kind?: 'base' | 'custom';
  configured?: boolean;
  dataReady?: boolean;
  model?: RoleModel;
  economyInputs?: string[];
  clubFirstDetails?: (typeof clubFirstFull)[number];
  googleExample?: (typeof clubFirstGoogleExample)[number];
};

type FrameworkAnswers = {
  goal: string;
  audience: string;
  outcome: string;
  context: string;
  data: string;
  pilot: string;
};
const emptyFramework: FrameworkAnswers = {
  goal: '', audience: '', outcome: '', context: '', data: '', pilot: '',
};
type RegistrationProfile = { name: string; email: string; organization: string; position: string };
const userStorageKey = (userId: string, name: string) => `role-center-v3:${userId}:${name}`;
const frameworkKey = (scope: Scope, userId: string) => userStorageKey(userId, `framework:${scope}`);
const suggestRoles = (items: Role[], answers: FrameworkAnswers, excluded: string[] = []) => {
  const query = `${answers.goal} ${answers.audience} ${answers.outcome} ${answers.context}`.toLowerCase();
  const terms = query.split(/[^а-яёa-z0-9]+/).filter((word) => word.length > 3);
  return items.filter((role) => !excluded.includes(role.name)).map((role, index) => {
    const roleText = `${role.name} ${role.short} ${role.beneficiaryEffect} ${role.participantEffect}`.toLowerCase();
    const matches = terms.filter((term) => roleText.includes(term));
    return { role, score: matches.length, index, reason: matches.length
      ? `Совпадение с запросом: ${matches.slice(0, 3).join(', ')}`
      : 'Возможная отправная модель для проверки на пилоте' };
  }).sort((a, b) => b.score - a.score || a.index - b.index);
};

const workbookValue = (value: string | number | null | undefined, unit?: string | null) => {
  if (value === null || value === undefined || value === '') return 'Нет данных';
  if (typeof value === 'string' && value.startsWith('=')) return 'Рассчитывается автоматически';
  if (typeof value === 'number') {
    if (unit === '%' && Math.abs(value) <= 1) return `${Math.round(value * 1000) / 10}%`;
    return new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 2 }).format(value) + (unit ? ` ${unit}` : '');
  }
  return String(value);
};

const dimensionNames = [
  'Жизнеспособность',
  'Актуальность',
  'Управляемость',
  'Подтверждаемость',
  'Результативность',
  'Операционная устойчивость',
];
const formatTarget = (value: number) => value > 0 && value <= 1 ? `${Math.round(value * 100)}%` : String(value);
const makeDimensions = (scores: number[], metrics: string[][]): Dimension[] =>
  scores.map((score, index) => ({
    name: dimensionNames[index],
    score,
    metric: metrics[index][0],
    formula: metrics[index][1],
    source: metrics[index][2],
    action: metrics[index][3],
  }));

const roles: Role[] = [
  {
    name: 'Бадди / Навигатор',
    short: 'Помогает новичку пройти адаптационный цикл.',
    owner: 'Илья Соколов',
    pilot: 'Пилот 1',
    status: 'В работе',
    health: 82,
    people: 12,
    beneficiaryScore: 78,
    participantScore: 88,
    beneficiaryEffect:
      'Роль увеличивает продление участия после первого года за счёт качественной адаптации новичков.',
    participantEffect:
      'Новичок понимает, к кому обратиться, а бадди получает признание вклада.',
    income: 4212000,
    costs: 782000,
    activities: [
      'Приветственная встреча · возможность проявления',
      'Личная встреча · обязательная среда',
      'Итог адаптации · подтверждение роли',
    ],
    dimensions: makeDimensions(
      [86, 84, 92, 76, 79, 70],
      [
        [
          'Активные бадди',
          'Бадди с ≥1 подтверждённым действием / все назначенные бадди',
          'Профиль + система учёта · автоматически',
          'Подключить неактивных бадди к новым циклам.',
        ],
        [
          'Новички с назначенным бадди',
          'Новички с активным назначением / все новички периода',
          'Система учёта · автоматически',
          'Проверить критерии назначения на новый поток.',
        ],
        [
          'Назначения в допустимой нагрузке',
          'Бадди с ≤3 новичками / все активные бадди',
          'Система ролей · автоматически',
          'Перераспределить перегруженных бадди.',
        ],
        [
          'Циклы с подтверждёнными встречами',
          'Циклы с фактами встреч / все начатые циклы',
          'Календарь + система учёта',
          'Запросить недостающие факты одним кликом.',
        ],
        [
          'Завершение адаптационного цикла',
          'Завершённые в срок циклы / циклы с наступившим сроком',
          'Система учёта · автоматически',
          'Разобрать незавершённые циклы.',
        ],
        [
          'Циклы без ручных напоминаний',
          'Циклы без ручной задачи / все завершённые циклы',
          'Канбан + система учёта',
          'Автоматизировать повторяющиеся напоминания.',
        ],
      ],
    ),
  },
  {
    name: 'Лидер клубной активности',
    short: 'Создаёт и проводит участнические форматы.',
    owner: 'Анна Волкова',
    pilot: 'Пилот 1',
    status: 'В работе',
    health: 76,
    people: 18,
    beneficiaryScore: 83,
    participantScore: 72,
    beneficiaryEffect:
      'Клуб получает больше самостоятельных активностей без роста нагрузки команды.',
    participantEffect:
      'Лидер реализует инициативу, развивает связи и получает видимость в клубе.',
    income: 3190000,
    costs: 1032000,
    activities: [
      'Тематическая встреча · обязательная среда',
      'Большая встреча · возможность проявления',
      'Разбор формата · подтверждение роли',
    ],
    dimensions: makeDimensions(
      [78, 81, 88, 72, 74, 63],
      [
        [
          'Лидеры с проведённой активностью',
          'Лидеры с ≥1 завершённой активностью / все назначенные лидеры',
          'Модуль активностей',
          'Уточнить планы у лидеров без запусков.',
        ],
        [
          'Форматы с подтверждённым спросом',
          'Активности выше порога регистраций / все опубликованные активности',
          'Модуль активностей',
          'Изменить форматы без спроса.',
        ],
        [
          'Активности с владельцем и планом',
          'Активности с указанным владельцем и утверждённым планом / все активности периода',
          'Канбан + календарь',
          'Назначить владельцев до публикации.',
        ],
        [
          'Активности с зафиксированным итогом',
          'Завершённые активности с зафиксированным результатом / все завершённые активности',
          'Модуль активностей',
          'Добавить обязательный короткий итог.',
        ],
        [
          'Конверсия регистрации в участие',
          'Уникальные посетители / уникальные регистрации',
          'Регистрация + чекин',
          'Разобрать причины неявки.',
        ],
        [
          'Самостоятельные запуски',
          'Активности без задач команды / все завершённые активности',
          'Канбан',
          'Собрать шаблон самостоятельного запуска.',
        ],
      ],
    ),
  },
  {
    name: 'Хранитель ценностей',
    short: 'Поддерживает нормы и культурный код клуба.',
    owner: 'Денис Миронов',
    pilot: 'Пилот 2',
    status: 'Подтверждение',
    health: 91,
    people: 24,
    beneficiaryScore: 90,
    participantScore: 86,
    beneficiaryEffect:
      'Клуб удерживает культурное ядро и делает желательные модели поведения видимыми.',
    participantEffect:
      'Участник получает признание вклада и доступ к специальным форматам.',
    income: 3984000,
    costs: 714000,
    activities: [
      'Повседневная коммуникация · роль не зависит от события',
      'Совет клуба · поддержка роли',
      'Церемония признания · подтверждение статуса',
    ],
    dimensions: makeDimensions(
      [94, 91, 96, 88, 90, 87],
      [
        [
          'Носители с актуальным статусом',
          'Носители с действующим статусом / все назначенные носители',
          'Профиль · автоматически',
          'Проверить истекающие статусы.',
        ],
        [
          'Связь роли с задачей культуры',
          'Средняя оценка владельца и бенефициара по шкале 1–5',
          '2 оценки раз в полугодие',
          'Сохранить текущую модель.',
        ],
        [
          'Полнота правил роли',
          'Заполненные условия: владелец, критерии, срок, снятие / 4',
          'Карточка роли',
          'Изменений не требуется.',
        ],
        [
          'Профили с основанием присвоения',
          'Статусы с зафиксированным решением / все активные статусы',
          'Профиль + решения',
          'Добавить основания к старым назначениям.',
        ],
        [
          'Сохранение носителей роли',
          'Продлившие участие / носители с датой продления',
          'Система учёта · автоматически',
          'Наблюдать динамику.',
        ],
        [
          'Автоматические обновления статуса',
          'Обновления через систему / все обновления статуса',
          'Система учёта + профиль',
          'Автоматизировать ручные проверки.',
        ],
      ],
    ),
  },
  {
    name: 'Эксперт / Автор',
    short: 'Создаёт проверенный контент и отвечает на запросы.',
    owner: 'Мария Лебедева',
    pilot: 'Пилот 1',
    status: 'Пилот',
    health: 73,
    people: 47,
    beneficiaryScore: 69,
    participantScore: 81,
    beneficiaryEffect:
      'Клуб превращает экспертизу участников в доступные материалы и ответы.',
    participantEffect:
      'Эксперт получает профессиональную видимость, связи и новые возможности.',
    income: 2680000,
    costs: 1176000,
    activities: [
      'Экспертная встреча · возможность проявления',
      'Ответ на запрос · подтверждение роли',
      'База знаний · роль не зависит от события',
    ],
    dimensions: makeDimensions(
      [78, 71, 86, 91, 66, 58],
      [
        [
          'Эксперты с проявлением',
          'Эксперты с публикацией или выступлением / все активные эксперты',
          'Приложение + активности',
          'Предложить темы экспертам без проявлений.',
        ],
        [
          'Материалы по востребованным темам',
          'Материалы по темам выше порога спроса / все материалы',
          'Поиск + запросы',
          'Обновить тематические приоритеты.',
        ],
        [
          'Материалы, прошедшие модерацию',
          'Материалы с решением модератора / все отправленные материалы',
          'Канбан',
          'Соблюдать установленный срок модерации.',
        ],
        [
          'Материалы с подтверждённым авторством',
          'Публикации с указанным автором / все публикации',
          'Приложение',
          'Изменений не требуется.',
        ],
        [
          'Материалы с полезным действием',
          'Материалы с сохранением, ответом или заявкой / материалы с достаточным охватом',
          'Аналитика приложения',
          'Разобрать слабые темы и форматы.',
        ],
        [
          'Публикации без ручного сопровождения',
          'Публикации без дополнительных задач команды / все публикации',
          'Канбан',
          'Упростить публикационный процесс.',
        ],
      ],
    ),
  },
  {
    name: 'Амбассадор',
    short: 'Представляет клуб и создаёт полезные внешние связи.',
    owner: 'Ольга Романова',
    pilot: 'Пилот 2',
    status: 'Пересмотр',
    health: 68,
    people: 11,
    beneficiaryScore: 74,
    participantScore: 77,
    beneficiaryEffect:
      'Клуб получает качественные рекомендации, партнёрства и внешнюю видимость.',
    participantEffect:
      'Амбассадор расширяет сеть контактов и получает представительские возможности.',
    income: 3460000,
    costs: 1344000,
    activities: [
      'Внешнее выступление · возможность проявления',
      'Партнёрская встреча · подтверждение роли',
      'Закрытый совет · поддержка и привилегия',
    ],
    dimensions: makeDimensions(
      [72, 75, 82, 69, 64, 54],
      [
        [
          'Амбассадоры с полезным проявлением',
          'Носители с ≥1 подтверждённым проявлением / все амбассадоры',
          'Система учёта + профиль',
          'Уточнить план проявлений.',
        ],
        [
          'Соответствие внешним приоритетам',
          'Средняя оценка владельца и бенефициара по шкале 1–5',
          '2 оценки раз в квартал',
          'Обновить приоритеты партнёрств.',
        ],
        [
          'Проявления с согласованной рамкой',
          'Проявления с заполненным брифом / все внешние проявления',
          'Система учёта',
          'Использовать короткий бриф перед выступлением.',
        ],
        [
          'Проявления с подтверждающим фактом',
          'Проявления со ссылкой или подтверждённым контактом / все заявленные проявления',
          'Система учёта + профиль',
          'Запросить недостающие подтверждения.',
        ],
        [
          'Выполнение плана полезных возможностей',
          'Подтверждённые возможности / план на период',
          'Система учёта · автоматически',
          'Сфокусировать два приоритетных канала.',
        ],
        [
          'Проявления без ручной координации',
          'Проявления без задач команды / все проявления',
          'Канбан + система учёта',
          'Создать готовый набор материалов.',
        ],
      ],
    ),
  },
];

type EffectSetup = {
  beneficiaryMetric: string;
  beneficiaryFormula: string;
  beneficiaryTarget: string;
  beneficiarySource: string;
  participantMetric: string;
  participantFormula: string;
  participantTarget: string;
  participantSource: string;
};

const effectSetup: Record<string, EffectSetup> = {
  'Бадди / Навигатор': {
    beneficiaryMetric: 'Продление участия после первого года',
    beneficiaryFormula:
      'Новички, продлившие участие / все новички с наступившей датой продления × 100%',
    beneficiaryTarget: 'не менее 82%',
    beneficiarySource: 'Система учёта членства',
    participantMetric: 'Завершение адаптационного цикла',
    participantFormula:
      'Новички, завершившие цикл в срок / все новички с наступившим сроком × 100%',
    participantTarget: 'не менее 80%',
    participantSource: 'Профиль участника и система адаптации',
  },
  'Лидер клубной активности': {
    beneficiaryMetric: 'Доля самостоятельных клубных активностей',
    beneficiaryFormula:
      'Активности без операционного участия команды / все проведённые активности × 100%',
    beneficiaryTarget: 'не менее 60%',
    beneficiarySource: 'Модуль активностей и канбан',
    participantMetric: 'Реализованные инициативы лидеров',
    participantFormula:
      'Доведённые до результата инициативы / все принятые инициативы × 100%',
    participantTarget: 'не менее 75%',
    participantSource: 'Канбан инициатив',
  },
  'Хранитель ценностей': {
    beneficiaryMetric: 'Продление участия носителей роли',
    beneficiaryFormula:
      'Продлившие участие носители / носители с наступившей датой продления × 100%',
    beneficiaryTarget: 'не менее 90%',
    beneficiarySource: 'Система учёта членства',
    participantMetric: 'Использование поддержки и привилегий',
    participantFormula:
      'Носители, использовавшие хотя бы одну возможность / все активные носители × 100%',
    participantTarget: 'не менее 65%',
    participantSource: 'Профиль и модуль доступов',
  },
  'Эксперт / Автор': {
    beneficiaryMetric: 'Экспертные материалы с полезным действием',
    beneficiaryFormula:
      'Материалы с сохранением, заявкой или ответом / материалы с достаточным охватом × 100%',
    beneficiaryTarget: 'не менее 35%',
    beneficiarySource: 'Аналитика приложения',
    participantMetric: 'Эксперты с новой профессиональной возможностью',
    participantFormula:
      'Эксперты с подтверждённым приглашением или запросом / активные эксперты × 100%',
    participantTarget: 'не менее 22%',
    participantSource: 'Профиль и система учёта',
  },
  Амбассадор: {
    beneficiaryMetric: 'Выполнение плана полезных внешних возможностей',
    beneficiaryFormula:
      'Подтверждённые возможности / утверждённый план на период × 100%',
    beneficiaryTarget: 'не менее 90%',
    beneficiarySource: 'Система учёта партнёрств',
    participantMetric: 'Амбассадоры с полученной возможностью',
    participantFormula:
      'Носители с выступлением, знакомством или партнёрством / активные амбассадоры × 100%',
    participantTarget: 'не менее 70%',
    participantSource: 'Профиль и система учёта',
  },
};

const indexTargets: Record<string, string[]> = {
  'Бадди / Навигатор': [
    'не менее 80%',
    'не менее 80%',
    'не менее 85%',
    'не менее 85%',
    'не менее 75%',
    'не менее 70%',
  ],
  'Лидер клубной активности': [
    'не менее 70%',
    'не менее 70%',
    'не менее 90%',
    'не менее 80%',
    'не менее 65%',
    'не менее 60%',
  ],
  'Хранитель ценностей': [
    'не менее 95%',
    'не менее 4 из 5',
    '100%',
    'не менее 98%',
    'не менее 90%',
    'не менее 95%',
  ],
  'Эксперт / Автор': [
    'не менее 50%',
    'не менее 70%',
    '100%',
    'не менее 95%',
    'не менее 35%',
    'не менее 70%',
  ],
  Амбассадор: [
    'не менее 70%',
    'не менее 4 из 5',
    'не менее 90%',
    'не менее 80%',
    'не менее 90%',
    'не менее 70%',
  ],
};

const menu = [
  {
    id: 'overview' as Page,
    label: 'Обзор',
    hint: 'Вся система',
    icon: LayoutDashboard,
  },
  {
    id: 'catalog' as Page,
    label: 'База ролей',
    hint: 'Выбор и создание',
    icon: BookOpen,
  },
  {
    id: 'roles' as Page,
    label: 'Роли',
    hint: 'Показатели и эффекты',
    icon: Gauge,
  },
  {
    id: 'tasks' as Page,
    label: 'Задачи',
    hint: 'Все процессы',
    icon: ListTodo,
  },
  {
    id: 'setup' as Page,
    label: 'Настройка',
    hint: 'Запуск системы',
    icon: Settings2,
  },
];
const money = (value: number) =>
  `${(value / 1_000_000).toFixed(1).replace('.', ',')} млн ₽`;
const tone = (score: number) =>
  score >= 85 ? 'good' : score >= 70 ? 'warn' : 'bad';
const status = (score: number) =>
  score >= 85
    ? 'Здоровый диапазон'
    : score >= 70
      ? 'Требует внимания'
      : 'Нужно действие';

function Overview({
  openRole,
  mode,
  roleList,
  scope,
}: {
  openRole: (role: Role) => void;
  mode: Mode;
  roleList: Role[];
  scope: Scope;
}) {
  const visible = mode === 'operator' ? roleList : roleList.slice(0, 3);
  const measured = visible.filter(
    (role) => role.configured && role.dataReady !== false,
  );
  const average = Math.round(
    measured.reduce((sum, role) => sum + role.health, 0) /
      (measured.length || 1),
  );
  return (
    <div className="page-stack">
      <div className="page-title">
        <div>
          <span>Рабочий стол</span>
          <h1>
            {mode === 'operator' ? 'Состояние ролевой системы' : 'Мои роли'}
          </h1>
          <p>
            {mode === 'operator'
              ? 'Главное по всем ролям — без лишних отчётов.'
              : 'Показатели, эффекты, экономика и задачи только по вашим ролям.'}
          </p>
        </div>
        <button className="primary" onClick={() => openRole(visible[0])}>
          Открыть роль <ArrowRight />
        </button>
      </div>
      <div className="kpi-grid">
        <article>
          <Gauge />
          <div>
            <span>Средний индекс здоровья роли</span>
            <strong>{measured.length ? average : '—'}</strong>
            <small>
              {measured.length ? status(average) : 'Недостаточно данных'}
            </small>
          </div>
        </article>
        <article>
          <Users />
          <div>
            <span>Носителей ролей</span>
            <strong>{visible.some((r) => r.dataReady !== false) ? visible.reduce((sum, r) => sum + r.people, 0) : '—'}</strong>
            <small>{visible.some((r) => r.dataReady !== false) ? 'в активной базе' : 'база не подключена'}</small>
          </div>
        </article>
        <article>
          <AlertTriangle />
          <div>
            <span>Требуют внимания</span>
            <strong>{measured.length ? measured.filter((r) => r.health < 75).length : '—'}</strong>
            <small>{measured.length ? 'индекс ниже 75' : 'оценка после загрузки фактов'}</small>
          </div>
        </article>
        <article>
          <ListTodo />
          <div>
            <span>Задачи на неделю</span>
            <strong>—</strong>
            <small>задачи пока не назначены</small>
          </div>
        </article>
      </div>
      <section className="panel role-table-panel">
        <div className="section-title">
          <div>
            <span>Портфель</span>
            <h2>{mode === 'operator' ? 'Все роли' : 'Роли владельца'}</h2>
          </div>
          <small>Нажмите на строку, чтобы открыть детали</small>
        </div>
        <div className="role-table">
          <div className="role-row role-head">
            <span>Роль</span>
            <span>Владелец</span>
            <span>Индекс</span>
            <span>Эффект участника</span>
            <span>Эффект бенефициара</span>
            <span>Экономика</span>
          </div>
          {visible.map((role) => (
            <button
              className="role-row"
              key={role.name}
              onClick={() => openRole(role)}
            >
              <span>
                <b>{role.name}</b>
                <small>
                  {role.pilot} · {role.status}
                </small>
              </span>
              <span>{role.owner}</span>
              <span>
                {role.dataReady !== false && role.configured && (
                  <i className={tone(role.health)} />
                )}
                <b>
                  {role.dataReady !== false && role.configured
                    ? role.health
                    : 'Нет данных'}
                </b>
              </span>
              <span>
                {role.dataReady !== false && role.configured
                  ? `${role.participantScore}%`
                  : 'Нет данных'}
              </span>
              <span>
                {role.dataReady !== false && role.configured
                  ? `${role.beneficiaryScore}%`
                  : 'Нет данных'}
              </span>
              <span>
                <b>
                  {role.configured && role.dataReady !== false
                    ? money(role.income - role.costs)
                    : role.dataReady === false ? 'Нет данных' : 'Не настроена'}
                </b>
                <small>
                  {role.configured && role.dataReady !== false ? 'чистый эффект' : 'нужны фактические значения'}
                </small>
              </span>
            </button>
          ))}
        </div>
      </section>
      <section className="panel portfolio-economy">
        <div className="section-title">
          <div>
            <span>Экономика портфеля</span>
            <h2>{mode === 'operator' ? 'Все роли клуба' : 'Все мои роли'}</h2>
            <p>
              {mode === 'operator'
                ? 'Оператор видит сводную экономику всей ролевой системы.'
                : 'Владелец видит экономику только закреплённых за ним ролей.'}
            </p>
          </div>
          <strong>
            {visible.some((item) => item.dataReady !== false)
              ? money(visible.filter((item) => item.dataReady !== false).reduce((sum, item) => sum + item.income - item.costs, 0))
              : 'Нет данных'}
            <small>совокупный чистый эффект</small>
          </strong>
        </div>
        {!visible.some((item) => item.dataReady !== false) ? (
          <div className="data-rule"><Database /><div><b>Экономика ролей пока не рассчитана</b><p>В карточке каждой роли уже указан набор исходных параметров. Внесите фактические значения, чтобы появился расчёт по роли и сводка портфеля.</p></div></div>
        ) : <div className="portfolio-economy-grid">
          {visible.map((item) => (
            <button key={item.name} onClick={() => openRole(item)}>
              <span>
                <b>{item.name}</b>
                <small>{item.owner}</small>
              </span>
              <span>
                <small>Выгоды</small>
                <b>{item.dataReady === false ? '—' : money(item.income)}</b>
              </span>
              <span>
                <small>Затраты</small>
                <b>{item.dataReady === false ? '—' : money(item.costs)}</b>
              </span>
              <span>
                <small>Чистый эффект</small>
                <strong>{item.dataReady === false ? '—' : money(item.income - item.costs)}</strong>
              </span>
            </button>
          ))}
        </div>}
      </section>
      <section className="panel next-actions">
        <div className="section-title">
          <div>
            <span>Фокус</span>
            <h2>Что требует решения сейчас</h2>
          </div>
        </div>
        {!visible.some((item) => item.dataReady !== false) ? (
          <div className="action-list">
            {roleList.slice(0, 3).map((item) => (
              <button key={item.name} onClick={() => openRole(item)}>
                <i className="warn"><Database /></i>
                <span><b>{item.name}: подключить факты</b><small>Методика роли загружена, фактический индекс пока не рассчитан</small></span>
                <ArrowRight />
              </button>
            ))}
          </div>
        ) : <div className="action-list">
          {visible.filter((item) => item.health < 75).map((item) => (
            <button key={item.name} onClick={() => openRole(item)}>
              <i className="warn"><AlertTriangle /></i>
              <span><b>{item.name}: индекс {item.health}</b><small>Откройте показатели и определите корректирующее действие</small></span>
              <ArrowRight />
            </button>
          ))}
          {!visible.some((item) => item.health < 75) && <p>Отклонений по рассчитанным ролям нет.</p>}
        </div>}
      </section>
    </div>
  );
}

function Health({ role }: { role: Role }) {
  const [added, setAdded] = useState<string[]>([]);
  if (role.dataReady === false)
    return (
      <div className="role-content">
        <div className="data-rule">
          <Database />
          <div>
            <b>Методика настроена, фактических данных пока недостаточно</b>
            <p>
              Индекс не считается нулевым. Подключите источник или внесите факт
              по каждому обязательному показателю.
            </p>
          </div>
        </div>
        <div className={role.clubFirstDetails ? 'dimension-list cf-dimension-list' : 'dimension-list'}>
          {role.clubFirstDetails ? role.clubFirstDetails.dimensions.map((d, index) => (
            <details key={d.name}>
              <summary><span><b>{d.name}</b><small>{d.metric}</small></span><strong>{workbookValue(d.weight, '%')}</strong><ChevronDown /></summary>
              <div className="dimension-detail">
                <p><b>Что считаем:</b> {d.calculation}</p>
                <p><b>Цель:</b> {workbookValue(role.model?.dimensions[index]?.metrics[0]?.target ?? d.target, d.unit)} · <b>Период:</b> {d.period} · <b>Источник:</b> {d.source}</p>
                <p><b>Формат ввода:</b> {d.unit || 'не задан'} · <b>Пример из Excel:</b> {workbookValue(d.example, d.unit)}</p>
                <p><b>При отклонении:</b> {d.action}</p>
                <details className="cf-formula"><summary>Технический расчёт балла</summary><code>{d.scoreFormula || 'Не задан'}</code><code>{d.weightedFormula || 'Не задан'}</code></details>
              </div>
            </details>
          )) : role.model?.dimensions.map((d) => (
            <details key={d.name}>
              <summary><span><b>{d.name}</b><small>{d.metrics.map((m) => m.name).join('; ')}</small></span><strong>—</strong><ChevronDown /></summary>
              {d.metrics.map((m) => (
                <div className="dimension-detail" key={m.id}>
                  <p><b>Что считаем:</b> {m.formula}</p>
                  <p><b>Цель:</b> {formatTarget(m.target)} · <b>Период:</b> {m.period} · <b>Источник:</b> {m.source}</p>
                  <p><b>При отклонении:</b> {m.action}</p>
                </div>
              ))}
            </details>
          ))}
        </div>
        {role.clubFirstDetails && <ClubFirstAdditional details={role.clubFirstDetails} />}
      </div>
    );
  const weak = role.dimensions.filter((item) => item.score < 85);
  return (
    <div className="role-content">
      <div className="health-summary">
        <div className={`health-ring ${tone(role.health)}`}>
          <strong>{role.health}</strong>
          <span>из 100</span>
        </div>
        <div>
          <span>Индекс здоровья роли</span>
          <h2>{status(role.health)}</h2>
          <p>
            Индекс оценивает здоровье роли, а не человека. Ниже сразу показаны
            отклонения, причина и следующее действие.
          </p>
        </div>
        <div className="legend">
          <span>
            <i className="good" />
            85–100 · здорово
          </span>
          <span>
            <i className="warn" />
            70–84 · внимание
          </span>
          <span>
            <i className="bad" />
            0–69 · действие
          </span>
          <span>
            <i className="nodata" />
            нет данных
          </span>
        </div>
      </div>
      {weak.length > 0 && (
        <section className="attention-strip">
          <AlertTriangle />
          <div>
            <b>{weak.length} показателя ниже здорового диапазона</b>
            <span>
              Сначала откройте самый низкий показатель. Рекомендацию можно сразу
              перенести в задачи.
            </span>
          </div>
          <button onClick={() => setAdded(weak.map((item) => item.name))}>
            <Plus />
            Добавить все в задачи
          </button>
        </section>
      )}
      <div className="dimension-list">
        {role.dimensions.map((item) => (
          <details key={item.name} open={item.score < 70}>
            <summary>
              <span>
                <i className={tone(item.score)} />
                <b>{item.name}</b>
                <small>{item.metric}</small>
              </span>
              <strong>{item.score}</strong>
              <ChevronDown />
            </summary>
            <div>
              <dl>
                <dt>Что считаем</dt>
                <dd>{item.metric}</dd>
                <dt>Формула</dt>
                <dd>{item.formula} × 100%</dd>
                <dt>Источник</dt>
                <dd>{item.source}</dd>
                <dt>Факт и цель</dt>
                <dd>Факт: {item.score} · здоровый диапазон: от 85</dd>
                <dt>Рекомендация</dt>
                <dd>{item.action}</dd>
              </dl>
              {item.score < 85 && (
                <button
                  className={
                    added.includes(item.name)
                      ? 'recommendation-task added'
                      : 'recommendation-task'
                  }
                  onClick={() =>
                    setAdded((current) =>
                      current.includes(item.name)
                        ? current
                        : [...current, item.name],
                    )
                  }
                >
                  {added.includes(item.name) ? (
                    <>
                      <Check />
                      Добавлено в задачи
                    </>
                  ) : (
                    <>
                      <Plus />
                      Добавить рекомендацию в задачи
                    </>
                  )}
                </button>
              )}
            </div>
          </details>
        ))}
      </div>
      <div className="data-rule">
        <Database />
        <div>
          <b>Если данных недостаточно</b>
          <p>
            Система показывает «Нет данных», а не ноль: отсутствие активности не
            смешивается с отсутствием фиксации.
          </p>
        </div>
      </div>
    </div>
  );
}

function ClubFirstAdditional({ details }: { details: (typeof clubFirstFull)[number] }) {
  const surveyRows: Record<string, string[][]> = {
    'Лидер бизнес-экспедиции': [
      ['Вопросы короткого опроса'],
      ['Выполнение роли', 'Лидер выполнил заявленную за ним часть программы?'],
      ['Организованность', 'Его часть программы была организована понятно и вовремя?'],
      ['На связи', 'Лидер был на связи и отвечал на вопросы?'],
      ['Польза от лидера', 'Участие лидера дало полезный контакт, знание или следующий шаг?'],
      ['Шкала', 'Да = 100; частично = 50; нет = 0; «не могу оценить» исключается. Для анкеты нужны хотя бы 3 из 4 оценок; для индекса — не менее 3 анкет участников.'],
      ['Правило', 'Ответы владельца роли показаны отдельно в реестре и не смешиваются с оценками участников. Цель индекса сохранена из действующей модели; после пилота её можно откалибровать.'],
    ],
    'Лидер гостеприимства': [
      ['Вопросы короткого опроса'],
      ['Выполнение роли', 'Лидер лично выполнил обещанную группе часть визита?'],
      ['Организованность', 'Приём со стороны лидера был организован понятно и вовремя?'],
      ['На связи', 'Лидер был на связи и отвечал на вопросы?'],
      ['Польза от лидера', 'Лидер помог получить полезный контекст, знакомство или ориентир?'],
      ['Шкала', 'Да = 100; частично = 50; нет = 0; «не могу оценить» исключается. Для анкеты нужны хотя бы 3 из 4 оценок; для индекса — не менее 3 анкет участников.'],
      ['Правило', 'Ответы владельца роли показаны отдельно в реестре и не смешиваются с оценками участников. Цель индекса сохранена из действующей модели; после пилота её можно откалибровать.'],
    ],
  };
  if (!details.additionalRows.length && !details.requiredData && !details.methodNote) return null;
  return <details className="panel cf-extra">
    <summary>Дополнительные данные и правила из Excel <ChevronDown /></summary>
    {details.requiredData && <p><b>Что загрузить:</b> {details.requiredData}</p>}
    {details.methodNote && <p><b>Правило расчёта:</b> {details.methodNote}</p>}
    {details.additionalRows.length > 0 && <div className="cf-extra-scroll"><table><tbody>{details.additionalRows.map((row, index) => <tr key={index}>{row.map((cell, cellIndex) => <td key={cellIndex}>{cell === null ? '—' : String(cell)}</td>)}</tr>)}</tbody></table></div>}
    {surveyRows[details.name] && <div className="cf-survey"><h3>Короткий опрос после активности</h3>{surveyRows[details.name].map((row, index) => <p key={index}><b>{row[0]}</b>{row[1] && ` — ${row[1]}`}</p>)}</div>}
  </details>;
}

function Effects({ role }: { role: Role }) {
  const beneficiaryReady =
    role.model?.beneficiaryMetrics.every((m) => m.fact !== null) ?? true;
  const participantReady =
    role.model?.participantMetrics.every((m) => m.fact !== null) ?? true;
  return (
    <div className="role-content effects-grid">
      <article className="effect-card beneficiary">
        <header>
          <Target />
          <span>Эффект для бенефициара</span>
          <strong>
            {beneficiaryReady ? `${role.beneficiaryScore}%` : 'Нет данных'}
          </strong>
        </header>
        <h3>{role.beneficiaryEffect}</h3>
        <div className="progress">
          <i
            style={{
              width: `${beneficiaryReady ? role.beneficiaryScore : 0}%`,
            }}
          />
        </div>
        <dl>
          <dt>Что измеряем</dt>
          <dd>
            {role.model?.beneficiaryMetrics.map((m) => m.name).join('; ') ||
              'Достижение целевого результата клуба.'}
          </dd>
          <dt>Как фиксируем</dt>
          <dd>
            {role.model?.beneficiaryMetrics
              .map((m) => `${m.formula} · ${m.source} · ${m.period}`)
              .join('; ') || 'Показатель из системы учёта или приложения.'}
          </dd>
          <dt>Кто отвечает</dt>
          <dd>Владелец подтверждает данные, оператор проверяет методику.</dd>
        </dl>
      </article>
      <article className="effect-card participant">
        <header>
          <UserRound />
          <span>Эффект для участника</span>
          <strong>
            {participantReady ? `${role.participantScore}%` : 'Нет данных'}
          </strong>
        </header>
        <h3>{role.participantEffect}</h3>
        <div className="progress">
          <i
            style={{
              width: `${participantReady ? role.participantScore : 0}%`,
            }}
          />
        </div>
        <dl>
          <dt>Что измеряем</dt>
          <dd>
            {role.model?.participantMetrics.map((m) => m.name).join('; ') ||
              'Получает ли носитель роли заявленную ценность и поддержку.'}
          </dd>
          <dt>Как фиксируем</dt>
          <dd>
            {role.model?.participantMetrics
              .map((m) => `${m.formula} · ${m.source} · ${m.period}`)
              .join('; ') ||
              'Данные по подтверждённым действиям и результатам.'}
          </dd>
          <dt>Кто отвечает</dt>
          <dd>Владелец роли реагирует на отклонения.</dd>
        </dl>
      </article>
      {role.clubFirstDetails && <section className="panel cf-effect-details">
        <div className="section-title"><div><span>Показатели из модели ClubFirst</span><h2>Как оценивать эффекты</h2><p>Примеры из Excel не являются текущими фактами клуба. Для расчёта подключите данные участников.</p></div></div>
        <div className="cf-effect-list">{role.clubFirstDetails.effects.map((effect, index) => <article key={`${effect.recipient}-${effect.name}-${index}`}>
          <span className="cf-label">{effect.recipient}</span><h3>{effect.name}</h3>
          <p>{effect.calculation}</p>
          <div className="cf-facts"><span><b>Цель</b>{workbookValue(effect.target, effect.unit)}</span><span><b>Пример из Excel</b>{workbookValue(effect.example, effect.unit)}</span><span><b>Источник</b>{effect.source}</span><span><b>Период</b>{effect.period}</span></div>
          <details className="cf-formula"><summary>Технический расчёт балла</summary><code>{effect.scoreFormula || 'Не задан'}</code></details>
        </article>)}</div>
      </section>}
      <section className="panel activity-links">
        <div className="section-title">
          <div>
            <span>Среда проявления</span>
            <h2>Связь с клубными активностями</h2>
          </div>
        </div>
        {role.activities.map((item) => {
          const [name, relation] = item.split(' · ');
          return (
            <div key={item}>
              <span>
                <b>{name}</b>
                <small>{relation}</small>
              </span>
              <button>Настроить</button>
            </div>
          );
        })}
      </section>
    </div>
  );
}

function Economics({ role, onEdit }: { role: Role; onEdit: () => void }) {
  const effect = role.income - role.costs;
  const payback =
    role.costs > 0 ? Math.round((effect / role.costs) * 100) : null;
  return (
    <div className="role-content">
      <div className="owner-note">
        <UserCog />
        <div>
          <b>Экономику ведёт владелец роли</b>
          <p>
            Оператор задаёт правила, а объёмы, стоимость и фактические значения
            подтверждает владелец процесса.
          </p>
        </div>
      </div>
      <div className="economy-kpis">
        <article>
          <span>Оценённый эффект</span>
          <strong>{role.dataReady === false ? 'Нет данных' : money(role.income)}</strong>
          <small>созданная ценность</small>
        </article>
        <article>
          <span>Стоимость роли</span>
          <strong>{role.dataReady === false ? 'Нет данных' : money(role.costs)}</strong>
          <small>время + расходы</small>
        </article>
        <article>
          <span>Чистый эффект</span>
          <strong>{role.dataReady === false ? 'Нет данных' : money(effect)}</strong>
          <small>эффект минус затраты</small>
        </article>
        <article>
          <span>Окупаемость роли</span>
          <strong>{role.dataReady === false || payback === null ? '—' : `${payback}%`}</strong>
          <small>чистый эффект / затраты</small>
        </article>
      </div>
      {role.clubFirstDetails && <section className="panel economy-form cf-economy">
        <div className="section-title"><div><span>Расчёт ClubFirst</span><h2>{role.clubFirstDetails.economyTitle || 'Экономика роли'}</h2><p>Все исходные статьи и результаты из таблицы. Заполненные числа — пример модели, а не текущие данные клуба.</p></div></div>
        <div className="cf-economy-grid"><div><h3>Что вводит владелец</h3><div className="cf-economy-list">{role.clubFirstDetails.economyInputs.map((item, index) => <article key={`${index}-${item.name}`}><div><b>{item.name}</b><small>{item.source}</small></div><strong>{workbookValue(item.example, item.unit)}</strong></article>)}</div></div>
        <div><h3>Что рассчитывает система</h3><div className="cf-economy-list">{role.clubFirstDetails.economyOutputs.map((item, index) => <article key={`${index}-${item.name}`}><div><b>{item.name}</b><small>{item.explanation || 'По заданным входным данным'}</small><details className="cf-formula"><summary>Формула из Excel</summary><code>{item.formula || 'Не задана'}</code></details></div><strong>{item.unit || '—'}</strong></article>)}</div></div></div>
        <p className="cf-economy-note"><b>Что требуется:</b> {role.clubFirstDetails.requiredData || 'Уточнить источники данных.'}</p>
        <button className="secondary" onClick={onEdit}><Settings2 />Настроить модель роли</button>
      </section>}
      {!role.clubFirstDetails && <section className="panel economy-form">
        <div className="section-title">
          <div>
            <span>Быстрый расчёт</span>
            <h2>Данные владельца</h2>
          </div>
          <button className="secondary" onClick={onEdit}>
            Изменить параметры
          </button>
        </div>
        <div className="economy-lines">
          {role.dataReady === false ? (
            <div><span><b>Фактические значения ещё не внесены</b><small>Параметры выше можно адаптировать и затем заполнить в настройке роли.</small></span><strong>—</strong></div>
          ) : role.model ? (
            [
              ...role.model.benefits.map((line) => ({
                ...line,
                kind: 'Выгода',
              })),
              ...role.model.costLines.map((line) => ({
                ...line,
                kind: 'Затрата',
              })),
            ].map((line) => (
              <div key={`${line.kind}-${line.id}`}>
                <span>
                  <b>{line.name}</b>
                  <small>
                    {line.kind} · {line.quantity} ×{' '}
                    {line.unitValue.toLocaleString('ru-RU')} ₽ · {line.source} ·{' '}
                    {line.period} · цель{' '}
                    {Number(line.target || 0).toLocaleString('ru-RU')} ₽
                  </small>
                </span>
                <strong>{money(line.quantity * line.unitValue)}</strong>
              </div>
            ))
          ) : (
            <div>
              <span>
                <b>Демонстрационный расчёт</b>
                <small>
                  Для точной экономики откройте параметры и задайте статьи,
                  источники и цели.
                </small>
              </span>
              <strong>{money(effect)}</strong>
            </div>
          )}
        </div>
        <details>
          <summary>
            Правила расчёта <ChevronDown />
          </summary>
          <p>
            Засчитываются только подтверждённые результаты. Если стоимость
            неизвестна, система показывает «Не настроена», а не ноль.
          </p>
        </details>
      </section>}
      {role.clubFirstDetails && <ClubFirstAdditional details={role.clubFirstDetails} />}
    </div>
  );
}

function People({ role }: { role: Role }) {
  const people = [
    ['Анна Волкова', 'Активна', 'Факты актуальны', 'Наблюдать'],
    ['Илья Соколов', 'Подтверждение', 'Нужен 1 факт', 'Запросить'],
    ['Мария Лебедева', 'Активна', 'Сильная динамика', 'Признать вклад'],
    ['Денис Миронов', 'Внимание', 'Нет фактов 30 дней', 'Разобрать'],
  ];
  return (
    <div className="role-content">
      <div className="people-toolbar">
        <div>
          <strong>{role.people}</strong>
          <span>носителей роли</span>
        </div>
        <button className="secondary">Подключить систему учёта</button>
        <button className="primary">
          <Plus />
          Назначить
        </button>
      </div>
      <div className="people-table">
        <div className="people-row people-head">
          <span>Участник</span>
          <span>Состояние</span>
          <span>Подтверждение</span>
          <span>Действие</span>
        </div>
        {role.dataReady === false && <div className="data-rule"><Database /><div><b>Участники пока не загружены</b><p>Подключите базу или добавьте назначения, чтобы увидеть носителей и их статусы.</p></div></div>}
        {role.dataReady !== false && people.map((p, i) => (
          <div className="people-row" key={p[0]}>
            <span>
              <i>
                {p[0]
                  .split(' ')
                  .map((x) => x[0])
                  .join('')}
              </i>
              <b>{p[0]}</b>
            </span>
            <span>
              <i className={i === 3 ? 'bad' : i === 1 ? 'warn' : 'good'} />
              {p[1]}
            </span>
            <span>{p[2]}</span>
            <button>{p[3]}</button>
          </div>
        ))}
      </div>
      <section className="panel lifecycle">
        <div className="section-title">
          <div>
            <span>Нелинейный путь</span>
            <h2>Состояния участника в роли</h2>
          </div>
        </div>
        <div className="lifecycle-steps">
          {[
            'Кандидат',
            'Назначен',
            'Активен',
            'Подтверждение',
            'Пауза',
            'Возврат или завершение',
          ].map((x, i) => (
            <span className={i < 3 ? 'done' : ''} key={x}>
              {i < 3 && <Check />}
              {x}
            </span>
          ))}
        </div>
        <p>
          Участник может вернуться к подтверждению, поставить роль на паузу,
          сменить или завершить её.
        </p>
      </section>
    </div>
  );
}

type CalcMetric = {
  id: number;
  name: string;
  formula: string;
  source: string;
  period: string;
  fact: number | null;
  target: number;
  weight: number;
  action: string;
};
type CalcDimension = {
  id: number;
  name: string;
  weight: number;
  metrics: CalcMetric[];
};
type EffectMetric = {
  id: number;
  name: string;
  formula: string;
  source: string;
  period: string;
  fact: number | null;
  target: number;
  weight: number;
};
type EconomyLine = {
  id: number;
  name: string;
  quantity: number;
  unitValue: number;
  source: string;
  period?: string;
  target?: number;
};
type RoleModel = {
  dimensions: CalcDimension[];
  participantMetrics: EffectMetric[];
  beneficiaryMetrics: EffectMetric[];
  benefits: EconomyLine[];
  costLines: EconomyLine[];
  sources: string[];
};
const defaultSources = [
  'Система учёта',
  'Профиль участника',
  'CRM',
  'Система членства',
  'Модуль активностей',
  'Календарь',
  'Финансы',
  'Ввод вручную',
];
const baseWeights = [15, 15, 20, 15, 25, 10];
const baseEconomy: Record<string, { benefits: string[]; costs: string[] }> = {
  'Бадди / Навигатор': {
    benefits: ['Подтверждённый финансовый эффект продлений новичков'],
    costs: ['Время сопровождения новичков', 'Прямые расходы на адаптацию'],
  },
  'Лидер клубной активности': {
    benefits: [
      'Экономия прямого бюджета активностей относительно утверждённого плана',
    ],
    costs: ['Прямые расходы на активности', 'Время команды на сопровождение'],
  },
  'Хранитель ценностей': {
    benefits: ['Подтверждённые финансовые результаты роли, если есть'],
    costs: [
      'Стоимость специальных предложений носителям',
      'Расходы на признание и сопровождение',
    ],
  },
  'Эксперт / Автор': {
    benefits: [
      'Подтверждённая экономия бюджета или доход от экспертного формата',
    ],
    costs: [
      'Прямые расходы на экспертные форматы',
      'Время команды на координацию',
    ],
  },
  Амбассадор: {
    benefits: ['Оплаченные членства по зарегистрированным рекомендациям'],
    costs: [
      'Бесплатный месяц приводящему участнику',
      'Прямые расходы на представительскую деятельность',
    ],
  },
};
const makeRoleModel = (role: Role): RoleModel => ({
  dimensions: role.dimensions.map((d, i) => ({
    id: i + 1,
    name: d.name,
    weight: baseWeights[i],
    metrics: [
      {
        id: (i + 1) * 100,
        name: d.metric,
        formula: d.formula,
        source: d.source,
        period: i === 4 ? 'Квартал' : 'Месяц',
        fact: role.kind === 'custom' ? null : d.score,
        target: 100,
        weight: 100,
        action: d.action,
      },
    ],
  })),
  participantMetrics: [
    {
      id: 1,
      name: effectSetup[role.name]?.participantMetric || '',
      formula: effectSetup[role.name]?.participantFormula || '',
      source: effectSetup[role.name]?.participantSource || 'Ввод вручную',
      period: 'Квартал',
      fact: role.kind === 'custom' ? null : role.participantScore,
      target: 100,
      weight: 100,
    },
  ],
  beneficiaryMetrics: [
    {
      id: 2,
      name: effectSetup[role.name]?.beneficiaryMetric || '',
      formula: effectSetup[role.name]?.beneficiaryFormula || '',
      source: effectSetup[role.name]?.beneficiarySource || 'Ввод вручную',
      period: 'Квартал',
      fact: role.kind === 'custom' ? null : role.beneficiaryScore,
      target: 100,
      weight: 100,
    },
  ],
  benefits: (baseEconomy[role.name]?.benefits || ['']).map((name, i) => ({
    id: i + 1,
    name,
    quantity: 0,
    unitValue: 0,
    source: role.kind === 'custom' ? 'Ввод вручную' : 'Финансы',
    period: 'Год',
    target: 0,
  })),
  costLines: (baseEconomy[role.name]?.costs || ['']).map((name, i) => ({
    id: i + 101,
    name,
    quantity: 0,
    unitValue: 0,
    source: role.kind === 'custom' ? 'Ввод вручную' : 'Финансы',
    period: 'Год',
    target: 0,
  })),
  sources: [
    ...new Set(
      [
        ...defaultSources,
        ...role.dimensions.map((d) => d.source).filter(Boolean),
        effectSetup[role.name]?.participantSource,
        effectSetup[role.name]?.beneficiarySource,
      ].filter((x): x is string => Boolean(x)),
    ),
  ],
});
const createEmptyRole = (name: string, short: string, owner: string): Role => ({
  name,
  short,
  owner,
  pilot: 'Не назначен',
  status: 'Черновик',
  health: 0,
  people: 0,
  beneficiaryScore: 0,
  participantScore: 0,
  beneficiaryEffect: '',
  participantEffect: '',
  income: 0,
  costs: 0,
  kind: 'custom',
  configured: false,
  activities: [],
  dimensions: dimensionNames.map((d) => ({
    name: d,
    score: 0,
    metric: '',
    formula: '',
    source: '',
    action: '',
  })),
});
const modelIssues = (model: RoleModel | undefined) => {
  if (!model) return ['Настройте показатели роли'];
  const issues: string[] = [];
  if (
    model.dimensions.length < 6 ||
    dimensionNames.some(
      (name) => !model.dimensions.some((d) => d.name === name),
    )
  )
    issues.push(
      'Нужны шесть базовых измерений индекса; дополнительные можно добавить',
    );
  if (model.dimensions.reduce((sum, d) => sum + Number(d.weight), 0) !== 100)
    issues.push('Вес измерений должен составлять 100%');
  model.dimensions.forEach((d) => {
    if (
      !d.metrics.length ||
      d.metrics.reduce((sum, m) => sum + Number(m.weight), 0) !== 100 ||
      d.metrics.some(
        (m) =>
          !m.name.trim() ||
          !m.formula.trim() ||
          !m.source.trim() ||
          !m.period.trim() ||
          Number(m.target) <= 0,
      )
    )
      issues.push(`Заполните показатели и 100% веса: ${d.name}`);
  });
  (
    [
      ['участника', model.participantMetrics],
      ['клуба', model.beneficiaryMetrics],
    ] as const
  ).forEach(([label, metrics]) => {
    if (
      !metrics.length ||
      metrics.reduce((sum, m) => sum + Number(m.weight), 0) !== 100 ||
      metrics.some(
        (m) =>
          !m.name.trim() ||
          !m.formula.trim() ||
          !m.source.trim() ||
          !m.period.trim() ||
          Number(m.target) <= 0,
      )
    )
      issues.push(`Настройте эффект для ${label} и 100% его веса`);
  });
  if (
    !model.benefits.length ||
    model.benefits.some(
      (l) =>
        !l.name.trim() ||
        !l.source.trim() ||
        !l.period?.trim() ||
        l.target === undefined ||
        Number(l.target) < 0,
    )
  )
    issues.push('Укажите статьи, источники, период и цель выгод');
  if (
    !model.costLines.length ||
    model.costLines.some(
      (l) =>
        !l.name.trim() ||
        !l.source.trim() ||
        !l.period?.trim() ||
        l.target === undefined ||
        Number(l.target) < 0,
    )
  )
    issues.push('Укажите статьи, источники, период и цель затрат');
  return issues;
};
const scoreFor = (fact: number | null, target: number) =>
  fact !== null && target > 0
    ? Math.min(Math.max((fact / target) * 100, 0), 100)
    : 0;
const scoreState = (score: number) =>
  score >= 85 ? 'Здорово' : score >= 70 ? 'Внимание' : 'Нужно действие';

function EconomyGroup({
  title,
  kind,
  lines,
  total,
  update,
  add,
  remove,
}: {
  title: string;
  kind: 'benefit' | 'cost';
  lines: EconomyLine[];
  total: number;
  update: (
    kind: 'benefit' | 'cost',
    index: number,
    key: keyof EconomyLine,
    value: string | number,
  ) => void;
  add: (kind: 'benefit' | 'cost') => void;
  remove: (kind: 'benefit' | 'cost', index: number) => void;
}) {
  return (
    <section className="economy-group">
      <header>
        <h4>{title}</h4>
        <strong>{money(total)}</strong>
      </header>
      {lines.map((line, index) => (
        <div className="economy-line-editor" key={line.id}>
          <label>
            Что считаем
            <input
              value={line.name}
              onChange={(e) => update(kind, index, 'name', e.target.value)}
            />
          </label>
          <label>
            Количество
            <input
              type="number"
              value={line.quantity}
              onChange={(e) =>
                update(kind, index, 'quantity', Number(e.target.value))
              }
            />
          </label>
          <label>
            Стоимость единицы, ₽
            <input
              type="number"
              value={line.unitValue}
              onChange={(e) =>
                update(kind, index, 'unitValue', Number(e.target.value))
              }
            />
          </label>
          <label>
            Источник
            <input
              value={line.source}
              onChange={(e) => update(kind, index, 'source', e.target.value)}
            />
          </label>
          <label>
            Период
            <select
              value={line.period || 'Год'}
              onChange={(e) => update(kind, index, 'period', e.target.value)}
            >
              <option>Месяц</option>
              <option>Квартал</option>
              <option>Год</option>
            </select>
          </label>
          <label>
            Цель, ₽
            <input
              type="number"
              min="0"
              value={line.target ?? 0}
              onChange={(e) =>
                update(kind, index, 'target', Number(e.target.value))
              }
            />
          </label>
          <div>
            <span>Факт = количество × стоимость</span>
            <b>{money(line.quantity * line.unitValue)}</b>
          </div>
          <button
            className="icon-button"
            aria-label="Удалить статью"
            onClick={() => remove(kind, index)}
          >
            <X />
          </button>
        </div>
      ))}
      <button className="add-metric" onClick={() => add(kind)}>
        <Plus />
        Добавить статью
      </button>
    </section>
  );
}

function CalculationModel({
  role,
  compact = false,
  onChange,
  initialModel,
  initialSection = 'index',
  onSectionChange,
}: {
  role: Role;
  compact?: boolean;
  onChange?: (model: RoleModel) => void;
  initialModel?: RoleModel;
  initialSection?: 'index' | 'effects' | 'economy';
  onSectionChange?: (section: 'index' | 'effects' | 'economy') => void;
}) {
  const initial = initialModel || role.model || makeRoleModel(role);
  const [section, setSection] = useState<'index' | 'effects' | 'economy'>(
    initialSection,
  );
  const [dimensions, setDimensions] = useState<CalcDimension[]>(
    initial.dimensions,
  );
  const [sources, setSources] = useState(initial.sources);
  const [newSource, setNewSource] = useState('');
  const [participantMetrics, setParticipantMetrics] = useState<EffectMetric[]>(
    initial.participantMetrics,
  );
  const [beneficiaryMetrics, setBeneficiaryMetrics] = useState<EffectMetric[]>(
    initial.beneficiaryMetrics,
  );
  const [benefits, setBenefits] = useState<EconomyLine[]>(initial.benefits);
  const [costLines, setCostLines] = useState<EconomyLine[]>(initial.costLines);
  useEffect(() => {
    onChange?.({
      dimensions,
      participantMetrics,
      beneficiaryMetrics,
      benefits,
      costLines,
      sources,
    });
  }, [
    dimensions,
    participantMetrics,
    beneficiaryMetrics,
    benefits,
    costLines,
    sources,
  ]);
  const [addedRecommendations, setAddedRecommendations] = useState<string[]>(
    [],
  );
  const dimensionScore = (dimension: CalcDimension) =>
    dimension.metrics.reduce(
      (sum, metric) =>
        sum + (scoreFor(metric.fact, metric.target) * metric.weight) / 100,
      0,
    );
  const index = Math.round(
    dimensions.reduce(
      (sum, d) => sum + (dimensionScore(d) * d.weight) / 100,
      0,
    ),
  );
  const effectScore = (metrics: EffectMetric[]) =>
    Math.round(
      metrics.reduce(
        (sum, metric) =>
          sum + (scoreFor(metric.fact, metric.target) * metric.weight) / 100,
        0,
      ),
    );
  const pScore = effectScore(participantMetrics);
  const bScore = effectScore(beneficiaryMetrics);
  const indexHasData = dimensions.every((d) =>
    d.metrics.every((m) => m.fact !== null),
  );
  const participantHasData = participantMetrics.every((m) => m.fact !== null);
  const beneficiaryHasData = beneficiaryMetrics.every((m) => m.fact !== null);
  const gross = benefits.reduce(
    (sum, line) => sum + line.quantity * line.unitValue,
    0,
  );
  const costs = costLines.reduce(
    (sum, line) => sum + line.quantity * line.unitValue,
    0,
  );
  const net = gross - costs;
  const returnRate = costs > 0 ? Math.round((net / costs) * 100) : 0;
  const updateDimension = (
    index: number,
    key: 'name' | 'weight',
    value: string | number,
  ) =>
    setDimensions((current) =>
      current.map((item, i) =>
        i === index ? { ...item, [key]: value } : item,
      ),
    );
  const updateMetric = (
    dimensionIndex: number,
    metricIndex: number,
    key: keyof CalcMetric,
    value: string | number | null,
  ) =>
    setDimensions((current) =>
      current.map((dimension, i) =>
        i === dimensionIndex
          ? {
              ...dimension,
              metrics: dimension.metrics.map((metric, j) =>
                j === metricIndex ? { ...metric, [key]: value } : metric,
              ),
            }
          : dimension,
      ),
    );
  const addMetric = (dimensionIndex: number) =>
    setDimensions((current) =>
      current.map((dimension, i) =>
        i === dimensionIndex
          ? {
              ...dimension,
              metrics: [
                ...dimension.metrics,
                {
                  id: Date.now(),
                  name: 'Новый показатель',
                  formula: 'Факт ÷ цель × 100%',
                  source: sources[0],
                  period: 'Месяц',
                  fact: null,
                  target: 85,
                  weight: 0,
                  action: 'Уточнить причину отклонения и создать задачу.',
                },
              ],
            }
          : dimension,
      ),
    );
  const removeMetric = (dimensionIndex: number, metricIndex: number) =>
    setDimensions((current) =>
      current.map((dimension, i) =>
        i === dimensionIndex
          ? {
              ...dimension,
              metrics: dimension.metrics.filter((_, j) => j !== metricIndex),
            }
          : dimension,
      ),
    );
  const addDimension = () =>
    setDimensions((current) => [
      ...current,
      {
        id: Date.now(),
        name: 'Новое измерение',
        weight: 0,
        metrics: [
          {
            id: Date.now() + 1,
            name: 'Новый показатель',
            formula: 'Факт ÷ цель × 100%',
            source: sources[0],
            period: 'Месяц',
            fact: null,
            target: 85,
            weight: 100,
            action: 'Уточнить причину отклонения и создать задачу.',
          },
        ],
      },
    ]);
  const removeDimension = (dimensionIndex: number) =>
    setDimensions((current) => current.filter((_, i) => i !== dimensionIndex));
  const saveSource = () => {
    const value = newSource.trim();
    if (value && !sources.includes(value)) {
      setSources((current) => [...current, value]);
      setNewSource('');
    }
  };
  const updateEffect = (
    kind: 'participant' | 'beneficiary',
    metricIndex: number,
    key: keyof EffectMetric,
    value: string | number | null,
  ) => {
    const setter =
      kind === 'participant' ? setParticipantMetrics : setBeneficiaryMetrics;
    setter((current) =>
      current.map((metric, index) =>
        index === metricIndex ? { ...metric, [key]: value } : metric,
      ),
    );
  };
  const addEffect = (kind: 'participant' | 'beneficiary') => {
    const setter =
      kind === 'participant' ? setParticipantMetrics : setBeneficiaryMetrics;
    setter((current) => [
      ...current,
      {
        id: Date.now(),
        name: 'Новый показатель эффекта',
        formula: 'Факт ÷ цель × 100%',
        source: sources[0],
        period: 'Квартал',
        fact: null,
        target: 85,
        weight: 0,
      },
    ]);
  };
  const removeEffect = (
    kind: 'participant' | 'beneficiary',
    metricIndex: number,
  ) => {
    const setter =
      kind === 'participant' ? setParticipantMetrics : setBeneficiaryMetrics;
    setter((current) => current.filter((_, index) => index !== metricIndex));
  };
  const updateEconomyLine = (
    kind: 'benefit' | 'cost',
    lineIndex: number,
    key: keyof EconomyLine,
    value: string | number,
  ) => {
    const setter = kind === 'benefit' ? setBenefits : setCostLines;
    setter((current) =>
      current.map((line, index) =>
        index === lineIndex ? { ...line, [key]: value } : line,
      ),
    );
  };
  const addEconomyLine = (kind: 'benefit' | 'cost') => {
    const setter = kind === 'benefit' ? setBenefits : setCostLines;
    setter((current) => [
      ...current,
      {
        id: Date.now(),
        name: '',
        quantity: 0,
        unitValue: 0,
        source: 'Ввод вручную',
        period: 'Год',
        target: 0,
      },
    ]);
  };
  const removeEconomyLine = (kind: 'benefit' | 'cost', lineIndex: number) => {
    const setter = kind === 'benefit' ? setBenefits : setCostLines;
    setter((current) => current.filter((_, index) => index !== lineIndex));
  };
  const addRecommendation = (key: string) =>
    setAddedRecommendations((current) =>
      current.includes(key) ? current : [...current, key],
    );
  return (
    <div className={`calculation-model ${compact ? 'compact' : ''}`}>
      <div className="calc-overview">
        <article className={`score-${tone(index)}`}>
          <span>Индекс здоровья</span>
          <strong>{indexHasData ? index : '—'}</strong>
          <small>
            {indexHasData ? scoreState(index) : 'Недостаточно данных'}
          </small>
        </article>
        <article className={`score-${tone(pScore)}`}>
          <span>Эффект для участника</span>
          <strong>{participantHasData ? pScore : '—'}</strong>
          <small>{participantHasData ? 'из 100' : 'Недостаточно данных'}</small>
        </article>
        <article className={`score-${tone(bScore)}`}>
          <span>Эффект для клуба</span>
          <strong>{beneficiaryHasData ? bScore : '—'}</strong>
          <small>{beneficiaryHasData ? 'из 100' : 'Недостаточно данных'}</small>
        </article>
        <article className={net >= 0 ? 'score-good' : 'score-bad'}>
          <span>Чистый эффект</span>
          <strong>{money(net)}</strong>
          <small>доходность затрат {returnRate}%</small>
        </article>
      </div>
      <nav className="calc-tabs">
        <button
          className={section === 'index' ? 'active' : ''}
          onClick={() => { setSection('index'); onSectionChange?.('index'); }}
        >
          <Gauge />
          Индекс здоровья
        </button>
        <button
          className={section === 'effects' ? 'active' : ''}
          onClick={() => { setSection('effects'); onSectionChange?.('effects'); }}
        >
          <Target />
          Эффекты
        </button>
        <button
          className={section === 'economy' ? 'active' : ''}
          onClick={() => { setSection('economy'); onSectionChange?.('economy'); }}
        >
          <Calculator />
          Экономика
        </button>
      </nav>
      {section === 'index' && (
        <section className="calc-sheet">
          <header>
            <div>
              <span>Конструктор индекса</span>
              <h3>Измерения и показатели здоровья роли</h3>
              <p>
                Вес измерения определяет его вклад в общий индекс. Внутри
                измерения можно создать несколько показателей и распределить
                между ними 100% веса.
              </p>
            </div>
            <div className="formula-note">
              <b>Два уровня расчёта</b>
              <span>Показатель → измерение → общий индекс</span>
            </div>
          </header>
          <div className="index-toolbar">
            <div>
              <b>Источники данных</b>
              <span>
                Добавьте источник один раз и выбирайте его в любом показателе.
              </span>
            </div>
            <div className="source-adder">
              <input
                value={newSource}
                onChange={(e) => setNewSource(e.target.value)}
                placeholder="Название нового источника"
              />
              <button className="secondary" onClick={saveSource}>
                <Plus />
                Добавить источник
              </button>
            </div>
          </div>
          <div
            className={`weight-summary ${dimensions.reduce((sum, d) => sum + d.weight, 0) === 100 ? 'valid' : 'invalid'}`}
          >
            <span>Вес измерений в общем индексе</span>
            <strong>
              {dimensions.reduce((sum, d) => sum + d.weight, 0)}% из 100%
            </strong>
            <small>
              {dimensions.reduce((sum, d) => sum + d.weight, 0) === 100
                ? 'Баланс настроен'
                : 'Распределите ровно 100% между измерениями'}
            </small>
          </div>
          <div className="dimension-editor-list">
            {dimensions.map((dimension, dimensionIndex) => {
              const score = Math.round(dimensionScore(dimension));
              const metricWeight = dimension.metrics.reduce(
                (sum, metric) => sum + metric.weight,
                0,
              );
              return (
                <article
                  className={`dimension-editor ${score < 70 ? 'row-alert' : score < 85 ? 'row-warning' : ''}`}
                  key={dimension.id}
                >
                  <header>
                    <div className="dimension-identity">
                      <label>
                        Название измерения
                        <input
                          value={dimension.name}
                          onChange={(e) =>
                            updateDimension(
                              dimensionIndex,
                              'name',
                              e.target.value,
                            )
                          }
                        />
                      </label>
                      <label>
                        Вес в общем индексе, %
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={dimension.weight}
                          onChange={(e) =>
                            updateDimension(
                              dimensionIndex,
                              'weight',
                              Number(e.target.value),
                            )
                          }
                        />
                      </label>
                    </div>
                    <div className="dimension-result">
                      <span>Балл измерения</span>
                      <strong className={tone(score)}>
                        {dimension.metrics.every((m) => m.fact !== null)
                          ? score
                          : '—'}
                      </strong>
                      <small>
                        {dimension.metrics.every((m) => m.fact !== null)
                          ? scoreState(score)
                          : 'Недостаточно данных'}
                      </small>
                    </div>
                    <button
                      className="icon-button"
                      title="Удалить измерение"
                      onClick={() => removeDimension(dimensionIndex)}
                    >
                      <X />
                    </button>
                  </header>
                  <div
                    className={`metric-weight-status ${metricWeight === 100 ? 'valid' : 'invalid'}`}
                  >
                    <span>Вес показателей внутри «{dimension.name}»</span>
                    <b>{metricWeight}% из 100%</b>
                    <small>
                      {metricWeight === 100
                        ? 'Распределение корректно'
                        : 'Сумма должна равняться 100%'}
                    </small>
                  </div>
                  <div className="metric-list">
                    {dimension.metrics.map((metric, metricIndex) => {
                      const metricScore = Math.round(
                        scoreFor(metric.fact, metric.target),
                      );
                      const taskKey = `${dimension.id}-${metric.id}`;
                      const added = addedRecommendations.includes(taskKey);
                      return (
                        <div className="metric-editor" key={metric.id}>
                          <div className="metric-main">
                            <label>
                              Показатель
                              <input
                                value={metric.name}
                                onChange={(e) =>
                                  updateMetric(
                                    dimensionIndex,
                                    metricIndex,
                                    'name',
                                    e.target.value,
                                  )
                                }
                              />
                            </label>
                            <label>
                              Вес внутри измерения, %
                              <input
                                type="number"
                                min="0"
                                max="100"
                                value={metric.weight}
                                onChange={(e) =>
                                  updateMetric(
                                    dimensionIndex,
                                    metricIndex,
                                    'weight',
                                    Number(e.target.value),
                                  )
                                }
                              />
                            </label>
                            <label>
                              Источник
                              <select
                                value={metric.source}
                                onChange={(e) =>
                                  updateMetric(
                                    dimensionIndex,
                                    metricIndex,
                                    'source',
                                    e.target.value,
                                  )
                                }
                              >
                                {sources.map((source) => (
                                  <option key={source}>{source}</option>
                                ))}
                              </select>
                            </label>
                            <label>
                              Период
                              <select
                                value={metric.period}
                                onChange={(e) =>
                                  updateMetric(
                                    dimensionIndex,
                                    metricIndex,
                                    'period',
                                    e.target.value,
                                  )
                                }
                              >
                                <option>Месяц</option>
                                <option>Квартал</option>
                                <option>Полугодие</option>
                                <option>Год</option>
                              </select>
                            </label>
                            <label>
                              Факт
                              <input
                                type="number"
                                value={metric.fact ?? ''}
                                onChange={(e) =>
                                  updateMetric(
                                    dimensionIndex,
                                    metricIndex,
                                    'fact',
                                    e.target.value === ''
                                      ? null
                                      : Number(e.target.value),
                                  )
                                }
                              />
                            </label>
                            <label>
                              Цель
                              <input
                                type="number"
                                value={metric.target}
                                onChange={(e) =>
                                  updateMetric(
                                    dimensionIndex,
                                    metricIndex,
                                    'target',
                                    Number(e.target.value),
                                  )
                                }
                              />
                            </label>
                            <div className="metric-score">
                              <span>Балл</span>
                              <strong className={tone(metricScore)}>
                                {metric.fact === null ? '—' : metricScore}
                              </strong>
                            </div>
                          </div>
                          <div className="metric-detail">
                            <label>
                              Как считаем
                              <textarea
                                value={metric.formula}
                                onChange={(e) =>
                                  updateMetric(
                                    dimensionIndex,
                                    metricIndex,
                                    'formula',
                                    e.target.value,
                                  )
                                }
                              />
                            </label>
                            <label>
                              Действие при отклонении
                              <textarea
                                value={metric.action}
                                onChange={(e) =>
                                  updateMetric(
                                    dimensionIndex,
                                    metricIndex,
                                    'action',
                                    e.target.value,
                                  )
                                }
                              />
                            </label>
                            <div className="metric-actions">
                              {metric.fact !== null && metricScore < 85 && (
                                <button
                                  className={
                                    added ? 'secondary added' : 'secondary'
                                  }
                                  onClick={() => addRecommendation(taskKey)}
                                >
                                  {added ? <Check /> : <Plus />}
                                  {added
                                    ? 'Добавлено в задачи'
                                    : 'Добавить в задачи'}
                                </button>
                              )}
                              <button
                                className="text-danger"
                                onClick={() =>
                                  removeMetric(dimensionIndex, metricIndex)
                                }
                              >
                                Удалить показатель
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <button
                    className="add-metric"
                    onClick={() => addMetric(dimensionIndex)}
                  >
                    <Plus />
                    Добавить показатель в «{dimension.name}»
                  </button>
                </article>
              );
            })}
          </div>
          <button className="add-dimension" onClick={addDimension}>
            <Plus />
            Добавить измерение индекса
          </button>
          <div className="missing-rule">
            <Database />
            <div>
              <b>Нет данных — отдельный статус</b>
              <span>
                Пустое значение не превращается в ноль и не занижает индекс.
                Система создаёт запрос на данные.
              </span>
            </div>
          </div>
        </section>
      )}
      {section === 'effects' && (
        <section className="calc-sheet">
          <header>
            <div>
              <span>Два независимых результата</span>
              <h3>Эффективность роли для участника и клуба</h3>
              <p>
                В каждом блоке можно создать несколько показателей, назначить им
                веса и получить отдельный итоговый балл из 100.
              </p>
            </div>
          </header>
          <div className="effect-groups">
            {(
              [
                [
                  'participant',
                  'Участник',
                  UserRound,
                  participantMetrics,
                  pScore,
                ],
                [
                  'beneficiary',
                  'Клуб — бенефициар',
                  Target,
                  beneficiaryMetrics,
                  bScore,
                ],
              ] as const
            ).map(([kind, label, Icon, metrics, score]) => {
              const weight = metrics.reduce(
                (sum, metric) => sum + metric.weight,
                0,
              );
              return (
                <article className="effect-group" key={kind}>
                  <header>
                    <Icon />
                    <div>
                      <span>{label}</span>
                      <strong>
                        {metrics.every((m) => m.fact !== null)
                          ? `${score} из 100`
                          : 'Недостаточно данных'}
                      </strong>
                    </div>
                    <em className={weight === 100 ? 'valid' : 'invalid'}>
                      {weight}% из 100% веса
                    </em>
                  </header>
                  <div className="effect-metric-list">
                    {metrics.map((metric, metricIndex) => {
                      const metricScore = Math.round(
                        scoreFor(metric.fact, metric.target),
                      );
                      return (
                        <div className="effect-metric" key={metric.id}>
                          <div className="effect-metric-grid">
                            <label>
                              Показатель
                              <input
                                value={metric.name}
                                onChange={(e) =>
                                  updateEffect(
                                    kind,
                                    metricIndex,
                                    'name',
                                    e.target.value,
                                  )
                                }
                              />
                            </label>
                            <label>
                              Вес, %
                              <input
                                type="number"
                                min="0"
                                max="100"
                                value={metric.weight}
                                onChange={(e) =>
                                  updateEffect(
                                    kind,
                                    metricIndex,
                                    'weight',
                                    Number(e.target.value),
                                  )
                                }
                              />
                            </label>
                            <label>
                              Источник
                              <select
                                value={metric.source}
                                onChange={(e) =>
                                  updateEffect(
                                    kind,
                                    metricIndex,
                                    'source',
                                    e.target.value,
                                  )
                                }
                              >
                                {sources.map((source) => (
                                  <option key={source}>{source}</option>
                                ))}
                              </select>
                            </label>
                            <label>
                              Период
                              <select
                                value={metric.period}
                                onChange={(e) =>
                                  updateEffect(
                                    kind,
                                    metricIndex,
                                    'period',
                                    e.target.value,
                                  )
                                }
                              >
                                <option>Месяц</option>
                                <option>Квартал</option>
                                <option>Год</option>
                              </select>
                            </label>
                            <label>
                              Факт
                              <input
                                type="number"
                                value={metric.fact ?? ''}
                                onChange={(e) =>
                                  updateEffect(
                                    kind,
                                    metricIndex,
                                    'fact',
                                    e.target.value === ''
                                      ? null
                                      : Number(e.target.value),
                                  )
                                }
                              />
                            </label>
                            <label>
                              Цель
                              <input
                                type="number"
                                value={metric.target}
                                onChange={(e) =>
                                  updateEffect(
                                    kind,
                                    metricIndex,
                                    'target',
                                    Number(e.target.value),
                                  )
                                }
                              />
                            </label>
                            <div className="metric-score">
                              <span>Балл</span>
                              <strong className={tone(metricScore)}>
                                {metric.fact === null ? '—' : metricScore}
                              </strong>
                            </div>
                          </div>
                          <label>
                            Как считаем
                            <textarea
                              value={metric.formula}
                              onChange={(e) =>
                                updateEffect(
                                  kind,
                                  metricIndex,
                                  'formula',
                                  e.target.value,
                                )
                              }
                            />
                          </label>
                          <button
                            className="text-danger"
                            onClick={() => removeEffect(kind, metricIndex)}
                          >
                            Удалить показатель
                          </button>
                        </div>
                      );
                    })}
                  </div>
                  <button
                    className="add-metric"
                    onClick={() => addEffect(kind)}
                  >
                    <Plus />
                    Добавить показатель
                  </button>
                </article>
              );
            })}
          </div>
        </section>
      )}
      {section === 'economy' && (
        <section className="calc-sheet">
          <header>
            <div>
              <span>Редактируемая модель владельца</span>
              <h3>Выгоды, затраты и чистый эффект</h3>
              <p>
                Добавляйте любые статьи экономики роли. Для каждой фиксируются
                объём, стоимость единицы и источник.
              </p>
            </div>
          </header>
          <div className="economy-builder">
            <div className="economy-lines-editor">
              <EconomyGroup
                title="Выгоды"
                kind="benefit"
                lines={benefits}
                total={gross}
                update={updateEconomyLine}
                add={addEconomyLine}
                remove={removeEconomyLine}
              />
              <EconomyGroup
                title="Затраты"
                kind="cost"
                lines={costLines}
                total={costs}
                update={updateEconomyLine}
                add={addEconomyLine}
                remove={removeEconomyLine}
              />
            </div>
            <aside className="economy-result">
              <span>Валовая выгода</span>
              <b>{money(gross)}</b>
              <span>Общие затраты</span>
              <b>{money(costs)}</b>
              <span>Чистый эффект</span>
              <strong>{money(net)}</strong>
              <span>Доходность затрат</span>
              <strong>{returnRate}%</strong>
              <small>Каждая роль может использовать свой набор статей.</small>
            </aside>
          </div>
        </section>
      )}
    </div>
  );
}

function RoleConfigurator({
  role,
  onClose,
  onSave,
  draftKey,
  closeLabel = 'Вернуться к роли',
}: {
  role: Role;
  onClose: () => void;
  onSave: (role: Role) => void;
  draftKey?: string;
  closeLabel?: string;
}) {
  const [beneficiaryEffect, setBeneficiaryEffect] = useState(
    role.beneficiaryEffect,
  );
  const [participantEffect, setParticipantEffect] = useState(
    role.participantEffect,
  );
  const [model, setModel] = useState<RoleModel>(
    role.model || makeRoleModel(role),
  );
  const [saved, setSaved] = useState(false);
  const [showIssues, setShowIssues] = useState(false);
  const [draftLoaded, setDraftLoaded] = useState(false);
  const [currentSection, setCurrentSection] = useState<'index' | 'effects' | 'economy'>('index');
  useEffect(() => {
    if (draftKey) {
      try {
        const draft = JSON.parse(localStorage.getItem(draftKey) || 'null');
        if (draft?.roleName === role.name) {
          if (typeof draft.beneficiaryEffect === 'string') setBeneficiaryEffect(draft.beneficiaryEffect);
          if (typeof draft.participantEffect === 'string') setParticipantEffect(draft.participantEffect);
          if (draft.model) setModel(draft.model);
          if (draft.section === 'index' || draft.section === 'effects' || draft.section === 'economy') setCurrentSection(draft.section);
        }
      } catch {}
    }
    setDraftLoaded(true);
  }, [draftKey, role.name]);
  useEffect(() => {
    if (!draftKey || !draftLoaded || saved) return;
    localStorage.setItem(draftKey, JSON.stringify({ roleName: role.name, beneficiaryEffect, participantEffect, model, section: currentSection }));
  }, [draftKey, draftLoaded, saved, role.name, beneficiaryEffect, participantEffect, model, currentSection]);
  const issues = [
    ...(!beneficiaryEffect.trim() ? ['Опишите эффект для клуба'] : []),
    ...(!participantEffect.trim() ? ['Опишите эффект для участника'] : []),
    ...modelIssues(model),
  ];
  const save = () => {
    setShowIssues(true);
    if (issues.length) return;
    const health = Math.round(
      model.dimensions.reduce(
        (sum, d) =>
          sum +
          (d.metrics.reduce(
            (s, m) => s + (scoreFor(m.fact, m.target) * m.weight) / 100,
            0,
          ) *
            d.weight) /
            100,
        0,
      ),
    );
    const effect = (items: EffectMetric[]) =>
      Math.round(
        items.reduce(
          (sum, m) => sum + (scoreFor(m.fact, m.target) * m.weight) / 100,
          0,
        ),
      );
    onSave({
      ...role,
      model,
      configured: true,
      dataReady:
        model.dimensions.every((d) =>
          d.metrics.every((m) => m.fact !== null),
        ) &&
        model.participantMetrics.every((m) => m.fact !== null) &&
        model.beneficiaryMetrics.every((m) => m.fact !== null),
      status: role.status === 'Черновик' ? 'Готова к пилоту' : role.status,
      health,
      participantScore: effect(model.participantMetrics),
      beneficiaryScore: effect(model.beneficiaryMetrics),
      income: model.benefits.reduce(
        (sum, l) => sum + l.quantity * l.unitValue,
        0,
      ),
      costs: model.costLines.reduce(
        (sum, l) => sum + l.quantity * l.unitValue,
        0,
      ),
      beneficiaryEffect,
      participantEffect,
      dimensions: model.dimensions.map((d) => ({
        ...role.dimensions.find((item) => item.name === d.name),
        name: d.name,
        score: Math.round(
          d.metrics.reduce(
            (s, m) => s + (scoreFor(m.fact, m.target) * m.weight) / 100,
            0,
          ),
        ),
        metric: d.metrics.map((m) => m.name).join('; '),
        formula: d.metrics.map((m) => m.formula).join('; '),
        source: d.metrics.map((m) => m.source).join('; '),
        action: d.metrics.map((m) => m.action).join('; '),
      })),
    });
    if (draftKey) localStorage.removeItem(draftKey);
    setSaved(true);
  };
  return (
    <div className="configuration-screen">
      <div className="configuration-head">
        <div>
          <span>Настройка роли</span>
          <h2>{role.name}</h2>
          <p>
            Зафиксируйте эффекты и правила расчёта до назначения участников. Все
            параметры можно изменить после пилота.
          </p>
        </div>
        <button className="secondary" onClick={onClose}>
          {closeLabel}
        </button>
      </div>
      <div className="configuration-grid">
        <section className="panel setup-effect beneficiary">
          <div className="setup-card-title">
            <Target />
            <div>
              <span>Эффект для клуба</span>
              <h3>Что должна изменить роль для бенефициара</h3>
            </div>
          </div>
          <label>
            Формулировка эффекта
            <textarea
              value={beneficiaryEffect}
              onChange={(event) => setBeneficiaryEffect(event.target.value)}
            />
          </label>
          <p>
            Показатели, формула, источник, период, факт, цель и вес задаются во
            вкладке «Эффекты» ниже.
          </p>
        </section>
        <section className="panel setup-effect participant">
          <div className="setup-card-title">
            <UserRound />
            <div>
              <span>Эффект для участника</span>
              <h3>Что получает носитель роли</h3>
            </div>
          </div>
          <label>
            Формулировка эффекта
            <textarea
              value={participantEffect}
              onChange={(event) => setParticipantEffect(event.target.value)}
            />
          </label>
          <p>
            Можно добавить несколько показателей; общий балл участника считается
            отдельно из 100.
          </p>
        </section>
      </div>
      {draftLoaded && <CalculationModel role={role} initialModel={model} initialSection={currentSection} onSectionChange={setCurrentSection} onChange={setModel} />}
      {showIssues && issues.length > 0 && (
        <div className="configuration-errors" role="alert">
          <b>Перед сохранением завершите настройку:</b>
          <ul>
            {issues.map((issue) => (
              <li key={issue}>{issue}</li>
            ))}
          </ul>
        </div>
      )}
      <div className="configuration-footer">
        <span>
          {saved ? (
            <>
              <Check /> Настройки сохранены в этом браузере
            </>
          ) : (
            'Для запуска обязательны индекс, оба эффекта и экономика'
          )}
        </span>
        <button className="primary" onClick={save}>
          Проверить и сохранить
        </button>
      </div>
    </div>
  );
}

function RolePage({
  role,
  setRole,
  mode,
  roleList,
  onSave,
}: {
  role: Role;
  setRole: (r: Role) => void;
  mode: Mode;
  roleList: Role[];
  onSave: (r: Role) => void;
}) {
  const [tab, setTab] = useState<RoleTab>('health');
  const [editing, setEditing] = useState(false);
  useEffect(() => {
    setEditing(!role.configured);
  }, [role.name]);
  const allowed = mode === 'operator' ? roleList : roleList.slice(0, 3);
  const tabs = [
    ['health', 'Здоровье', Gauge],
    ['effects', 'Эффекты', Target],
    ['economics', 'Экономика', CircleDollarSign],
    ['people', 'Участники', Users],
  ] as const;
  if (editing)
    return (
      <RoleConfigurator
        key={role.name}
        role={role}
        onSave={onSave}
        onClose={() => setEditing(false)}
      />
    );
  return (
    <div className="page-stack">
      <div className="page-title role-title">
        <div>
          <span>
            {role.pilot} · {role.status}
          </span>
          <h1>{role.name}</h1>
          <p>{role.short}</p>
        </div>
        <label className="role-picker">
          <span>Выбранная роль</span>
          <select
            value={role.name}
            onChange={(e) =>
              setRole(roleList.find((r) => r.name === e.target.value)!)
            }
          >
            {allowed.map((r) => (
              <option key={r.name}>{r.name}</option>
            ))}
          </select>
          <ChevronDown />
        </label>
      </div>
      {!role.configured && (
        <div className="draft-notice">
          <AlertTriangle />
          <span>
            Настройка не завершена: до запуска задайте показатели индекса,
            эффекты для участника и клуба, а также экономику.
          </span>
          <button onClick={() => setEditing(true)}>Завершить настройку</button>
        </div>
      )}
      <div className="role-meta">
        <span>
          <b>Владелец</b>
          {role.owner}
        </span>
        <span>
          <b>Носителей</b>
          {role.people}
        </span>
        <span>
          <b>Индекс здоровья роли</b>
          {role.configured && role.dataReady !== false ? (
            <>
              <i className={tone(role.health)} />
              {role.health}
            </>
          ) : role.configured ? (
            'Недостаточно данных'
          ) : (
            'Не настроен'
          )}
        </span>
        <button className="secondary" onClick={() => setEditing(true)}>
          <Settings2 />
          Настроить роль
        </button>
      </div>
      {role.googleExample && <ClubFirstExample example={role.googleExample} />}
      <nav className="role-tabs">
        {tabs.map(([id, label, Icon]) => (
          <button
            className={tab === id ? 'active' : ''}
            onClick={() => setTab(id)}
            key={id}
          >
            <Icon />
            {label}
          </button>
        ))}
      </nav>
      {tab === 'health' && <Health role={role} />}{' '}
      {tab === 'effects' && <Effects role={role} />}{' '}
      {tab === 'economics' && (
        <Economics role={role} onEdit={() => setEditing(true)} />
      )}{' '}
      {tab === 'people' && <People role={role} />}
    </div>
  );
}

type ProcessItem = {
  name: string;
  result: string;
  phase?: number;
  subprocesses: {
    name: string;
    tasks: string[];
    checkpoint?: string;
    decision?: string;
    timing?: string;
  }[];
};
type TaskState = 'todo' | 'doing' | 'review' | 'done';
type TaskItem = {
  id: number;
  title: string;
  role: string;
  owner: string;
  actor: Mode;
  process: string;
  subprocess: string;
  due: string;
  priority: 'Обычный' | 'Высокий';
  state: TaskState;
  subject?: string;
};
type ProcessPhase = { name: string; question: string; result: string };

const processPhases: ProcessPhase[] = [
  {
    name: 'Проектирование',
    question: 'Что создаём и по каким правилам?',
    result: 'Готовая и проверенная модель роли',
  },
  {
    name: 'Запуск',
    question: 'Как перевести модель в работающий пилот?',
    result: 'Роль назначена и начала работать',
  },
  {
    name: 'Управление',
    question: 'Как поддерживать качество и результат?',
    result: 'Отклонения видны и обрабатываются',
  },
  {
    name: 'Развитие',
    question: 'Что улучшить, масштабировать или завершить?',
    result: 'Принято решение о следующей версии',
  },
];
const phaseIndexes: Record<Mode, number[][]> = {
  operator: [
    [0, 1, 2, 3],
    [4, 5],
    [6, 7, 8, 9],
    [10, 11],
  ],
  owner: [
    [0, 1],
    [2, 3],
    [4, 5, 6, 7, 8, 9],
    [10, 11, 12],
  ],
};
const phaseRecommendations: Record<Mode, string[]> = {
  operator: [
    'Сначала зафиксируйте задачу роли, исключите пересечения и утвердите методику.',
    'Назначьте владельца, подключите данные и сформируйте план пилота.',
    'Проверяйте индекс, качество данных, эффекты и выполнение задач владельцами.',
    'Сравните результаты периода и выберите: изменить, масштабировать, приостановить или завершить.',
  ],
  owner: [
    'Подтвердите ответственность, ресурсы и пул подходящих кандидатов.',
    'Назначьте роль, проведите онбординг и получите первый подтверждающий факт.',
    'Поддерживайте носителей, данные, эффекты, экономику и актуальные статусы.',
    'Соберите обратную связь, признайте вклад и передайте оператору запрос на изменение роли.',
  ],
};

const operatorProcesses: ProcessItem[] = [
  {
    name: 'Архитектура ролевой системы',
    result: 'Единая и непротиворечивая структура ролей',
    subprocesses: [
      {
        name: 'Структура ролей',
        tasks: [
          'Определить типы ролей и связи между ними',
          'Зафиксировать жизненный цикл и обязательные поля',
        ],
      },
      {
        name: 'Единые стандарты',
        tasks: [
          'Обновить паспорт роли и правила статусов',
          'Утвердить методику индекса, эффектов и экономики',
        ],
      },
    ],
  },
  {
    name: 'Обработка запросов',
    result: 'Принято решение: создавать, объединить или отклонить',
    subprocesses: [
      {
        name: 'Приём запроса',
        tasks: [
          'Проверить полноту брифа',
          'Назначить ответственного за разбор',
        ],
      },
      {
        name: 'Анализ и приоритизация',
        tasks: [
          'Проверить дубли и пересечения',
          'Оценить ценность, срочность, данные и ресурсы',
        ],
      },
    ],
  },
  {
    name: 'Проектирование роли',
    result: 'Готова измеримая карточка роли',
    subprocesses: [
      {
        name: 'Гипотеза и описание',
        tasks: [
          'Зафиксировать проблему, поведение и результат',
          'Описать назначение, критерии, права и срок',
        ],
      },
      {
        name: 'Метрики',
        tasks: [
          'Настроить шесть измерений индекса',
          'Настроить эффекты и экономическую модель',
        ],
      },
    ],
  },
  {
    name: 'Проверка роли',
    result: 'Роль готова к настройке в системе',
    subprocesses: [
      {
        name: 'Методологическая проверка',
        tasks: [
          'Проверить место роли в общей модели',
          'Устранить противоречия в критериях',
        ],
      },
      {
        name: 'Проверка данных',
        tasks: [
          'Подтвердить доступность источников',
          'Проверить формулы и периодичность',
        ],
      },
    ],
  },
  {
    name: 'Настройка системы',
    result: 'Карточка, данные и ответственные готовы',
    subprocesses: [
      {
        name: 'Создание карточки',
        tasks: [
          'Завести роль и назначить владельца',
          'Настроить статусы и уведомления',
        ],
      },
      {
        name: 'Интеграции',
        tasks: [
          'Подключить CRM или таблицу',
          'Проверить передачу данных в профиль',
        ],
      },
    ],
  },
  {
    name: 'Запуск пилота',
    result: 'Пилот запущен с измеримыми критериями успеха',
    subprocesses: [
      {
        name: 'План пилота',
        tasks: [
          'Выбрать 3–5 ролей и носителей',
          'Зафиксировать критерии и срок пилота',
        ],
      },
      {
        name: 'Контроль запуска',
        tasks: [
          'Проверить назначения и онбординг',
          'Собрать первые сигналы и отклонения',
        ],
      },
    ],
  },
  {
    name: 'Управление портфелем',
    result: 'По каждой роли принято своевременное решение',
    subprocesses: [
      {
        name: 'Мониторинг',
        tasks: [
          'Проверить Role Health Index по всем ролям',
          'Сравнить роли и динамику',
        ],
      },
      {
        name: 'Алармы',
        tasks: [
          'Классифицировать причину отклонения',
          'Создать задачу владельцу или оператору',
        ],
      },
    ],
  },
  {
    name: 'Контроль качества данных',
    result: 'Назначения и факты подтверждены',
    subprocesses: [
      {
        name: 'Аудит назначений',
        tasks: [
          'Проверить основания присвоения',
          'Проверить сроки подтверждения и снятия',
        ],
      },
      {
        name: 'Аудит данных',
        tasks: [
          'Найти пропуски и дубли',
          'Отделить отсутствие активности от отсутствия данных',
        ],
      },
    ],
  },
  {
    name: 'Обучение и поддержка',
    result: 'Владельцы применяют единые правила',
    subprocesses: [
      {
        name: 'Обучение владельцев',
        tasks: [
          'Назначить обязательный курс',
          'Проверить прохождение контрольного сценария',
        ],
      },
      {
        name: 'Методологическая поддержка',
        tasks: ['Разобрать сложные случаи', 'Обновить инструкции и примеры'],
      },
    ],
  },
  {
    name: 'Аналитика и отчётность',
    result: 'Понятны здоровье, эффекты и экономика портфеля',
    subprocesses: [
      {
        name: 'Отчёт по портфелю',
        tasks: ['Собрать индекс и алармы', 'Сопоставить эффекты и затраты'],
      },
      {
        name: 'Управленческие выводы',
        tasks: [
          'Подготовить решения по ролям',
          'Зафиксировать гипотезы на следующий период',
        ],
      },
    ],
  },
  {
    name: 'Пересмотр роли',
    result: 'Изменения оформлены новой версией',
    subprocesses: [
      {
        name: 'Инициирование изменений',
        tasks: [
          'Собрать обратную связь владельца',
          'Определить причину и масштаб изменения',
        ],
      },
      {
        name: 'Версионирование',
        tasks: [
          'Согласовать новую версию',
          'Перенести правила без потери истории',
        ],
      },
    ],
  },
  {
    name: 'Приостановка или завершение',
    result: 'Роль корректно закрыта, данные сохранены',
    subprocesses: [
      {
        name: 'Решение',
        tasks: [
          'Проверить основания и последствия',
          'Согласовать приостановку или закрытие',
        ],
      },
      {
        name: 'Завершение',
        tasks: [
          'Уведомить владельца и носителей',
          'Закрыть статусы и сохранить историю',
        ],
      },
    ],
  },
];

const ownerProcesses: ProcessItem[] = [
  {
    name: 'Подготовка роли',
    result: 'Роль готова к операционной работе',
    subprocesses: [
      {
        name: 'Принятие ответственности',
        tasks: ['Подтвердить роль владельца', 'Изучить паспорт и критерии'],
      },
      {
        name: 'Операционный план',
        tasks: [
          'Определить календарь и ресурсы',
          'Подготовить инструкции и каналы связи',
        ],
      },
    ],
  },
  {
    name: 'Управление кандидатами',
    result: 'Сформирован проверенный пул кандидатов',
    subprocesses: [
      {
        name: 'Формирование пула',
        tasks: ['Получить кандидатов из базы', 'Добавить кандидатов вручную'],
      },
      {
        name: 'Проверка и решение',
        tasks: [
          'Проверить соответствие критериям',
          'Одобрить, отклонить или передать на разбор',
        ],
      },
    ],
  },
  {
    name: 'Назначение роли',
    result: 'Статус присвоен с основанием и сроком',
    subprocesses: [
      {
        name: 'Оформление назначения',
        tasks: [
          'Зафиксировать решение и основание',
          'Указать уровень, срок и дату проверки',
        ],
      },
      {
        name: 'Уведомление',
        tasks: [
          'Сообщить участнику о назначении',
          'Передать правила и следующий шаг',
        ],
      },
    ],
  },
  {
    name: 'Онбординг носителя',
    result: 'Участник понимает роль и начал действовать',
    subprocesses: [
      {
        name: 'Инструктаж',
        tasks: ['Провести короткий онбординг', 'Подтвердить принятие правил'],
      },
      {
        name: 'Первый цикл',
        tasks: [
          'Назначить первое действие',
          'Проверить первый подтверждающий факт',
        ],
      },
    ],
  },
  {
    name: 'Операционное управление',
    result: 'Носители выполняют роль в рабочем ритме',
    subprocesses: [
      {
        name: 'Планирование',
        tasks: ['Сформировать план проявлений', 'Распределить нагрузку'],
      },
      {
        name: 'Сопровождение',
        tasks: [
          'Контролировать выполнение',
          'Устранять блокеры и поддерживать носителей',
        ],
      },
    ],
  },
  {
    name: 'Связь с активностями',
    result: 'Активности поддерживают и подтверждают роль',
    subprocesses: [
      {
        name: 'Настройка связи',
        tasks: [
          'Выбрать тип связи роли с активностью',
          'Назначить обязательные или поддерживающие форматы',
        ],
      },
      {
        name: 'Фиксация результата',
        tasks: [
          'Подтвердить участие или результат',
          'Передать факт в профиль и индекс',
        ],
      },
    ],
  },
  {
    name: 'Управление данными',
    result: 'По роли достаточно достоверных данных',
    subprocesses: [
      {
        name: 'Полнота данных',
        tasks: [
          'Проверить обязательные поля',
          'Запросить недостающие сведения',
        ],
      },
      {
        name: 'Подтверждение фактов',
        tasks: ['Проверить источник и период', 'Принять или отклонить факт'],
      },
    ],
  },
  {
    name: 'Мониторинг здоровья',
    result: 'Отклонения разобраны и устранены',
    subprocesses: [
      {
        name: 'Проверка индекса',
        tasks: ['Посмотреть шесть измерений', 'Открыть причины алармов'],
      },
      {
        name: 'Работа с отклонением',
        tasks: [
          'Определить операционную причину',
          'Создать и выполнить корректирующее действие',
        ],
      },
    ],
  },
  {
    name: 'Управление эффектами',
    result: 'Эффекты для участника и клуба подтверждены',
    subprocesses: [
      {
        name: 'Фиксация факта',
        tasks: [
          'Проверить автоматически загруженные значения',
          'Внести только недостающие данные',
        ],
      },
      {
        name: 'Анализ',
        tasks: ['Сравнить факт с целью', 'Объяснить существенное отклонение'],
      },
    ],
  },
  {
    name: 'Управление экономикой',
    result: 'Понятны затраты и ценность роли',
    subprocesses: [
      {
        name: 'Учёт',
        tasks: [
          'Проверить время, прямые расходы и выгоды',
          'Подтвердить источник каждого значения',
        ],
      },
      {
        name: 'Оценка',
        tasks: [
          'Проверить корректность атрибуции',
          'Сравнить экономику с прошлым периодом',
        ],
      },
    ],
  },
  {
    name: 'Коммуникация и признание',
    result: 'Носители получают обратную связь и признание',
    subprocesses: [
      {
        name: 'Регулярная коммуникация',
        tasks: [
          'Сообщать изменения и задачи',
          'Собирать вопросы и обратную связь',
        ],
      },
      {
        name: 'Признание',
        tasks: [
          'Подтвердить вклад носителя',
          'Передать результат в профиль или клубный формат',
        ],
      },
    ],
  },
  {
    name: 'Статус носителя',
    result: 'Статус участника всегда актуален',
    subprocesses: [
      {
        name: 'Проверка срока',
        tasks: [
          'Получить список статусов к проверке',
          'Оценить выполнение критериев',
        ],
      },
      {
        name: 'Решение',
        tasks: [
          'Подтвердить, продлить или приостановить',
          'Снять роль и уведомить участника при необходимости',
        ],
      },
    ],
  },
  {
    name: 'Улучшение роли',
    result: 'Оператор получил обоснованный запрос на изменение',
    subprocesses: [
      {
        name: 'Обратная связь',
        tasks: [
          'Собрать проблемы и сильные практики',
          'Приложить данные и примеры',
        ],
      },
      {
        name: 'Запрос оператору',
        tasks: [
          'Описать предлагаемое изменение',
          'Принять участие в проверке новой версии',
        ],
      },
    ],
  },
];

// Пилотные сроки: владелец клуба может изменить их в карточке подпроцесса.
const processControls: Record<Mode, [string, string, string][][]> = {
  operator: [
    [
      [
        'Карта типов и связей согласована',
        'Утвердить структуру или вернуть на разбор',
        'До запуска; раз в полгода',
      ],
      [
        'Паспорт и правила статусов опубликованы',
        'Принять новую версию стандарта',
        'Раз в квартал',
      ],
    ],
    [
      [
        'Бриф содержит задачу, аудиторию и эффект',
        'Принять или вернуть за данными',
        '1–2 рабочих дня',
      ],
      [
        'Пересечения и ресурсы проверены',
        'Адаптировать, создать, объединить или отклонить',
        'До 3 рабочих дней после брифа',
      ],
    ],
    [
      [
        'Владелец подтвердил применимость роли',
        'Утвердить описание или доработать',
        '5–20 рабочих дней',
      ],
      [
        'Все показатели имеют формулу, источник и цель',
        'Принять методику или вернуть на настройку',
        'До пилота',
      ],
    ],
    [
      [
        'Нет противоречий с портфелем',
        'Допустить роль к настройке или вернуть',
        'До 5 рабочих дней',
      ],
      [
        'Источники и периоды доступны',
        'Допустить расчёт или отметить «нет данных»',
        'До запуска',
      ],
    ],
    [
      [
        'Роль имеет владельца, срок и правила',
        'Опубликовать карточку или оставить черновик',
        'До первого назначения',
      ],
      [
        'Тестовые записи проходят в профиль',
        'Подключить источник или выбрать ручной ввод',
        'До пилота',
      ],
    ],
    [
      [
        'Выбраны 3–5 ролей и критерии успеха',
        'Утвердить состав и срок пилота',
        'За 2–4 недели до старта',
      ],
      [
        'Назначения и первые факты подтверждены',
        'Продолжить, исправить или остановить запуск',
        'Еженедельно в пилоте',
      ],
    ],
    [
      [
        'Есть обзор всех шести измерений',
        'Назначить приоритет поддержки роли',
        'Ежемесячно до 10-го рабочего дня',
      ],
      [
        'Установлена причина отклонения',
        'Создать задачу владельцу или пересмотр методики',
        'Еженедельно; критично — 1 день',
      ],
    ],
    [
      [
        'Назначения имеют основания и срок',
        'Исправить запись или начать пересмотр',
        'Ежемесячно',
      ],
      [
        'Пропуски и дубли отделены от неактивности',
        'Подтвердить расчёт или дать статус «нет данных»',
        'При обновлении; сверка ежемесячно',
      ],
    ],
    [
      [
        'Владелец прошёл контрольный сценарий',
        'Выдать доступ к роли или повторить обучение',
        'До передачи роли',
      ],
      [
        'Сложный случай разобран и задокументирован',
        'Разъяснить правило или инициировать новую версию',
        'До 5 рабочих дней',
      ],
    ],
    [
      [
        'Индекс, эффекты и экономика сопоставимы',
        'Принять отчёт или запросить исправление данных',
        'Ежемесячно',
      ],
      [
        'Для отклонений назначены решения',
        'Поддержать, изменить, масштабировать или закрыть',
        'Раз в квартал',
      ],
    ],
    [
      [
        'Запрос подкреплён фактами и последствиями',
        'Принять к пересмотру или отклонить с причиной',
        'До 3 рабочих дней',
      ],
      [
        'Новая версия и переход носителей согласованы',
        'Опубликовать версию или вернуть на проверку',
        'Раз в квартал / внепланово',
      ],
    ],
    [
      [
        'Основания и последствия проверены',
        'Приостановить, завершить или сохранить роль',
        'При значимом сигнале',
      ],
      [
        'Уведомления и профили обновлены',
        'Закрыть роль с сохранением истории',
        'До 2 рабочих дней после решения',
      ],
    ],
  ],
  owner: [
    [
      [
        'Паспорт, полномочия и ресурсы понятны',
        'Принять роль или вернуть оператору',
        'До 3 рабочих дней',
      ],
      [
        'Есть календарь, ресурсы и первый шаг',
        'Запустить план или запросить ресурс',
        'До пилота; уточнять ежемесячно',
      ],
    ],
    [
      [
        'Пул кандидатов соотнесён с критериями',
        'Пригласить или продолжить поиск',
        'Ежемесячно; новый сигнал — до 5 дней',
      ],
      [
        'Критерии и готовность проверены',
        'Одобрить, отложить или отклонить',
        'До 5 рабочих дней',
      ],
    ],
    [
      [
        'Согласие и основания получены',
        'Назначить или запросить подтверждение',
        'До 2 рабочих дней после проверки',
      ],
      [
        'Профиль и уведомление обновлены',
        'Считать назначение завершённым',
        'Не позднее следующего рабочего дня',
      ],
    ],
    [
      [
        'Носитель понял действия и срок',
        'Допустить к первому циклу',
        'До 5 рабочих дней',
      ],
      [
        'Первый факт зафиксирован',
        'Продолжить или помочь начать',
        'По календарю роли',
      ],
    ],
    [
      ['Нагрузка распределена', 'Утвердить план проявлений', 'Ежемесячно'],
      [
        'Блокеры и просрочки обработаны',
        'Поддержать, переназначить или пересмотреть',
        'Еженедельно',
      ],
    ],
    [
      [
        'Тип связи формата с ролью указан',
        'Назначить обязательный или поддерживающий формат',
        'До запуска; при смене формата',
      ],
      [
        'Событие и факт подтверждены',
        'Засчитать проявление или запросить данные',
        'До 2 рабочих дней после события',
      ],
    ],
    [
      [
        'Обязательные поля заполнены',
        'Запросить недостающие сведения',
        'Ежемесячно',
      ],
      [
        'Источник и период подтверждены',
        'Принять или отклонить факт',
        'При поступлении факта',
      ],
    ],
    [
      [
        'Проверены шесть измерений и алармы',
        'Выбрать отклонение для разбора',
        'Ежемесячно',
      ],
      [
        'Причина отклонения определена',
        'Создать задачу или запрос оператору',
        'До 5 рабочих дней; критично — 1 день',
      ],
    ],
    [
      [
        'Автоматические значения сверены',
        'Подтвердить факт или исправить источник',
        'По периоду показателя',
      ],
      [
        'Факт сопоставлен с целью',
        'Принять результат или начать действие',
        'Месяц / квартал / год',
      ],
    ],
    [
      [
        'Затраты и выгоды имеют источник',
        'Подтвердить фактические статьи',
        'Ежемесячно',
      ],
      [
        'План и факт сопоставлены без двойного счёта',
        'Скорректировать бюджет или модель',
        'Ежеквартально',
      ],
    ],
    [
      [
        'Изменения доведены до носителей',
        'Обновить договорённости и задачи',
        'По событию; обзор ежемесячно',
      ],
      [
        'Вклад подтверждён фактом',
        'Отразить признание или запросить данные',
        'После подтверждения',
      ],
    ],
    [
      [
        'Есть список истекающих назначений',
        'Начать проверку критериев',
        'За 30/14/7 дней до срока',
      ],
      [
        'Основание решения и уведомление записаны',
        'Продлить, пауза или снять роль',
        'До окончания срока',
      ],
    ],
    [
      [
        'Проблема или сильная практика подтверждена',
        'Подготовить предложение оператору',
        'Раз в квартал / по сигналу',
      ],
      [
        'Запрос содержит данные и последствия',
        'Передать на методологический пересмотр',
        'До 3 рабочих дней после подготовки',
      ],
    ],
  ],
};
const withControls = (items: ProcessItem[], mode: Mode): ProcessItem[] =>
  items.map((process, i) => ({
    ...process,
    subprocesses: process.subprocesses.map((sub, j) => ({
      checkpoint: processControls[mode][i]?.[j]?.[0] || '',
      decision: processControls[mode][i]?.[j]?.[1] || '',
      timing: processControls[mode][i]?.[j]?.[2] || '',
      ...sub,
    })),
  }));

const initialTasks: TaskItem[] = [
  {
    id: 1,
    title: 'Проверить пересечение нового запроса с базой ролей',
    role: 'Все роли',
    owner: 'Оператор ролей',
    actor: 'operator',
    process: 'Обработка запросов',
    subprocess: 'Анализ и приоритизация',
    due: 'Сегодня',
    priority: 'Высокий',
    state: 'todo',
  },
  {
    id: 2,
    title: 'Настроить источники данных пилота',
    role: 'Бадди / Навигатор',
    owner: 'Оператор ролей',
    actor: 'operator',
    process: 'Настройка системы',
    subprocess: 'Интеграции',
    due: '12 окт.',
    priority: 'Обычный',
    state: 'doing',
  },
  {
    id: 3,
    title: 'Разобрать аларм подтверждаемости',
    role: 'Амбассадор',
    owner: 'Оператор ролей',
    actor: 'operator',
    process: 'Управление портфелем',
    subprocess: 'Алармы',
    due: '10 окт.',
    priority: 'Высокий',
    state: 'review',
  },
  {
    id: 4,
    title: 'Согласовать критерии второго пилота',
    role: 'Эксперт / Автор',
    owner: 'Оператор ролей',
    actor: 'operator',
    process: 'Запуск пилота',
    subprocess: 'План пилота',
    due: '15 окт.',
    priority: 'Обычный',
    state: 'done',
  },
  {
    id: 5,
    title: 'Проверить кандидатов на новый цикл',
    role: 'Бадди / Навигатор',
    owner: 'Илья Соколов',
    actor: 'owner',
    process: 'Управление кандидатами',
    subprocess: 'Проверка и решение',
    due: 'Сегодня',
    priority: 'Высокий',
    state: 'todo',
  },
  {
    id: 6,
    title: 'Подтвердить результаты клубных активностей',
    role: 'Лидер клубной активности',
    owner: 'Анна Волкова',
    actor: 'owner',
    process: 'Связь с активностями',
    subprocess: 'Фиксация результата',
    due: '11 окт.',
    priority: 'Обычный',
    state: 'doing',
  },
  {
    id: 7,
    title: 'Разобрать снижение результативности',
    role: 'Амбассадор',
    owner: 'Ольга Романова',
    actor: 'owner',
    process: 'Мониторинг здоровья',
    subprocess: 'Работа с отклонением',
    due: '10 окт.',
    priority: 'Высокий',
    state: 'review',
  },
  {
    id: 8,
    title: 'Подтвердить продление статусов',
    role: 'Хранитель ценностей',
    owner: 'Денис Миронов',
    actor: 'owner',
    process: 'Статус носителя',
    subprocess: 'Решение',
    due: 'Выполнено',
    priority: 'Обычный',
    state: 'done',
  },
];

function Tasks({ mode, roleList, scope, userId }: { mode: Mode; roleList: Role[]; scope: Scope; userId: string }) {
  const roles = roleList;
  const [view, setView] = useState<'board' | 'map'>('board');
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [processDrafts, setProcessDrafts] = useState<
    Record<Mode, ProcessItem[]>
  >({
    operator: withControls(operatorProcesses, 'operator'),
    owner: withControls(ownerProcesses, 'owner'),
  });
  const [processesHydrated, setProcessesHydrated] = useState(false);
  const [editingSubprocess, setEditingSubprocess] = useState<string | null>(
    null,
  );
  const [processAlerts, setProcessAlerts] = useState<string[]>([
    'Управление портфелем::Алармы',
    'Мониторинг здоровья::Работа с отклонением',
  ]);
  useEffect(() => {
    try {
      const saved = localStorage.getItem(userStorageKey(userId, `processes:${scope}`));
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.processDrafts?.operator && parsed.processDrafts?.owner)
          setProcessDrafts(parsed.processDrafts);
        if (Array.isArray(parsed.tasks)) setTasks(parsed.tasks);
        if (Array.isArray(parsed.processAlerts))
          setProcessAlerts(parsed.processAlerts);
      }
    } catch {}
    setProcessesHydrated(true);
  }, [scope, userId]);
  useEffect(() => {
    if (processesHydrated)
      localStorage.setItem(
        userStorageKey(userId, `processes:${scope}`),
        JSON.stringify({ processDrafts, tasks, processAlerts }),
      );
  }, [processDrafts, tasks, processAlerts, processesHydrated, scope, userId]);
  const [processQuery, setProcessQuery] = useState('');
  const [processAlertsOnly, setProcessAlertsOnly] = useState(false);
  const [activePhase, setActivePhase] = useState(0);
  const [roleFilter, setRoleFilter] = useState('Все роли');
  const [processFilter, setProcessFilter] = useState('Все процессы');
  const [alertsOnly, setAlertsOnly] = useState(false);
  const [taskRole, setTaskRole] = useState(roles[0]?.name || 'Все роли');
  const [taskSubject, setTaskSubject] = useState('Роль целиком');
  const [taskDue, setTaskDue] = useState(() => new Date().toISOString().slice(0, 10));
  const [taskOwner, setTaskOwner] = useState(
    mode === 'operator' ? 'Оператор ролей' : 'Владелец роли',
  );
  const processes = processDrafts[mode];
  const scoped = tasks.filter((t) => t.actor === mode);
  const visible = scoped.filter(
    (t) =>
      (roleFilter === 'Все роли' || t.role === roleFilter) &&
      (processFilter === 'Все процессы' || t.process === processFilter) &&
      (!alertsOnly || t.priority === 'Высокий'),
  );
  const move = (id: number, state: TaskState) =>
    setTasks((current) =>
      current.map((t) => (t.id === id ? { ...t, state } : t)),
    );
  const updateTask = (id: number, key: keyof TaskItem, value: string) =>
    setTasks((current) =>
      current.map((task) =>
        task.id === id ? { ...task, [key]: value } : task,
      ),
    );
  const addTask = (process: string, subprocess: string, title: string) => {
    const next: TaskItem = {
      id: Date.now(),
      title,
      role: taskRole,
      owner: taskOwner,
      actor: mode,
      process,
      subprocess,
      due: taskDue,
      subject: taskSubject,
      priority: 'Обычный',
      state: 'todo',
    };
    setTasks((current) => [next, ...current]);
    setView('board');
    setProcessFilter('Все процессы');
  };
  const updateSubprocess = (
    processIndex: number,
    subIndex: number,
    field: 'name' | 'tasks' | 'checkpoint' | 'decision' | 'timing',
    value: string | string[],
  ) =>
    setProcessDrafts((current) => ({
      ...current,
      [mode]: current[mode].map((process, i) =>
        i === processIndex
          ? {
              ...process,
              subprocesses: process.subprocesses.map((sub, j) =>
                j === subIndex ? { ...sub, [field]: value } : sub,
              ),
            }
          : process,
      ),
    }));
  const updateProcess = (
    index: number,
    field: 'name' | 'result',
    value: string,
  ) =>
    setProcessDrafts((current) => ({
      ...current,
      [mode]: current[mode].map((process, i) =>
        i === index ? { ...process, [field]: value } : process,
      ),
    }));
  const addSubprocessTask = (processIndex: number, subIndex: number) => {
    const sub = processes[processIndex].subprocesses[subIndex];
    updateSubprocess(processIndex, subIndex, 'tasks', [
      ...sub.tasks,
      'Новая задача подпроцесса',
    ]);
  };
  const toggleProcessAlert = (key: string) =>
    setProcessAlerts((current) =>
      current.includes(key)
        ? current.filter((item) => item !== key)
        : [...current, key],
    );
  const activeIndexes = phaseIndexes[mode][activePhase];
  const processVisible = processes
    .map((process, index) => ({ process, index }))
    .filter(({ process, index }) => {
      const matches =
        !processQuery ||
        `${process.name} ${process.result} ${process.subprocesses.map((s) => `${s.name} ${s.tasks.join(' ')}`).join(' ')}`
          .toLowerCase()
          .includes(processQuery.toLowerCase());
      const hasAlert = process.subprocesses.some((sub) =>
        processAlerts.includes(`${process.name}::${sub.name}`),
      );
      return (
        (activeIndexes.includes(index) || process.phase === activePhase) &&
        matches &&
        (!processAlertsOnly || hasAlert)
      );
    });
  const columns: { id: TaskState; title: string; hint: string }[] = [
    { id: 'todo', title: 'Новые', hint: 'Нужно начать' },
    { id: 'doing', title: 'В работе', hint: 'Есть ответственный' },
    { id: 'review', title: 'На проверке', hint: 'Нужно решение' },
    { id: 'done', title: 'Завершено', hint: 'Результат принят' },
  ];
  return (
    <div className="page-stack process-center">
      <div className="page-title">
        <div>
          <span>
            {mode === 'operator'
              ? 'Управление всей системой'
              : 'Управление своими ролями'}
          </span>
          <h1>Процессы и задачи</h1>
          <p>
            {mode === 'operator'
              ? 'Архитектура, запуски, качество и портфель ролей — от запроса до завершения.'
              : 'Кандидаты, носители, данные, эффекты и экономика ваших ролей.'}
          </p>
        </div>
        <button
          className="primary"
          onClick={() =>
            addTask('Ручная задача', 'Без подпроцесса', 'Новая задача')
          }
        >
          <Plus />
          Добавить задачу
        </button>
      </div>
      <div className="process-tabs">
        <button
          className={view === 'board' ? 'active' : ''}
          onClick={() => setView('board')}
        >
          <ListTodo />
          Канбан задач{' '}
          <em>{scoped.filter((t) => t.state !== 'done').length}</em>
        </button>
        <button
          className={view === 'map' ? 'active' : ''}
          onClick={() => setView('map')}
        >
          <Settings2 />
          Карта процессов <em>{processes.length}</em>
        </button>
      </div>
      {view === 'board' ? (
        <>
          <div className="process-kpis">
            <article>
              <span>В работе</span>
              <strong>
                {scoped.filter((t) => t.state === 'doing').length}
              </strong>
              <small>задачи с ответственным</small>
            </article>
            <article>
              <span>Требуют решения</span>
              <strong>
                {
                  scoped.filter(
                    (t) => t.priority === 'Высокий' && t.state !== 'done',
                  ).length
                }
              </strong>
              <small>высокий приоритет</small>
            </article>
            <article>
              <span>На проверке</span>
              <strong>
                {scoped.filter((t) => t.state === 'review').length}
              </strong>
              <small>нужно принять результат</small>
            </article>
            <article>
              <span>Завершено</span>
              <strong>{scoped.filter((t) => t.state === 'done').length}</strong>
              <small>за текущий период</small>
            </article>
          </div>
          <div className="task-filters">
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
            >
              <option>Все роли</option>
              {roles.map((r) => (
                <option key={r.name}>{r.name}</option>
              ))}
            </select>
            <select
              value={processFilter}
              onChange={(e) => setProcessFilter(e.target.value)}
            >
              <option>Все процессы</option>
              {processes.map((p) => (
                <option key={p.name}>{p.name}</option>
              ))}
            </select>
            <button
              className={alertsOnly ? 'secondary active' : 'secondary'}
              onClick={() => setAlertsOnly((v) => !v)}
            >
              <AlertTriangle />
              Только с алармами
            </button>
          </div>
          <div className="kanban process-board">
            {columns.map((column, ci) => (
              <section key={column.id}>
                <header>
                  <span>
                    <b>{column.title}</b>
                    <small>{column.hint}</small>
                  </span>
                  <strong>
                    {visible.filter((t) => t.state === column.id).length}
                  </strong>
                </header>
                <div>
                  {visible
                    .filter((t) => t.state === column.id)
                    .map((t) => (
                      <article
                        key={t.id}
                        className={t.priority === 'Высокий' ? 'urgent' : ''}
                      >
                        <div className="task-card-tags">
                          <span>{t.role}</span>
                          {t.subject && <span>{t.subject}</span>}
                          {t.priority === 'Высокий' && <em>Аларм</em>}
                        </div>
                        <h3>{t.title}</h3>
                        <p className="task-process">
                          {t.process} · {t.subprocess}
                        </p>
                        <div className="task-quick-edit">
                          <label>
                            Роль
                            <select
                              value={t.role}
                              onChange={(e) =>
                                updateTask(t.id, 'role', e.target.value)
                              }
                            >
                              <option>Все роли</option>
                              {roles.map((item) => (
                                <option key={item.name}>{item.name}</option>
                              ))}
                            </select>
                          </label>
                          <label>
                            Кандидат / участник
                            <input
                              value={t.subject || ''}
                              onChange={(e) =>
                                updateTask(t.id, 'subject', e.target.value)
                              }
                              placeholder="Роль целиком"
                            />
                          </label>
                          <label>
                            Срок
                            <input
                              type="date"
                              value={
                                t.due.match(/^\d{4}-\d{2}-\d{2}$/) ? t.due : ''
                              }
                              onChange={(e) =>
                                updateTask(t.id, 'due', e.target.value)
                              }
                            />
                          </label>
                        </div>
                        <div className="task-meta">
                          <span>{t.owner}</span>
                          <b>{t.due || 'Без срока'}</b>
                        </div>
                        <footer>
                          {ci > 0 && (
                            <button
                              aria-label="Переместить назад"
                              onClick={() => move(t.id, columns[ci - 1].id)}
                            >
                              Назад
                            </button>
                          )}
                          {ci < 3 && (
                            <button
                              onClick={() => move(t.id, columns[ci + 1].id)}
                            >
                              {ci === 2 ? 'Завершить' : 'Дальше'}
                            </button>
                          )}
                        </footer>
                      </article>
                    ))}
                </div>
              </section>
            ))}
          </div>
        </>
      ) : (
        <div className="process-map">
          <div className="process-map-intro">
            <div>
              <b>
                {mode === 'operator'
                  ? 'Процессы оператора ролей'
                  : 'Процессы владельца роли'}
              </b>
              <span>
                {processes.length} процессов ·{' '}
                {processes.reduce((sum, p) => sum + p.subprocesses.length, 0)}{' '}
                подпроцессов ·{' '}
                {
                  processAlerts.filter((key) =>
                    processes.some((p) => key.startsWith(`${p.name}::`)),
                  ).length
                }{' '}
                аларма
              </span>
            </div>
            <p>
              Система предлагает процесс по типу роли и состоянию участника. Вы
              можете изменить задачи, назначить объект, ответственного, срок и
              аларм.
            </p>
          </div>
          <div className="phase-roadmap">
            {processPhases.map((phase, phaseIndex) => {
              const count =
                phaseIndexes[mode][phaseIndex].length +
                processes.filter((process) => process.phase === phaseIndex)
                  .length;
              const progress =
                phaseIndex < activePhase
                  ? 100
                  : phaseIndex === activePhase
                    ? 55
                    : 0;
              return (
                <button
                  className={
                    activePhase === phaseIndex
                      ? 'active'
                      : phaseIndex < activePhase
                        ? 'done'
                        : ''
                  }
                  onClick={() => setActivePhase(phaseIndex)}
                  key={phase.name}
                >
                  <span>
                    {phaseIndex < activePhase ? <Check /> : phaseIndex + 1}
                  </span>
                  <div>
                    <b>{phase.name}</b>
                    <small>{phase.question}</small>
                    <i>
                      <em style={{ width: `${progress}%` }} />
                    </i>
                  </div>
                  <strong>{count} процессов</strong>
                </button>
              );
            })}
          </div>
          <div className="phase-focus">
            <div>
              <span>Выбранный этап</span>
              <h3>{processPhases[activePhase].name}</h3>
              <p>{processPhases[activePhase].question}</p>
            </div>
            <div>
              <span>Результат этапа</span>
              <b>{processPhases[activePhase].result}</b>
            </div>
            <div>
              <span>Что делать сейчас</span>
              <b>{processes[activeIndexes[0]]?.name}</b>
              <small>
                Откройте процесс ниже и перенесите первую задачу в канбан.
              </small>
            </div>
          </div>
          <div className="process-recommendation">
            <Sparkles />
            <div>
              <b>Рекомендация системы</b>
              <span>{phaseRecommendations[mode][activePhase]}</span>
            </div>
            <button
              onClick={() =>
                addTask(
                  mode === 'operator' ? 'Проверка роли' : 'Онбординг носителя',
                  mode === 'operator' ? 'Проверка данных' : 'Первый цикл',
                  mode === 'operator'
                    ? 'Проверить готовность роли к запуску'
                    : 'Проверить первый подтверждающий факт',
                )
              }
            >
              <Plus />
              Добавить план
            </button>
          </div>
          <div className="task-binding">
            <div>
              <b>Параметры новой задачи</b>
              <span>Применяются при переносе задачи из карты в канбан.</span>
            </div>
            <label>
              Роль
              <select
                value={taskRole}
                onChange={(e) => setTaskRole(e.target.value)}
              >
                {roles.map((item) => (
                  <option key={item.name}>{item.name}</option>
                ))}
              </select>
            </label>
            <label>
              Объект
              <input
                value={taskSubject}
                onChange={(e) => setTaskSubject(e.target.value)}
                placeholder="Роль, кандидат или участник"
              />
            </label>
            <label>
              Ответственный
              <input
                value={taskOwner}
                onChange={(e) => setTaskOwner(e.target.value)}
              />
            </label>
            <label>
              Срок
              <input
                type="date"
                value={taskDue}
                onChange={(e) => setTaskDue(e.target.value)}
              />
            </label>
          </div>
          <div className="process-map-tools">
            <label>
              <span>Поиск</span>
              <input
                value={processQuery}
                onChange={(e) => setProcessQuery(e.target.value)}
                placeholder="Процесс, подпроцесс или задача"
              />
            </label>
            <button
              className={processAlertsOnly ? 'secondary active' : 'secondary'}
              onClick={() => setProcessAlertsOnly((value) => !value)}
            >
              <Bell />
              Только с алармами
            </button>
            <button
              className="secondary"
              onClick={() =>
                setProcessDrafts((current) => ({
                  ...current,
                  [mode]: [
                    ...current[mode],
                    {
                      name: 'Новый процесс',
                      result: 'Укажите ожидаемый результат',
                      phase: activePhase,
                      subprocesses: [
                        {
                          name: 'Новый подпроцесс',
                          tasks: ['Опишите первую задачу'],
                          checkpoint: '',
                          decision: '',
                          timing: '',
                        },
                      ],
                    },
                  ],
                }))
              }
            >
              <Plus />
              Добавить процесс
            </button>
          </div>
          {processVisible.map(({ process, index }) => (
            <details
              key={`${index}-${process.name}`}
              open={
                index === 0 ||
                process.subprocesses.some((sub) =>
                  processAlerts.includes(`${process.name}::${sub.name}`),
                )
              }
            >
              <summary>
                <span>{String(index + 1).padStart(2, '0')}</span>
                <div>
                  <b>{process.name}</b>
                  <small>{process.result}</small>
                </div>
                <em>{process.subprocesses.length} подпроцесса</em>
                <ChevronDown />
              </summary>
              <div className="process-editor-head">
                <label>
                  Название процесса
                  <input
                    value={process.name}
                    onChange={(e) =>
                      updateProcess(index, 'name', e.target.value)
                    }
                  />
                </label>
                <label>
                  Ожидаемый результат
                  <input
                    value={process.result}
                    onChange={(e) =>
                      updateProcess(index, 'result', e.target.value)
                    }
                  />
                </label>
              </div>
              <div className="subprocess-grid">
                {process.subprocesses.map((sub, subIndex) => {
                  const key = `${process.name}::${sub.name}`;
                  const editing =
                    editingSubprocess === `${mode}-${index}-${subIndex}`;
                  const alert = processAlerts.includes(key);
                  return (
                    <article
                      className={alert ? 'subprocess-alert' : ''}
                      key={`${subIndex}-${sub.name}`}
                    >
                      <header>
                        <div>
                          <span>Подпроцесс {subIndex + 1}</span>
                          {editing ? (
                            <input
                              value={sub.name}
                              onChange={(e) =>
                                updateSubprocess(
                                  index,
                                  subIndex,
                                  'name',
                                  e.target.value,
                                )
                              }
                            />
                          ) : (
                            <b>{sub.name}</b>
                          )}
                        </div>
                        <div className="subprocess-actions">
                          <button
                            className={alert ? 'icon-button alert' : ''}
                            aria-label="Переключить аларм"
                            onClick={() => toggleProcessAlert(key)}
                          >
                            <Bell />
                          </button>
                          <button
                            className="icon-button"
                            aria-label="Изменить подпроцесс"
                            onClick={() =>
                              setEditingSubprocess(
                                editing ? null : `${mode}-${index}-${subIndex}`,
                              )
                            }
                          >
                            {editing ? <Save /> : <Pencil />}
                          </button>
                        </div>
                      </header>
                      {editing ? (
                        <div className="editable-task-list">
                          {sub.tasks.map((task, taskIndex) => (
                            <label key={taskIndex}>
                              <span>{taskIndex + 1}</span>
                              <input
                                value={task}
                                onChange={(e) =>
                                  updateSubprocess(
                                    index,
                                    subIndex,
                                    'tasks',
                                    sub.tasks.map((item, i) =>
                                      i === taskIndex ? e.target.value : item,
                                    ),
                                  )
                                }
                              />
                              <button
                                aria-label="Удалить задачу"
                                onClick={() =>
                                  updateSubprocess(
                                    index,
                                    subIndex,
                                    'tasks',
                                    sub.tasks.filter((_, i) => i !== taskIndex),
                                  )
                                }
                              >
                                <X />
                              </button>
                            </label>
                          ))}
                          <button
                            className="text-button"
                            onClick={() => addSubprocessTask(index, subIndex)}
                          >
                            <Plus />
                            Добавить задачу
                          </button>
                        </div>
                      ) : (
                        <ol>
                          {sub.tasks.map((task) => (
                            <li key={task}>{task}</li>
                          ))}
                        </ol>
                      )}
                      <div className="process-control-grid">
                        {(['checkpoint', 'decision', 'timing'] as const).map(
                          (field) => (
                            <label key={field}>
                              {field === 'checkpoint'
                                ? 'Контрольная точка'
                                : field === 'decision'
                                  ? 'Решение'
                                  : 'Период / срок'}
                              {editing ? (
                                <textarea
                                  value={sub[field] || ''}
                                  onChange={(e) =>
                                    updateSubprocess(
                                      index,
                                      subIndex,
                                      field,
                                      e.target.value,
                                    )
                                  }
                                />
                              ) : (
                                <strong>{sub[field] || 'Не задано'}</strong>
                              )}
                            </label>
                          ),
                        )}
                      </div>
                      <footer>
                        {alert && (
                          <span>
                            <AlertTriangle />
                            Требует внимания
                          </span>
                        )}
                        <button
                          onClick={() =>
                            addTask(
                              process.name,
                              sub.name,
                              sub.tasks[0] || 'Новая задача',
                            )
                          }
                        >
                          <Plus />В канбан
                        </button>
                      </footer>
                    </article>
                  );
                })}
              </div>
              <footer>
                <span>
                  <Check />
                  Ожидаемый результат
                </span>
                <b>{process.result}</b>
              </footer>
            </details>
          ))}
        </div>
      )}
      <div className="responsibility-note">
        <UserCog />
        <div>
          <b>Граница ответственности</b>
          <p>
            {mode === 'operator'
              ? 'Оператор проектирует правила, проверяет измеримость и управляет портфелем. Владелец передаёт предметную фактуру и выполняет операционные действия по своим ролям.'
              : 'Владелец применяет роль в работе, отвечает за носителей, факты и результаты. Изменение методики и новой версии роли передаётся оператору.'}
          </p>
        </div>
      </div>
    </div>
  );
}

function Setup({
  roleList,
  scope,
  userId,
  onCreateRole,
  onSaveRole,
  onFrameworkComplete,
  onSetupComplete,
}: {
  roleList: Role[];
  scope: Scope;
  userId: string;
  onCreateRole: (role: Role) => void;
  onSaveRole: (role: Role) => void;
  onFrameworkComplete: () => void;
  onSetupComplete: (roleNames: string[]) => void;
}) {
  const roles = roleList;
  const [route, setRoute] = useState<'team' | 'self'>('self');
  const [step, setStep] = useState(1);
  const [framework, setFramework] = useState<FrameworkAnswers>(emptyFramework);
  const [operator, setOperator] = useState({ name: '', position: '', contact: '' });
  const [selected, setSelected] = useState<string[]>([]);
  const [parametersConfirmed, setParametersConfirmed] = useState<string[]>([]);
  const [primaryRolesLoaded, setPrimaryRolesLoaded] = useState(false);
  const [dataSource, setDataSource] = useState<'crm' | 'table' | 'manual' | ''>('');
  const [generated, setGenerated] = useState(false);
  const [teamRequest, setTeamRequest] = useState(false);
  const [frameworkError, setFrameworkError] = useState('');
  const [launchMessage, setLaunchMessage] = useState('');
  const [editingRoleName, setEditingRoleName] = useState<string | null>(null);
  const [creatingRole, setCreatingRole] = useState(false);
  const [customName, setCustomName] = useState('');
  const [customPurpose, setCustomPurpose] = useState('');
  const [customError, setCustomError] = useState('');
  const [draftLoaded, setDraftLoaded] = useState(false);
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(frameworkKey(scope, userId)) || 'null');
      if (saved) {
        setRoute(saved.route === 'team' ? 'team' : 'self');
        setFramework({ ...emptyFramework, ...saved.framework });
        setOperator(saved.operator || { name: '', position: '', contact: '' });
        setSelected(Array.isArray(saved.selected) ? saved.selected : []);
        setParametersConfirmed(Array.isArray(saved.parametersConfirmed) ? saved.parametersConfirmed : []);
        setPrimaryRolesLoaded(Boolean(saved.primaryRolesLoaded));
        setDataSource(saved.dataSource || '');
        setGenerated(Boolean(saved.generated));
        setTeamRequest(Boolean(saved.teamRequest));
        setStep(Number(saved.step) || 1);
        if (typeof saved.editingRoleName === 'string' && roleList.some((role) => role.name === saved.editingRoleName)) setEditingRoleName(saved.editingRoleName);
      }
    } catch {}
    setDraftLoaded(true);
  }, [scope, userId]);
  useEffect(() => {
    if (draftLoaded) localStorage.setItem(frameworkKey(scope, userId), JSON.stringify({ route, framework, operator, selected, parametersConfirmed, primaryRolesLoaded, dataSource, generated, teamRequest, step, editingRoleName }));
  }, [scope, userId, route, framework, operator, selected, parametersConfirmed, primaryRolesLoaded, dataSource, generated, teamRequest, step, editingRoleName, draftLoaded]);
  const updateFramework = (key: keyof FrameworkAnswers, value: string) => {
    setFramework((current) => ({ ...current, [key]: value }));
    setGenerated(false);
    setTeamRequest(false);
  };
  const validFramework = (Object.keys(emptyFramework) as (keyof FrameworkAnswers)[]).every((key) => framework[key]?.trim().length > 0);
  const finishFramework = () => {
    if (!validFramework) {
      setFrameworkError('Заполните все шесть пунктов фреймворка: они нужны для обоих сценариев.');
      return;
    }
    setFrameworkError('');
    onFrameworkComplete();
    setStep(3);
  };
  const recommended = suggestRoles(roles, framework).slice(0, 5);
  const toggle = (name: string) =>
    setSelected((c) => {
      setPrimaryRolesLoaded(false);
      if (c.includes(name)) {
        setParametersConfirmed((current) => current.filter((item) => item !== name));
        return c.filter((x) => x !== name);
      }
      return c.length < 5 ? [...c, name] : c;
    });
  const createCustomRole = () => {
    const name = customName.trim();
    const purpose = customPurpose.trim();
    if (!name || !purpose) {
      setCustomError('Укажите название и задачу новой роли.');
      return;
    }
    if (roles.some((role) => role.name.toLowerCase() === name.toLowerCase())) {
      setCustomError('Роль с таким названием уже есть в библиотеке.');
      return;
    }
    if (selected.length >= 5) {
      setCustomError('В первом проектировании можно выбрать не более пяти ролей.');
      return;
    }
    onCreateRole(createEmptyRole(name, purpose, ''));
    setSelected((current) => [...current, name]);
    setPrimaryRolesLoaded(false);
    setCreatingRole(false);
    setCustomName('');
    setCustomPurpose('');
    setCustomError('');
  };
  const launch = () => {
    const missing = selected
      .map((name) => roles.find((role) => role.name === name))
      .filter((role) => !role?.configured);
    const minimum = framework.pilot.startsWith('1–2') ? 1 : 3;
    if (selected.length < minimum) {
      setLaunchMessage(`Для выбранного масштаба пилота выберите не менее ${minimum} ролей.`);
      return;
    }
    if (selected.some((name) => {
      const role = roles.find((item) => item.name === name);
      return !role?.owner.trim() || !role.ownerPosition?.trim() || !role.ownerContact?.trim();
    })) {
      setLaunchMessage('Назначьте владельца, его должность и контакт для каждой выбранной роли.');
      return;
    }
    if (!operator.name.trim() || !operator.position.trim() || !operator.contact.trim()) {
      setLaunchMessage('Назначьте оператора ролей: имя, должность и контакт.');
      return;
    }
    if (missing.length) {
      setLaunchMessage(
        `Не настроены обязательные показатели: ${missing.map((role) => role?.name).join(', ')}.`,
      );
      return;
    }
    if (selected.some((name) => !parametersConfirmed.includes(name))) {
      setLaunchMessage('Подтвердите параметры индекса, эффектов и экономики для каждой роли.');
      return;
    }
    if (!primaryRolesLoaded) {
      setLaunchMessage('Сначала зафиксируйте первичный портфель ролей и проверьте распределение.');
      return;
    }
    setLaunchMessage(
      'Пилот подготовлен: роли, параметры, ответственные и распределение проверены. Подключение реальных данных остаётся отдельным шагом.',
    );
  };
  const editingRole = step === 5 ? roles.find((role) => role.name === editingRoleName) : undefined;
  if (editingRole) return (
    <div className="page-stack">
      <div className="setup-editor-context">
        <button className="secondary" onClick={() => setEditingRoleName(null)}>← Вернуться к шагу 5</button>
        <div><span>Шаг 5 из 8 · Роль {selected.indexOf(editingRole.name) + 1} из {selected.length}</span><b>{editingRole.name}</b><small>Вы остаетесь в настройке. Черновик этой роли сохраняется в браузере автоматически.</small></div>
        <strong>{selected.filter((name) => parametersConfirmed.includes(name)).length} / {selected.length} готово</strong>
      </div>
      <RoleConfigurator
        key={editingRole.name}
        role={editingRole}
        draftKey={userStorageKey(userId, `setup-role-draft:${editingRole.name}`)}
        closeLabel="Вернуться к списку ролей"
        onClose={() => setEditingRoleName(null)}
        onSave={(updated) => {
          onSaveRole(updated);
          setParametersConfirmed((current) => current.includes(updated.name) ? current : [...current, updated.name]);
          setEditingRoleName(null);
        }}
      />
    </div>
  );
  return (
    <div className="page-stack">
      <div className="page-title">
        <div>
          <span>Первичная настройка</span>
          <h1>Путь от запроса до запуска ролей</h1>
          <p>От выбора пути и описания задачи до параметров, ответственных, распределения и запуска.</p>
        </div>
      </div>
      <nav className="setup-steps eight">
        {[
          'Путь',
          'Фреймворк',
          'Следующий шаг',
          'Проектирование',
          'Параметры',
          'Ответственные',
          'Распределение',
          'Запуск',
        ].map((x, i) => (
          <button
            className={step === i + 1 ? 'active' : step > i + 1 ? 'done' : ''}
            onClick={() => { if (i + 1 <= step) setStep(i + 1); }}
            key={x}
          >
            <span>{step > i + 1 ? <Check /> : i + 1}</span>
            {x}
          </button>
        ))}
      </nav>
      {step === 1 && (
        <section className="setup-card">
          <div className="section-title">
            <div>
              <span>Шаг 1</span>
              <h2>Как будете проектировать систему?</h2>
              <p>В обоих сценариях сначала нужно сформулировать задачу по единому фреймворку.</p>
            </div>
          </div>
          <div className="route-options">
            <button
              className={route === 'team' ? 'active' : ''}
              onClick={() => { setRoute('team'); setGenerated(false); setTeamRequest(false); }}
            >
              <Users />
              <b>Совместно с командой</b>
              <p>После фреймворка запрос передаётся команде. Затем вы переходите к созданию и настройке ролей.</p>
              <span>{route === 'team' && <Check />}</span>
            </button>
            <button
              className={route === 'self' ? 'active' : ''}
              onClick={() => { setRoute('self'); setGenerated(false); setTeamRequest(false); }}
            >
              <Sparkles />
              <b>Самостоятельно</b>
              <p>После фреймворка помощник подбирает роли из базы. Вы проверяете и настраиваете каждую.</p>
              <span>{route === 'self' && <Check />}</span>
            </button>
          </div>
          <button className="primary next" onClick={() => setStep(2)}>
            Продолжить <ArrowRight />
          </button>
        </section>
      )}
      {step === 2 && (
        <section className="setup-card">
          <div className="section-title">
            <div>
              <span>Шаг 2</span>
              <h2>Фреймворк ролевой системы</h2>
              <p>
                Ответы задают основу модели, а не конкретные показатели
                отдельных ролей.
              </p>
            </div>
          </div>
          <div className="framework">
            <label>
              <span>Какую бизнес-задачу решаем?</span>
              <select value={framework.goal} onChange={(e) => updateFramework('goal', e.target.value)}>
                <option value="">Выберите задачу</option>
                <option>Адаптация и удержание</option>
                <option>Создание участнической ценности</option>
                <option>Рост членства и выручки</option>
                <option>Развитие горизонтальных связей</option>
              </select>
            </label>
            <label>
              <span>Для кого создаём роли?</span>
              <select value={framework.audience} onChange={(e) => updateFramework('audience', e.target.value)}>
                <option value="">Выберите аудиторию</option>
                <option>Для всех участников</option>
                <option>Для новых участников</option>
                <option>Для активного ядра</option>
                <option>Для отдельных сегментов</option>
              </select>
            </label>
            <label>
              <span>Какой результат ждём от ролей?</span>
              <input value={framework.outcome} onChange={(e) => updateFramework('outcome', e.target.value)} placeholder="Например, больше продлений после первого года" />
            </label>
            <label>
              <span>Где роли смогут проявляться?</span>
              <input value={framework.context} onChange={(e) => updateFramework('context', e.target.value)} placeholder="Встречи, малые группы, помощь новичкам, коммуникация" />
            </label>
            <label>
              <span>Какие данные уже доступны?</span>
              <select value={framework.data} onChange={(e) => updateFramework('data', e.target.value)}>
                <option value="">Выберите источник</option>
                <option>Система учёта, профиль и активности</option>
                <option>CRM и система членства</option>
                <option>Таблица участников</option>
                <option>Пока только ручной ввод</option>
              </select>
            </label>
            <label>
              <span>Какой ресурс есть на пилот?</span>
              <select value={framework.pilot} onChange={(e) => updateFramework('pilot', e.target.value)}>
                <option value="">Выберите масштаб</option>
                <option>3–5 ролей · 2 пилота · 3 месяца</option>
                <option>1–2 роли · 1 пилот · 1 месяц</option>
                <option>Кастомный план</option>
              </select>
            </label>
          </div>
          <div className="framework-result">
            <Sparkles />
            <div>
              <b>Что получится после ответов</b>
              <span>
                {route === 'self'
                  ? 'Помощник предложит подходящие роли из базы; решение о выборе и запуске остаётся за вами.'
                  : 'Вы сформируете запрос команде, затем перейдёте к совместному проектированию ролей.'}
              </span>
            </div>
          </div>
          {frameworkError && <p className="form-error">{frameworkError}</p>}
          <button className="primary next" onClick={finishFramework}>
            Сохранить фреймворк и продолжить <ArrowRight />
          </button>
        </section>
      )}
      {step === 3 && (
        <section className="setup-card">
          <div className="section-title">
            <div>
              <span>Шаг 3</span>
              <h2>{route === 'self' ? 'Подбор ролей по вашему запросу' : 'Передача запроса команде'}</h2>
              <p>Основа — сохранённые ответы фреймворка. Изменить их можно на предыдущем шаге.</p>
            </div>
          </div>
          <div className="framework-result">
            <Target />
            <div><b>{framework.goal}</b><span>{framework.audience} · {framework.outcome} · данные: {framework.data}</span></div>
          </div>
          {route === 'self' ? (
            <>
              <p className="setup-explainer">Помощник сопоставляет вашу задачу с описаниями ролей в базе. Это демонстрационный подбор: внешняя нейросеть пока не подключена.</p>
              <button className="primary" onClick={() => setGenerated(true)}><Sparkles /> Подобрать роли из базы</button>
              {generated && <div className="setup-suggestions">
                {recommended.map(({ role, reason }) => <article key={role.name}>
                  <div><b>{role.name}</b><small>{reason}</small><span>{role.short}</span></div>
                  <button className="secondary" onClick={() => toggle(role.name)}>{selected.includes(role.name) ? 'Убрать' : 'Добавить'}</button>
                </article>)}
              </div>}
              {generated && <button className="primary next" onClick={() => setStep(4)}>Перейти к созданию ролей <ArrowRight /></button>}
            </>
          ) : (
            <>
              <div className="team-handoff">
                <b>Что получит команда</b>
                <span>Цель, аудиторию, ожидаемый результат, среду проявления ролей, доступные данные, оператора и масштаб пилота. На этой основе команда проектирует кастомную модель.</span>
              </div>
              <button className="primary" onClick={() => setTeamRequest(true)}><Users /> Отправить на создание ролей</button>
              {teamRequest && <div className="draft-notice" role="status"><Check /><span>Запрос подготовлен в прототипе. Внешняя отправка команде пока не подключена; после согласования можно перейти к проектированию.</span></div>}
              {teamRequest && <button className="primary next" onClick={() => setStep(4)}>Перейти к созданию ролей <ArrowRight /></button>}
            </>
          )}
        </section>
      )}
      {step === 4 && (
        <section className="setup-card">
          <div className="section-title">
            <div>
              <span>Шаг 4</span>
              <h2>Проектирование ролей</h2>
              <p>{route === 'team' ? 'Выберите роли, согласованные с командой, или создайте кастомные. Для каждой откройте полную модель.' : 'Проверьте рекомендованные роли, адаптируйте их или создайте свои.'}</p>
            </div>
            <small>{selected.length} выбрано</small>
          </div>
          <div className="setup-role-list">
            {roles.map((r) => (
              <div
                className={selected.includes(r.name) ? 'selected' : ''}
                key={r.name}
              >
                <button onClick={() => toggle(r.name)}>
                  <span>{selected.includes(r.name) && <Check />}</span>
                  <div>
                    <b>{r.name}</b>
                    <small>{r.short}</small>
                  </div>
                  <em>{r.kind === 'custom' ? 'Своя роль' : 'Базовая'}</em>
                </button>
                {selected.includes(r.name) && (
                  <div className="setup-design-actions">
                    <span>Выбрана для проекта · индекс, эффекты и экономику настроим вместе на следующем шаге.</span>
                  </div>
                )}
              </div>
            ))}
          </div>
          <button className="secondary" onClick={() => setCreatingRole((current) => !current)}>
            <Plus />
            {creatingRole ? 'Скрыть создание роли' : 'Создать свою роль здесь'}
          </button>
          {creatingRole && <div className="setup-inline-create">
            <div><b>Новая роль в этом проекте</b><span>После создания она появится в списке и останется в текущем шаге.</span></div>
            <div className="custom-role-fields">
              <label>Название роли<input value={customName} onChange={(event) => setCustomName(event.target.value)} placeholder="Например, проводник сообщества" /></label>
              <label>Какую задачу решает<input value={customPurpose} onChange={(event) => setCustomPurpose(event.target.value)} placeholder="Кратко о назначении роли" /></label>
            </div>
            {customError && <p className="form-error" role="alert">{customError}</p>}
            <button className="primary" onClick={createCustomRole}>Добавить роль в проект <ArrowRight /></button>
          </div>}
          <button
            className="primary next"
            onClick={() => { if (selected.length) { setFrameworkError(''); setStep(5); } else setFrameworkError('Выберите хотя бы одну роль для проектирования.'); }}
          >
            Определить параметры ролей <ArrowRight />
          </button>
          {frameworkError && <p className="form-error">{frameworkError}</p>}
        </section>
      )}
      {step === 5 && (
        <section className="setup-calculations">
          <div className="setup-calc-head">
            <div>
              <span>Шаг 5</span>
              <h2>Параметры каждой роли</h2>
              <p>Открывайте роли по одной. Настройка индекса, эффектов и экономики откроется здесь же; после сохранения вы вернётесь к этому списку. Место и черновик сохраняются.</p>
            </div>
          </div>
          <div className="setup-progress-note"><b>{selected.filter((name) => parametersConfirmed.includes(name)).length} из {selected.length} ролей настроено</b><span>Следующая: {selected.find((name) => !parametersConfirmed.includes(name)) || 'все роли готовы'}</span></div>
          <div className="setup-role-list">
            {roles
              .filter((role) => selected.includes(role.name))
              .map((role, index) => (
                <div key={role.name} className="selected">
                  <div className="setup-calc-role">
                    <div>
                      <b>{index + 1}. {role.name}</b>
                      <small>
                        {parametersConfirmed.includes(role.name) ? 'Показатели сохранены и подтверждены' : role.configured ? 'Проверьте готовую модель и сохраните' : 'Настройте показатели роли'}
                      </small>
                    </div>
                    <div className="setup-calc-actions">
                      <button className="secondary" onClick={() => setEditingRoleName(role.name)}><Settings2 /> {parametersConfirmed.includes(role.name) ? 'Изменить показатели' : 'Настроить показатели'}</button>
                    </div>
                  </div>
                </div>
              ))}
          </div>
          <div className="setup-save-bar">
            <span>Подтверждено {selected.filter((name) => parametersConfirmed.includes(name)).length} из {selected.length} моделей ролей.</span>
            <button className="primary" onClick={() => {
              if (selected.some((name) => !parametersConfirmed.includes(name))) setFrameworkError('Подтвердите параметры для всех выбранных ролей.');
              else { setFrameworkError(''); setStep(6); }
            }}>
              Назначить ответственных <ArrowRight />
            </button>
          </div>
          {frameworkError && <p className="form-error">{frameworkError}</p>}
        </section>
      )}
      {step === 6 && (
        <section className="setup-card">
          <div className="section-title"><div><span>Шаг 6</span><h2>Оператор и владельцы ролей</h2><p>После настройки параметров назначьте методологического оператора и владельца каждой роли.</p></div></div>
          <div className="setup-owner-list">
            <article><b>Оператор ролевой системы</b><div className="owner-fields">
              <label>Фамилия и имя<input value={operator.name} onChange={(e) => setOperator({ ...operator, name: e.target.value })} placeholder="Фамилия Имя" /></label>
              <label>Должность<input value={operator.position} onChange={(e) => setOperator({ ...operator, position: e.target.value })} placeholder="Должность" /></label>
              <label>Контакт<input value={operator.contact} onChange={(e) => setOperator({ ...operator, contact: e.target.value })} placeholder="Почта или телефон" /></label>
            </div></article>
            {roles.filter((r) => selected.includes(r.name)).map((r) => <article key={r.name}>
              <b>Владелец роли · {r.name}</b>
              <div className="owner-fields">
                <label>Фамилия и имя<input value={r.owner} onChange={(e) => onSaveRole({ ...r, owner: e.target.value })} placeholder="Фамилия Имя" /></label>
                <label>Должность<input value={r.ownerPosition || ''} onChange={(e) => onSaveRole({ ...r, ownerPosition: e.target.value })} placeholder="Должность" /></label>
                <label>Контакт<input value={r.ownerContact || ''} onChange={(e) => onSaveRole({ ...r, ownerContact: e.target.value })} placeholder="Почта или телефон" /></label>
              </div>
            </article>)}
          </div>
          <button className="primary next" onClick={() => {
            if (!operator.name.trim() || !operator.position.trim() || !operator.contact.trim()) setFrameworkError('Укажите имя, должность и контакт оператора.');
            else if (roles.filter((r) => selected.includes(r.name)).some((r) => !r.owner.trim() || !r.ownerPosition?.trim() || !r.ownerContact?.trim())) setFrameworkError('Укажите имя, должность и контакт владельца для каждой роли.');
            else { setFrameworkError(''); setStep(7); }
          }}>Перейти к распределению <ArrowRight /></button>
          {frameworkError && <p className="form-error">{frameworkError}</p>}
        </section>
      )}
      {step === 7 && (
        <section className="setup-card">
          <div className="section-title">
            <div>
              <span>Шаг 7</span>
              <h2>Первичные роли и распределение</h2>
              <p>Зафиксируйте роли первого запуска, распределите их по пилотам и проверьте нагрузку владельцев до запуска.</p>
            </div>
          </div>
          <div className="setup-distribution">
            {roles.filter((role) => selected.includes(role.name)).map((role) => <article key={role.name}>
              <div><b>{role.name}</b><small>Владелец: {role.owner || 'не назначен'} · {parametersConfirmed.includes(role.name) ? 'параметры подтверждены' : 'параметры не подтверждены'}</small></div>
              <label>Очередь запуска<select value={role.pilot === 'Пилот 2' ? 'Пилот 2' : 'Пилот 1'} onChange={(e) => { onSaveRole({ ...role, pilot: e.target.value }); setPrimaryRolesLoaded(false); }}><option>Пилот 1</option><option>Пилот 2</option></select></label>
            </article>)}
          </div>
          <div className="distribution-summary"><b>Распределение:</b><span>Пилот 1 — {roles.filter((r) => selected.includes(r.name) && r.pilot !== 'Пилот 2').length} роли</span><span>Пилот 2 — {roles.filter((r) => selected.includes(r.name) && r.pilot === 'Пилот 2').length} роли</span><span>Владельцев — {new Set(roles.filter((r) => selected.includes(r.name)).map((r) => r.owner.trim()).filter(Boolean)).size}</span></div>
          <button className="secondary" onClick={() => setPrimaryRolesLoaded(true)}><Check /> Зафиксировать первичный портфель ролей</button>
          {primaryRolesLoaded && <div className="draft-notice" role="status"><Check /><span>Первичные роли зафиксированы. Можно выбрать источник данных и перейти к проверке запуска.</span></div>}
          <h3 className="setup-subheading">Источник данных для пилота</h3>
          <div className="source-options">
            <button className={dataSource === 'crm' ? 'active' : ''} onClick={() => setDataSource('crm')}>
              <Database />
              <b>CRM / система учёта</b>
              <small>Интеграция будет настраиваться отдельно</small>
            </button>
            <button className={dataSource === 'table' ? 'active' : ''} onClick={() => setDataSource('table')}>
              <BookOpen />
              <b>Таблица участников</b>
              <small>Демонстрационный выбор источника, без загрузки файла</small>
            </button>
          </div>
          <button className="primary next" onClick={() => {
            if (!primaryRolesLoaded) setFrameworkError('Сначала зафиксируйте первичный портфель ролей.');
            else if (!dataSource) setFrameworkError('Выберите предполагаемый источник данных для пилота.');
            else { setFrameworkError(''); setStep(8); }
          }}>Проверить готовность к запуску <ArrowRight /></button>
          {frameworkError && <p className="form-error">{frameworkError}</p>}
        </section>
      )}
      {step === 8 && (
        <section className="setup-card">
          <div className="section-title"><div><span>Шаг 8</span><h2>Проверка перед запуском</h2><p>Роли, параметры и ответственные должны быть согласованы до активации системы.</p></div></div>
          <div className="data-checklist">
            <div>
              <Check />
              <span>
                <b>Индекс здоровья</b>
                <small>Настроены шесть измерений, веса, цели и источники</small>
              </span>
            </div>
            <div>
              <Check />
              <span>
                <b>Эффекты</b>
                <small>Отдельные баллы для участника и клуба из 100</small>
              </span>
            </div>
            <div>
              <Check />
              <span>
                <b>Экономика</b>
                <small>
                  Выгоды, время команды, расходы и стоимость системы
                </small>
              </span>
            </div>
            <div>
              <AlertTriangle />
              <span>
                <b>Перед запуском</b>
                <small>
                  Заполните недостающие источники, чтобы не смешивать ноль и
                  отсутствие данных
                </small>
              </span>
            </div>
          </div>
          <div className="launch-summary">
            <span>
              <b>{selected.length}</b> ролей
            </span>
            <ArrowRight />
            <span>
              <b>{selected.length}</b> владельцев
            </span>
            <ArrowRight />
            <span>
              <b>{new Set(roles.filter((r) => selected.includes(r.name)).map((r) => r.pilot)).size}</b> пилота
            </span>
            <ArrowRight />
            <span>
              <b>1</b> система
            </span>
          </div>
          {launchMessage && (
            <div className="draft-notice" role="status">
              <AlertTriangle />
              <span>{launchMessage}</span>
            </div>
          )}
          <button className="primary next" onClick={launch}>
            Проверить готовность запуска
          </button>
          {launchMessage.startsWith('Пилот подготовлен') && <button className="secondary next" onClick={() => onSetupComplete(selected)}>Открыть рабочий стол <ArrowRight /></button>}
        </section>
      )}
    </div>
  );
}

function RoleCatalog({
  roleList,
  userId,
  onOpen,
  onCreate,
  onAddToSetup,
  scope,
}: {
  roleList: Role[];
  userId: string;
  onOpen: (role: Role) => void;
  onCreate: (role: Role) => void;
  onAddToSetup: (role: Role) => void;
  scope: Scope;
}) {
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState('');
  const [short, setShort] = useState('');
  const [error, setError] = useState('');
  const [advisorOpen, setAdvisorOpen] = useState(false);
  const [advisorMode, setAdvisorMode] = useState<'ai' | 'team'>('ai');
  const [savedSetup, setSavedSetup] = useState<{ framework: FrameworkAnswers; selected: string[] } | null>(null);
  useEffect(() => {
    try { setSavedSetup(JSON.parse(localStorage.getItem(frameworkKey(scope, userId)) || 'null')); } catch { setSavedSetup(null); }
  }, [scope, userId]);
  const nextSuggestions = savedSetup ? suggestRoles(roleList, savedSetup.framework, savedSetup.selected || []).slice(0, 3) : [];
  const create = () => {
    if (!name.trim() || !short.trim()) {
      setError('Заполните название и назначение роли. Владельца назначим после параметров.');
      return;
    }
    if (
      roleList.some(
        (role) => role.name.toLowerCase() === name.trim().toLowerCase(),
      )
    ) {
      setError('Роль с таким названием уже существует.');
      return;
    }
    onCreate(createEmptyRole(name.trim(), short.trim(), ''));
    setCreating(false);
    setName('');
    setShort('');
    setError('');
  };
  return (
    <div className="page-stack">
      <div className="page-title">
        <div>
          <span>Библиотека и конструктор</span>
          <h1>{scope === 'clubfirst' ? 'Роли ClubFirst' : 'Выберите базовую роль или создайте свою'}</h1>
          <p>
            У любой роли одна обязательная структура: индекс здоровья, эффекты
            для участника и клуба, экономика.
          </p>
        </div>
        <button
          className="primary"
          onClick={() => setCreating((value) => !value)}
        >
          <Plus />
          Создать свою роль
        </button>
      </div>
      <section className="panel role-advisor">
        <div><span>Развитие портфеля</span><h2>Какую роль добавить следующей?</h2><p>Вернитесь к сохранённому фреймворку в любой момент — после первого запуска тоже.</p></div>
        <div className="role-advisor-actions">
          <button className="secondary" onClick={() => { setAdvisorMode('ai'); setAdvisorOpen(true); }}><Sparkles /> Подобрать по данным</button>
          <button className="secondary" onClick={() => { setAdvisorMode('team'); setAdvisorOpen(true); }}><Users /> Запросить у команды</button>
        </div>
        {advisorOpen && (savedSetup?.framework && Object.values(savedSetup.framework).every((value) => Boolean(value?.trim())) ? advisorMode === 'ai' ? (
          <div className="advisor-results"><p>Демонстрационный подбор по фреймворку и уже выбранным ролям; внешняя нейросеть пока не подключена.</p>
            {nextSuggestions.length ? nextSuggestions.map(({ role, reason }) => <article key={role.name}><div><b>{role.name}</b><small>{reason}</small></div><button className="secondary" onClick={() => onAddToSetup(role)}>Добавить в проектирование</button></article>) : <p>Все роли базы уже выбраны. Можно создать свою роль.</p>}
          </div>
        ) : <div className="advisor-results"><b>Запрос для команды подготовлен</b><p>Основа: {savedSetup.framework.goal}; ожидаемый результат: {savedSetup.framework.outcome}. В прототипе внешняя отправка не подключена — обсудите эту карточку с командой или создайте роль вручную.</p></div> : <p className="draft-notice">Сначала заполните фреймворк в разделе «Настройка».</p>)}
      </section>
      {creating && (
        <section className="panel custom-role-form">
          <div className="section-title">
            <div>
              <span>Новая роль</span>
              <h2>Начните с назначения роли</h2>
              <p>
                После создания откроется настройка всех обязательных
                показателей.
              </p>
            </div>
          </div>
          <div className="custom-role-fields">
            <label>
              Название роли
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Например, проводник сообщества"
              />
            </label>
            <label>
              Зачем нужна роль
              <input
                value={short}
                onChange={(e) => setShort(e.target.value)}
                placeholder="Какую задачу клуба решает"
              />
            </label>
          </div>
          {error && <p className="form-error">{error}</p>}
          <button className="primary" onClick={create}>
            Создать и настроить <ArrowRight />
          </button>
        </section>
      )}
      <div className="catalog-section-title">
        <h2>{scope === 'clubfirst' ? 'Роли ClubFirst' : 'Базовые роли'}</h2>
        <span>{scope === 'clubfirst' ? `${roleList.filter((role) => role.kind !== 'custom').length} моделей из ролевой таблицы; факты подключаются отдельно` : '5 готовых отправных моделей; показатели можно адаптировать'}</span>
      </div>
      <div className="catalog-grid">
        {roleList
          .filter((role) => role.kind !== 'custom')
          .map((role) => (
            <article className="catalog-card" key={role.name}>
              <div className="catalog-card-top">
                <span>{scope === 'clubfirst' ? 'Роль ClubFirst' : 'Базовая роль'}</span>
                <b>{role.configured ? scope === 'clubfirst' ? 'Показатели заданы' : 'Модель готова' : 'Требует настройки'}</b>
              </div>
              <h3>{role.name}</h3>
              <p>{role.short}</p>
              <div>
                <small>Индекс: 6 измерений</small>
                <small>Эффекты: участник и клуб</small>
                <small>Экономика: выгоды и затраты</small>
              </div>
              <button className="secondary" onClick={() => onOpen(role)}>
                Открыть и адаптировать <ArrowRight />
              </button>
            </article>
          ))}
      </div>
      {roleList.some((role) => role.kind === 'custom') && (
        <>
          <div className="catalog-section-title">
            <h2>Свои роли</h2>
            <span>Черновики и настроенные роли</span>
          </div>
          <div className="catalog-grid">
            {roleList
              .filter((role) => role.kind === 'custom')
              .map((role) => (
                <article className="catalog-card" key={role.name}>
                  <div className="catalog-card-top">
                    <span>Своя роль</span>
                    <b>{role.configured ? 'Готова к пилоту' : 'Черновик'}</b>
                  </div>
                  <h3>{role.name}</h3>
                  <p>{role.short}</p>
                  <div>
                    <small>Владелец: {role.owner}</small>
                    <small>
                      {role.configured
                        ? 'Обязательные блоки заполнены'
                        : 'Показатели ещё не настроены'}
                    </small>
                  </div>
                  <button className="secondary" onClick={() => onOpen(role)}>
                    {role.configured ? 'Открыть роль' : 'Завершить настройку'}{' '}
                    <ArrowRight />
                  </button>
                </article>
              ))}
          </div>
        </>
      )}
    </div>
  );
}

const clubFirstRoles: Role[] = clubFirstSeed.map((source) => {
  const full = clubFirstFull.find((item) => item.name === source.name);
  const googleExample = clubFirstGoogleExample.find((item) => item.name === source.name);
  const participant = source.effects.filter((effect) => effect.recipient === 'Участник');
  const beneficiary = source.effects.filter((effect) => effect.recipient === 'Бенефициар');
  const metrics = (items: typeof source.effects, start: number): EffectMetric[] =>
    items.map((item, index) => ({
      id: start + index,
      name: item.name,
      formula: item.formula,
      source: item.source,
      period: item.period,
      fact: null,
      target: Number(item.target),
      weight: Math.floor(100 / items.length) + (index === 0 ? 100 % items.length : 0),
    }));
  return {
    name: source.name,
    short: source.short,
    owner: 'Не назначен',
    pilot: 'Не назначен',
    status: 'Модель подготовлена',
    health: 0,
    people: 0,
    beneficiaryScore: 0,
    participantScore: 0,
    beneficiaryEffect: beneficiary.map((item) => item.name).join('; '),
    participantEffect: participant.map((item) => item.name).join('; '),
    income: 0,
    costs: 0,
    activities: [],
    kind: 'base',
    configured: true,
    dataReady: false,
    economyInputs: [...new Set(source.economyInputs)],
    clubFirstDetails: full,
    googleExample,
    dimensions: source.dimensions.map((item) => ({
      name: item.name,
      score: 0,
      metric: item.metric,
      formula: item.formula,
      source: item.source,
      action: item.action,
    })),
    model: {
      dimensions: source.dimensions.map((item, index) => ({
        id: index + 1,
        name: item.name,
        weight: baseWeights[index],
        metrics: [{
          id: (index + 1) * 100,
          name: item.metric,
          formula: item.formula,
          source: item.source,
          period: item.period,
          fact: null,
          target: Number(item.target),
          weight: 100,
          action: item.action,
        }],
      })),
      participantMetrics: metrics(participant, 1000),
      beneficiaryMetrics: metrics(beneficiary, 2000),
      benefits: [{ id: 1, name: 'Подтверждённые поступления или экономия', quantity: 0, unitValue: 0, source: 'Финансы', period: 'Год' }],
      costLines: [{ id: 101, name: 'Подтверждённые затраты роли', quantity: 0, unitValue: 0, source: 'Финансы', period: 'Год' }],
      sources: [...new Set([...source.dimensions.map((item) => item.source), ...source.effects.map((item) => item.source), 'Финансы'])],
    },
  };
});

const mergeStoredRoles = (defaults: Role[], stored: Role[]): Role[] => [
  ...defaults.map((base) => {
    const saved = stored.find((item) => item.name === base.name);
    return saved ? { ...base, ...saved, clubFirstDetails: base.clubFirstDetails, googleExample: base.googleExample } : base;
  }),
  ...stored.filter((item) => item.kind === 'custom'),
];

export default function Home({ user }: { user?: { userId: string; displayName: string; email: string } }) {
  const userId = user?.userId || 'demo';
  const [page, setPage] = useState<Page>('setup');
  const [entryState, setEntryState] = useState<'loading' | 'registration' | 'choice' | 'ready'>('loading');
  const [registrationProfile, setRegistrationProfile] = useState<RegistrationProfile>({ name: '', email: user?.email || '', organization: '', position: '' });
  const [registrationError, setRegistrationError] = useState('');
  const [frameworkComplete, setFrameworkComplete] = useState(false);
  const [setupComplete, setSetupComplete] = useState(false);
  const [activeRoleNames, setActiveRoleNames] = useState<string[]>([]);
  const [mode, setMode] = useState<Mode>('operator');
  const [scope] = useState<Scope>('general');
  const [generalRoles, setGeneralRoles] = useState<Role[]>(
    roles.map((role) => ({
      ...role,
      owner: '',
      ownerPosition: '',
      ownerContact: '',
      pilot: 'Пилот 1',
      kind: 'base',
      configured: true,
      dataReady: false,
    })),
  );
  const [clubRoles, setClubRoles] = useState<Role[]>(clubFirstRoles);
  const roleList = scope === 'general' ? generalRoles : clubRoles;
  const portfolioRoles = setupComplete && activeRoleNames.length ? roleList.filter((role) => activeRoleNames.includes(role.name)) : roleList;
  const setRoleList = scope === 'general' ? setGeneralRoles : setClubRoles;
  const [roleName, setRoleName] = useState(roles[0].name);
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    try {
      const phase = localStorage.getItem(userStorageKey(userId, 'onboarding'));
      const savedProfile = localStorage.getItem(userStorageKey(userId, 'registration'));
      if (savedProfile) setRegistrationProfile(JSON.parse(savedProfile));
      const hasChosenPath = phase === 'path_chosen' || phase === 'framework_confirmed' || phase === 'setup_complete';
      setEntryState(!savedProfile ? 'registration' : hasChosenPath ? 'ready' : 'choice');
      setFrameworkComplete(phase === 'framework_confirmed' || phase === 'setup_complete');
      setSetupComplete(phase === 'setup_complete');
      if (phase === 'setup_complete') {
        const savedSetup = JSON.parse(localStorage.getItem(frameworkKey('general', userId)) || 'null');
        if (Array.isArray(savedSetup?.selected)) setActiveRoleNames(savedSetup.selected);
      }
      setPage(phase === 'setup_complete' ? 'overview' : 'setup');
      const saved = localStorage.getItem(userStorageKey(userId, 'roles:general'));
      if (saved) {
        const stored = JSON.parse(saved) as Role[];
        if (Array.isArray(stored)) {
          setGeneralRoles(mergeStoredRoles(roles.map((base) => ({
            ...base, owner: '', ownerPosition: '', ownerContact: '', pilot: 'Пилот 1', kind: 'base', configured: true, dataReady: false,
          })), stored.map((item) => ({
            ...item,
            dataReady: Boolean(item.model?.dimensions.every((dimension) =>
              dimension.metrics.every((metric) => metric.fact !== null),
            ) && item.model?.participantMetrics.every((metric) => metric.fact !== null)
              && item.model?.beneficiaryMetrics.every((metric) => metric.fact !== null)),
          }))));
        }
      }
      const savedClub = localStorage.getItem(userStorageKey(userId, 'roles:clubfirst'));
      if (savedClub) {
        const storedClub = JSON.parse(savedClub) as Role[];
        if (Array.isArray(storedClub)) setClubRoles(mergeStoredRoles(clubFirstRoles, storedClub));
      }
    } catch {}
    setHydrated(true);
  }, [userId]);
  useEffect(() => {
    if (hydrated)
      localStorage.setItem(userStorageKey(userId, 'roles:general'), JSON.stringify(generalRoles));
  }, [generalRoles, hydrated, userId]);
  useEffect(() => {
    if (hydrated) localStorage.setItem(userStorageKey(userId, 'roles:clubfirst'), JSON.stringify(clubRoles));
  }, [clubRoles, hydrated, userId]);
  const role = roleList.find((item) => item.name === roleName) || roleList[0];
  const attention = useMemo(
    () => portfolioRoles.filter((r) => r.configured && r.dataReady !== false && r.health < 75).length,
    [portfolioRoles],
  );
  const openRole = (r: Role) => {
    setRoleName(r.name);
    setPage('roles');
  };
  const saveRole = (updated: Role) =>
    setRoleList((current) =>
      current.map((item) => (item.name === updated.name ? updated : item)),
    );
  const createRole = (created: Role) => {
    if (
      roleList.some(
        (item) => item.name.toLowerCase() === created.name.toLowerCase(),
      )
    )
      return;
    setRoleList((current) => [...current, created]);
    try {
      const saved = JSON.parse(localStorage.getItem(frameworkKey(scope, userId)) || 'null');
      if (saved) localStorage.setItem(frameworkKey(scope, userId), JSON.stringify({ ...saved, selected: [...new Set([...(saved.selected || []), created.name])] }));
    } catch {}
    openRole(created);
  };
  const createSetupRole = (created: Role) => {
    setRoleList((current) => current.some((role) => role.name.toLowerCase() === created.name.toLowerCase()) ? current : [...current, created]);
  };
  const addRoleToSetup = (added: Role) => {
    try {
      const saved = JSON.parse(localStorage.getItem(frameworkKey(scope, userId)) || 'null') || {};
      localStorage.setItem(frameworkKey(scope, userId), JSON.stringify({ ...saved, selected: [...new Set([...(saved.selected || []), added.name])], step: 4 }));
    } catch {}
    setPage('setup');
  };
  const changeMode = (m: Mode) => {
    setMode(m);
    if (m === 'owner' && !roleList.slice(0, 3).some((r) => r.name === roleName))
      setRoleName(roleList[0].name);
  };
  const startPath = (route: 'team' | 'self') => {
    try {
      const saved = JSON.parse(localStorage.getItem(frameworkKey(scope, userId)) || 'null') || {};
      localStorage.setItem(frameworkKey(scope, userId), JSON.stringify({
        ...saved, route, step: 2, generated: false, teamRequest: false,
      }));
      localStorage.setItem(userStorageKey(userId, 'onboarding'), 'path_chosen');
    } catch {}
    setFrameworkComplete(false);
    setSetupComplete(false);
    setPage('setup');
    setEntryState('ready');
  };
  const finishRegistration = (demo = false) => {
    const profile = demo
      ? { name: 'Демо-пользователь', email: user?.email || 'demo@example.invalid', organization: 'Демо-сообщество', position: 'Участник команды' }
      : { ...registrationProfile, name: registrationProfile.name.trim(), email: registrationProfile.email.trim(), organization: registrationProfile.organization.trim(), position: registrationProfile.position.trim() };
    if (!profile.name || !profile.email.includes('@') || !profile.organization) {
      setRegistrationError('Заполните обязательные поля: имя, рабочий email и название сообщества. Или откройте демо без заполнения формы.');
      return;
    }
    localStorage.setItem(userStorageKey(userId, 'registration'), JSON.stringify(profile));
    localStorage.setItem(userStorageKey(userId, 'onboarding'), 'registered');
    setFrameworkComplete(false);
    setSetupComplete(false);
    setRegistrationProfile(profile);
    setRegistrationError('');
    setEntryState('choice');
  };
  const confirmFramework = () => {
    localStorage.setItem(userStorageKey(userId, 'onboarding'), 'framework_confirmed');
    setFrameworkComplete(true);
  };
  const completeSetup = (roleNames: string[]) => {
    localStorage.setItem(userStorageKey(userId, 'onboarding'), 'setup_complete');
    setActiveRoleNames(roleNames);
    setSetupComplete(true);
    setPage('overview');
  };
  if (entryState === 'loading') return <div className="entry-loading">Загружаем Role Center…</div>;
  if (entryState === 'registration') return (
    <main className="entry-shell">
      <div className="entry-brand"><span>RC</span><div><b>Role Center</b><small>Центр управления ролями</small></div></div>
      <section className="entry-panel">
        <div className="entry-progress"><span className="complete"><Check /> Вход</span><span className="current">2 · Регистрация</span><span>3 · Путь</span><span>4 · Проектирование</span></div>
        <div className="entry-auth"><div className="entry-auth-icon"><UserRound /></div><div><b>{user ? 'Вход через ChatGPT подтверждён' : 'Демонстрационный режим'}</b><span>{user ? user.email : 'Автономная HTML-версия без платформенной авторизации'}</span></div><Check /></div>
        <span className="entry-eyebrow">Первый шаг</span><h1>Зарегистрируйте профиль в Role Center</h1>
        <p>Создайте профиль вашего сообщества. После регистрации вы выберете способ проектирования ролей. Для быстрого знакомства можно открыть демо без заполнения формы.</p>
        <div className="registration-grid">
          <label>Ваше имя и фамилия *<input value={registrationProfile.name} onChange={(e) => setRegistrationProfile({ ...registrationProfile, name: e.target.value })} placeholder="Фамилия Имя" /></label>
          <label>Рабочий email *<input type="email" value={registrationProfile.email} onChange={(e) => setRegistrationProfile({ ...registrationProfile, email: e.target.value })} placeholder="name@example.com" /></label>
          <label>Название сообщества или клуба *<input value={registrationProfile.organization} onChange={(e) => setRegistrationProfile({ ...registrationProfile, organization: e.target.value })} placeholder="Название вашего сообщества" /></label>
          <label>Ваша должность · необязательно<input value={registrationProfile.position} onChange={(e) => setRegistrationProfile({ ...registrationProfile, position: e.target.value })} placeholder="Например, руководитель сообщества" /></label>
        </div>
        {registrationError && <p className="form-error" role="alert">{registrationError}</p>}
        <div className="registration-footer"><span>В прототипе профиль сохраняется только в этом браузере. Отдельный аккаунт и доступы пока не создаются.</span><div className="registration-actions"><button className="secondary" onClick={() => finishRegistration(true)}>Посмотреть демо без заполнения</button><button className="primary" onClick={() => finishRegistration()}>Зарегистрироваться и выбрать путь <ArrowRight /></button></div></div>
      </section>
    </main>
  );
  if (entryState === 'choice') return (
    <main className="entry-shell">
      <div className="entry-brand"><span>RC</span><div><b>Role Center</b><small>Центр управления ролями</small></div></div>
      <section className="entry-panel">
        <div className="entry-progress"><span className="complete"><Check /> Вход</span><span className="complete"><Check /> Регистрация</span><span className="current">3 · Выбор пути</span><span>4 · Фреймворк</span></div>
        <div className="entry-auth"><div className="entry-auth-icon"><UserRound /></div><div><b>{registrationProfile.organization}</b><span>{registrationProfile.name} · {registrationProfile.position}</span></div><Check /></div>
        <span className="entry-eyebrow">Первый вход</span>
        <h1>Как вы хотите создать ролевую систему?</h1>
        <p>Выберите путь сейчас. В обоих случаях следующим шагом будет один и тот же фреймворк — он поможет сформулировать задачу, аудиторию, эффекты и ресурсы пилота.</p>
        <div className="entry-routes">
          <button onClick={() => startPath('team')}><Users /><b>Проектировать с командой</b><span>Заполнить фреймворк, передать запрос команде и затем вместе создать роли.</span><em>Выбрать путь <ArrowRight /></em></button>
          <button onClick={() => startPath('self')}><Sparkles /><b>Проектировать самостоятельно</b><span>Заполнить фреймворк, получить подбор ролей из базы и настроить пилот.</span><em>Выбрать путь <ArrowRight /></em></button>
        </div>
        <details className="entry-dev-note"><summary>Для разработчика: логика входа</summary><p>Платформа подтверждает личность до открытия приложения. Регистрация сообщества, выбор пути и фреймворк — отдельные состояния. В прототипе они хранятся в браузере; серверная модель описана в документации проекта.</p></details>
      </section>
    </main>
  );
  return (
    <main className="app-shell">
      <header className="topbar">
        <button className="brand" onClick={() => setPage(setupComplete ? 'overview' : 'setup')}>
          <span>RC</span>
          <div>
            <b>Role Center</b>
            <small>Центр управления ролями</small>
          </div>
        </button>
        <nav>
          {menu.map(({ id, label, hint, icon: Icon }) => (
            <button
              className={page === id ? 'active' : ''}
              onClick={() => setPage(id)}
              disabled={id !== 'setup' && !setupComplete}
              key={id}
            >
              <Icon />
              <span>
                <b>{label}</b>
                <small>{hint}</small>
              </span>
              {id === 'tasks' && attention > 0 && <em>{attention}</em>}
            </button>
          ))}
        </nav>
        {setupComplete && <div className="mode-switch">
          <button
            className={mode === 'operator' ? 'active' : ''}
            onClick={() => changeMode('operator')}
          >
            Оператор
          </button>
          <button
            className={mode === 'owner' ? 'active' : ''}
            onClick={() => changeMode('owner')}
          >
            Владелец
          </button>
        </div>}
      </header>
      <div className="mobile-nav">
        {menu.map(({ id, label, icon: Icon }) => (
          <button
            className={page === id ? 'active' : ''}
            onClick={() => setPage(id)}
            disabled={id !== 'setup' && !setupComplete}
            key={id}
          >
            <Icon />
            <span>{label}</span>
          </button>
        ))}
      </div>
      <div className="workspace">
        <div className="scope-description"><b>Общая модель</b><span>Вы проектируете ролевую систему для своего сообщества.</span></div>
        {page === 'overview' && (
          <Overview openRole={openRole} mode={mode} roleList={portfolioRoles} scope={scope} />
        )}{' '}
        {page === 'catalog' && (
          <RoleCatalog
            roleList={roleList}
            userId={userId}
            scope={scope}
            onOpen={openRole}
            onCreate={createRole}
            onAddToSetup={addRoleToSetup}
          />
        )}{' '}
        {page === 'roles' && (
          <RolePage
            role={role}
            setRole={openRole}
            mode={mode}
            roleList={portfolioRoles}
            onSave={saveRole}
          />
        )}{' '}
        {page === 'tasks' && <Tasks key={scope} mode={mode} roleList={portfolioRoles} scope={scope} userId={userId} />}{' '}
        {page === 'setup' && (
          <Setup
            key={scope}
            roleList={roleList}
            scope={scope}
            userId={userId}
            onCreateRole={createSetupRole}
            onSaveRole={saveRole}
            onFrameworkComplete={confirmFramework}
            onSetupComplete={completeSetup}
          />
        )}
      </div>
    </main>
  );
}
