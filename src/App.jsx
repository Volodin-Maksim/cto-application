import { useMemo, useState } from 'react'

const SERVICES = [
  { id: 'oil', name: 'Замена масла', duration: '30–60 минут' },
  { id: 'tires', name: 'Шиномонтаж', duration: '30–60 минут' },
  { id: 'diagnostics', name: 'Диагностика подвески', duration: '60–90 минут' },
  { id: 'brakes', name: 'Замена тормозных колодок', duration: '60–120 минут' },
  { id: 'engine', name: 'Компьютерная диагностика', duration: '30–60 минут' },
]

const TIMES = ['09:00', '10:30', '12:00', '14:00', '15:30', '17:00']

const initialForm = {
  service: '',
  date: '',
  time: '',
  name: '',
  phone: '',
  carMake: '',
  carModel: '',
}

function getToday() {
  const now = new Date()
  const offset = now.getTimezoneOffset() * 60000
  return new Date(now.getTime() - offset).toISOString().split('T')[0]
}

function App() {
  const [form, setForm] = useState(initialForm)
  const [errors, setErrors] = useState({})
  const [confirmed, setConfirmed] = useState(null)
  const today = useMemo(getToday, [])

  const updateField = (event) => {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
    setErrors((current) => ({ ...current, [name]: '' }))
  }

  const validate = () => {
    const nextErrors = {}
    const cleanName = form.name.trim()
    const cleanPhone = form.phone.trim()

    if (!form.service) nextErrors.service = 'Выберите услугу'
    if (!form.date) nextErrors.date = 'Выберите дату'
    else if (form.date < today) nextErrors.date = 'Дата не может быть в прошлом'
    if (!form.time) nextErrors.time = 'Выберите время'
    if (cleanName.length < 2 || !/^[а-яёa-z\s-]+$/i.test(cleanName)) {
      nextErrors.name = 'Введите имя буквами'
    }
    if (!/^\+?[\d\s()\-]{10,20}$/.test(cleanPhone) || cleanPhone.replace(/\D/g, '').length < 10) {
      nextErrors.phone = 'Введите корректный номер телефона'
    }

    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  const submit = (event) => {
    event.preventDefault()
    if (!validate()) return

    const booking = {
      ...form,
      name: form.name.trim(),
      phone: form.phone.trim(),
      createdAt: new Date().toISOString(),
    }
    console.log('Новая запись:', booking)
    setConfirmed(booking)
  }

  const service = SERVICES.find((item) => item.id === confirmed?.service)

  if (confirmed) {
    return (
      <main className="page-shell">
        <section className="card confirmation-card" aria-labelledby="confirmation-title">
          <div className="success-mark" aria-hidden="true">✓</div>
          <p className="eyebrow">Запись на СТО</p>
          <h1 id="confirmation-title">Запись подтверждена</h1>
          <p className="muted">Ждём вас. Детали записи сохранены на этом экране.</p>

          <dl className="details-list">
            <div><dt>Услуга</dt><dd>{service?.name}</dd></div>
            <div><dt>Дата и время</dt><dd>{formatDate(confirmed.date)} в {confirmed.time}</dd></div>
            <div><dt>Клиент</dt><dd>{confirmed.name}</dd></div>
            <div><dt>Телефон</dt><dd>{confirmed.phone}</dd></div>
            {(confirmed.carMake || confirmed.carModel) && (
              <div><dt>Автомобиль</dt><dd>{[confirmed.carMake, confirmed.carModel].filter(Boolean).join(' ')}</dd></div>
            )}
          </dl>

          <button className="button button-secondary" type="button" onClick={() => setConfirmed(null)}>
            Создать ещё одну запись
          </button>
        </section>
      </main>
    )
  }

  return (
    <main className="page-shell">
      <section className="intro">
        <p className="eyebrow">Сервис без звонков</p>
        <h1>Запишитесь на обслуживание автомобиля</h1>
        <p className="intro-copy">Выберите услугу, удобное время и оставьте контакты.</p>
      </section>

      <form className="card booking-form" onSubmit={submit} noValidate>
        <fieldset>
          <legend>Услуга</legend>
          <div className="service-grid">
            {SERVICES.map((item) => (
              <label className={`service-option ${form.service === item.id ? 'selected' : ''}`} key={item.id}>
                <input type="radio" name="service" value={item.id} checked={form.service === item.id} onChange={updateField} />
                <span>
                  <strong>{item.name}</strong>
                  <small>{item.duration}</small>
                </span>
              </label>
            ))}
          </div>
          {errors.service && <p className="error">{errors.service}</p>}
        </fieldset>

        <div className="form-grid">
          <Field label="Дата" name="date" type="date" value={form.date} onChange={updateField} min={today} error={errors.date} />
          <Field label="Время" name="time" type="select" value={form.time} onChange={updateField} error={errors.time}>
            <option value="">Выберите время</option>
            {TIMES.map((time) => <option key={time} value={time}>{time}</option>)}
          </Field>
        </div>

        <fieldset>
          <legend>Контакты</legend>
          <div className="fields-stack">
            <Field label="Имя" name="name" value={form.name} onChange={updateField} placeholder="Например, Алексей" error={errors.name} />
            <Field label="Телефон" name="phone" type="tel" value={form.phone} onChange={updateField} placeholder="+7 900 000-00-00" error={errors.phone} />
          </div>
        </fieldset>

        <fieldset>
          <legend>Автомобиль <span className="optional">необязательно</span></legend>
          <div className="form-grid">
            <Field label="Марка" name="carMake" value={form.carMake} onChange={updateField} placeholder="Toyota" />
            <Field label="Модель" name="carModel" value={form.carModel} onChange={updateField} placeholder="Camry" />
          </div>
        </fieldset>

        <button className="button" type="submit">Записаться</button>
        <p className="form-note">Нажимая кнопку, вы подтверждаете выбранные данные.</p>
      </form>
    </main>
  )
}

function Field({ label, name, type = 'text', value, onChange, error, children, ...props }) {
  const fieldId = `field-${name}`
  return (
    <label className="field" htmlFor={fieldId}>
      <span>{label}</span>
      {type === 'select' ? (
        <select id={fieldId} name={name} value={value} onChange={onChange} aria-invalid={Boolean(error)}>
          {children}
        </select>
      ) : (
        <input id={fieldId} name={name} type={type} value={value} onChange={onChange} aria-invalid={Boolean(error)} {...props} />
      )}
      {error && <small className="error">{error}</small>}
    </label>
  )
}

function formatDate(date) {
  return new Intl.DateTimeFormat('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(`${date}T12:00:00`))
}

export default App
