import { useState, useEffect } from 'react';
import styles from './management.module.scss';

const ActiveRentals = () => {
  const [rentals, setRentals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRental, setSelectedRental] = useState(null);

  useEffect(() => {
    loadRentals();
  }, []);

  const loadRentals = async () => {
    try {
      setTimeout(() => {
        const mockRentals = [
          {
            id: 1,
            clientName: 'Иван Петров',
            clientPhone: '+7 (912) 345-67-89',
            clientEmail: 'ivan@mail.ru',
            propertyTitle: '3-комн. квартира в центре',
            propertyAddress: 'Москва, ул. Тверская, д. 25',
            startDate: '2024-01-01',
            endDate: '2024-12-31',
            monthlyRent: 45000,
            deposit: 90000,
            status: 'active',
            contractNumber: 'АР-2024-001',
            paymentDay: 1,
            lastPayment: '2024-01-01',
            nextPayment: '2024-02-01'
          },
          {
            id: 2,
            clientName: 'Мария Сидорова',
            clientPhone: '+7 (923) 456-78-90',
            clientEmail: 'maria@mail.ru',
            propertyTitle: '1-комн. квартира',
            propertyAddress: 'Москва, ул. Ленина, д. 15',
            startDate: '2024-01-15',
            endDate: '2024-07-15',
            monthlyRent: 28000,
            deposit: 56000,
            status: 'active',
            contractNumber: 'АР-2024-002',
            paymentDay: 15,
            lastPayment: '2024-01-15',
            nextPayment: '2024-02-15'
          },
          {
            id: 3,
            clientName: 'Алексей Козлов',
            clientPhone: '+7 (934) 567-89-01',
            clientEmail: 'alex@mail.ru',
            propertyTitle: '2-комн. квартира',
            propertyAddress: 'Москва, пр. Мира, д. 45',
            startDate: '2023-11-01',
            endDate: '2024-10-31',
            monthlyRent: 35000,
            deposit: 70000,
            status: 'active',
            contractNumber: 'АР-2023-045',
            paymentDay: 1,
            lastPayment: '2024-01-01',
            nextPayment: '2024-02-01'
          }
        ];
        setRentals(mockRentals);
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Ошибка загрузки аренд:', error);
      setLoading(false);
    }
  };

  const calculateDaysUntilPayment = (nextPaymentDate) => {
    const today = new Date();
    const paymentDate = new Date(nextPaymentDate);
    const diffTime = paymentDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const handleExtendRental = (rentalId) => {
    console.log('Продление аренды:', rentalId);
  };

  const handleTerminateRental = (rentalId) => {
    console.log('Расторжение аренды:', rentalId);
  };

  if (loading) {
    return <div className={styles.loadingSection}>Загрузка активных аренд...</div>;
  }

  return (
    <div className={styles.section}>
      <div className={styles.sectionHeader}>
        <h2>📄 Активные аренды</h2>
        <div className={styles.sectionStats}>
          <span className={styles.stat}>
            Всего: {rentals.length}
          </span>
          <span className={styles.stat}>
            Следующий платеж: {rentals.filter(r => calculateDaysUntilPayment(r.nextPayment) <= 7).length}
          </span>
        </div>
      </div>

      <div className={styles.rentalsGrid}>
        {rentals.map(rental => {
          const daysUntilPayment = calculateDaysUntilPayment(rental.nextPayment);
          const paymentStatus = daysUntilPayment <= 7 ? 'soon' : daysUntilPayment <= 0 ? 'overdue' : 'normal';

          return (
            <div key={rental.id} className={styles.rentalCard}>
              <div className={styles.rentalHeader}>
                <div className={styles.rentalTitle}>
                  <h3>{rental.propertyTitle}</h3>
                  <span className={`${styles.contractBadge} ${styles[paymentStatus]}`}>
                    {paymentStatus === 'soon' && `Оплата через ${daysUntilPayment} дн.`}
                    {paymentStatus === 'overdue' && 'Просрочка'}
                    {paymentStatus === 'normal' && 'Активна'}
                  </span>
                </div>
                <span className={styles.contractNumber}>
                  {rental.contractNumber}
                </span>
              </div>

              <div className={styles.rentalMain}>
                <div className={styles.clientInfo}>
                  <h4>Арендатор:</h4>
                  <p><strong>Имя:</strong> {rental.clientName}</p>
                  <p><strong>Телефон:</strong> {rental.clientPhone}</p>
                  <p><strong>Email:</strong> {rental.clientEmail}</p>
                </div>

                <div className={styles.rentalInfo}>
                  <h4>Условия аренды:</h4>
                  <p><strong>Арендная плата:</strong> {rental.monthlyRent.toLocaleString()} ₽/мес</p>
                  <p><strong>Залог:</strong> {rental.deposit.toLocaleString()} ₽</p>
                  <p><strong>Период:</strong> {rental.startDate} - {rental.endDate}</p>
                  <p><strong>День оплаты:</strong> {rental.paymentDay} число</p>
                </div>

                <div className={styles.paymentInfo}>
                  <h4>Платежи:</h4>
                  <p><strong>Последний платеж:</strong> {rental.lastPayment}</p>
                  <p><strong>Следующий платеж:</strong> {rental.nextPayment}</p>
                  <p className={`${styles.paymentStatus} ${styles[paymentStatus]}`}>
                    {paymentStatus === 'soon' && '⚠️ Скоро оплата'}
                    {paymentStatus === 'overdue' && '❌ Просрочено'}
                    {paymentStatus === 'normal' && '✅ В порядке'}
                  </p>
                </div>
              </div>

              <div className={styles.rentalActions}>
                <button 
                  className={styles.extendBtn}
                  onClick={() => handleExtendRental(rental.id)}
                >
                  📅 Продлить
                </button>
                <button 
                  className={styles.terminateBtn}
                  onClick={() => handleTerminateRental(rental.id)}
                >
                  📄 Расторгнуть
                </button>
                <button 
                  className={styles.contactBtn}
                  onClick={() => window.open(`tel:${rental.clientPhone}`)}
                >
                  📞 Позвонить
                </button>
                <button 
                  className={styles.detailsBtn}
                  onClick={() => setSelectedRental(selectedRental?.id === rental.id ? null : rental)}
                >
                  {selectedRental?.id === rental.id ? '▲' : '▼'} Подробнее
                </button>
              </div>

              {selectedRental?.id === rental.id && (
                <div className={styles.rentalAdditionalInfo}>
                  <div className={styles.additionalSection}>
                    <h4>Адрес объекта:</h4>
                    <p>{rental.propertyAddress}</p>
                  </div>
                  <div className={styles.additionalSection}>
                    <h4>История платежей:</h4>
                    <div className={styles.paymentHistory}>
                      <div className={styles.paymentItem}>
                        <span>Январь 2024</span>
                        <span className={styles.paid}>Оплачено</span>
                      </div>
                      <div className={styles.paymentItem}>
                        <span>Декабрь 2023</span>
                        <span className={styles.paid}>Оплачено</span>
                      </div>
                      <div className={styles.paymentItem}>
                        <span>Ноябрь 2023</span>
                        <span className={styles.paid}>Оплачено</span>
                      </div>
                    </div>
                  </div>
                  <div className={styles.additionalSection}>
                    <h4>Примечания:</h4>
                    <textarea 
                      placeholder="Добавьте заметки по аренде..."
                      className={styles.notesTextarea}
                    />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {rentals.length === 0 && (
        <div className={styles.emptyState}>
          <p>Нет активных аренд</p>
        </div>
      )}
    </div>
  );
};

export default ActiveRentals;