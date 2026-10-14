'use client';

import clubFirstGoogleExample from './clubfirst-google-example.json';

type Example = (typeof clubFirstGoogleExample)[number];

const sourceUrl = 'https://docs.google.com/spreadsheets/d/1lnA0K2L8qiRChmRuLPx_MDJ7Ky9DwT9I-UN0_vfvV58/edit?gid=545212083#gid=545212083';

function display(value: number | string | null | undefined, unit?: string | null) {
  if (value === null || value === undefined || value === '') return 'Нет данных';
  if (typeof value === 'string') return value;
  const number = new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 2 }).format(unit === '%' && Math.abs(value) <= 1 ? value * 100 : value);
  return `${number}${unit === '%' ? '%' : unit ? ` ${unit}` : ''}`;
}

function points(value: number | null) {
  return value === null ? 'Нет данных' : `${new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 1 }).format(value)} из 100`;
}

export default function ClubFirstExample({ example }: { example: Example }) {
  return (
    <section className="cf-google-example" aria-label="Пример расчёта из таблицы ClubFirst">
      <div className="cf-google-heading">
        <div>
          <span className="cf-google-label">Демонстрационный сценарий · не фактические данные</span>
          <h2>Пример расчёта для роли</h2>
          <p>Значения из таблицы ClubFirst показаны отдельно и не влияют на рабочий дашборд или настройку роли.</p>
        </div>
        <a href={sourceUrl} target="_blank" rel="noreferrer">Открыть исходную таблицу ↗</a>
      </div>
      <div className="cf-google-summary">
        <div><span>Индекс здоровья роли</span><strong>{points(example.indexScore)}</strong><small>{example.indexStatus}; зона внимания: {example.weakBlock}</small></div>
        <div><span>Эффект для участника</span><strong>{points(example.participantScore)}</strong><small>Оценка по примеру</small></div>
        <div><span>Эффект для клуба</span><strong>{points(example.beneficiaryScore)}</strong><small>Оценка по примеру</small></div>
      </div>
      <details className="cf-google-details">
        <summary>Показать все исходные значения и расчёты</summary>
        <div className="cf-google-sections">
          <div>
            <h3>Индекс здоровья роли</h3>
            {example.indexRows.map((row, index) => (
              <article key={`${row.dimension}-${index}`}>
                <div className="cf-google-row-title"><b>{row.dimension}: {row.metric}</b><strong>{points(row.score)}</strong></div>
                <p>{row.calculation}</p>
                <dl><div><dt>Факт</dt><dd>{display(row.fact, row.unit)}</dd></div><div><dt>Цель</dt><dd>{display(row.target, row.unit)}</dd></div><div><dt>Вес</dt><dd>{display(row.weight, '%')}</dd></div><div><dt>Источник</dt><dd>{row.source}</dd></div></dl>
                {row.factFormula && <small>Формула примера: {row.factFormula}</small>}
              </article>
            ))}
          </div>
          <div>
            <h3>Эффекты</h3>
            {example.effects.map((effect, index) => (
              <article key={`${effect.name}-${index}`}>
                <div className="cf-google-row-title"><b>{effect.recipient}: {effect.name}</b><strong>{points(effect.score)}</strong></div>
                <p>{effect.calculation}</p>
                <dl><div><dt>Факт</dt><dd>{display(effect.fact, effect.unit)}</dd></div><div><dt>Цель</dt><dd>{display(effect.target, effect.unit)}</dd></div></dl>
                {effect.factFormula && <small>Формула примера: {effect.factFormula}</small>}
              </article>
            ))}
          </div>
          <div>
            <h3>Экономика: исходные данные</h3>
            {example.economyInputs.map((input, index) => (
              <article key={`${input.name}-${index}`}>
                <div className="cf-google-row-title"><b>{input.name}</b><strong>{display(input.value, input.unit)}</strong></div>
                <small>Источник: {input.source}</small>
              </article>
            ))}
          </div>
          <div>
            <h3>Экономика: результат расчёта</h3>
            {example.economyOutputs.map((output, index) => (
              <article key={`${output.name}-${index}`}>
                <div className="cf-google-row-title"><b>{output.name}</b><strong>{display(output.value, output.unit)}</strong></div>
                <p>{output.explanation}</p>
                {output.formula && <small>Формула в исходной таблице: {output.formula}</small>}
              </article>
            ))}
          </div>
        </div>
      </details>
    </section>
  );
}
