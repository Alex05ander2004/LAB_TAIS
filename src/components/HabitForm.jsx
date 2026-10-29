import { useState } from 'react';

const FIELD_LABELS = {
  name: 'nombre',
  category: 'categoría',
  startDate: 'fecha de inicio',
};

const emptyValues = (today) => ({ name: '', category: '', startDate: today });

export default function HabitForm({ today, onCreate }) {
  const [values, setValues] = useState(() => emptyValues(today));
  const [errors, setErrors] = useState({});
  const [savedName, setSavedName] = useState('');

  const handleChange = (event) => {
    const { name, value } = event.target;
    setValues((current) => ({ ...current, [name]: value }));
    setErrors((current) => {
      if (!current[name]) return current;
      const { [name]: _removed, ...rest } = current;
      return rest;
    });
    setSavedName('');
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const result = onCreate(values);

    if (result.ok) {
      setSavedName(result.habit.name);
      setErrors({});
      setValues(emptyValues(today));
    } else {
      setSavedName('');
      setErrors(result.errors);
    }
  };

  const invalidFields = Object.keys(FIELD_LABELS).filter((field) => errors[field]);

  const fieldProps = (field) => ({
    id: `habit-${field}`,
    name: field,
    value: values[field],
    onChange: handleChange,
    'aria-invalid': errors[field] ? 'true' : undefined,
    'aria-describedby': errors[field] ? `habit-${field}-error` : undefined,
  });

  const fieldError = (field) =>
    errors[field] ? (
      <p id={`habit-${field}-error`} className="field-error">
        {errors[field]}
      </p>
    ) : null;

  return (
    <form className="habit-form" aria-label="Nuevo hábito" onSubmit={handleSubmit} noValidate>
      {invalidFields.length > 0 && (
        <p className="form-alert" role="alert">
          Revisa los datos marcados: {invalidFields.map((field) => FIELD_LABELS[field]).join(', ')}.
        </p>
      )}

      <div className="field">
        <label htmlFor="habit-name">Nombre</label>
        <input type="text" autoComplete="off" placeholder="Ej.: Leer 20 minutos" {...fieldProps('name')} />
        {fieldError('name')}
      </div>

      <div className="field">
        <label htmlFor="habit-category">Categoría</label>
        <input type="text" autoComplete="off" placeholder="Ej.: Estudio" {...fieldProps('category')} />
        {fieldError('category')}
      </div>

      <div className="field">
        <label htmlFor="habit-startDate">Fecha de inicio</label>
        <input type="date" {...fieldProps('startDate')} />
        {fieldError('startDate')}
      </div>

      <button type="submit" className="button button-primary">
        Guardar hábito
      </button>

      {savedName && (
        <p className="form-success" role="status">
          Hábito «{savedName}» guardado.
        </p>
      )}
    </form>
  );
}
