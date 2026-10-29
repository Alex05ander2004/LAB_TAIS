function noticeText({ status, discarded }) {
  switch (status) {
    case 'corrupt':
      return 'Los datos guardados estaban dañados y no se pudieron leer. Empezaste con una lista vacía.';
    case 'partial':
      return discarded === 1
        ? 'Se ignoró 1 registro dañado de los datos guardados.'
        : `Se ignoraron ${discarded} registros dañados de los datos guardados.`;
    case 'unavailable':
      return 'No se puede acceder al almacenamiento del navegador. Los cambios no se guardarán.';
    case 'save-failed':
      return 'No se pudo guardar el último cambio en este navegador.';
    default:
      return null;
  }
}

export default function StorageNotice({ notice, onDismiss }) {
  const text = notice && noticeText(notice);
  if (!text) return null;

  return (
    <div className="storage-notice" role="alert">
      <p>{text}</p>
      <button type="button" className="button button-secondary" onClick={onDismiss}>
        Cerrar aviso
      </button>
    </div>
  );
}
