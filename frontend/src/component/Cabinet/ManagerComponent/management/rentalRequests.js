import { useState, useEffect } from 'react';
import styles from './management.module.scss';

const RentalRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState(null);

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    try {
      setTimeout(() => {
        const mockRequests = [
          {
            id: 1,
            clientName: 'Иван Петров',
            clientPhone: '+7 (912) 345-67-89',
            clientEmail: 'ivan@mail.ru',
            propertyTitle: '3-комн. квартира в центре',
            propertyAddress: 'Москва, ул. Тверская, д. 25',
            date: '2024-01-15',
            status: 'new',
            budget: 45000,
            duration: '12 месяцев',
            message: 'Интересует долгосрочная аренда для семьи'
          },
          {
            id: 2,
            clientName: 'Мария Сидорова',
            clientPhone: '+7 (923) 456-78-90',
            clientEmail: 'maria@mail.ru',
            propertyTitle: '1-комн. квартира',
            propertyAddress: 'Москва, ул. Ленина, д. 15',
            date: '2024-01-14',
            status: 'processing',
            budget: 28000,
            duration: '6 месяцев',
            message: 'Ищу квартиру недалеко от метро'
          },
          {
            id: 3,
            clientName: 'Алексей Козлов',
            clientPhone: '+7 (934) 567-89-01',
            clientEmail: 'alex@mail.ru',
            propertyTitle: '2-комн. квартира',
            propertyAddress: 'Москва, пр. Мира, д. 45',
            date: '2024-01-13',
            status: 'approved',
            budget: 35000,
            duration: '24 месяца',
            message: 'Рассматриваем с женой для постоянного проживания'
          }
        ];
        setRequests(mockRequests);
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Ошибка загрузки заявок:', error);
      setLoading(false);
    }
  };

  const handleStatusChange = async (requestId, newStatus) => {
    try {
      setRequests(prev => prev.map(req => 
        req.id === requestId ? { ...req, status: newStatus } : req
      ));
    } catch (error) {
      console.error('Ошибка обновления статуса:', error);
    }
  };

  const getStatusText = (status) => {
    const statusMap = {
      'new': 'Новая',
      'processing': 'В обработке',
      'approved': 'Одобрена',
      'rejected': 'Отклонена'
    };
    return statusMap[status] || status;
  };

  if (loading) {
    return <div className={styles.loadingSection}>Загрузка заявок...</div>;
  }

  return (
    <div className={styles.section}>
      <div className={styles.sectionHeader}>
        <h2>📋 Заявки на аренду</h2>
        <div className={styles.sectionStats}>
          <span className={styles.stat}>
            Новые: {requests.filter(r => r.status === 'new').length}
          </span>
          <span className={styles.stat}>
            В работе: {requests.filter(r => r.status === 'processing').length}
          </span>
        </div>
      </div>

      <div className={styles.requestsContainer}>
        {requests.map(request => (
          <div key={request.id} className={`${styles.requestCard} ${styles[request.status]}`}>
            <div className={styles.requestHeader}>
              <div className={styles.requestTitle}>
                <h3>{request.propertyTitle}</h3>
                <span className={`${styles.statusBadge} ${styles[request.status]}`}>
                  {getStatusText(request.status)}
                </span>
              </div>
              <button 
                className={styles.detailsBtn}
                onClick={() => setSelectedRequest(selectedRequest?.id === request.id ? null : request)}
              >
                {selectedRequest?.id === request.id ? '▲' : '▼'} Детали
              </button>
            </div>
            
            <div className={styles.requestMain}>
              <div className={styles.clientInfo}>
                <p><strong>Клиент:</strong> {request.clientName}</p>
                <p><strong>Телефон:</strong> {request.clientPhone}</p>
                <p><strong>Email:</strong> {request.clientEmail}</p>
              </div>
              <div className={styles.propertyInfo}>
                <p><strong>Адрес:</strong> {request.propertyAddress}</p>
                <p><strong>Бюджет:</strong> {request.budget.toLocaleString()} ₽/мес</p>
                <p><strong>Срок:</strong> {request.duration}</p>
              </div>
            </div>

            {selectedRequest?.id === request.id && (
              <div className={styles.requestDetails}>
                <div className={styles.detailSection}>
                  <h4>Сообщение клиента:</h4>
                  <p>{request.message}</p>
                </div>
                <div className={styles.detailSection}>
                  <h4>Дата заявки:</h4>
                  <p>{request.date}</p>
                </div>
              </div>
            )}

            <div className={styles.requestActions}>
              {request.status === 'new' && (
                <>
                  <button 
                    className={styles.processBtn}
                    onClick={() => handleStatusChange(request.id, 'processing')}
                  >
                    Взять в работу
                  </button>
                  <button 
                    className={styles.rejectBtn}
                    onClick={() => handleStatusChange(request.id, 'rejected')}
                  >
                    Отклонить
                  </button>
                </>
              )}
              {request.status === 'processing' && (
                <>
                  <button 
                    className={styles.approveBtn}
                    onClick={() => handleStatusChange(request.id, 'approved')}
                  >
                    Одобрить
                  </button>
                  <button 
                    className={styles.rejectBtn}
                    onClick={() => handleStatusChange(request.id, 'rejected')}
                  >
                    Отклонить
                  </button>
                </>
              )}
              {(request.status === 'approved' || request.status === 'rejected') && (
                <button 
                  className={styles.resetBtn}
                  onClick={() => handleStatusChange(request.id, 'new')}
                >
                  Вернуть в новые
                </button>
              )}
              <button className={styles.contactBtn}>
                📞 Позвонить
              </button>
            </div>
          </div>
        ))}
      </div>

      {requests.length === 0 && (
        <div className={styles.emptyState}>
          <p>Нет заявок на аренду</p>
        </div>
      )}
    </div>
  );
};

export default RentalRequests;