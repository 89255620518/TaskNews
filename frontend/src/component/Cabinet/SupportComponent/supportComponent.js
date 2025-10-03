import { useState, useEffect } from 'react';
import { useAuth } from '../../../useContext/AuthContext';
import styles from './support.module.scss';

const SupportComponent = () => {
  const { token, user, isSupport, isAuthenticated } = useAuth();
  const [currentSection, setCurrentSection] = useState('tickets');
  const [supportData, setSupportData] = useState(null);
  const [accessDenied, setAccessDenied] = useState(false);
  const [error, setError] = useState('');
  
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [replyText, setReplyText] = useState('');

  useEffect(() => {
    if (!token || !isAuthenticated) {
      setError('Требуется авторизация');
      setAccessDenied(true);
      setTimeout(() => {
        window.location.href = '/login';
      }, 3000);
      return;
    }

    if (user && !isSupport()) {
      setError('Нет доступа к разделу менеджера');
      setAccessDenied(true);
      setTimeout(() => {
        window.location.href = '/login';
      }, 3000);
      return;
    }

    if (user && isSupport()) {
      setSupportData({
        name: `${user.lastName || ''} ${user.firstName || ''}`.trim(),
        email: user.email || '',
        role: user.role || 'support',
        lastLogin: new Date().toLocaleString('ru-RU')
      });
      loadTickets();
    }
  }, [token, user, isSupport, isAuthenticated]);

  const loadTickets = async () => {
    setLoading(true);
    try {
      const mockTickets = [
        {
          id: 1,
          title: 'Проблема с оплатой',
          description: 'Не могу оплатить аренду через карту',
          status: 'open',
          priority: 'high',
          user: { name: 'Иван Иванов', email: 'ivan@mail.ru' },
          createdAt: '2024-01-15T10:30:00Z',
          updatedAt: '2024-01-15T10:30:00Z',
          messages: [
            {
              id: 1,
              text: 'Здравствуйте! У меня не проходит оплата картой при попытке арендовать квартиру.',
              sender: 'user',
              createdAt: '2024-01-15T10:30:00Z'
            }
          ]
        },
        {
          id: 2,
          title: 'Вопрос по документам',
          description: 'Какие документы нужны для аренды?',
          status: 'in_progress',
          priority: 'medium',
          user: { name: 'Петр Петров', email: 'petr@mail.ru' },
          createdAt: '2024-01-14T15:20:00Z',
          updatedAt: '2024-01-15T09:15:00Z',
          messages: [
            {
              id: 1,
              text: 'Добрый день! Подскажите, пожалуйста, какие документы требуются для оформления аренды квартиры?',
              sender: 'user',
              createdAt: '2024-01-14T15:20:00Z'
            },
            {
              id: 2,
              text: 'Здравствуйте! Для аренды потребуется паспорт и контактные данные. Мы свяжемся с вами для уточнения деталей.',
              sender: 'support',
              createdAt: '2024-01-15T09:15:00Z'
            }
          ]
        },
        {
          id: 3,
          title: 'Техническая проблема',
          description: 'Не загружаются фотографии объекта',
          status: 'closed',
          priority: 'low',
          user: { name: 'Мария Сидорова', email: 'maria@mail.ru' },
          createdAt: '2024-01-13T11:45:00Z',
          updatedAt: '2024-01-14T16:30:00Z',
          messages: [
            {
              id: 1,
              text: 'При загрузке фотографий для моего объекта выходит ошибка.',
              sender: 'user',
              createdAt: '2024-01-13T11:45:00Z'
            },
            {
              id: 2,
              text: 'Проблема решена. Попробуйте теперь загрузить фотографии.',
              sender: 'support',
              createdAt: '2024-01-14T16:30:00Z'
            }
          ]
        }
      ];
      setTickets(mockTickets);
    } catch (error) {
      console.error('Ошибка загрузки тикетов:', error);
      setError('Не удалось загрузить тикеты');
    } finally {
      setLoading(false);
    }
  };

  const getRoleDisplay = (role) => {
    const roleMap = {
      'user': 'Клиент',
      'admin': 'Администратор компании',
      'manager': 'Менеджер по аренде',
      'support': 'Служба поддержки'
    };
    return roleMap[role] || role;
  };

  const getStatusDisplay = (status) => {
    const statusMap = {
      'open': { text: 'Открыт', class: styles.statusOpen },
      'in_progress': { text: 'В работе', class: styles.statusInProgress },
      'closed': { text: 'Закрыт', class: styles.statusClosed }
    };
    return statusMap[status] || { text: status, class: styles.statusUnknown };
  };

  const getPriorityDisplay = (priority) => {
    const priorityMap = {
      'low': { text: 'Низкий', class: styles.priorityLow },
      'medium': { text: 'Средний', class: styles.priorityMedium },
      'high': { text: 'Высокий', class: styles.priorityHigh }
    };
    return priorityMap[priority] || { text: priority, class: styles.priorityUnknown };
  };

  const handleTicketSelect = (ticket) => {
    setSelectedTicket(ticket);
    setReplyText('');
  };

  const handleSendReply = async () => {
    if (!replyText.trim() || !selectedTicket) return;

    try {
      const newMessage = {
        id: Date.now(),
        text: replyText,
        sender: 'support',
        createdAt: new Date().toISOString()
      };

      const updatedTickets = tickets.map(ticket => 
        ticket.id === selectedTicket.id 
          ? {
              ...ticket,
              status: 'in_progress',
              updatedAt: new Date().toISOString(),
              messages: [...ticket.messages, newMessage]
            }
          : ticket
      );

      setTickets(updatedTickets);
      setSelectedTicket({
        ...selectedTicket,
        status: 'in_progress',
        updatedAt: new Date().toISOString(),
        messages: [...selectedTicket.messages, newMessage]
      });
      setReplyText('');
      
      console.log('Ответ отправлен:', replyText);
    } catch (error) {
      console.error('Ошибка отправки ответа:', error);
      setError('Не удалось отправить ответ');
    }
  };

  const handleCloseTicket = async (ticketId) => {
    try {
      const updatedTickets = tickets.map(ticket => 
        ticket.id === ticketId 
          ? { ...ticket, status: 'closed', updatedAt: new Date().toISOString() }
          : ticket
      );

      setTickets(updatedTickets);
      if (selectedTicket && selectedTicket.id === ticketId) {
        setSelectedTicket({
          ...selectedTicket,
          status: 'closed',
          updatedAt: new Date().toISOString()
        });
      }
    } catch (error) {
      console.error('Ошибка закрытия тикета:', error);
      setError('Не удалось закрыть тикет');
    }
  };

  const handleReopenTicket = async (ticketId) => {
    try {
      const updatedTickets = tickets.map(ticket => 
        ticket.id === ticketId 
          ? { ...ticket, status: 'open', updatedAt: new Date().toISOString() }
          : ticket
      );

      setTickets(updatedTickets);
      if (selectedTicket && selectedTicket.id === ticketId) {
        setSelectedTicket({
          ...selectedTicket,
          status: 'open',
          updatedAt: new Date().toISOString()
        });
      }
    } catch (error) {
      console.error('Ошибка открытия тикета:', error);
      setError('Не удалось открыть тикет');
    }
  };

  const filteredTickets = tickets.filter(ticket => {
    if (currentSection === 'open') return ticket.status === 'open';
    if (currentSection === 'in_progress') return ticket.status === 'in_progress';
    if (currentSection === 'closed') return ticket.status === 'closed';
    return true;
  });

  if (accessDenied) {
    return (
      <div className={styles.supportContainer}>
        <div className={styles.accessDenied}>
          <h2>Доступ запрещен</h2>
          <p>{error || 'Нет доступа к разделу службы поддержки'}</p>
          <p>Перенаправление на страницу входа через 3 секунды...</p>
        </div>
      </div>
    );
  }

  if (!supportData) {
    return (
      <div className={styles.supportContainer}>
        <div className={styles.loading}>Загрузка панели поддержки...</div>
      </div>
    );
  }

  return (
    <div className={styles.supportContainer}>
      <div className={styles.supportHeader}>
        <h1 className={styles.supportTitle}>Панель службы поддержки</h1>
        
        <div className={styles.supportInfo}>
          <p><strong>Сотрудник:</strong> {supportData.name}</p>
          <p><strong>Email:</strong> {supportData.email}</p>
          <p><strong>Роль:</strong> {getRoleDisplay(supportData.role)}</p>
          <p><strong>Текущая сессия:</strong> {supportData.lastLogin}</p>
        </div>

        <div className={styles.supportNavigation}>
          <button 
            className={`${styles.navButton} ${currentSection === 'tickets' ? styles.active : ''}`}
            onClick={() => setCurrentSection('tickets')}
          >
            📋 Все тикеты
          </button>
          <button 
            className={`${styles.navButton} ${currentSection === 'open' ? styles.active : ''}`}
            onClick={() => setCurrentSection('open')}
          >
            🔴 Открытые
          </button>
          <button 
            className={`${styles.navButton} ${currentSection === 'in_progress' ? styles.active : ''}`}
            onClick={() => setCurrentSection('in_progress')}
          >
            🟡 В работе
          </button>
          <button 
            className={`${styles.navButton} ${currentSection === 'closed' ? styles.active : ''}`}
            onClick={() => setCurrentSection('closed')}
          >
            🟢 Закрытые
          </button>
        </div>
      </div>

      <div className={styles.supportContent}>
        {error && (
          <div className={styles.errorMessage}>
            {error}
            <button onClick={() => setError('')} className={styles.closeError}>×</button>
          </div>
        )}

        <div className={styles.ticketsLayout}>
          <div className={styles.ticketsList}>
            <div className={styles.ticketsHeader}>
              <h3>Тикеты ({filteredTickets.length})</h3>
              <button 
                className={styles.refreshButton}
                onClick={loadTickets}
                disabled={loading}
              >
                {loading ? '🔄' : '🔄'}
              </button>
            </div>

            {loading ? (
              <div className={styles.loadingTickets}>Загрузка тикетов...</div>
            ) : filteredTickets.length === 0 ? (
              <div className={styles.noTickets}>Тикеты не найдены</div>
            ) : (
              <div className={styles.tickets}>
                {filteredTickets.map(ticket => {
                  const statusInfo = getStatusDisplay(ticket.status);
                  const priorityInfo = getPriorityDisplay(ticket.priority);
                  
                  return (
                    <div
                      key={ticket.id}
                      className={`${styles.ticketItem} ${
                        selectedTicket?.id === ticket.id ? styles.selected : ''
                      }`}
                      onClick={() => handleTicketSelect(ticket)}
                    >
                      <div className={styles.ticketHeader}>
                        <h4 className={styles.ticketTitle}>{ticket.title}</h4>
                        <div className={styles.ticketMeta}>
                          <span className={`${styles.status} ${statusInfo.class}`}>
                            {statusInfo.text}
                          </span>
                          <span className={`${styles.priority} ${priorityInfo.class}`}>
                            {priorityInfo.text}
                          </span>
                        </div>
                      </div>
                      <p className={styles.ticketDescription}>{ticket.description}</p>
                      <div className={styles.ticketFooter}>
                        <span className={styles.userInfo}>
                          👤 {ticket.user.name}
                        </span>
                        <span className={styles.date}>
                          {new Date(ticket.createdAt).toLocaleDateString('ru-RU')}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className={styles.ticketDetails}>
            {selectedTicket ? (
              <div className={styles.ticketView}>
                <div className={styles.ticketViewHeader}>
                  <h3>{selectedTicket.title}</h3>
                  <div className={styles.ticketActions}>
                    {selectedTicket.status !== 'closed' ? (
                      <button
                        className={styles.closeTicketButton}
                        onClick={() => handleCloseTicket(selectedTicket.id)}
                      >
                        Закрыть тикет
                      </button>
                    ) : (
                      <button
                        className={styles.reopenTicketButton}
                        onClick={() => handleReopenTicket(selectedTicket.id)}
                      >
                        Открыть снова
                      </button>
                    )}
                  </div>
                </div>

                <div className={styles.ticketInfo}>
                  <div className={styles.ticketMetaInfo}>
                    <p><strong>Пользователь:</strong> {selectedTicket.user.name} ({selectedTicket.user.email})</p>
                    <p><strong>Создан:</strong> {new Date(selectedTicket.createdAt).toLocaleString('ru-RU')}</p>
                    <p><strong>Обновлен:</strong> {new Date(selectedTicket.updatedAt).toLocaleString('ru-RU')}</p>
                    <p>
                      <strong>Статус:</strong> 
                      <span className={`${styles.status} ${getStatusDisplay(selectedTicket.status).class}`}>
                        {getStatusDisplay(selectedTicket.status).text}
                      </span>
                    </p>
                    <p>
                      <strong>Приоритет:</strong> 
                      <span className={`${styles.priority} ${getPriorityDisplay(selectedTicket.priority).class}`}>
                        {getPriorityDisplay(selectedTicket.priority).text}
                      </span>
                    </p>
                  </div>
                </div>

                <div className={styles.messages}>
                  <h4>История переписки</h4>
                  {selectedTicket.messages.map(message => (
                    <div
                      key={message.id}
                      className={`${styles.message} ${
                        message.sender === 'support' ? styles.supportMessage : styles.userMessage
                      }`}
                    >
                      <div className={styles.messageHeader}>
                        <strong>
                          {message.sender === 'support' ? 'Служба поддержки' : selectedTicket.user.name}
                        </strong>
                        <span className={styles.messageTime}>
                          {new Date(message.createdAt).toLocaleString('ru-RU')}
                        </span>
                      </div>
                      <p className={styles.messageText}>{message.text}</p>
                    </div>
                  ))}
                </div>

                {selectedTicket.status !== 'closed' && (
                  <div className={styles.replySection}>
                    <h4>Ответить</h4>
                    <textarea
                      className={styles.replyTextarea}
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder="Введите ваш ответ..."
                      rows="4"
                    />
                    <button
                      className={styles.sendButton}
                      onClick={handleSendReply}
                      disabled={!replyText.trim()}
                    >
                      Отправить ответ
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className={styles.noTicketSelected}>
                <p>Выберите тикет для просмотра и ответа</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SupportComponent;