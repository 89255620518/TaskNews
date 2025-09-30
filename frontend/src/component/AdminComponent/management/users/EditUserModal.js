// EditUserModal.js
import { useState } from 'react';
import styles from '../../admin.module.scss';

const EditUserModal = ({ user, onSave, onClose }) => {
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    patronymic: user?.patronymic || '',
    email: user?.email || '',
    phoneNumber: user?.phoneNumber || '',
    role: user?.role || 'user'
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const formatPhoneDisplay = (phone) => {
    if (!phone) return '+7';
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 0) return '+7';
    if (cleaned.length <= 3) return `+7 (${cleaned}`;
    if (cleaned.length <= 6) return `+7 (${cleaned.substring(0, 3)}) ${cleaned.substring(3)}`;
    if (cleaned.length <= 8) return `+7 (${cleaned.substring(0, 3)}) ${cleaned.substring(3, 6)}-${cleaned.substring(6)}`;
    return `+7 (${cleaned.substring(0, 3)}) ${cleaned.substring(3, 6)}-${cleaned.substring(6, 8)}-${cleaned.substring(8, 10)}`;
  };

  const handlePhoneChange = (e) => {
    let value = e.target.value;
    let cleaned = value.replace(/[^\d+]/g, '');
    if (!cleaned.startsWith('+7')) {
      cleaned = '+7' + cleaned.replace(/^\+/, '');
    }
    if (cleaned.length > 12) {
      cleaned = cleaned.substring(0, 12);
    }
    
    setFormData({
      ...formData,
      phoneNumber: cleaned
    });
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>
            {user ? 'Редактирование пользователя' : 'Создание пользователя'}
          </h2>
          <button className={styles.closeButton} onClick={onClose}>×</button>
        </div>
        
        <form onSubmit={handleSubmit} className={styles.modalForm}>
          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label>Фамилия *</label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                required
                className={styles.formInput}
              />
            </div>

            <div className={styles.formGroup}>
              <label>Имя *</label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                required
                className={styles.formInput}
              />
            </div>
          </div>

          <div className={styles.formGroup}>
            <label>Отчество</label>
            <input
              type="text"
              name="patronymic"
              value={formData.patronymic}
              onChange={handleChange}
              className={styles.formInput}
            />
          </div>

          <div className={styles.formGroup}>
            <label>Email *</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className={styles.formInput}
            />
          </div>

          <div className={styles.formGroup}>
            <label>Телефон</label>
            <input
              type="tel"
              name="phoneNumber"
              value={formatPhoneDisplay(formData.phoneNumber)}
              onChange={handlePhoneChange}
              placeholder="+7 (912) 345-67-89"
              className={styles.formInput}
            />
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label>Роль</label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className={styles.formSelect}
              >
                <option value="user">Клиент</option>
                <option value="admin">Администратор компании</option>
                <option value="manager">Менеджер по аренде</option>
                <option value="support">Служба поддержки</option>
              </select>
            </div>
          </div>

          <div className={styles.formActions}>
            <button
              type="button"
              className={styles.cancelButton}
              onClick={onClose}
            >
              Отмена
            </button>
            <button
              type="submit"
              className={styles.saveButton}
            >
              {user ? 'Сохранить изменения' : 'Создать пользователя'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditUserModal;